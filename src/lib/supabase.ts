import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { SecurityUtils } from './security';
import { errorHandler } from './errorHandler';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
if (import.meta.env.DEV) {
  console.log('Database URL:', supabaseUrl);
  console.log('Database Key:', supabaseAnonKey ? 'Set' : 'Missing');
}

if (!supabaseUrl || !supabaseAnonKey) {
  errorHandler.logError('Missing database environment variables', new Error('Database configuration missing'));
  throw new Error('Database configuration missing');
}

// Validate URL format
if (supabaseUrl) {
  try {
    new URL(supabaseUrl);
  } catch {
    errorHandler.logError('Invalid database URL format', new Error(`Invalid URL: ${supabaseUrl}`));
  }
}

// Create database client with enhanced error handling
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
  }
);

// Types for better type safety
export type Profile = Database['public']['Tables']['profiles']['Row'] & {
  certifications?: Certification[];
};
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Certification = Database['public']['Tables']['certifications']['Row'];
export type CertificationInsert = Database['public']['Tables']['certifications']['Insert'];
export type CertificationUpdate = Database['public']['Tables']['certifications']['Update'];

export type Writeup = Database['public']['Tables']['writeups']['Row'];
export type WriteupInsert = Database['public']['Tables']['writeups']['Insert'];
export type WriteupUpdate = Database['public']['Tables']['writeups']['Update'];

export type Article = Database['public']['Tables']['articles']['Row'];
export type ArticleInsert = Database['public']['Tables']['articles']['Insert'];
export type ArticleUpdate = Database['public']['Tables']['articles']['Update'];

