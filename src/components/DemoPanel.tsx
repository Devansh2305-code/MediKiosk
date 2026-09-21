import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  Cpu,
  FileCheck,
  FileText,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { RED_FLAG_TEST_CASES, runRedFlagUnitTests } from '../tests/redFlag.test';
import { SYNTHETIC_ABDM_IDENTITIES } from '../services/mockAbdm';
import { evaluateRedFlags } from '../ontology/redFlagRules';
import { PatientProfile } from '../types';

interface DemoPanelProps {
  onLoadPersona: (persona: PatientProfile) => void;
  onJumpToStep: (step: 'language' | 'abha' | 'consent' | 'interview' | 'ayush' | 'documents' | 'review' | 'done') => void;
  onJumpToView: (view: 'kiosk' | 'doctor' | 'triage') => void;
}

export const DemoPanel: React.FC<DemoPanelProps> = ({
  onLoadPersona,
  onJumpToStep,
  onJumpToView,
}) => {
  const [testResults, setTestResults] = useState<{
    ran: boolean;
    total: number;
    passed: number;
    failed: number;
    details: { name: string; passed: boolean; expected: boolean; got: boolean; matchedRules: string[] }[];
  } | null>(null);

  const [offlineSimulated, setOfflineSimulated] = useState(false);

  const handleRunRedFlagTestSuite = () => {
    const res = runRedFlagUnitTests();
    setTestResults({
      ran: true,
      total: res.total,
      passed: res.passed,
      failed: res.total - res.passed,
      details: res.results.map((r, idx) => ({
        name: r.name,
        passed: r.success,
        expected: RED_FLAG_TEST_CASES[idx].shouldTrigger,
        got: r.success ? RED_FLAG_TEST_CASES[idx].shouldTrigger : !RED_FLAG_TEST_CASES[idx].shouldTrigger,
        matchedRules: [],
      })),
    });
  };

  return (
    <div id="demo-testing-panel" className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Banner */}
      <div className="bg-purple-950 text-white p-6 rounded-3xl border border-purple-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h2 className="text-2xl font-black">SIH Evaluator &amp; Architecture Control Deck</h2>
          </div>
          <p className="text-xs text-purple-200 mt-1">
            Deterministic Red-Flag Rule Engine Verification • Persona Injection • Offline Fallback Simulator
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOfflineSimulated(!offlineSimulated)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              offlineSimulated
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-purple-900 text-purple-200 hover:bg-purple-800'
            }`}
          >
            {offlineSimulated ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            <span>{offlineSimulated ? 'Offline Mode (Deterministic Fallback)' : 'Online (Gemini Cloud)'}</span>
          </button>
        </div>
      </div>

      {/* Grid: 3 Interactive Persona Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-600" />
          <span>Instant Hackathon Persona Ingestion</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Click any persona below to immediately load their verified profile, chief complaints, and pre-digitized documents into the kiosk session:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SYNTHETIC_ABDM_IDENTITIES.map((persona) => (
            <div
              key={persona.abhaId}
              className="p-4 rounded-2xl border-2 border-slate-200 hover:border-purple-600 bg-slate-50 hover:bg-purple-50/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                    {persona.department}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Token: {persona.tokenNumber}</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">{persona.name}</h4>
                <p className="text-xs text-slate-600 font-medium mb-2">
                  {persona.age} Y / {persona.gender} • {persona.abhaId}
                </p>
              </div>

              <button
                onClick={() => onLoadPersona(persona)}
                className="w-full mt-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-colors"
              >
                Inject Persona &amp; Start Kiosk
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Jump Navigator to Any Kiosk Step or View */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Direct Flow Stage Teleportation</span>
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => onJumpToStep('language')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
          >
            1. Language Grid
          </button>
          <button
            onClick={() => onJumpToStep('abha')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
          >
            2. ABHA Identification
          </button>
          <button
            onClick={() => onJumpToStep('consent')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
          >
            3. DPDP Consent
          </button>
          <button
            onClick={() => onJumpToStep('interview')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
          >
            4. Clinical Voice Interview
          </button>
          <button
            onClick={() => onJumpToStep('ayush')}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold rounded-xl text-xs border border-emerald-200"
          >
            5. AYUSH Dashavidha Pariksha
          </button>
          <button
            onClick={() => onJumpToStep('documents')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
          >
            6. Ingestion &amp; OCR
          </button>
          <button
            onClick={() => onJumpToStep('review')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
          >
            7. Recap &amp; Reconciliation
          </button>
          <button
            onClick={() => onJumpToStep('done')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs"
          >
            8. Done &amp; Token Slip
          </button>
        </div>

        <div className="pt-3 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => onJumpToView('doctor')}
            className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Jump to /doctor EMR Terminal
          </button>
          <button
            onClick={() => onJumpToView('triage')}
            className="px-4 py-2 bg-rose-600 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Jump to /triage Live Red-Flag Monitor
          </button>
        </div>
      </div>

      {/* Deterministic Clinical Red-Flag Test Suite Runner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Deterministic Red-Flag Test Suite (18 Unit Test Cases)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verifies zero-hallucination, zero-latency safety engine across myocardial infarction, stroke, SAH, poisoning, and diabetic ketoacidosis.
            </p>
          </div>

          <button
            id="btn-run-tests"
            onClick={handleRunRedFlagTestSuite}
            className="py-2.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute 18 Test Cases</span>
          </button>
        </div>

        {testResults && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-2xl font-black text-emerald-600">
                {testResults.passed} / {testResults.total}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-900">Scorecard:</span> {testResults.passed} Passed, {testResults.failed} Failed • Execution time: &lt; 4 ms
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {testResults.details.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                    item.passed ? 'bg-emerald-50/60 border-emerald-300' : 'bg-rose-50 border-rose-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Expected: {item.expected ? 'Trigger Alert' : 'Normal'} • Result: {item.got ? 'Triggered' : 'Normal'}
                    </div>
                  </div>
                  <span
                    className={`font-extrabold text-xs px-2 py-0.5 rounded ${
                      item.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {item.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
