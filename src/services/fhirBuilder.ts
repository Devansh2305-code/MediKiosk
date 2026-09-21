import { z } from 'zod';
import { ConsentArtifact, DigitizedDocument, PatientProfile, StructuredSummary } from '../types';

export interface FhirResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'document';
  timestamp: string;
  identifier: {
    system: string;
    value: string;
  };
  entry: {
    fullUrl: string;
    resource: FhirResource;
  }[];
}

// Zod schema for validating basic FHIR R4 document bundle shape
export const FhirBundleSchema = z.object({
  resourceType: z.literal('Bundle'),
  id: z.string(),
  type: z.literal('document'),
  timestamp: z.string(),
  identifier: z.object({
    system: z.string(),
    value: z.string(),
  }),
  entry: z.array(
    z.object({
      fullUrl: z.string(),
      resource: z.object({
        resourceType: z.string(),
        id: z.string(),
      }).passthrough(),
    })
  ).min(2), // Must contain at least Composition and Patient
});

export function buildAbdmOpConsultFhirBundle(params: {
  patient: PatientProfile;
  summary: StructuredSummary;
  documents: DigitizedDocument[];
  consent?: ConsentArtifact;
  doctorName?: string;
}): FhirBundle {
  const { patient, summary, documents, consent, doctorName = 'Dr. Staff Medical Officer' } = params;
  const bundleId = `ABDM-BUNDLE-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const timestamp = new Date().toISOString();
  const patientResId = `Patient-${patient.abhaId?.replace(/[^a-zA-Z0-9]/g, '') || 'ANON-101'}`;
  const practitionerResId = 'Practitioner-NRCES-DOC-01';
  const compositionId = `Composition-OPConsult-${Date.now()}`;

  const entries: { fullUrl: string; resource: FhirResource }[] = [];

  // 1. Patient Resource
  const patientResource: FhirResource = {
    resourceType: 'Patient',
    id: patientResId,
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Patient'],
    },
    identifier: [
      {
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'MR',
              display: 'Medical record number',
            },
          ],
        },
        system: 'https://healthid.ndhm.gov.in',
        value: patient.abhaId || '91-0000-0000-0000',
      },
    ],
    name: [
      {
        text: patient.name,
      },
    ],
    gender: patient.gender === 'M' ? 'male' : patient.gender === 'F' ? 'female' : 'other',
    birthDate: `${new Date().getFullYear() - patient.age}-01-01`,
  };

  // 2. Practitioner Resource
  const practitionerResource: FhirResource = {
    resourceType: 'Practitioner',
    id: practitionerResId,
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Practitioner'],
    },
    identifier: [
      {
        system: 'https://doctor.nmc.org.in',
        value: 'NMC-REG-2026-84912',
      },
    ],
    name: [
      {
        text: doctorName,
      },
    ],
  };

  // 3. Condition Resources (from chief complaint and past history)
  const conditionResources: FhirResource[] = [];
  const primaryConditionId = `Condition-ChiefComplaint-${Date.now()}`;
  conditionResources.push({
    resourceType: 'Condition',
    id: primaryConditionId,
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Condition'],
    },
    clinicalStatus: {
      coding: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active',
        },
      ],
    },
    code: {
      text: summary.chiefComplaint.title,
    },
    subject: {
      reference: `Patient/${patientResId}`,
    },
    note: [
      {
        text: `HPI: ${summary.hpi.narrative}`,
      },
    ],
  });

  // Past medical conditions
  summary.pastMedical.forEach((pm, idx) => {
    conditionResources.push({
      resourceType: 'Condition',
      id: `Condition-Past-${idx}-${Date.now()}`,
      clinicalStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
      },
      code: { text: pm },
      subject: { reference: `Patient/${patientResId}` },
    });
  });

  // 4. AllergyIntolerance Resources
  const allergyResources: FhirResource[] = [];
  summary.allergies.forEach((allergy, idx) => {
    allergyResources.push({
      resourceType: 'AllergyIntolerance',
      id: `Allergy-${idx}-${Date.now()}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/AllergyIntolerance'],
      },
      clinicalStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical', code: 'active' }],
      },
      verificationStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification', code: 'confirmed' }],
      },
      code: { text: allergy },
      patient: { reference: `Patient/${patientResId}` },
    });
  });

  // 5. MedicationStatement Resources
  const medicationResources: FhirResource[] = [];
  summary.medications.forEach((med, idx) => {
    medicationResources.push({
      resourceType: 'MedicationStatement',
      id: `MedStatement-${idx}-${Date.now()}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/MedicationStatement'],
      },
      status: 'active',
      medicationCodeableConcept: {
        text: `${med.brand} (${med.generic || ''}) ${med.strength || ''}`,
      },
      subject: { reference: `Patient/${patientResId}` },
      dosage: [
        {
          text: `${med.dose || ''} ${med.frequency || ''} - ${med.route || 'Oral'}`,
        },
      ],
    });
  });

  // 6. Observation Resources (Prior lab investigations & Vitals)
  const observationResources: FhirResource[] = [];
  summary.priorInvestigations.forEach((inv, idx) => {
    observationResources.push({
      resourceType: 'Observation',
      id: `Observation-Lab-${idx}-${Date.now()}`,
      meta: {
        profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/Observation'],
      },
      status: 'final',
      code: { text: inv.name },
      subject: { reference: `Patient/${patientResId}` },
      valueString: `${inv.value} ${inv.unit || ''}`.trim(),
      interpretation: inv.flag
        ? [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: inv.flag === 'H' ? 'H' : inv.flag === 'L' ? 'L' : 'N',
                },
              ],
            },
          ]
        : undefined,
    });
  });

  // 7. DocumentReference Resources (Scanned historical docs)
  const documentResources: FhirResource[] = [];
  documents.forEach((doc, idx) => {
    documentResources.push({
      resourceType: 'DocumentReference',
      id: `DocRef-${idx}-${Date.now()}`,
      status: 'current',
      type: { text: doc.docType },
      subject: { reference: `Patient/${patientResId}` },
      date: doc.documentDate,
      description: `${doc.docType} from ${doc.facilityOrDoctor || 'Prior facility'}`,
    });
  });

  // 8. Composition Resource (ABDM NRCeS OPD Consultation Record Root)
  const compositionResource: FhirResource = {
    resourceType: 'Composition',
    id: compositionId,
    meta: {
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/OPConsultRecord'],
    },
    status: 'final',
    type: {
      coding: [
        {
          system: 'http://snomed.info/sct',
          code: '371530004',
          display: 'Clinical consultation report',
        },
      ],
      text: 'OPD Clinical Intake & History Summary',
    },
    subject: {
      reference: `Patient/${patientResId}`,
      display: patient.name,
    },
    date: timestamp,
    author: [
      {
        reference: `Practitioner/${practitionerResId}`,
        display: doctorName,
      },
    ],
    title: 'MediKiosk OPD Clinical Intake Record',
    section: [
      {
        title: 'Chief Complaints & HPI',
        code: { coding: [{ system: 'http://snomed.info/sct', code: '422843007', display: 'Chief complaint section' }] },
        entry: conditionResources.map((c) => ({ reference: `Condition/${c.id}` })),
      },
      {
        title: 'Allergies & Adverse Reactions',
        code: { coding: [{ system: 'http://snomed.info/sct', code: '722446000', display: 'Allergy record' }] },
        entry: allergyResources.map((a) => ({ reference: `AllergyIntolerance/${a.id}` })),
      },
      {
        title: 'Current Medications',
        code: { coding: [{ system: 'http://snomed.info/sct', code: '1003606003', display: 'Medication history' }] },
        entry: medicationResources.map((m) => ({ reference: `MedicationStatement/${m.id}` })),
      },
      {
        title: 'Diagnostic Investigations',
        code: { coding: [{ system: 'http://snomed.info/sct', code: '423100009', display: 'Results section' }] },
        entry: observationResources.map((o) => ({ reference: `Observation/${o.id}` })),
      },
      {
        title: 'Digitized Historical Documents',
        entry: documentResources.map((d) => ({ reference: `DocumentReference/${d.id}` })),
      },
    ],
  };

  // Add composition first as per FHIR Document standard
  entries.push({ fullUrl: `urn:uuid:${compositionId}`, resource: compositionResource });
  entries.push({ fullUrl: `urn:uuid:${patientResId}`, resource: patientResource });
  entries.push({ fullUrl: `urn:uuid:${practitionerResId}`, resource: practitionerResource });
  conditionResources.forEach((r) => entries.push({ fullUrl: `urn:uuid:${r.id}`, resource: r }));
  allergyResources.forEach((r) => entries.push({ fullUrl: `urn:uuid:${r.id}`, resource: r }));
  medicationResources.forEach((r) => entries.push({ fullUrl: `urn:uuid:${r.id}`, resource: r }));
  observationResources.forEach((r) => entries.push({ fullUrl: `urn:uuid:${r.id}`, resource: r }));
  documentResources.forEach((r) => entries.push({ fullUrl: `urn:uuid:${r.id}`, resource: r }));

  const bundle: FhirBundle = {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'document',
    timestamp,
    identifier: {
      system: 'https://ndhm.gov.in/bundles',
      value: bundleId,
    },
    entry: entries,
  };

  // Validate bundle shape with zod
  FhirBundleSchema.parse(bundle);

  return bundle;
}
