import { AuditLogEntry, DoctorReviewSession, StructuredSummary } from '../types';

class AuditAndHisStore {
  private auditLogs: AuditLogEntry[] = [];
  private confirmedConsultations: DoctorReviewSession[] = [];

  constructor() {
    this.logAction('SYSTEM', 'SYSTEM_INITIALIZATION', 'MEDIKIOSK_CORE', 'MediKiosk ABDM OPD Gateway online with DPDP audit tracking.');
  }

  logAction(actor: string, action: string, resourceId: string, details: string): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      resourceId,
      details,
    };
    this.auditLogs.unshift(entry);
    return entry;
  }

  getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }

  saveConfirmedConsultation(session: DoctorReviewSession): void {
    this.confirmedConsultations.unshift(session);
    this.logAction(
      session.doctorName,
      'PHYSICIAN_CONFIRMED_OPD_RECORD',
      `PATIENT:${session.patientId}`,
      `Physician confirmed clinical summary with ${Object.values(session.sectionStatus).filter((s) => s === 'edited').length} edited sections. Version 1.0 committed to HIS.`
    );
  }

  getConfirmedConsultations(): DoctorReviewSession[] {
    return [...this.confirmedConsultations];
  }
}

export const auditAndHisStore = new AuditAndHisStore();
