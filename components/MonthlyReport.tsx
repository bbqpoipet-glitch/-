import React from 'react';
import { AggregatedLoan, SortField, SortDirection, SortConfig } from '../types';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';
import SortIcon from './icons/SortIcon';

interface MonthlyReportProps {
  aggregatedLoans: AggregatedLoan[];
  onSortChange: (field: SortField) => void;
  sortConfig: SortConfig;
  availableMonths: string[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ 
  aggregatedLoans, 
  onSortChange, 
  sortConfig,
  availableMonths,
  selectedMonth,
  onMonthChange
}) => {
    
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

    const formatMonth = (monthStr: string) => {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };
    
    const totalAmount = aggregatedLoans.reduce((acc, loan) => acc + loan.totalAmount, 0);
    const totalLoans = aggregatedLoans.reduce((acc, loan) => acc + loan.loanCount, 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Monthly Report</h2>
        {availableMonths.length > 0 && (
          <div>
            <label htmlFor="month-select" className="sr-only">Select Month</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{formatMonth(month)}</option>
              ))}
            </select>
          </div>
        )}
      </div>
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
                        {availableMonths.length === 0 ? "No loans recorded yet." : `No loans recorded for ${formatMonth(selectedMonth)}.`}
                    </td>
                </tr>
            ) : (
                aggregatedLoans.map((loan) => (
                <tr key={loan.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{loan.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(loan.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{loan.loanCount}</td>
                </tr>
                ))
            )}
          </tbody>
          {aggregatedLoans.length > 0 && (
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
          )}
        </table>
      </div>
    </div>
  );
};

export default MonthlyReport;