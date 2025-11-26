import React from 'react';
import { Application } from '../types';
import { STATUS_COLORS } from '../constants';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';
import { LinkIcon } from './icons/LinkIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ApplicationListProps {
  applications: Application[];
  onEdit: (application: Application) => void;
  onDelete: (application: Application) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  uniquePlatforms: string[];
  uniqueLocations: string[];
  selectedPlatform: string;
  setSelectedPlatform: (platform: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
}

const getDomainFromUrl = (url: string): string => {
    if (!url || typeof url !== 'string' || url.trim() === '') return '-';
    try {
        const fullUrl = url.startsWith('http') ? url : `https://${url.split(' ')[0]}`; // Handle cases with notes in url field
        const hostname = new URL(fullUrl).hostname;
        return hostname.replace(/^www\./, '');
    } catch (error) {
        if (url.length > 25) {
            return url.substring(0, 22) + '...';
        }
        return url;
    }
};


const ApplicationList: React.FC<ApplicationListProps> = ({ 
    applications, 
    onEdit, 
    onDelete, 
    searchTerm, 
    setSearchTerm,
    uniquePlatforms,
    uniqueLocations,
    selectedPlatform,
    setSelectedPlatform,
    selectedLocation,
    setSelectedLocation
}) => {
    
     const handleExport = () => {
        // Ensure XLSX is available from the script loaded in index.html
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert('Fitur ekspor tidak tersedia. Silakan coba lagi nanti.');
            return;
        }

        // PERBAIKAN 1: Menambahkan index di sini agar Excel juga urut 1, 2, 3...
        const dataToExport = applications.map((app, index) => ({
            'No': index + 1,
            'Perusahaan': app.company,
            'Posisi': app.role,
            'Tanggal Submit': new Date(app.submissionDate).toLocaleDateString('id-ID'),
            'Status': app.status,
            'Platform': app.platform || '-',
            'Lokasi': app.location || '-',
            'Sumber': app.url || '-',
            'Tanggal Tes': app.testDate || '-',
            'Status Tes': app.testStatus || '-',
            'Catatan': app.notes || '-'
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Lamaran');

        // Set column widths for better readability
        worksheet['!cols'] = [
            { wch: 5 },   // No
            { wch: 30 },  // Perusahaan
            { wch: 30 },  // Posisi
            { wch: 15 },  // Tanggal Submit
            { wch: 15 },  // Status
            { wch: 15 },  // Platform
            { wch: 15 },  // Lokasi
            { wch: 40 },  // Sumber
            { wch: 15 },  // Tanggal Tes
            { wch: 15 },  // Status Tes
            { wch: 50 },  // Catatan
        ];

        XLSX.writeFile(workbook, 'Daftar_Lamaran_Pekerjaan.xlsx');
    };
    
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-xl shadow-lg">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Semua Lamaran</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handleExport}
                        disabled={applications.length === 0}
                        className="flex items-center gap-2 w-full sm:w-auto bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Ekspor XLSX
                    </button>
                    <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value)}
                        className="w-full sm:w-40 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="">Semua Platform</option>
                        {uniquePlatforms.map(platform => (
                            <option key={platform} value={platform}>{platform}</option>
                        ))}
                    </select>
                     <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full sm:w-40 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                        <option value="">Semua Lokasi</option>
                        {uniqueLocations.map(location => (
                            <option key={location} value={location}>{location}</option>
                        ))}
                    </select>
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Cari perusahaan atau posisi..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <svg className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>
            <div className="overflow-auto max-h-[600px]">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">No</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Perusahaan / Posisi</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tgl Submit</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Platform</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Lokasi</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Sumber</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tgl Tes</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status Tes</th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Aksi</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                       {/* PERBAIKAN 2: Menambahkan index di sini agar tampilan tabel urut 1, 2, 3... */}
                       {applications.length > 0 ? applications.map((app, index) => (
                            <tr key={app.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                {/* PERBAIKAN 3: Menggunakan index + 1 sebagai nomor urut */}
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">{app.company}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{app.role}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(app.submissionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[app.status]?.base || 'bg-gray-200'}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{app.platform || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{app.location || '-'}</td>
                               
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                     {app.url ? (
                                        <a href={app.url.startsWith('http') ? app.url : `https://${app.url.split(' ')[0]}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 group">
                                            <LinkIcon className="w-4 h-4 flex-shrink-0" />
                                            <span className="group-hover:underline truncate" style={{maxWidth: '120px'}}>{getDomainFromUrl(app.url)}</span>
                                        </a>
                                    ) : (
                                        <span className="text-slate-500 dark:text-slate-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{app.testDate || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{app.testStatus || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-3">
                                        <button onClick={() => onEdit(app)} className="text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300" aria-label={`Ubah lamaran ${app.company}`}>
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button 
                                          onClick={() => onDelete(app)}
                                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                          aria-label={`Hapus lamaran ${app.company}`}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                           <tr>
                                <td colSpan={10} className="text-center py-10 text-slate-500 dark:text-slate-400">
                                    Tidak ada lamaran yang ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicationList;