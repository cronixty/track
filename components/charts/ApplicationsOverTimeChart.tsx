
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Application } from '../../types';

interface ApplicationsOverTimeChartProps {
    applications: Application[];
    onDataClick: (title: string, applications: Application[]) => void;
}

const ApplicationsOverTimeChart: React.FC<ApplicationsOverTimeChartProps> = ({ applications, onDataClick }) => {
    const sortedApps = [...applications].sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime());

    const data = sortedApps.reduce((acc, app) => {
        const date = new Date(app.submissionDate).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
        const existingEntry = acc.find(item => item.date === date);

        if (existingEntry) {
            existingEntry.applications.push(app);
            existingEntry.count = existingEntry.applications.length;
        } else {
            acc.push({ date, count: 1, applications: [app] });
        }
        return acc;
    }, [] as { date: string; count: number; applications: Application[] }[]);
    
    if (applications.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-500">Tidak ada data lamaran untuk ditampilkan.</div>;
    }

    const handleClick = (e: any) => {
        if (e && e.activePayload && e.activePayload.length > 0) {
            const payload = e.activePayload[0].payload;
            onDataClick(`Lamaran pada ${payload.date}`, payload.applications);
        }
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    onClick={handleClick}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8' }} fontSize={12} />
                    <YAxis allowDecimals={false} tick={{ fill: '#94a3b8' }} fontSize={12} />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                        }}
                         labelStyle={{ color: '#cbd5e1' }}
                    />
                    <Legend wrapperStyle={{fontSize: "0.875rem"}} />
                    <Line type="monotone" dataKey="count" name="Lamaran" stroke="#0ea5e9" strokeWidth={2} activeDot={{ r: 8 }} cursor="pointer" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ApplicationsOverTimeChart;