// App.tsx - Versi Final dengan Koneksi Firebase dan Perbaikan Typo

import React, { useState, useMemo, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from './firebase'; // Pastikan file firebase.ts ada di direktori yang sama

import { Application } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ApplicationList from './components/ApplicationList';
import ApplicationForm from './components/ApplicationForm';
import { PlusIcon } from './components/icons/PlusIcon';
import ConfirmationModal from './components/ConfirmationModal';

const App: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    
    // Mengambil data dari Firestore secara real-time
    useEffect(() => {
        const q = query(collection(db, "applications"), orderBy("no"));
        
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const appsData: Application[] = [];
            querySnapshot.forEach((doc) => {
                // Baris ini sudah diperbaiki
                appsData.push({ ...doc.data(), id: doc.id } as Application);
            });
            setApplications(appsData);
        });

        // Membersihkan listener saat komponen tidak lagi digunakan
        return () => unsubscribe();
    }, []); // Array kosong berarti efek ini hanya berjalan sekali

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string>('');

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);


    const handleOpenForm = (app?: Application) => {
        setEditingApplication(app || null);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingApplication(null);
    };

    // Menyimpan atau mengupdate data ke Firestore
    const handleSaveApplication = async (app: Application) => {
        try {
            if (editingApplication && editingApplication.id) {
                const appDocRef = doc(db, 'applications', editingApplication.id);
                const { id, ...appData } = app;
                await updateDoc(appDocRef, appData);
            } else {
                const maxNo = applications.reduce((max, app) => app.no > max ? app.no : max, 0);
                const newApp = { ...app, no: maxNo + 1 };
                delete newApp.id;
                await addDoc(collection(db, 'applications'), newApp);
            }
        } catch (error) {
            console.error("Error saat menyimpan aplikasi: ", error);
        }
        handleCloseForm();
    };
    
    // Menghapus data dari Firestore
    const handleDeleteApplication = async (id: string) => {
        try {
            const appDocRef = doc(db, 'applications', id);
            await deleteDoc(appDocRef);
        } catch (error) {
            console.error("Error saat menghapus aplikasi: ", error);
        }
    };
    
    // Alur konfirmasi hapus
    const handleRequestDelete = (app: Application) => {
        setApplicationToDelete(app);
        setIsConfirmModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (applicationToDelete && applicationToDelete.id) {
            handleDeleteApplication(applicationToDelete.id);
        }
        setIsConfirmModalOpen(false);
        setApplicationToDelete(null);
    };

    const handleCancelDelete = () => {
        setIsConfirmModalOpen(false);
        setApplicationToDelete(null);
    };
    
    // Logika filtering dan lainnya (tidak perlu diubah)
    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const searchMatch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  app.role.toLowerCase().includes(searchTerm.toLowerCase());
            const platformMatch = selectedPlatform ? app.platform === selectedPlatform : true;
            const locationMatch = selectedLocation ? app.location === selectedLocation : true;
            return searchMatch && platformMatch && locationMatch;
        });
    }, [applications, searchTerm, selectedPlatform, selectedLocation]);

    const uniquePlatforms = useMemo(() => {
        const platforms = applications.map(app => app.platform).filter(p => p && p.trim() !== '');
        return [...new Set(platforms)].sort();
    }, [applications]);

    const uniqueLocations = useMemo(() => {
        const locations = applications.map(app => app.location).filter(l => l && l.trim() !== '');
        return [...new Set(locations)].sort();
    }, [applications]);

    const uniqueRoles = useMemo(() => {
        const roles = applications.map(app => app.role).filter(r => r && r.trim() !== '');
        return [...new Set(roles)].sort();
    }, [applications]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200 font-sans">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dasbor Pelacakan Lamaran</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Lacak dan analisis perjalanan pencarian kerjamu.</p>
                    </div>
                    <button
                        onClick={() => handleOpenForm()}
                        className="flex items-center gap-2 bg-brand-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-opacity-75 transition duration-200 w-full sm:w-auto"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Tambah Lamaran
                    </button>
                </div>
                
                 <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <p className="text-center text-slate-700 dark:text-slate-300 font-medium">
                        Sejauh ini kamu sudah kirim total <span className="font-bold text-brand-600">{applications.length}</span> lamaran. Semangat, Rifqi! Semoga segera ada kabar baik, ya! 💪
                    </p>
                </div>

                <Dashboard applications={applications} />

                <div className="mt-8">
                    <ApplicationList 
                        applications={filteredApplications} 
                        onEdit={handleOpenForm} 
                        onDelete={handleRequestDelete}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        uniquePlatforms={uniquePlatforms}
                        uniqueLocations={uniqueLocations}
                        selectedPlatform={selectedPlatform}
                        setSelectedPlatform={setSelectedPlatform}
                        selectedLocation={selectedLocation}
                        setSelectedLocation={setSelectedLocation}
                    />
                </div>
            </main>
            {isFormOpen && (
                <ApplicationForm
                    application={editingApplication}
                    onSave={handleSaveApplication}
                    onClose={handleCloseForm}
                    onDelete={handleRequestDelete}
                    uniquePlatforms={uniquePlatforms}
                    uniqueLocations={uniqueLocations}
                    uniqueRoles={uniqueRoles}
                />
            )}
             {isConfirmModalOpen && applicationToDelete && (
                <ConfirmationModal
                    message={`Tindakan ini akan menghapus lamaran untuk "${applicationToDelete.company}" secara permanen. Aksi ini tidak dapat diurungkan.`}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default App;