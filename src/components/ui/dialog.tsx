import React from 'react';

export const Dialog: React.FC<any> = ({ children, open }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      {children}
    </div>
  );
};

export const DialogContent: React.FC<any> = ({ children, className = "", ...props }) => (
  <div
    className={`w-full max-w-lg rounded-lg border border-gray-200 bg-white p-5 shadow-2xl ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const DialogHeader: React.FC<any> = ({ children, className = "", ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle: React.FC<any> = ({ children, className = "", ...props }) => (
  <h3 className={`text-lg font-bold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const DialogFooter: React.FC<any> = ({ children, className = "", ...props }) => (
  <div className={`mt-4 flex justify-end gap-2 ${className}`} {...props}>
    {children}
  </div>
);
export default Dialog;
