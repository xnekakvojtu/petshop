import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  change?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, change }) => {
  return (
    <div className="stats-card">
      <div className="stats-header">
        <h3>{title}</h3>
        <div className="stats-icon" style={{ backgroundColor: `${color}20`, color }}>
          <i className={icon}></i>
        </div>
      </div>
      
      <div className="stats-content">
        <div className="stats-value">{value}</div>
        {change && (
          <div className="stats-change">
            <span className={change.startsWith('+') ? 'positive' : 'negative'}>
              {change}
            </span>
          </div>
        )}
      </div>
      
      <style >{`
        .stats-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          transition: transform 0.2s;
        }
        
        .stats-card:hover {
          transform: translateY(-2px);
        }
        
        .stats-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        
        .stats-header h3 {
          margin: 0;
          font-size: 16px;
          color: #6b7280;
          font-weight: 500;
        }
        
        .stats-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        
        .stats-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        
        .stats-value {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
        }
        
        .stats-change {
          font-size: 14px;
        }
        
        .positive {
          color: #10b981;
        }
        
        .negative {
          color: #ef4444;
        }
        
        @media (max-width: 768px) {
          .stats-card {
            padding: 15px;
          }
          
          .stats-value {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default StatsCard;