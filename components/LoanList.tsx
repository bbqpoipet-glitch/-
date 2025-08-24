
import React from 'react';
import { Loan } from '../types';

interface LoanListProps {
  loans: Loan[];
}

const LoanList: React.FC<LoanListProps> = ({ loans }) => {
  const sortedLoans = [...loans].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Full Loan History</h2>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {sortedLoans.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 dark:text-slate-400">No loans recorded yet.</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm">Use the form to add your first loan.</p>
          </div>
        ) : (
          sortedLoans.map((loan) => (
            <div key={loan.id} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex justify-between items-start gap-4">
              <div>
                <p className="font-semibold text-primary-700 dark:text-primary-400">{loan.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{loan.description || 'No description'}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{loan.date.toLocaleDateString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-slate-800 dark:text-slate-100">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(loan.amount)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LoanList;
