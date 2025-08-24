import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loan, AggregatedLoan, SortField, SortDirection } from './types';
import LoanForm from './components/LoanForm';
import ReportView from './components/ReportView';
import MonthlyReport from './components/MonthlyReport';

const App: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savedDescriptions, setSavedDescriptions] = useState<string[]>([]);
  
  // State for overall report
  const [sortField, setSortField] = useState<SortField>(SortField.NAME);
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);

  // State for monthly report
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [monthlySortField, setMonthlySortField] = useState<SortField>(SortField.NAME);
  const [monthlySortDirection, setMonthlySortDirection] = useState<SortDirection>(SortDirection.ASC);

  useEffect(() => {
    try {
      const savedLoansRaw = localStorage.getItem('loans');
      if (savedLoansRaw) {
        const savedLoans = JSON.parse(savedLoansRaw);
        // Ensure date property is converted back to a Date object
        const loansWithDates = savedLoans.map((loan: any) => ({
          ...loan,
          date: new Date(loan.date),
        }));
        setLoans(loansWithDates);
      }
      
      const savedDescriptionsRaw = localStorage.getItem('savedDescriptions');
      if (savedDescriptionsRaw) {
        setSavedDescriptions(JSON.parse(savedDescriptionsRaw));
      }

    } catch (error) {
      console.error("Failed to load data from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('loans', JSON.stringify(loans));
    } catch (error)      {
      console.error("Failed to save loans to local storage", error);
    }
  }, [loans]);
  
  useEffect(() => {
    try {
      localStorage.setItem('savedDescriptions', JSON.stringify(savedDescriptions));
    } catch (error)      {
      console.error("Failed to save descriptions to local storage", error);
    }
  }, [savedDescriptions]);

  const handleAddLoan = useCallback((newLoan: Omit<Loan, 'id' | 'date'>) => {
    setLoans(prevLoans => [
      ...prevLoans,
      {
        ...newLoan,
        id: `${Date.now()}-${Math.random()}`,
        date: new Date(),
      },
    ]);
    
    const trimmedDescription = newLoan.description.trim();
    if (trimmedDescription && !savedDescriptions.includes(trimmedDescription)) {
      setSavedDescriptions(prev => [...prev, trimmedDescription].sort());
    }
  }, [savedDescriptions]);

  const handleDeleteDescription = useCallback((descriptionToDelete: string) => {
    setSavedDescriptions(prev => prev.filter(d => d !== descriptionToDelete));
  }, []);

  const handleSortChange = useCallback((field: SortField) => {
    setSortField(prevField => {
      if (prevField === field) {
        setSortDirection(prevDirection => 
          prevDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
        );
      } else {
        setSortDirection(SortDirection.ASC);
      }
      return field;
    });
  }, []);

  // Handler for monthly report sort
  const handleMonthlySortChange = useCallback((field: SortField) => {
    setMonthlySortField(prevField => {
      if (prevField === field) {
        setMonthlySortDirection(prevDirection =>
          prevDirection === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC
        );
      } else {
        setMonthlySortDirection(SortDirection.ASC);
      }
      return field;
    });
  }, []);

  // Handler for month selection
  const handleMonthChange = useCallback((month: string) => {
    setSelectedMonth(month);
  }, []);
  
  // Memoized calculation for available months
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    loans.forEach(loan => {
      const year = loan.date.getFullYear();
      const month = (loan.date.getMonth() + 1).toString().padStart(2, '0');
      monthSet.add(`${year}-${month}`);
    });
    return Array.from(monthSet).sort().reverse();
  }, [loans]);
  
  // Effect to set the selected month automatically
  useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    } else if (availableMonths.length === 0) {
      setSelectedMonth('');
    }
  }, [availableMonths, selectedMonth]);

  const aggregatedLoans = useMemo<AggregatedLoan[]>(() => {
    const aggregation: { [key: string]: { totalAmount: number; loanCount: number } } = {};
    
    loans.forEach(loan => {
      if (!aggregation[loan.name]) {
        aggregation[loan.name] = { totalAmount: 0, loanCount: 0 };
      }
      aggregation[loan.name].totalAmount += loan.amount;
      aggregation[loan.name].loanCount += 1;
    });

    const aggregatedArray: AggregatedLoan[] = Object.keys(aggregation).map(name => ({
      name,
      totalAmount: aggregation[name].totalAmount,
      loanCount: aggregation[name].loanCount,
    }));

    aggregatedArray.sort((a, b) => {
      const directionModifier = sortDirection === SortDirection.ASC ? 1 : -1;
      if (sortField === SortField.NAME) {
        return a.name.localeCompare(b.name) * directionModifier;
      } else { // Sort by totalAmount
        return (a.totalAmount - b.totalAmount) * directionModifier;
      }
    });

    return aggregatedArray;
  }, [loans, sortField, sortDirection]);

  // Memoized calculation for monthly aggregated loans
  const monthlyAggregatedLoans = useMemo<AggregatedLoan[]>(() => {
    if (!selectedMonth) return [];

    const [year, month] = selectedMonth.split('-').map(Number);

    const filteredLoans = loans.filter(loan =>
      loan.date.getFullYear() === year && loan.date.getMonth() + 1 === month
    );

    const aggregation: { [key: string]: { totalAmount: number; loanCount: number } } = {};
    
    filteredLoans.forEach(loan => {
      if (!aggregation[loan.name]) {
        aggregation[loan.name] = { totalAmount: 0, loanCount: 0 };
      }
      aggregation[loan.name].totalAmount += loan.amount;
      aggregation[loan.name].loanCount += 1;
    });

    const aggregatedArray: AggregatedLoan[] = Object.keys(aggregation).map(name => ({
      name,
      totalAmount: aggregation[name].totalAmount,
      loanCount: aggregation[name].loanCount,
    }));

    aggregatedArray.sort((a, b) => {
      const directionModifier = monthlySortDirection === SortDirection.ASC ? 1 : -1;
      if (monthlySortField === SortField.NAME) {
        return a.name.localeCompare(b.name) * directionModifier;
      } else { // Sort by totalAmount
        return (a.totalAmount - b.totalAmount) * directionModifier;
      }
    });

    return aggregatedArray;
  }, [loans, selectedMonth, monthlySortField, monthlySortDirection]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-600 dark:text-primary-400 tracking-tight">
            ផ្កាកាហ្វេកត់បុង
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            តាមដានការជំពាក់របស់អ្នកដោយងាយស្រួល
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <LoanForm 
              onAddLoan={handleAddLoan} 
              savedDescriptions={savedDescriptions}
              onDeleteDescription={handleDeleteDescription}
            />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <ReportView 
              loans={loans}
              aggregatedLoans={aggregatedLoans} 
              onSortChange={handleSortChange}
              sortConfig={{ field: sortField, direction: sortDirection }}
            />
            <MonthlyReport
              aggregatedLoans={monthlyAggregatedLoans}
              onSortChange={handleMonthlySortChange}
              sortConfig={{ field: monthlySortField, direction: monthlySortDirection }}
              availableMonths={availableMonths}
              selectedMonth={selectedMonth}
              onMonthChange={handleMonthChange}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;