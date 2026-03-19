'use client';

import React, { useState } from 'react';
import { Copy, FileText, ExternalLink, Check } from 'lucide-react';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  filename: string;
  path: string;
  slideNumber: number;
  title: string;
  excerpt: string;
  modifiedAt: string;
}

export default function ResultCard({
  filename,
  path,
  slideNumber,
  title,
  excerpt,
  modifiedAt
}: ResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formattedDate = new Date(modifiedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <FileText className={styles.fileIcon} size={20} />
          <h3 className={styles.filename}>{filename}</h3>
        </div>
        <span className={styles.slideBadge}>Slide {slideNumber}</span>
      </div>

      <div className={styles.content}>
        {title && <h4 className={styles.slideTitle}>{title}</h4>}
        <p className={styles.excerpt}>{excerpt || "Pas de texte extrait."}</p>
      </div>

      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={styles.date}>Modifié le {formattedDate}</span>
          <span className={styles.path} title={path}>
            {path.length > 50 ? '...' + path.slice(-47) : path}
          </span>
        </div>
        
        <div className={styles.actions}>
          <button
            onClick={() => {
              handleCopy();
              alert("Les navigateurs web bloquent l'ouverture directe de fichiers locaux par sécurité.\n\nLe chemin absolu a été copié dans votre presse-papiers !\nVous pouvez le coller (Ctrl+V) dans la barre de votre Explorateur Windows.");
            }}
            className={styles.actionButton}
            title="Copier le chemin et voir les instructions"
          >
            {copied ? <Check size={16} className={styles.success} /> : <ExternalLink size={16} />}
            <span>Ouvrir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
