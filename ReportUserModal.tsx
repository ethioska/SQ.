import React, { useState } from 'react';

interface ReportUserModalProps {
  onClose: () => void;
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({ onClose }) => {
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !reason.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      console.log('Report submitted:', { userId, reason });
      setIsSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-glass border border-border-color rounded-2xl w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-border-color">
          <h2 className="text-xl font-bold text-text-primary">Report a User</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary text-2xl">&times;</button>
        </div>
        
        <div className="p-4">
          {success ? (
            <div className="text-center py-10">
              <p className="text-green-400 font-semibold">Report Submitted Successfully</p>
              <p className="text-text-secondary text-sm">Thank you for helping keep the community safe.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="report-user-id" className="text-sm text-text-secondary block mb-1">User ID to Report</label>
                <input
                  id="report-user-id"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none"
                  placeholder="Enter the user's ID (e.g., SQB_123456)"
                />
              </div>
              <div>
                <label htmlFor="report-reason" className="text-sm text-text-secondary block mb-1">Reason for Report</label>
                <textarea
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={4}
                  className="w-full bg-main-bg/50 border border-border-color rounded-lg p-3 text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent-cyan focus:outline-none"
                  placeholder="Please provide details about the issue..."
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportUserModal;