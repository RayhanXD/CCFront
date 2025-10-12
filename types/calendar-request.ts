export interface CalendarRequest {
  start_date?: string; // YYYY-MM-DD format
  end_date?: string; // YYYY-MM-DD format
  categories?: string[]; // List of categories to filter by
  location?: string; // Location search term
}
