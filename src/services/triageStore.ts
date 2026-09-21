import { RedFlagAlert } from '../types';

export type TriageListener = (alert: RedFlagAlert) => void;

class TriageAlertStore {
  private alerts: RedFlagAlert[] = [];
  private listeners: Set<TriageListener> = new Set();

  constructor() {
    // Seed with 1 initial simulated alert for immediate demonstration realism
    this.alerts.push({
      id: 'ALERT_DEMO_01',
      patientId: 'PAT-482910',
      patientName: 'Ramesh Kumar',
      patientAge: 62,
      patientGender: 'M',
      tokenNumber: 'A-108',
      timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      ruleId: 'RF_ACS_CHEST_PAIN',
      severity: 'CRITICAL',
      title: 'Possible Acute Coronary Syndrome (Cardiac Red Flag)',
      description: 'Patient presented with retrosternal crushing chest pain, cold sweating, and radiation to left arm.',
      triggerEvidence: 'Voice input: "सीने में दर्द है और सांस फूल रही है, पसीना आ रहा है"',
      suggestedAction: 'Immediate ECG, stat cardiology review, transfer to Resuscitation/Triage Bay 1.',
      acknowledged: false,
    });
  }

  addAlert(alert: RedFlagAlert): void {
    const existing = this.alerts.find((a) => a.id === alert.id || (a.patientId === alert.patientId && a.ruleId === alert.ruleId));
    if (!existing) {
      this.alerts.unshift(alert);
      this.notifyListeners(alert);
    }
  }

  getAlerts(): RedFlagAlert[] {
    return [...this.alerts];
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string = 'Staff Nurse (Triage Bay)'): boolean {
    const a = this.alerts.find((al) => al.id === alertId);
    if (a) {
      a.acknowledged = true;
      a.acknowledgedBy = acknowledgedBy;
      this.notifyListeners(a);
      return true;
    }
    return false;
  }

  assignRoom(alertId: string, room: string): boolean {
    const a = this.alerts.find((al) => al.id === alertId);
    if (a) {
      a.assignedRoom = room;
      this.notifyListeners(a);
      return true;
    }
    return false;
  }

  updateStatus(alertId: string, status: string, disposition?: string): boolean {
    const a = this.alerts.find((al) => al.id === alertId);
    if (a) {
      if (status === 'RESOLVED') {
        a.acknowledged = true;
      }
      if (disposition) {
        a.assignedRoom = disposition;
      }
      this.notifyListeners(a);
      return true;
    }
    return false;
  }

  subscribe(listener: TriageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(alert: RedFlagAlert): void {
    this.listeners.forEach((fn) => {
      try {
        fn(alert);
      } catch {
        // Safe listener dispatch
      }
    });
  }

  clear(): void {
    this.alerts = [];
  }
}

export const triageStore = new TriageAlertStore();
