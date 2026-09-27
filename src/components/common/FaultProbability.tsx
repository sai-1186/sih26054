import React from 'react';
import { STATIC_FAULT_PROBABILITIES } from '../../services/replayData';
import { AlertCircle, Cpu, HelpCircle } from 'lucide-react';

interface FaultProbabilityProps {
  probabilities?: typeof STATIC_FAULT_PROBABILITIES;
  className?: string;
}

export const FaultProbability: React.FC<FaultProbabilityProps> = ({
  probabilities = STATIC_FAULT_PROBABILITIES,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            AI Probabilistic Fault Classification
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Random Forest &amp; XGBoost Output
        </span>
      </div>

      {/* Probability Bars */}
      <div className="space-y-3.5">
        {probabilities.map(item => {
          let barColor = 'bg-sky-500';
          let textColor = 'text-slate-700';

          if (item.probability >= 50) {
            barColor = 'bg-rose-500';
            textColor = 'text-rose-700 font-bold';
          } else if (item.probability >= 15) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-700 font-medium';
          }

          return (
            <div key={item.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  {item.name}
                  {item.probability >= 50 && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded font-bold font-mono">
                      PRIMARY
                    </span>
                  )}
                </span>
                <span className={`font-mono ${textColor}`}>{item.probability}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                  style={{ width: `${item.probability}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                <span className="truncate max-w-[280px]">{item.description}</span>
                <span>Risk: {item.riskLevel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Footnote */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Probabilities represent multi-class model softmax confidence derived from 14 synchronized sensor residual features.
        </span>
      </div>
    </div>
  );
};
