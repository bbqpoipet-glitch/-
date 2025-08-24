import React, { useState, useRef, useEffect } from 'react';
import { Loan } from '../types';
import CloseIcon from './icons/CloseIcon';

interface LoanFormProps {
  onAddLoan: (loan: Omit<Loan, 'id' | 'date'>) => void;
  savedDescriptions: string[];
  onDeleteDescription: (description: string) => void;
}

const LoanForm: React.FC<LoanFormProps> = ({ onAddLoan, savedDescriptions, onDeleteDescription }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const descriptionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (descriptionContainerRef.current && !descriptionContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDescription(value);

    if (value.length > 0) {
      const filtered = savedDescriptions.filter(s =>
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setDescription(suggestion);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || !amount.trim()) {
      setError('Borrower name and amount are required.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid, positive loan amount.');
      return;
    }

    onAddLoan({ name: name.trim(), amount: parsedAmount, description: description.trim() });
    setName('');
    setAmount('');
    setDescription('');
    setError('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">Add New Loan</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Borrower's Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Doe"
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g., 150.00"
            step="0.01"
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
          />
        </div>
        <div ref={descriptionContainerRef} className="relative">
          <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description (Optional)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={handleDescriptionChange}
            onFocus={() => {
                if (description.length > 0 && savedDescriptions.length > 0) {
                    const filtered = savedDescriptions.filter(s => s.toLowerCase().includes(description.toLowerCase()));
                    setSuggestions(filtered);
                    setShowSuggestions(true);
                }
            }}
            placeholder="e.g., For lunch"
            autoComplete="off"
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
          />
           {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              <ul className="py-1">
                {suggestions.map(suggestion => (
                  <li key={suggestion} className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                    <span
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex-grow text-left px-4 py-2"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDescription(suggestion);
                      }}
                      className="mr-2 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800/50 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label={`Delete saved item: "${suggestion}"`}
                    >
                      <CloseIcon />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/50 transition-transform transform active:scale-95"
        >
          Add Loan Record
        </button>
      </form>
    </div>
  );
};

export default LoanForm;