import React, { useState } from 'react';
import { AggregatedLoan, SortField, SortDirection, SortConfig, Loan } from '../types';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import SortIcon from './icons/SortIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';

interface ReportViewProps {
  loans: Loan[];
  aggregatedLoans: AggregatedLoan[];
  onSortChange: (field: SortField) => void;
  sortConfig: SortConfig;
}

const ReportView: React.FC<ReportViewProps> = ({ loans, aggregatedLoans, onSortChange, sortConfig }) => {
    const [expandedBorrower, setExpandedBorrower] = useState<string | null>(null);

    const handleRowClick = (borrowerName: string) => {
        setExpandedBorrower(prev => (prev === borrowerName ? null : borrowerName));
    };
    
    const renderSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) {
            return <SortIcon />;
        }
        if (sortConfig.direction === SortDirection.ASC) {
            return <ArrowUpIcon />;
        }
        return <ArrowDownIcon />;
    };

    const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
        <th 
            scope="col" 
            className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => onSortChange(field)}
            aria-sort={sortConfig.field === field ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <div className="flex items-center gap-2">
                {children}
                {renderSortIcon(field)}
            </div>
        </th>
    );
    
    const totalAmount = aggregatedLoans.reduce((acc, loan) => acc + loan.totalAmount, 0);
    const totalLoans = aggregatedLoans.reduce((acc, loan) => acc + loan.loanCount, 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Borrower Report</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50">
            <tr>
              <SortableHeader field={SortField.NAME}>Borrower Name</SortableHeader>
              <SortableHeader field={SortField.TOTAL_AMOUNT}>Total Loaned</SortableHeader>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                # of Loans
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {aggregatedLoans.length === 0 ? (
                <tr>
                    <td colSpan={3} className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No data for the report yet.
                    </td>
                </tr>
            ) : (
                aggregatedLoans.map((aggLoan) => (
                  <React.Fragment key={aggLoan.name}>
                    <tr 
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(aggLoan.name)}
                      aria-expanded={expandedBorrower === aggLoan.name}
                    >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <ChevronRightIcon className={`transition-transform transform text-slate-400 ${expandedBorrower === aggLoan.name ? 'rotate-90' : ''}`} />
                            <span>{aggLoan.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(aggLoan.totalAmount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{aggLoan.loanCount}</td>
                    </tr>
                    {expandedBorrower === aggLoan.name && (
                       <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                          <td colSpan={3} className="p-4 pl-12">
                              <div className="overflow-x-auto">
                                  <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-600">
                                            <th scope="col" className="pb-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
                                            <th scope="col" className="pb-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date</th>
                                            <th scope="col" className="pb-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                                            <th scope="col" className="pb-2 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                      {loans
                                          .filter(loan => loan.name === aggLoan.name)
                                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                                          .map(loan => (
                                              <tr key={loan.id} className="border-t border-slate-200 dark:border-slate-700">
                                                <td className="py-3 pr-4 text-sm text-slate-800 dark:text-slate-200">
                                                    {loan.description || 'No description'}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    {loan.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </td>
                                                <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                                    {loan.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </td>
                                                <td className="py-3 pl-4 whitespace-nowrap text-sm font-semibold text-slate-800 dark:text-slate-100 text-right">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(loan.amount)}
                                                </td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
            )}
          </tbody>
           <tfoot className="bg-slate-100 dark:bg-slate-700/50 border-t-2 border-slate-300 dark:border-slate-600">
              <tr>
                  <td className="px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">Total</td>
                  <td className="px-6 py-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)}
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-slate-800 dark:text-slate-100">
                      {totalLoans}
                  </td>
              </tr>
            </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ReportView;