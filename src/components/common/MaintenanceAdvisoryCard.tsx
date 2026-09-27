import React, { useState } from 'react';
import { MaintenanceAdvisory } from '../../types/telemetry';
import { AlertTriangle, CheckSquare, Square, Download, FileText, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

interface MaintenanceAdvisoryCardProps {
  advisory: MaintenanceAdvisory;
  onExportReport?: () => void;
  className?: string;
}

export const MaintenanceAdvisoryCard: React.FC<MaintenanceAdvisoryCardProps> = ({
  advisory,
  onExportReport,
  className = '',
}) => {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleCheck = (idx: number) => {
    if (completedSteps.includes(idx)) {
      setCompletedSteps(completedSteps.filter(i => i !== idx));
    } else {
      setCompletedSteps([...completedSteps, idx]);
    }
  };

  const handleExport = () => {
    if (onExportReport) {
      onExportReport();
      return;
    }
    const reportText = `=====================================================
MALE UAV AERO-PISTON ENGINE MAINTENANCE ADVISORY
Advisory ID: ${advisory.id}
Date/Time: ${advisory.timestamp}
System: DRONANETRA AI Engine Health Digital Twin
=====================================================
Severity: ${advisory.severity}
Engine Health Index: ${advisory.healthIndex}%
Anomaly Score: ${advisory.anomalyScore}
Degradation Level: ${advisory.degradation}
Possible Issue: ${advisory.possibleIssue}
Estimated RUL: ~${advisory.estimatedRul} Hours

RECOMMENDED ACTION:
${advisory.recommendedAction}

EVIDENCE & RESIDUAL ANALYSIS:
${advisory.evidence.map(e => `• ${e}`).join('\n')}

AFFECTED PARAMETERS:
${advisory.affectedParameters.join(', ')}

CHECKLIST & VERIFICATION PROTOCOL:
${advisory.checklist.map((c, i) => `[ ] ${i+1}. ${c}`).join('\n')}

DISCLAIMER:
${advisory.certifiedNotice}
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAINT_ADVISORY_${advisory.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden ${className}`}>
      {/* Top Header Card */}
      <div className="p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500 text-white shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase tracking-wider">
                {advisory.severity}
              </span>
              <span className="text-xs font-mono text-slate-500">{advisory.id}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              {advisory.possibleIssue}
            </h3>
          </div>
        </div>

        <button
          onClick={handleExport}
          className="px-3 py-1.5 rounded-lg border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Export Maintenance Work Order
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Core Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Engine Health Index</div>
            <div className="text-xl font-bold font-telemetry text-amber-700 mt-0.5">{advisory.healthIndex}%</div>
            <div className="text-[10px] text-slate-500 font-medium">Degradation: {advisory.degradation}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Anomaly Score</div>
            <div className="text-xl font-bold font-telemetry text-purple-700 mt-0.5">{advisory.anomalyScore}</div>
            <div className="text-[10px] text-purple-600 font-medium">Threshold &gt; 0.50 exceeded</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Estimated RUL</div>
            <div className="text-xl font-bold font-telemetry text-slate-900 mt-0.5">~{advisory.estimatedRul} h</div>
            <div className="text-[10px] text-slate-500 font-medium">Until mandatory overhaul</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Generated Timestamp</div>
            <div className="text-xs font-bold font-mono text-slate-800 mt-1 truncate">{advisory.timestamp}</div>
            <div className="text-[10px] text-slate-500 font-medium">CAN Telemetry Logged</div>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200 text-xs">
          <div className="font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <ArrowRight className="w-3.5 h-3.5 text-sky-700" />
            Recommended Action
          </div>
          <p className="text-sky-950 font-medium text-sm leading-relaxed">
            “{advisory.recommendedAction}”
          </p>
        </div>

        {/* Evidence & Residual Analysis */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            Evidence & Digital Twin Deviation Signature
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {advisory.evidence.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="leading-normal">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Checklist for Maintenance Technicians */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verification & Inspection Checklist
            </h4>
            <span className="text-[11px] font-mono text-slate-500">
              {completedSteps.length} of {advisory.checklist.length} verified
            </span>
          </div>
          <div className="space-y-1.5">
            {advisory.checklist.map((step, idx) => {
              const checked = completedSteps.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2.5 transition-colors ${
                    checked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {checked ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className={checked ? 'line-through text-emerald-800' : ''}>{step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Certification Disclaimer */}
        <div className="p-3 bg-slate-100 rounded-lg border border-slate-200/80 flex items-start gap-2 text-[11px] text-slate-600">
          <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-700">Important Disclaimer: </span>
            {advisory.certifiedNotice}
          </div>
        </div>
      </div>
    </div>
  );
};
