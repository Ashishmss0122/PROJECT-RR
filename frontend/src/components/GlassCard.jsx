import React from 'react';

const GlassCard = ({ children, className = '', hoverEffect = false }) => {
  return (
    <div className={`glass-panel rounded-xl p-6 ${hoverEffect ? 'glass-panel-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;
