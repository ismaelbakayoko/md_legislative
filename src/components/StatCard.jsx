import React from 'react';

const StatCard = ({ title, value, subtext, color = "blue" }) => {
    const colorClasses = {
        blue: "border-l-4 border-brand-500",
        gray: "border-l-4 border-gray-500",
        green: "border-l-4 border-green-500",
    };

    return (
        <div className={`bg-white rounded-lg shadow-sm p-4 ${colorClasses[color] || 'border-l-4 border-gray-500'}`}>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</h3>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {subtext && <div className="text-xs text-gray-500 mt-1">{subtext}</div>}
        </div>
    );
};

export default StatCard;
