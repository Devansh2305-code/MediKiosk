import { ConsentArtifact, PatientProfile } from '../types';
import { FhirBundle } from './fhirBuilder';

// MOCK: ABDM Adapter simulating National Health Authority ABDM M1/M2/M3 APIs
export interface AbdmAdapter {
  verifyAbha(abhaNumberOrAddress: string, otp?: string): Promise<{ success: boolean; profile?: PatientProfile; error?: string }>;
  fetchProfile(abhaId: string): Promise<PatientProfile | null>;
  pushBundle(bundle: FhirBundle, consentArtifact: ConsentArtifact): Promise<{ success: boolean; ackId: string }>;
  linkCareContext(patientRef: string, visitContextId: string): Promise<{ linked: boolean; careContextReference: string }>;
  revokeConsent(consentId: string): Promise<{ revoked: boolean }>;
}

// 3 obviously synthetic identities for hackathon demonstration
export const SYNTHETIC_ABDM_IDENTITIES: PatientProfile[] = [
  {
    abhaId: '91-4829-1048-2831',
    abhaAddress: 'ramesh.kumar62@abdm',
    name: 'Ramesh Kumar (रमेश कुमार)',
    age: 62,
    gender: 'M',
    mobileNumber: '98765-43210',
    abhaLinked: true,
    department: 'Cardiology / General Medicine',
    tokenNumber: 'A-108',
    opdRoom: 'Room 12 (Cardiology)',
    registeredAt: new Date().toISOString(),
  },
  {
    abhaId: '91-8932-4412-9012',
    abhaAddress: 'priya.sharma34@abdm',
    name: 'Priya Sharma (प्रिया शर्मा)',
    age: 34,
    gender: 'F',
    mobileNumber: '98111-22334',
    abhaLinked: true,
    department: 'Pulmonology / Chest Clinic',
    tokenNumber: 'B-215',
    opdRoom: 'Room 08 (Respiratory Medicine)',
    registeredAt: new Date().toISOString(),
  },
  {
    abhaId: '91-2309-8819-7612',
    abhaAddress: 'sunita.devi45@abdm',
    name: 'Sunita Devi (सुनीता देवी)',
    age: 45,
    gender: 'F',
    mobileNumber: '98450-99881',
    abhaLinked: true,
    department: 'AYUSH / Kayachikitsa OPD',
    tokenNumber: 'AY-042',
    opdRoom: 'AYUSH Wing - Room 3',
    registeredAt: new Date().toISOString(),
  },
];

class MockAbdmService implements AbdmAdapter {
  private pushedBundles: Map<string, { bundle: FhirBundle; consent: ConsentArtifact }> = new Map();
  private consentArtifacts: Map<string, ConsentArtifact> = new Map();

  async verifyAbha(abhaNumberOrAddress: string, otp: string = '123456'): Promise<{ success: boolean; profile?: PatientProfile; error?: string }> {
    // Artificial 250ms network latency
    await new Promise((r) => setTimeout(r, 250));

    const cleanInput = abhaNumberOrAddress.replace(/[^a-zA-Z0-9@.]/g, '').toLowerCase();

    // Check synthetic profiles
    const matched = SYNTHETIC_ABDM_IDENTITIES.find(
      (p) =>
        p.abhaId?.replace(/[^a-zA-Z0-9]/g, '') === cleanInput ||
        p.abhaAddress?.toLowerCase() === cleanInput ||
        cleanInput.includes('ramesh') ||
        cleanInput === '123456' ||
        cleanInput === '91482910482831'
    );

    if (matched) {
      return { success: true, profile: { ...matched } };
    }

    // Default fallback synthetic registration if any 14-digit number is given
    if (cleanInput.length >= 10) {
      const generated: PatientProfile = {
        abhaId: `91-${cleanInput.slice(0, 4)}-${cleanInput.slice(4, 8)}-${cleanInput.slice(8, 12) || '9999'}`,
        abhaAddress: `patient.${cleanInput.slice(-4)}@abdm`,
        name: 'New Registered Citizen (सिम्युलेटेड मरीज)',
        age: 42,
        gender: 'M',
        mobileNumber: '99887-76655',
        abhaLinked: true,
        department: 'General OPD',
        tokenNumber: `T-${Math.floor(100 + Math.random() * 900)}`,
        opdRoom: 'Room 04 (General Medicine)',
        registeredAt: new Date().toISOString(),
      };
      return { success: true, profile: generated };
    }

    return {
      success: false,
      error: 'Invalid ABHA Number or Address. For demo, use 91-4829-1048-2831 or tap a sample card.',
    };
  }

  async fetchProfile(abhaId: string): Promise<PatientProfile | null> {
    const found = SYNTHETIC_ABDM_IDENTITIES.find((p) => p.abhaId === abhaId);
    return found ? { ...found } : null;
  }

  async pushBundle(bundle: FhirBundle, consentArtifact: ConsentArtifact): Promise<{ success: boolean; ackId: string }> {
    const ackId = `ABDM-ACK-${Date.now()}`;
    this.pushedBundles.set(bundle.id, { bundle, consent: consentArtifact });
    this.consentArtifacts.set(consentArtifact.id, consentArtifact);
    return { success: true, ackId };
  }

  async linkCareContext(patientRef: string, visitContextId: string): Promise<{ linked: boolean; careContextReference: string }> {
    return {
      linked: true,
      careContextReference: `CARE-CTX-${visitContextId}-${Date.now()}`,
    };
  }

  async revokeConsent(consentId: string): Promise<{ revoked: boolean }> {
    const artifact = this.consentArtifacts.get(consentId);
    if (artifact) {
      artifact.status = 'revoked';
      return { revoked: true };
    }
    return { revoked: false };
  }

  getAllPushedBundles(): { id: string; timestamp: string; bundle: FhirBundle; consent: ConsentArtifact }[] {
    const list: { id: string; timestamp: string; bundle: FhirBundle; consent: ConsentArtifact }[] = [];
    this.pushedBundles.forEach((val, id) => {
      list.push({ id, timestamp: val.bundle.timestamp, bundle: val.bundle, consent: val.consent });
    });
    return list;
  }
}

export const mockAbdm = new MockAbdmService();

// STUB: Production SandboxAbdm implementation documented for real ABDM Gateway integration
export class SandboxAbdm implements AbdmAdapter {
  private gatewayUrl = 'https://dev.abdm.gov.in/gateway/v0.5';
  async verifyAbha(_abha: string): Promise<any> {
    throw new Error('SandboxAbdm requires ABDM Gateway Client ID & Secret configured. See docs/COMPLIANCE_MAPPING.md');
  }
  async fetchProfile(_abhaId: string): Promise<any> {
    throw new Error('Production gateway requires valid CM consent handle.');
  }
  async pushBundle(_b: any, _c: any): Promise<any> {
    throw new Error('Real NRCeS HIP service required.');
  }
  async linkCareContext(_p: any, _v: any): Promise<any> {
    throw new Error('Gateway care-context link API requires signed JWT.');
  }
  async revokeConsent(_c: any): Promise<any> {
    throw new Error('Gateway consent notify required.');
  }
}
