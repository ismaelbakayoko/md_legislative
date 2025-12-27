import React, { useState, useEffect } from 'react';

const StatCard = ({ title, value, icon, color = "blue", animate = true }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [prevValue, setPrevValue] = useState(value);

    useEffect(() => {
        if (animate && value !== prevValue) {
            setIsUpdating(true);
            setPrevValue(value);
            const timer = setTimeout(() => setIsUpdating(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [value, prevValue, animate]);

    const colorConfig = {
        blue: { border: "border-blue-500", text: "text-blue-600", bg: "bg-blue-50", icon: "text-blue-600" },
        purple: { border: "border-purple-500", text: "text-purple-600", bg: "bg-purple-50", icon: "text-purple-600" },
        emerald: { border: "border-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", icon: "text-emerald-600" },
        rose: { border: "border-rose-500", text: "text-rose-600", bg: "bg-rose-50", icon: "text-rose-600" },
        indigo: { border: "border-indigo-500", text: "text-indigo-600", bg: "bg-indigo-50", icon: "text-indigo-600" },
        slate: { border: "border-slate-500", text: "text-slate-600", bg: "bg-slate-50", icon: "text-slate-600" },
    };

    const config = colorConfig[color] || colorConfig.blue;

    return (
        <div className={`bg-white border-l-4 ${config.border} rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 ${isUpdating ? 'animate-update' : ''}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-[10px] font-bold ${config.text} uppercase tracking-widest`}>{title}</p>
                    <p className={`text-xl font-extrabold text-gray-900 mt-1 transition-all duration-500 ${isUpdating ? 'scale-110 text-brand-600 shadow-glow' : ''}`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </p>
                </div>
                {icon && (
                    <div className={`${config.bg} rounded-lg p-1.5`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
