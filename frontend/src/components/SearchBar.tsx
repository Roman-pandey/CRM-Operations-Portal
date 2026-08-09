import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  value?: string;
  onChange?: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ 
  onSearch, 
  value: externalValue, 
  onChange: externalOnChange, 
  placeholder = 'Search...', 
  className = '' 
}: SearchBarProps) => {
  const isControlled = externalValue !== undefined;
  const [internalQuery, setInternalQuery] = useState('');

  // Extract clean string query (handling accidental non-string values)
  const currentQuery = isControlled 
    ? (typeof externalValue === 'string' ? externalValue : '') 
    : internalQuery;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!isControlled) {
      setInternalQuery(val);
    }
    if (externalOnChange) {
      externalOnChange(val);
    }
    if (onSearch) {
      onSearch(val);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-slate-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
        placeholder={placeholder}
        value={currentQuery}
        onChange={handleChange}
      />
    </div>
  );
};
