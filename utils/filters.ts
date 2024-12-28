// utils/filter.ts
type FilterConditions = {
    [key: string]: any;
  };
  
  type FilterOptions = {
    searchFields?: string[]; // Fields for text search
    exactFields?: string[];  // Fields for exact match
    rangeFields?: {          // Fields for range queries (e.g., createdAt, price)
      [key: string]: {
        min?: number | Date;
        max?: number | Date;
      };
    };
  };
  
  export function buildFilters(
    query: URLSearchParams,
    options: FilterOptions
  ): FilterConditions {
    const filters: FilterConditions = {};
  
    // Text search
    if (options.searchFields) {
      const searchValue = query.get('search');
      if (searchValue) {
        filters.OR = options.searchFields.map((field) => ({
          [field]: {
            contains: searchValue,
            mode: 'insensitive', // Case-insensitive search
          },
        }));
      }
    }
  
    // Exact matches
    if (options.exactFields) {
      options.exactFields.forEach((field) => {
        const value = query.get(field);
        if (value) {
          filters[field] = value;
        }
      });
    }
  
    // Range filters
    if (options.rangeFields) {
      Object.entries(options.rangeFields).forEach(([field, range]) => {
        const minValue = query.get(`${field}_min`);
        const maxValue = query.get(`${field}_max`);
  
        if (minValue || maxValue) {
          filters[field] = {};
          if (minValue) {
            filters[field].gte = range.min instanceof Date ? new Date(minValue) : parseFloat(minValue);
          }
          if (maxValue) {
            filters[field].lte = range.max instanceof Date ? new Date(maxValue) : parseFloat(maxValue);
          }
        }
      });
    }
  
    return filters;
  }
  