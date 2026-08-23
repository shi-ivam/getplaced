import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Plus, X } from "lucide-react";

export default function SearchableCombobox({
  options = [],
  value = "",
  onChange = () => {},
  placeholder = "Select or type...",
  label = "",
  error = "",
  allowCustom = true,
  customPromptPrefix = "Use custom:",
  helperText = "",
  name = "",
  id = "",
  required = false,
  icon: Icon = null,
  quickSuggestions = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value || "");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setSearchQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchQuery(value || "");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const filteredOptions = options.filter((opt) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return opt.toLowerCase().includes(q);
  });

  const isExactMatch = options.some(
    (opt) => opt.toLowerCase() === searchQuery.toLowerCase().trim()
  );

  const showCustomOption =
    allowCustom &&
    searchQuery.trim().length > 0 &&
    !isExactMatch;

  const totalSelectableCount =
    filteredOptions.length + (showCustomOption ? 1 : 0);

  const handleSelect = (selectedVal) => {
    onChange(selectedVal);
    setSearchQuery(selectedVal);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    if (!isOpen) setIsOpen(true);
    setHighlightedIndex(0);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalSelectableCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalSelectableCount) % totalSelectableCount);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (showCustomOption && highlightedIndex === 0) {
        handleSelect(searchQuery.trim());
      } else {
        const offset = showCustomOption ? 1 : 0;
        const actualOptionIdx = highlightedIndex - offset;
        if (actualOptionIdx >= 0 && filteredOptions[actualOptionIdx]) {
          handleSelect(filteredOptions[actualOptionIdx]);
        } else if (filteredOptions.length > 0) {
          handleSelect(filteredOptions[0]);
        } else if (allowCustom && searchQuery.trim()) {
          handleSelect(searchQuery.trim());
        }
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery(value || "");
      e.preventDefault();
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
    <div className="space-y-1.5 w-full text-left" ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-[#6F6A80] text-xs font-semibold flex items-center gap-1.5">
            {Icon && <Icon className="w-3.5 h-3.5 text-[#6F6A80]" />}
            <span>{label}</span>
            {required && <span className="text-[#C7382B]">*</span>}
          </label>
          {helperText && <span className="text-[11px] text-[#6F6A80]">{helperText}</span>}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F6A80]">
          <Search className="w-3.5 h-3.5" />
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
          className={`w-full h-9 pl-9 pr-14 rounded-xl bg-[#F8F8F5] border text-[#17103D] text-xs font-medium placeholder:text-[#6F6A80]/60 focus:outline-none focus:bg-white focus:border-[#6E44FF] transition-colors ${
            error
              ? "border-[#C7382B]"
              : "border-[#E2DEEC]"
          }`}
        />

        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-[#6F6A80] hover:text-[#17103D] rounded hover:bg-[#E2DEEC]/50 transition-colors cursor-pointer"
              title="Clear"
            >
              <X className="w-3 h-3" />
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
            className="p-1 text-[#6F6A80] hover:text-[#17103D] rounded hover:bg-[#E2DEEC]/50 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#17103D]" : ""}`} />
          </button>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-xl bg-white border border-[#E2DEEC] shadow-xl py-1 text-xs">
            {/* Custom option prompt */}
            {showCustomOption && (
              <button
                type="button"
                onClick={() => handleSelect(searchQuery.trim())}
                className={`w-full text-left px-3 py-2 flex items-center justify-between border-b border-[#E2DEEC] transition-colors cursor-pointer ${
                  highlightedIndex === 0 ? "bg-[#F2F0FA] text-[#6E44FF]" : "hover:bg-[#F8F8F5] text-[#17103D]"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Plus className="w-3.5 h-3.5 text-[#6E44FF] shrink-0" />
                  <span className="truncate">
                    {customPromptPrefix} <strong className="text-[#17103D] font-bold">"{searchQuery.trim()}"</strong>
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EFEAFF] text-[#6E44FF] font-bold uppercase tracking-wider shrink-0 ml-2">
                  Custom
                </span>
              </button>
            )}

            {/* Filtered suggestions */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => {
                const isSelected = value === option;
                const offset = showCustomOption ? 1 : 0;
                const isHighlighted = highlightedIndex === idx + offset;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(idx + offset)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                      isHighlighted
                        ? "bg-[#F2F0FA] text-[#17103D] font-semibold"
                        : isSelected
                        ? "bg-[#EFEAFF] text-[#6E44FF] font-bold"
                        : "text-[#17103D] hover:bg-[#F8F8F5]"
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 shrink-0 ml-2 text-[#6E44FF]" />
                    )}
                  </button>
                );
              })
            ) : !showCustomOption ? (
              <div className="px-3 py-4 text-center text-xs text-[#6F6A80]">
                No matching options found.
              </div>
            ) : null}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-medium text-[#C7382B] tracking-wide mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
