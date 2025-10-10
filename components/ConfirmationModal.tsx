
import React from 'react';
import Modal from './Modal';
import { TrashIcon } from './icons/TrashIcon';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ message, onConfirm, onCancel }) => {
  return (
    <Modal title="Konfirmasi Tindakan" onClose={onCancel}>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
           <svg className="h-6 w-6 text-red-600 dark:text-red-400" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
        </div>
        <h3 className="mt-5 text-lg font-medium text-slate-900 dark:text-white">Apakah Anda yakin?</h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {message}
          </p>
        </div>
        <div className="flex justify-center gap-3 mt-4">
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <TrashIcon className="w-4 h-4" />
            Ya, Hapus
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