// Enhanced error handling
class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Utility functions for secure data operations
export class DatabaseService {
  // Connection test
  static async testConnection(): Promise<boolean> {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Testing database connection...');
      }
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        errorHandler.logError('Database connection test failed', error);
        return false;
      }
      
      if (import.meta.env.DEV) {
        console.log('✅ Database connection successful');
      }
      return true;
    } catch (error) {
      errorHandler.logError('Database connection test error', error);
      return false;
    }
  }

  // Profile operations
  static async getProfile(userId?: string): Promise<Profile | null> {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Fetching profile from database...');
      }
      
      let query = supabase
        .from('profiles')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: profileData, error: profileError } = await query.limit(1);

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError.message);
        console.error('Error details:', profileError);
        if (profileError.code === 'PGRST116' || profileError.message.includes('No rows')) {
          if (import.meta.env.DEV) {
            console.log('ℹ️ No profile found');
          }
          return null;
        }
        throw new DatabaseError('Failed to fetch profile', profileError);
      }

      const profile = Array.isArray(profileData) ? profileData[0] : profileData;
      
      if (!profile) {
        if (import.meta.env.DEV) {
          console.log('ℹ️ No profile found');
        }
        return null;
      }

      // Fetch certifications separately
      if (import.meta.env.DEV) {
        console.log('🔄 Fetching certifications for profile:', profile.id);
      }
      const { data: certificationsData, error: certificationsError } = await supabase
        .from('certifications')
        .select('*')
        .eq('profile_id', profile.id)
        .order('issue_date', { ascending: false });

      if (certificationsError) {
        errorHandler.logWarning('Certifications fetch error', { error: certificationsError.message });
        // Don't throw error, just log it and continue without certifications
      }

      const profileWithCertifications = {
        ...profile,
        certifications: certificationsData || []
      };

      if (import.meta.env.DEV) {
        console.log('✅ Profile loaded successfully:', profileWithCertifications.name);
        console.log('📜 Certifications loaded:', certificationsData?.length || 0);
      }
      
      return profileWithCertifications;
    } catch (error) {
      errorHandler.logError('Error fetching profile', error);
      return null;
    }
  }

  static async upsertProfile(profileData: Partial<ProfileInsert>): Promise<Profile | null> {
    try {
      // Sanitize inputs
      const sanitizedData: Partial<ProfileInsert> = {
        ...profileData,
        name: profileData.name ? SecurityUtils.sanitizeInput(profileData.name) : undefined,
        title: profileData.title ? SecurityUtils.sanitizeInput(profileData.title) : undefined,
        bio: profileData.bio ? SecurityUtils.sanitizeInput(profileData.bio) : undefined,
        experience: profileData.experience ? SecurityUtils.sanitizeInput(profileData.experience) : undefined,
      };

      // Validate URLs
      if (sanitizedData.github_url && !SecurityUtils.isValidUrl(sanitizedData.github_url)) {
        throw new Error('Invalid GitHub URL');
      }
      if (sanitizedData.linkedin_url && !SecurityUtils.isValidUrl(sanitizedData.linkedin_url)) {
        throw new Error('Invalid LinkedIn URL');
      }
      if (sanitizedData.avatar_url && !SecurityUtils.isValidUrl(sanitizedData.avatar_url)) {
        throw new Error('Invalid Avatar URL');
      }
      if (sanitizedData.email && !SecurityUtils.isValidEmail(sanitizedData.email)) {
        throw new Error('Invalid email address');
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(sanitizedData as ProfileInsert)
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to upsert profile', error);
      return data;
    } catch (error) {
      errorHandler.logError('Error upserting profile', error);
      throw error;
    }
  }

  // Writeup operations
  static async getWriteups(options: {
    published?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Writeup[]> {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Fetching writeups from database with options:', options);
      }
      
      let query = supabase
        .from('writeups')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.published !== undefined) {
        query = query.eq('published', options.published);
      }

      if (options.category) {
        query = query.eq('category', options.category as 'ctf' | 'bug-bounty');
      }

      if (options.search) {
        const sanitizedSearch = SecurityUtils.sanitizeInput(options.search);
        query = query.or(`title.ilike.%${sanitizedSearch}%,excerpt.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        errorHandler.logError('Writeups fetch error', error);
        throw new DatabaseError('Failed to fetch writeups', error);
      }

      if (import.meta.env.DEV) {
        console.log(`✅ Fetched ${data?.length || 0} writeups`);
      }
      
      return data || [];
    } catch (error) {
      errorHandler.logError('Error fetching writeups', error);
      return [];
    }
  }

  static async getWriteupBySlug(slug: string): Promise<Writeup | null> {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Fetching writeup by slug:', slug);
      }
      
      const sanitizedSlug = SecurityUtils.sanitizeInput(slug);
      
      if (!SecurityUtils.isValidSlug(sanitizedSlug)) {
        throw new Error('Invalid slug format');
      }
      
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('slug', sanitizedSlug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
          if (import.meta.env.DEV) {
            console.log('ℹ️ Writeup not found for slug:', slug);
          }
          return null;
        }
        errorHandler.logError('Writeup fetch error', error);
        throw new DatabaseError('Failed to fetch writeup', error);
      }

      if (import.meta.env.DEV) {
        console.log('✅ Writeup loaded successfully:', data?.title);
      }
      
      return data;
    } catch (error) {
      errorHandler.logError('Error fetching writeup by slug', error);
      return null;
    }
  }

  static async upsertWriteup(writeupData: Partial<WriteupInsert>): Promise<Writeup | null> {
    try {
      // Sanitize inputs
      const sanitizedData: Partial<WriteupInsert> = {
        ...writeupData,
        title: writeupData.title ? SecurityUtils.sanitizeInput(writeupData.title) : undefined,
        excerpt: writeupData.excerpt ? SecurityUtils.sanitizeInput(writeupData.excerpt) : undefined,
        slug: writeupData.title ? SecurityUtils.generateSlug(writeupData.title) : writeupData.slug,
      };

      // Validate required fields
      if (!sanitizedData.title || !sanitizedData.content) {
        throw new Error('Title and content are required');
      }

      const { data, error } = await supabase
        .from('writeups')
        .upsert(sanitizedData as WriteupInsert)
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to upsert writeup', error);
      return data;
    } catch (error) {
      errorHandler.logError('Error upserting writeup', error);
      throw error;
    }
  }

  static async deleteWriteup(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('writeups')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError('Failed to delete writeup', error);
      return true;
    } catch (error) {
      errorHandler.logError('Error deleting writeup', error);
      return false;
    }
  }

  // Article operations
  static async getArticles(options: {
    published?: boolean;
    featured?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<Article[]> {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Fetching articles from database with options:', options);
      }
      
      let query = supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.published !== undefined) {
        query = query.eq('published', options.published);
      }

      if (options.featured !== undefined) {
        query = query.eq('featured', options.featured);
      }

      if (options.category) {
        query = query.eq('category', options.category as 'tutorial' | 'news' | 'opinion' | 'tools' | 'career');
      }

      if (options.search) {
        const sanitizedSearch = SecurityUtils.sanitizeInput(options.search);
        query = query.or(`title.ilike.%${sanitizedSearch}%,excerpt.ilike.%${sanitizedSearch}%,content.ilike.%${sanitizedSearch}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        errorHandler.logError('Articles fetch error', error);
        throw new DatabaseError('Failed to fetch articles', error);
      }

      if (import.meta.env.DEV) {
        console.log(`✅ Fetched ${data?.length || 0} articles`);
      }
      
      return data || [];
    } catch (error) {
      errorHandler.logError('Error fetching articles', error);
      return [];
    }
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      if (import.meta.env.DEV) {
        console.log('🔄 Fetching article by slug:', slug);
      }
      
      const sanitizedSlug = SecurityUtils.sanitizeInput(slug);
      
      if (!SecurityUtils.isValidSlug(sanitizedSlug)) {
        throw new Error('Invalid slug format');
      }
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', sanitizedSlug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
          if (import.meta.env.DEV) {
            console.log('ℹ️ Article not found for slug:', slug);
          }
          return null;
        }
        errorHandler.logError('Article fetch error', error);
        throw new DatabaseError('Failed to fetch article', error);
      }

      if (import.meta.env.DEV) {
        console.log('✅ Article loaded successfully:', data?.title);
      }
      
      return data;
    } catch (error) {
      errorHandler.logError('Error fetching article by slug', error);
      return null;
    }
  }

  static async upsertArticle(articleData: Partial<ArticleInsert>): Promise<Article | null> {
    try {
      // Calculate read time
      const wordCount = articleData.content ? articleData.content.trim().split(/\s+/).length : 0;
      const readTime = Math.max(1, Math.ceil(wordCount / 200));

      // Sanitize inputs
      const sanitizedData: Partial<ArticleInsert> = {
        ...articleData,
        title: articleData.title ? SecurityUtils.sanitizeInput(articleData.title) : undefined,
        excerpt: articleData.excerpt ? SecurityUtils.sanitizeInput(articleData.excerpt) : undefined,
        slug: articleData.title ? SecurityUtils.generateSlug(articleData.title) : articleData.slug,
        read_time: readTime,
      };

      // Validate required fields
      if (!sanitizedData.title || !sanitizedData.content) {
        throw new Error('Title and content are required');
      }

      const { data, error } = await supabase
        .from('articles')
        .upsert(sanitizedData as ArticleInsert)
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to upsert article', error);
      return data;
    } catch (error) {
      errorHandler.logError('Error upserting article', error);
      throw error;
    }
  }

  static async deleteArticle(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError('Failed to delete article', error);
      return true;
    } catch (error) {
      errorHandler.logError('Error deleting article', error);
      return false;
    }
  }

  // Certification operations
  static async upsertCertification(certData: Partial<CertificationInsert>): Promise<Certification | null> {
    try {
      // Sanitize inputs
      const sanitizedData: Partial<CertificationInsert> = {
        ...certData,
        name: certData.name ? SecurityUtils.sanitizeInput(certData.name) : undefined,
        issuer: certData.issuer ? SecurityUtils.sanitizeInput(certData.issuer) : undefined,
      };

      // Validate URLs
      if (sanitizedData.validation_url && !SecurityUtils.isValidUrl(sanitizedData.validation_url)) {
        throw new Error('Invalid validation URL');
      }
      if (sanitizedData.logo_url && !SecurityUtils.isValidUrl(sanitizedData.logo_url)) {
        throw new Error('Invalid logo URL');
      }

      const { data, error } = await supabase
        .from('certifications')
        .upsert(sanitizedData as CertificationInsert)
        .select()
        .single();

      if (error) throw new DatabaseError('Failed to upsert certification', error);
      return data;
    } catch (error) {
      errorHandler.logError('Error upserting certification', error);
      throw error;
    }
  }

  static async deleteCertification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      if (error) throw new DatabaseError('Failed to delete certification', error);
      return true;
    } catch (error) {
      errorHandler.logError('Error deleting certification', error);
      return false;
    }
  }
}

// Export the service as default
export default DatabaseService;