import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Plus, X, Search } from "lucide-react";

export default function SearchableCombobox({
  id,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Select or type...",
  label,
  required = false,
  error,
  icon: Icon,
  quickSuggestions = [],
  customPromptPrefix = "Use",
  helperText,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync external value with input searchQuery
  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // If dropdown is closed and input query doesn't match value, keep value or accept query if user typed
        if (searchQuery.trim() !== (value || "")) {
          // If query is empty, set value to empty
          if (!searchQuery.trim()) {
            onChange("");
          } else {
            // Keep query as custom value if not empty
            onChange(searchQuery.trim());
          }
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchQuery, value, onChange]);

  // Filtered options based on query
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const isExactMatch = options.some(
    (option) => option.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  const showCustomOption = searchQuery.trim().length > 0 && !isExactMatch;

  const totalItemsCount = (showCustomOption ? 1 : 0) + filteredOptions.length;

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setSearchQuery(selectedValue);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (totalItemsCount || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + (totalItemsCount || 1)) % (totalItemsCount || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showCustomOption && highlightedIndex === 0) {
        handleSelect(searchQuery.trim());
      } else {
        const optionIndex = showCustomOption ? highlightedIndex - 1 : highlightedIndex;
        if (filteredOptions[optionIndex]) {
          handleSelect(filteredOptions[optionIndex]);
        } else if (searchQuery.trim()) {
          handleSelect(searchQuery.trim());
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="space-y-1.5 w-full" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-gray-300 text-sm font-medium flex items-center gap-1.5">
            {Icon && <Icon className="w-4 h-4 text-purple-400" />}
            <span>{label}</span>
            {required && <span className="text-red-400">*</span>}
          </label>
          {helperText && <span className="text-[11px] text-gray-500">{helperText}</span>}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={`w-full h-10 pl-9 pr-16 rounded-md bg-[#1c1c1c] border text-white text-sm placeholder:text-gray-500 focus:outline-none transition-colors ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
              : "border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          }`}
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-200 rounded hover:bg-gray-800 transition-colors"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              if (!isOpen && inputRef.current) {
                inputRef.current.focus();
              }
            }}
            className="p-1 text-gray-400 hover:text-gray-200 rounded hover:bg-gray-800 transition-colors"
            tabIndex={-1}
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-purple-400" : ""}`} />
          </button>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-[#181818] border border-gray-700/80 shadow-2xl py-1 text-sm">
            {/* Custom option prompt */}
            {showCustomOption && (
              <button
                type="button"
                onClick={() => handleSelect(searchQuery.trim())}
                className={`w-full text-left px-3 py-2 flex items-center justify-between border-b border-gray-800/80 transition-colors ${
                  highlightedIndex === 0 ? "bg-purple-950/70 text-purple-200" : "hover:bg-purple-950/40 text-purple-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Plus className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">
                    {customPromptPrefix} <strong className="text-white font-medium">"{searchQuery.trim()}"</strong>
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50 uppercase font-bold tracking-wider shrink-0 ml-2">
                  Custom
                </span>
              </button>
            )}

            {/* Filtered suggestions */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const itemIndex = showCustomOption ? idx + 1 : idx;
                const isSelected = value.toLowerCase() === option.toLowerCase();
                const isHighlighted = highlightedIndex === itemIndex;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      isHighlighted
                        ? "bg-purple-600 text-white font-medium"
                        : isSelected
                        ? "bg-purple-900/40 text-purple-200"
                        : "text-gray-300 hover:bg-[#242424] hover:text-white"
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && (
                      <Check className={`w-4 h-4 shrink-0 ml-2 ${isHighlighted ? "text-white" : "text-purple-400"}`} />
                    )}
                  </button>
                );
              })
            ) : !showCustomOption ? (
              <div className="px-3 py-3 text-center text-xs text-gray-500">
                No matching options found.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Quick suggestions pills */}
      {quickSuggestions && quickSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-gray-500 font-medium mr-0.5">Popular:</span>
          {quickSuggestions.map((item) => {
            const isSelected = value.toLowerCase() === item.toLowerCase();
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleSelect(item)}
                className={`text-[11px] px-2 py-0.5 rounded transition-all cursor-pointer ${
                  isSelected
                    ? "bg-purple-600 text-white font-semibold shadow-sm shadow-purple-900/50"
                    : "bg-gray-800/80 hover:bg-purple-900/50 hover:text-purple-300 text-gray-400 border border-gray-700/60"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
