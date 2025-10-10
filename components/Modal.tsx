
import React, { ReactNode } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';

interface ModalProps {
    title: string;
    children: ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                        <XMarkIcon className="w-6 h-6" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
