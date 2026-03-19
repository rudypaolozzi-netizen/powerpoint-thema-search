'use client';

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSearch: (query: string) => void;
  resultCount: number | null;
  isSearching: boolean;
}

export default function SearchBar({ onSearch, resultCount, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        {isSearching ? (
          <Loader2 className={`${styles.icon} ${styles.spinner}`} size={20} />
        ) : (
          <Search className={styles.icon} size={20} />
        )}
        <input
          type="text"
          className={styles.input}
          placeholder="Recherche de l'ensemble des slides qui contiennent le mot-clé"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && resultCount !== null && (
          <span className={styles.badge}>
            {resultCount} {resultCount > 1 ? 'résultats' : 'résultat'}
          </span>
        )}
      </div>
    </div>
  );
}
