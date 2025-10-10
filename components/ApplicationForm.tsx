
import React, { useState, useEffect, FormEvent } from 'react';
import { Application, ApplicationStatus } from '../types';
import Modal from './Modal';

interface ApplicationFormProps {
    application: Application | null;
    onSave: (application: Application) => void;
    onClose: () => void;
    onDelete: (application: Application) => void;
    uniquePlatforms: string[];
    uniqueLocations: string[];
    uniqueRoles: string[];
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ application, onSave, onClose, onDelete, uniquePlatforms, uniqueLocations, uniqueRoles }) => {
    const [formData, setFormData] = useState<Partial<Application>>({
        company: '',
        role: '',
        submissionDate: new Date().toISOString().split('T')[0],
        status: ApplicationStatus.DIKIRIM,
        location: '',
        platform: '',
        url: '',
        notes: '',
        testDate: '',
        testStatus: '',
    });

    useEffect(() => {
        if (application) {
            setFormData({
                ...application,
                submissionDate: new Date(application.submissionDate).toISOString().split('T')[0],
            });
        }
    }, [application]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const finalApplication: Application = {
            id: application ? application.id : new Date().getTime().toString(),
            no: application ? application.no : 0, // No is set in App.tsx
            company: formData.company || '',
            role: formData.role || '',
            submissionDate: new Date(formData.submissionDate || '').toISOString(),
            status: formData.status || ApplicationStatus.DIKIRIM,
            location: formData.location || '',
            platform: formData.platform || '',
            url: formData.url || '',
            workSystem: formData.workSystem || 'On-site',
            notes: formData.notes || '',
            testDate: formData.testDate,
            testStatus: formData.testStatus,
        };
        onSave(finalApplication);
    };

    const handleDeleteClick = () => {
        if (application) {
            onDelete(application);
            onClose(); // Close the form modal to show the confirmation modal
        }
    };


    return (
        <Modal title={application ? 'Ubah Lamaran' : 'Tambah Lamaran Baru'} onClose={onClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perusahaan</label>
                        <input type="text" name="company" id="company" value={formData.company} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Posisi</label>
                        <input list="roles" type="text" name="role" id="role" value={formData.role} onChange={handleChange} required placeholder="e.g. Management Trainee" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                        <datalist id="roles">
                            {uniqueRoles.map(r => <option key={r} value={r} />)}
                        </datalist>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="submissionDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Melamar</label>
                        <input type="date" name="submissionDate" id="submissionDate" value={formData.submissionDate} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600">
                            {Object.values(ApplicationStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="platform" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Platform</label>
                         <input list="platforms" name="platform" id="platform" value={formData.platform || ''} onChange={handleChange} placeholder="e.g. JobStreet" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                        <datalist id="platforms">
                            {uniquePlatforms.map(p => <option key={p} value={p} />)}
                        </datalist>
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lokasi</label>
                        <input list="locations" name="location" id="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g. Jakarta" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                        <datalist id="locations">
                            {uniqueLocations.map(l => <option key={l} value={l} />)}
                        </datalist>
                    </div>
                </div>
                
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-slate-700 dark:text-slate-300">URL Lowongan</label>
                    <input type="url" name="url" id="url" value={formData.url} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                </div>
                
                <hr className="border-slate-200 dark:border-slate-600 my-4" />
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Detail Tes (Opsional)</h3>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="testDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tanggal Tes</label>
                        <input type="text" name="testDate" id="testDate" value={formData.testDate || ''} onChange={handleChange} placeholder="cth: 02/08/2024" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                    <div>
                        <label htmlFor="testStatus" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status Tes</label>
                        <input type="text" name="testStatus" id="testStatus" value={formData.testStatus || ''} onChange={handleChange} placeholder="cth: Selesai Tes" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600" />
                    </div>
                </div>

                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Catatan</label>
                    <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 px-3 py-2 dark:bg-slate-700 dark:border-slate-600"></textarea>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                     <div>
                        {application && (
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Hapus Lamaran
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                            Batal
                        </button>
                        <button type="submit" className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">
                            Simpan Lamaran
                        </button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default ApplicationForm;
