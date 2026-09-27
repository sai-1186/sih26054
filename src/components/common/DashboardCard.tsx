import React from 'react';

interface DashboardCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden ${className}`}>
      {(title || subtitle || badge || action) && (
        <div className={`px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div>
              {title && (
                <div className="font-semibold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                  {title}
                </div>
              )}
              {subtitle && (
                <p className="text-xs text-slate-600 mt-0.5 font-normal">
                  {subtitle}
                </p>
              )}
            </div>
            {badge && <div>{badge}</div>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};
