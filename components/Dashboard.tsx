import React, { useMemo, useState } from 'react';
import { Application, ApplicationStatus } from '../types';
import StatCard from './StatCard';
import StatusPieChart from './charts/StatusPieChart';
import ApplicationsOverTimeChart from './charts/ApplicationsOverTimeChart';
import RoleTreemapChart from './charts/ApplicationFunnelChart';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, LabelList } from 'recharts';
import DrilldownModal from './DrilldownModal';

interface DashboardProps {
  applications: Application[];
}

// --- Platform Chart Component ---
const PlatformChart: React.FC<{ 
    applications: Application[];
    onDataClick: (title: string, applications: Application[]) => void;
}> = ({ applications, onDataClick }) => {
    const PLATFORM_COLORS = ['#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e', '#38bdf8', '#7dd3fc'];

    const platformData = useMemo(() => {
        const platformGroups = applications.reduce((acc, app) => {
            const platform = app.platform?.trim() || 'Lainnya';
            if (!acc[platform]) {
                acc[platform] = [];
            }
            acc[platform].push(app);
            return acc;
        }, {} as Record<string, Application[]>);

        const allData = Object.entries(platformGroups)
            .map(([name, apps]) => ({ name, value: apps.length, applications: apps }))
            .sort((a, b) => b.value - a.value);

        const MAX_ITEMS = 6;
        if (allData.length <= MAX_ITEMS) {
            return allData.sort((a, b) => a.value - b.value); // Bar chart looks better ascending
        }

        const topItems = allData.slice(0, MAX_ITEMS - 1);
        const otherItems = allData.slice(MAX_ITEMS - 1);

        const othersGroup = otherItems.reduce((acc, item) => {
            return {
                name: 'Lainnya',
                value: acc.value + item.value,
                applications: [...acc.applications, ...item.applications]
            };
        }, { name: 'Lainnya', value: 0, applications: [] as Application[] });

        return [...topItems, othersGroup].sort((a, b) => a.value - b.value);

    }, [applications]);

     if (applications.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-500">Tidak ada data untuk ditampilkan.</div>;
    }

    const handleClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const payload = data.activePayload[0].payload;
            onDataClick(`Lamaran dari Platform "${payload.name}"`, payload.applications);
        }
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={platformData} margin={{ top: 5, right: 40, left: 20, bottom: 5 }} onClick={handleClick}>
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <Bar dataKey="value" barSize={25} radius={[0, 4, 4, 0]} cursor="pointer">
                         <LabelList dataKey="value" position="right" offset={8} className="font-semibold" fill="#FFFFFF" fontSize={12} />
                        {platformData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[index % PLATFORM_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Location Chart Component ---
const LocationChart: React.FC<{ 
    applications: Application[];
    onDataClick: (title: string, applications: Application[]) => void;
}> = ({ applications, onDataClick }) => {
    const LOCATION_COLORS = ['#4ade80', '#22c55e', '#16a34a', '#15803d', '#14532d', '#86efac', '#bbf7d0'];

    const locationData = useMemo(() => {
        const locationGroups = applications.reduce((acc, app) => {
            const location = app.location?.trim() || 'Tidak Disebutkan';
            if (!acc[location]) {
                acc[location] = [];
            }
            acc[location].push(app);
            return acc;
        }, {} as Record<string, Application[]>);

        const allData = Object.entries(locationGroups)
            .map(([name, apps]) => ({ name, value: apps.length, applications: apps }))
            .sort((a, b) => b.value - a.value);
            
        const MAX_ITEMS = 6;
        if (allData.length <= MAX_ITEMS) {
            return allData.sort((a, b) => a.value - b.value);
        }

        const topItems = allData.slice(0, MAX_ITEMS - 1);
        const otherItems = allData.slice(MAX_ITEMS - 1);

        const othersGroup = otherItems.reduce((acc, item) => {
            return {
                name: 'Lainnya',
                value: acc.value + item.value,
                applications: [...acc.applications, ...item.applications]
            };
        }, { name: 'Lainnya', value: 0, applications: [] as Application[] });

        return [...topItems, othersGroup].sort((a, b) => a.value - b.value);
    }, [applications]);

    if (applications.length === 0) {
        return <div className="flex items-center justify-center h-64 text-slate-500">Tidak ada data untuk ditampilkan.</div>;
    }

    const handleClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            const payload = data.activePayload[0].payload;
            onDataClick(`Lamaran di Lokasi "${payload.name}"`, payload.applications);
        }
    };

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart layout="vertical" data={locationData} margin={{ top: 5, right: 40, left: 20, bottom: 5 }} onClick={handleClick}>
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={100}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <Bar dataKey="value" barSize={25} radius={[0, 4, 4, 0]} cursor="pointer">
                        <LabelList dataKey="value" position="right" offset={8} className="font-semibold" fill="#FFFFFF" fontSize={12} />
                        {locationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={LOCATION_COLORS[index % LOCATION_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ applications }) => {
  const [drilldownState, setDrilldownState] = useState<{ isOpen: boolean; title: string; applications: Application[] }>({
    isOpen: false,
    title: '',
    applications: [],
  });

  const handleDataClick = (title: string, applications: Application[]) => {
    setDrilldownState({ isOpen: true, title, applications });
  };

  const handleCloseDrilldown = () => {
    setDrilldownState({ isOpen: false, title: '', applications: [] });
  };

  const totalApplications = applications.length;
  const interviewingCount = applications.filter(app => app.status === ApplicationStatus.PROSES || app.status === ApplicationStatus.TES_SELESAI).length;
  const offerCount = applications.filter(app => app.status === ApplicationStatus.TAWARAN).length;
  const activeApplications = applications.filter(app => 
    app.status === ApplicationStatus.DIKIRIM || app.status === ApplicationStatus.PROSES || app.status === ApplicationStatus.TES_SELESAI
  ).length;

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Lamaran 🚀" value={totalApplications} />
          <StatCard title="Proses Wawancara 💼" value={interviewingCount} />
          <StatCard title="Tawaran Diterima 🎉" value={offerCount} />
          <StatCard title="Lamaran Aktif 🔥" value={activeApplications} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Status Lamaran</h3>
            <StatusPieChart applications={applications} onDataClick={handleDataClick} />
          </div>
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Lamaran dari Waktu ke Waktu</h3>
            <ApplicationsOverTimeChart applications={applications} onDataClick={handleDataClick} />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Analisis Platform</h3>
              <PlatformChart applications={applications} onDataClick={handleDataClick} />
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Analisis Lokasi</h3>
              <LocationChart applications={applications} onDataClick={handleDataClick} />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Analisis Posisi</h3>
                <RoleTreemapChart applications={applications} onDataClick={handleDataClick} />
            </div>
        </div>
      </div>
      {drilldownState.isOpen && (
        <DrilldownModal 
            title={drilldownState.title}
            applications={drilldownState.applications}
            onClose={handleCloseDrilldown}
        />
      )}
    </>
  );
};

export default Dashboard;