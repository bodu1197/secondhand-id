'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  className,
  required,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={selectRef}> {/* Removed className from here */}
      <button
        type="button"
        className={`w-full p-2 rounded-lg border border-gray-700 bg-[#1f2937] text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center ${className || ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        required={required}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </button>

            {isOpen && (
              <> {/* Fragment to wrap multiple elements */}          {/* Add Webkit scrollbar hide for Chrome/Safari */}
          <style>{`
            .custom-select-options::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <ul
            className="absolute z-10 w-full mt-1 rounded-lg border border-gray-700 bg-[#1f2937] shadow-lg max-h-60 overflow-auto focus:outline-none custom-select-options"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // For Firefox and IE/Edge
            tabIndex={-1}
            role="listbox"
          >
            {options.map((option) => (
              <li
                key={option.value}
                className={`p-2 cursor-pointer hover:bg-gray-600 text-left ${option.value === value ? 'bg-blue-700 text-white' : 'text-gray-400'}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
