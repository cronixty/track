import React from 'react';
import { Application } from '../types';
import Modal from './Modal';
import { STATUS_COLORS } from '../constants';

interface DrilldownModalProps {
  title: string;
  applications: Application[];
  onClose: () => void;
}

const DrilldownModal: React.FC<DrilldownModalProps> = ({ title, applications, onClose }) => {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="overflow-auto max-h-[60vh] text-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">No</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Perusahaan / Posisi</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tgl Submit</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {applications && applications.length > 0 ? [...applications]
              .filter(app => !!app) // Filter out any null/undefined entries to prevent crashes
              .sort((a, b) => a.no - b.no)
              .map((app) => (
              <tr key={app.id}>
                <td className="px-4 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{app.no}</td>
                <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">{app.company}</div>
                  <div className="text-slate-500 dark:text-slate-400 truncate">{app.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                  {new Date(app.submissionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${STATUS_COLORS[app.status]?.base || 'bg-gray-200'}`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-500 dark:text-slate-400">
                  Tidak ada data untuk ditampilkan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default DrilldownModal;