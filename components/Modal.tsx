import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'confirm' | 'error' | 'info';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  onConfirm,
  confirmText = '확인',
  cancelText = '취소',
}) => {
  // Icon & Color Mapping
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-12 h-12 text-teal-400" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-400" />;
      case 'confirm':
        return <AlertTriangle className="w-12 h-12 text-amber-400" />;
      default:
        return <Info className="w-12 h-12 text-blue-400" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'success':
        return 'from-teal-500/20 to-emerald-500/5';
      case 'error':
        return 'from-red-500/20 to-rose-500/5';
      case 'confirm':
        return 'from-amber-500/20 to-orange-500/5';
      default:
        return 'from-blue-500/20 to-cyan-500/5';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-teal-500/25';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 shadow-red-500/25';
      case 'confirm':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/25';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 shadow-blue-500/25';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-md bg-[#1a1f2e]/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient()} opacity-50 pointer-events-none`} />
            
            <div className="relative z-10 p-8 flex flex-col items-center text-center">
              {/* Icon Wrapper with Glow */}
              <div className="mb-6 relative">
                <div className={`absolute inset-0 blur-2xl opacity-30 ${type === 'error' ? 'bg-red-500' : type === 'confirm' ? 'bg-amber-500' : 'bg-teal-500'}`}></div>
                <div className="relative bg-white/5 p-4 rounded-full border border-white/10 shadow-inner">
                  {getIcon()}
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                {title}
              </h3>
              
              <p className="text-slate-400 mb-8 leading-relaxed whitespace-pre-line">
                {message}
              </p>

              <div className="flex gap-3 w-full">
                {type === 'confirm' && (
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold transition-all duration-200"
                  >
                    {cancelText}
                  </button>
                )}
                
                <button
                  onClick={() => {
                    if (type === 'confirm' && onConfirm) {
                      onConfirm();
                    } else {
                      onClose();
                    }
                  }}
                  className={`flex-1 px-6 py-3.5 rounded-xl text-white font-bold text-sm tracking-wide shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${getButtonColor()}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
