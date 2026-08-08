import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm print:static print:p-0 print:bg-white print:backdrop-blur-none">
      <div 
        className="absolute inset-0 print:hidden" 
        onClick={onClose}
      ></div>
      <div 
        ref={modalRef}
        className={`relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col print:border-none print:shadow-none print:max-h-none print:w-full print:max-w-none print:bg-white print:rounded-none`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-800 print:hidden">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 print:p-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
