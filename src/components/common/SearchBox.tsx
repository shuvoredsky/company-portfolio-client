'use client';

import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export interface SearchBoxProps {
  basePath: string;
  initialValue: string;
  label: string;
  placeholder: string;
  clearLabel: string;
  submitLabel: string;
}

export function SearchBox({
  basePath,
  initialValue,
  label,
  placeholder,
  clearLabel,
  submitLabel,
}: SearchBoxProps) {
  const router = useRouter();
  const inputId = useId();
  const normalizedInitial = initialValue.trim().slice(0, 100);
  const [prevInitial, setPrevInitial] = useState(normalizedInitial);
  const [value, setValue] = useState(initialValue);

  if (normalizedInitial !== prevInitial) {
    setPrevInitial(normalizedInitial);
    setValue(initialValue);
  }

  const debouncedValue = useDebouncedValue(value, 400);

  const navigateWithQuery = useCallback(
    (raw: string) => {
      const trimmed = raw.trim().slice(0, 100);
      if (trimmed === normalizedInitial) return;

      const params = new URLSearchParams();
      if (trimmed) {
        params.set('search', trimmed);
      }
      const query = params.toString();
      router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
    },
    [basePath, normalizedInitial, router],
  );

  useEffect(() => {
    navigateWithQuery(debouncedValue);
  }, [debouncedValue, navigateWithQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigateWithQuery(value);
  };

  const handleClear = () => {
    setValue('');
    if (normalizedInitial !== '') {
      router.replace(basePath, { scroll: false });
    }
  };

  return (
    <form
      role="search"
      action={basePath}
      method="GET"
      onSubmit={handleSubmit}
      className="relative flex w-full max-w-md items-center"
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>

      <Search
        className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted-foreground"
        aria-hidden="true"
      />

      <input
        id={inputId}
        name="search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        maxLength={100}
        aria-label={label}
        className="min-h-11 w-full rounded-xl border border-input bg-card py-2 pr-11 pl-10 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 [&::-webkit-search-cancel-button]:hidden"
      />

      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label={clearLabel}
          className="absolute right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <button type="submit" className="sr-only">
          {submitLabel}
        </button>
      )}
    </form>
  );
}

