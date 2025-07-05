// Updated Supabase implementation with local storage
import { localDB } from './localStorage';

export type Profile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  certifications?: Certification[];
  created_at: string;
  updated_at: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  validation_url: string;
  issue_date: string;
  expiry_date?: string;
  logo_url: string;
};

export type Writeup = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'ctf' | 'bug-bounty';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'tutorial' | 'news' | 'opinion' | 'tools' | 'career';
  tags: string[];
  published: boolean;
  featured: boolean;
  read_time: number;
  created_at: string;
  updated_at: string;
};

// Query builder class to handle chaining
class QueryBuilder {
  private table: string;
  private filters: Array<{column: string, value: any}> = [];
  private orderBy: {column: string, ascending: boolean} | null = null;
  private limitCount: number | null = null;

  constructor(table: string) {
    this.table = table;
  }

  eq(column: string, value: any) {
    this.filters.push({column, value});
    return this;
  }

  order(column: string, options: {ascending?: boolean} = {}) {
    this.orderBy = {column, ascending: options.ascending !== false};
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  async single() {
    const result = await this.execute();
    if (result.data && result.data.length > 0) {
      return {data: result.data[0], error: null};
    }
    return {data: null, error: {code: 'PGRST116', message: 'No data found'}};
  }

  then(callback: (result: {data: any[], error: any}) => any) {
    return this.execute().then(callback);
  }

  private async execute() {
    try {
      let data = localDB.select(this.table as any);

      // Apply filters
      for (const filter of this.filters) {
        data = data.filter(item => {
          const value = item[filter.column as keyof typeof item];
          return value === filter.value;
        });
      }

      // Apply ordering
      if (this.orderBy) {
        data.sort((a, b) => {
          const aVal = a[this.orderBy!.column as keyof typeof a];
          const bVal = b[this.orderBy!.column as keyof typeof b];
          
          if (this.orderBy!.column === 'created_at') {
            const aTime = new Date(aVal as string).getTime();
            const bTime = new Date(bVal as string).getTime();
            return this.orderBy!.ascending ? aTime - bTime : bTime - aTime;
          }
          
          if (aVal < bVal) return this.orderBy!.ascending ? -1 : 1;
          if (aVal > bVal) return this.orderBy!.ascending ? 1 : -1;
          return 0;
        });
      }

      // Apply limit
      if (this.limitCount) {
        data = data.slice(0, this.limitCount);
      }

      return {data, error: null};
    } catch (error) {
      return {data: [], error};
    }
  }
}

// Supabase-like API with local storage backend
export const supabase = {
  from: (table: string) => ({
    select: (columns: string = '*') => new QueryBuilder(table),
    
    insert: (data: any) => ({
      then: async (callback: any) => {
        try {
          const success = localDB.insert(table as any, data);
          if (success) {
            return callback({ data: data, error: null });
          } else {
            return callback({ data: null, error: { message: 'Insert failed' } });
          }
        } catch (error) {
          return callback({ data: null, error });
        }
      }
    }),
    
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          try {
            const success = localDB.update(table as any, value, data);
            if (success) {
              return callback({ data: data, error: null });
            } else {
              return callback({ data: null, error: { message: 'Update failed' } });
            }
          } catch (error) {
            return callback({ data: null, error });
          }
        }
      })
    }),
    
    upsert: (data: any) => ({
      then: async (callback: any) => {
        try {
          const success = localDB.upsert(table as any, data);
          if (success) {
            return callback({ data: data, error: null });
          } else {
            return callback({ data: null, error: { message: 'Upsert failed' } });
          }
        } catch (error) {
          return callback({ data: null, error });
        }
      }
    }),
    
    delete: () => ({
      eq: (column: string, value: any) => ({
        then: async (callback: any) => {
          try {
            const success = localDB.delete(table as any, value);
            if (success) {
              return callback({ data: null, error: null });
            } else {
              return callback({ data: null, error: { message: 'Delete failed' } });
            }
          } catch (error) {
            return callback({ data: null, error });
          }
        }
      })
    })
  })
};