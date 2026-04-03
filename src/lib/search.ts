import MiniSearch, { SearchResult } from 'minisearch';

// Types correspondants à la structure de l'index généré par la Brique A
export interface SlideEntry {
  slide_number: number;
  title: string | null;
  text: string;
  excerpt: string;
}

export interface FileEntry {
  path: string;
  filename: string;
  modified_at: string;
  size: number;
  slides: SlideEntry[];
}

export interface IndexData {
  generated_at: string;
  root: string;
  stats: {
    total_files: number;
    total_slides: number;
  };
  files: FileEntry[];
}

// Format aplati pour MiniSearch
export interface SearchableSlide {
  id: string; // hash ou string unique (e.g. filename_slidenumber)
  filename: string;
  path: string;
  slide_number: number;
  title: string; // null becomes empty string
  text: string;
  excerpt: string;
  modified_at: string;
}

let miniSearch: MiniSearch<SearchableSlide> | null = null;
let indexDataCache: IndexData | null = null;

// Supprime les accents pour la recherche
const normalizeText = (text: string) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

export const fetchIndexData = async (): Promise<IndexData> => {
  if (indexDataCache) return indexDataCache;

  const url = process.env.NEXT_PUBLIC_INDEX_URL || '/index.json';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch index from ${url}`);
  }

  const data: IndexData = await response.json();
  indexDataCache = data;
  return data;
};

export const initializeSearch = async (): Promise<void> => {
  if (miniSearch) return;

  const data = await fetchIndexData();

  // Aplatir les slides pour l'outil de recherche
  const searchableSlides: SearchableSlide[] = [];
  data.files.forEach((file) => {
    file.slides.forEach((slide) => {
      searchableSlides.push({
        id: `${file.path}_${slide.slide_number}`,
        filename: file.filename,
        path: file.path,
        slide_number: slide.slide_number,
        title: slide.title || '',
        text: slide.text || '',
        excerpt: slide.excerpt || '',
        modified_at: file.modified_at,
      });
    });
  });

  miniSearch = new MiniSearch<SearchableSlide>({
    fields: ['title', 'text', 'filename'], // champs indexés
    storeFields: ['id', 'filename', 'path', 'slide_number', 'title', 'excerpt', 'modified_at'], // champs retournés
    processTerm: (term) => normalizeText(term),
    searchOptions: {
      processTerm: (term) => normalizeText(term),
      boost: { title: 3, filename: 2, text: 1 },
      prefix: true, // permet de trouver "equi" pour "equipe"
      fuzzy: 0.2,   // tolérance aux fautes de frappe
    },
  });

  miniSearch.addAll(searchableSlides);
};

export const searchSlides = (query: string): (SearchResult & SearchableSlide)[] => {
  if (!miniSearch) {
    console.warn('MiniSearch is not initialized yet.');
    return [];
  }
  
  if (!query.trim()) return [];

  return miniSearch.search(query) as (SearchResult & SearchableSlide)[];
};

export const getStats = () => {
  if (!indexDataCache) {
    return null;
  }

  return {
    ...indexDataCache.stats,
    generated_at: indexDataCache.generated_at,
  };
};
