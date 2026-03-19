'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import styles from './FilterPanel.module.css';

interface FilterPanelProps {
  sortBy: 'relevance' | 'date' | 'filename';
  onSortChange: (sort: 'relevance' | 'date' | 'filename') => void;
  resultCount: number;
}

export default function FilterPanel({ sortBy, onSortChange, resultCount }: FilterPanelProps) {
  if (resultCount === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <Filter size={16} className={styles.icon} />
        <span className={styles.label}>Trier par :</span>
      </div>
      
      <div className={styles.right}>
        <button 
          className={`${styles.sortButton} ${sortBy === 'relevance' ? styles.active : ''}`}
          onClick={() => onSortChange('relevance')}
        >
          Pertinence
        </button>
        <button 
          className={`${styles.sortButton} ${sortBy === 'date' ? styles.active : ''}`}
          onClick={() => onSortChange('date')}
        >
          Récents
        </button>
        <button 
          className={`${styles.sortButton} ${sortBy === 'filename' ? styles.active : ''}`}
          onClick={() => onSortChange('filename')}
        >
          Nom Alpha
        </button>
      </div>
    </div>
  );
}
