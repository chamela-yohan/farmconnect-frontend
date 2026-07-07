"use client";

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

interface SearchableComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableCombobox({ options, value, onChange, placeholder }: SearchableComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync search text when value changes externally
  useEffect(() => {
    setSearch(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        // Revert search text to the actual selected value if they typed something else
        setSearch(value); 
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setOpen(!open)}
        className="w-full h-11 px-3 bg-background border border-border rounded-lg text-foreground focus-within:ring-2 focus-within:ring-primary flex items-center justify-between cursor-pointer"
      >
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none cursor-pointer"
        />
        <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-md max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <div
                key={option}
                onClick={() => {
                  onChange(option); // Only triggers when they CLICK an option
                  setSearch(option);
                  setOpen(false);
                }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted flex items-center justify-between ${
                  value === option ? 'bg-muted font-medium' : ''
                }`}
              >
                {option}
                {value === option && <Check className="w-4 h-4 text-primary" />}
              </div>
            ))
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No category found. Please select from the list.
            </div>
          )}
        </div>
      )}
    </div>
  );
}