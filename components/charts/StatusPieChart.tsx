import React, { useState, useCallback, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Sector } from 'recharts';
import { Application, ApplicationStatus } from '../../types';

interface StatusPieChartProps {
    applications: Application[];
    onDataClick: (title: string, applications: Application[]) => void;
}

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;

    return (
        <g>
            <text x={cx} y={cy} dy={0} textAnchor="middle" fill="#f1f5f9" className="text-lg font-bold">
                {payload.name}
            </text>
            <text x={cx} y={cy} dy={24} textAnchor="middle" fill="#94a3b8" className="text-sm">
                {`${payload.value} (${(percent * 100).toFixed(0)}%)`}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 8}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                cornerRadius={4}
            />
        </g>
    );
};


const StatusPieChart: React.FC<StatusPieChartProps> = ({ applications, onDataClick }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, [setActiveIndex]);
    
    const data = useMemo(() => {
        const statusGroups = applications.reduce((acc, app) => {
            if (!acc[app.status]) {
                acc[app.status] = [];
            }
            acc[app.status].push(app);
            return acc;
        }, {} as Record<ApplicationStatus, Application[]>);

        return Object.entries(statusGroups).map(([name, apps]) => ({
            name: name as ApplicationStatus,
            value: apps.length,
            applications: apps,
        })).sort((a,b) => b.value - a.value);
    }, [applications]);
    
    if (applications.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-500">Tidak ada data lamaran untuk ditampilkan.</div>;
    }
    
    const colorMap: Record<ApplicationStatus, string> = {
      [ApplicationStatus.DIKIRIM]: '#38bdf8',
      [ApplicationStatus.PROSES]: '#facc15',
      [ApplicationStatus.TES_SELESAI]: '#a78bfa',
      [ApplicationStatus.TAWARAN]: '#4ade80',
      [ApplicationStatus.DITOLAK]: '#f87171',
      [ApplicationStatus.WISHLIST]: '#9ca3af',
    };

    // FIX: The 'activeIndex' prop is valid for the Pie component but may not be recognized by the installed TypeScript types. Casting Pie to `any` to bypass the type check.
    const PieComponent = Pie as any;

    return (
        <div style={{ width: '100%', height: 300, cursor: 'pointer' }}>
            <ResponsiveContainer>
                <PieChart>
                    <PieComponent
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={110}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        onMouseEnter={onPieEnter}
                        onClick={(data: any) => onDataClick(`Lamaran dengan Status "${data.name}"`, data.applications)}
                        paddingAngle={2}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colorMap[entry.name]} stroke={colorMap[entry.name]} />
                        ))}
                    </PieComponent>
                     <Legend 
                        iconSize={10}
                        iconType="square"
                        wrapperStyle={{fontSize: "0.875rem", paddingTop: "20px" }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StatusPieChart;