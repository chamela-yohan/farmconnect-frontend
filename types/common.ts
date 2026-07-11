// types
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // Current page index (0-based)
  first: boolean;
  last: boolean;
  empty: boolean;
}