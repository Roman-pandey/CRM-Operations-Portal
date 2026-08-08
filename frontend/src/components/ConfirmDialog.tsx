import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  onConfirm: () => void;
  onCancel?: () => void;
  title: string;
  message: string;
  isDestructive?: boolean;
  variant?: 'danger' | 'warning' | string;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  isDestructive = false,
  variant
}: ConfirmDialogProps) => {
  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const isRed = isDestructive || variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title}>
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-full ${isRed ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-slate-300">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            onConfirm();
            handleCancel();
          }}
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            isRed 
              ? 'bg-red-600 hover:bg-red-500' 
              : 'bg-indigo-600 hover:bg-indigo-500'
          }`}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
};
