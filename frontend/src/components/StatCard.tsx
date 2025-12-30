import React from 'react';

type StatCardProps = {
  title: string;
  value: number | string;
  accent?: string;
};

const StatCard: React.FC<StatCardProps> = ({ title, value, accent = '#2563eb' }) => (
  <div className="card" style={{ borderLeft: `4px solid ${accent}` }}>
    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{title}</div>
    <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{value}</div>
  </div>
);

export default StatCard;