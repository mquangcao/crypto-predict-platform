import { useEffect, useRef, useState } from "react";
import {
  PiMagnifyingGlassBold as SearchIcon,
  PiXBold as XIcon,
} from "react-icons/pi";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  placeholder?: string;
  defaultValue?: string;
  debounceMs?: number;
  onSearch?: (value: string) => void;
  "aria-label"?: string;
  className?: string;
}

export function SearchInput({
  placeholder = "Search",
  defaultValue = "",
  debounceMs = 400,
  onSearch,
  "aria-label": ariaLabel = "Search",
  className,
}: SearchInputProps) {
  // Controlled input using state
  const [value, setValue] = useState<string>(defaultValue);
  const clearedRef = useRef(false);
  const [debouncedValue] = useDebouncedValue(value, debounceMs);

  useEffect(() => {
    // trigger initial search with default value
    onSearch?.(defaultValue);
  }, [defaultValue, onSearch]);

  useEffect(() => {
    if (!clearedRef.current) {
      onSearch?.(debouncedValue);
    } else {
      clearedRef.current = false;
    }
  }, [debouncedValue, onSearch]);

  return (
    <InputGroup style={{ minWidth: 200 }} className={cn(`${className}`)}>
      <InputGroupAddon align="inline-start">
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => {
          const v = e.currentTarget.value;
          clearedRef.current = false;
          setValue(v);
        }}
        className="text-xs!"
      />
      {value.length > 0 && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            onClick={() => {
              // clear controlled value and prevent pending debounced callback from firing
              setValue("");
              clearedRef.current = true;
              onSearch?.("");
            }}
            aria-label="Clear search"
            className="hover:bg-transparent cursor-pointer"
          >
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}
export default SearchInput;
