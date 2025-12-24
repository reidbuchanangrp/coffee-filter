import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Search, X } from "lucide-react";
import { Button } from "./ui/button";

interface Suggestion {
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number) => void;
  placeholder?: string;
}

export function LocationSearch({
  onLocationSelect,
  placeholder = "Search...",
}: LocationSearchProps) {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Format suggestion into readable address
  const formatAddress = (suggestion: Suggestion): string => {
    const { properties: p } = suggestion;
    const parts: string[] = [];

    if (p.name) {
      parts.push(p.name);
    } else if (p.housenumber && p.street) {
      parts.push(`${p.housenumber} ${p.street}`);
    } else if (p.street) {
      parts.push(p.street);
    }

    if (p.city) parts.push(p.city);
    if (p.state) parts.push(p.state);

    return parts.join(", ");
  };

  // Fetch suggestions from Photon API
  const fetchSuggestions = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setSuggestions(data.features || []);
      setIsSearchOpen(true);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSelect = (suggestion: Suggestion) => {
    const address = formatAddress(suggestion);
    const [lng, lat] = suggestion.geometry.coordinates;

    setValue(address);
    onLocationSelect(lat, lng);
    setSuggestions([]);
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsSearchOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        if (e.shiftKey) {
          if (highlightedIndex > 0) {
            e.preventDefault();
            setHighlightedIndex((prev) => prev - 1);
          } else if (highlightedIndex === 0) {
            setHighlightedIndex(-1);
          }
        } else {
          if (highlightedIndex < suggestions.length - 1) {
            e.preventDefault();
            setHighlightedIndex((prev) => prev + 1);
          } else if (highlightedIndex === suggestions.length - 1) {
            e.preventDefault();
            handleSelect(suggestions[highlightedIndex]);
          } else if (highlightedIndex === -1 && suggestions.length > 0) {
            e.preventDefault();
            setHighlightedIndex(0);
          }
        }
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setValue("");
    setSuggestions([]);
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
  };

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <Input
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setIsSearchOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-8 pr-8 h-9 bg-background/80 w-[110px] sm:w-[200px] md:w-[250px]"
          role="combobox"
          aria-expanded={isSearchOpen}
          aria-haspopup="listbox"
          aria-activedescendant={
            highlightedIndex >= 0
              ? `location-option-${highlightedIndex}`
              : undefined
          }
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 h-9 w-9 hover:bg-transparent"
            onClick={handleClear}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-2.5">
            <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {isSearchOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-9999 w-max min-w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              id={`location-option-${index}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`flex items-start gap-2 px-3 py-2 cursor-pointer text-sm ${
                index === highlightedIndex ? "bg-accent" : "hover:bg-accent"
              }`}
            >
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>{formatAddress(suggestion)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
