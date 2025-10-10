import React, { useMemo } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts';
import { Application } from '../../types';

interface RoleTreemapChartProps {
    applications: Application[];
    onDataClick: (title: string, applications: Application[]) => void;
}

const RoleTreemapChart: React.FC<RoleTreemapChartProps> = ({ applications, onDataClick }) => {
    const roleData = useMemo(() => {
        const roleGroups = applications.reduce((acc, app) => {
            let role = app.role ? app.role.trim().toLowerCase() : 'lainnya';
            if (role === '') role = 'lainnya';

            // Simple grouping for similar roles
            if (role.includes('management trainee') || role.includes('mt')) role = 'Management Trainee';
            else if (role.includes('hr') || role.includes('human resource') || role.includes('hc')) role = 'HR/HC Staff';
            else if (role.includes('legal')) role = 'Legal Staff';
            else if (role.includes('general affair') || role.includes('ga')) role = 'General Affair';
            
            role = role.replace(/\b\w/g, l => l.toUpperCase()); // Title Case

            if (!acc[role]) {
                acc[role] = [];
            }
            acc[role].push(app);
            return acc;
        }, {} as Record<string, Application[]>);

        const sortedRoles = Object.entries(roleGroups)
            .map(([name, apps]) => ({ name, value: apps.length, applications: apps }))
            .sort((a, b) => b.value - a.value);
        
        const topRoles = sortedRoles.slice(0, 7);
        const otherApps = sortedRoles.slice(7).flatMap(item => item.applications);

        if (otherApps.length > 0) {
            // Create a new array instead of mutating the existing one with push()
            return [...topRoles, { name: 'Lainnya', value: otherApps.length, applications: otherApps }];
        }
        
        return topRoles;
    }, [applications]);
    
    if (roleData.length < 3) {
        return <div className="flex items-center justify-center h-[350px] text-slate-500 dark:text-slate-400">Data posisi tidak cukup untuk membuat grafik.</div>;
    }
    
    const tickFormatter = (value: string) => {
        const MAX_LENGTH = 15;
        if (value.length > MAX_LENGTH) {
            return `${value.substring(0, MAX_LENGTH)}...`;
        }
        return value;
    };

    const handleClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const payload = data.activePayload[0].payload;
            onDataClick(`Lamaran untuk Posisi "${payload.name}"`, payload.applications);
        }
    };

    return (
        <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={roleData} onClick={handleClick}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                    <PolarAngleAxis 
                        dataKey="name" 
                        tickFormatter={tickFormatter} 
                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    />
                    <Radar 
                        name="Jumlah" 
                        dataKey="value" 
                        stroke="#a78bfa" 
                        fill="#8b5cf6" 
                        fillOpacity={0.7}
                        cursor="pointer" 
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <Legend wrapperStyle={{fontSize: "0.875rem", paddingTop: "20px" }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RoleTreemapChart;