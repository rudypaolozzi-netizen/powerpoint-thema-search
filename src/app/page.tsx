'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import ResultCard from '@/components/ResultCard';
import FilterPanel from '@/components/FilterPanel';
import { initializeSearch, searchSlides, getStats, SearchableSlide } from '@/lib/search';
import { SearchResult } from 'minisearch';
import styles from './page.module.css';

type SortOption = 'relevance' | 'date' | 'filename';
type CombinedResult = SearchResult & SearchableSlide;

const formatIndexGeneratedAt = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const normalizedValue = value.replace(/(\.\d{3})\d+$/, '$1');
  const date = new Date(normalizedValue);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export default function Home() {
  const [isReady, setIsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CombinedResult[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize miniSearch on mount
    initializeSearch()
      .then(() => setIsReady(true))
      .catch((err) => {
        console.error('Failed to init search', err);
        setError('Impossible de charger l\'index de recherche.');
      });
  }, []);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    if (!newQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    // Timeout to allow UI to update to searching state before heavy sync computation
    setTimeout(() => {
      try {
        const queryResults = searchSlides(newQuery);
        setResults(queryResults);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 0);
  };

  const getSortedResults = () => {
    if (sortBy === 'relevance') return results; // Already sorted by MiniSearch
    
    return [...results].sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime();
      }
      if (sortBy === 'filename') {
        return a.filename.localeCompare(b.filename);
      }
      return 0;
    });
  };

  const sortedResults = getSortedResults();
  const stats = getStats();
  const generatedAtLabel = formatIndexGeneratedAt(stats?.generated_at);

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Agencies Slides Search</h1>
        <p className={styles.subtitle}>
          Retrouvez instantanément le contenu de présentations PowerPoint par mot-clé.
        </p>
      </div>

      <div className={styles.searchSection}>
        {error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <SearchBar 
            onSearch={handleSearch} 
            resultCount={query ? results.length : null}
            isSearching={!isReady || isSearching}
          />
        )}
      </div>

      <div className={styles.resultsSection}>
        {query && results.length > 0 && (
          <FilterPanel 
            sortBy={sortBy} 
            onSortChange={setSortBy} 
            resultCount={results.length} 
          />
        )}

        <div className={styles.cardsGrid}>
          {sortedResults.map((result) => (
            <ResultCard
              key={result.id}
              filename={result.filename}
              path={result.path}
              slideNumber={result.slide_number}
              title={result.title}
              excerpt={result.excerpt}
              modifiedAt={result.modified_at}
            />
          ))}
        </div>

        {query && results.length === 0 && !isSearching && isReady && (
          <div className={styles.noResults}>
            Aucun résultat trouvé pour "{query}". 
            <br />
            Essayez des termes plus généraux.
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>Index local : {stats ? `${stats.total_slides} slides dans ${stats.total_files} fichiers` : 'Chargement...'}</p>
        {generatedAtLabel && <p>Index mis à jour le {generatedAtLabel}</p>}
      </footer>
    </main>
  );
}
