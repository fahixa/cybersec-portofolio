import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug environment variables
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file');
  throw new Error('Supabase configuration missing');
}

// Validate URL format
if (supabaseUrl) {
  try {
    new URL(supabaseUrl);
  } catch {
    console.error('Invalid Supabase URL format:', supabaseUrl);
  }
}

// Create Supabase client with enhanced error handling
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
class SupabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// Utility functions for secure data operations
export class SupabaseService {
  // Connection test
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔄 Testing Supabase connection...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Connection test failed:', error.message);
        console.error('Error details:', error);
        return false;
      }
      
      console.log('✅ Supabase connection successful');
      return true;
    } catch (error) {
      console.error('❌ Connection test error:', error);
      return false;
    }
  }

  // Input sanitization helper
  private static sanitizeString(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  }

  // URL validation helper
  private static isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  // Slug generation helper
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .slice(0, 100); // Limit length
  }

  // Profile operations
  static async getProfile(userId?: string): Promise<Profile | null> {
    try {
      console.log('🔄 Fetching profile from Supabase...');
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          certifications (*)
        `);

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.limit(1);

      if (error) {
        console.error('❌ Profile fetch error:', error.message);
        console.error('Error details:', error);
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
          console.log('ℹ️ No profile found');
          return null;
        }
        throw new SupabaseError('Failed to fetch profile', error);
      }

      const profile = Array.isArray(data) ? data[0] : data;
      console.log('✅ Profile loaded successfully:', profile?.name);
      return profile || null;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return null;
    }
  }

  static async upsertProfile(profileData: Partial<ProfileInsert>): Promise<Profile | null> {
    try {
      // Sanitize inputs
      const sanitizedData: Partial<ProfileInsert> = {
        ...profileData,
        name: profileData.name ? this.sanitizeString(profileData.name) : undefined,
        title: profileData.title ? this.sanitizeString(profileData.title) : undefined,
        bio: profileData.bio ? this.sanitizeString(profileData.bio) : undefined,
        experience: profileData.experience ? this.sanitizeString(profileData.experience) : undefined,
      };

      // Validate URLs
      if (sanitizedData.github_url && !this.isValidUrl(sanitizedData.github_url)) {
        throw new Error('Invalid GitHub URL');
      }
      if (sanitizedData.linkedin_url && !this.isValidUrl(sanitizedData.linkedin_url)) {
        throw new Error('Invalid LinkedIn URL');
      }
      if (sanitizedData.twitter_url && !this.isValidUrl(sanitizedData.twitter_url)) {
        throw new Error('Invalid Twitter URL');
      }
      if (sanitizedData.avatar_url && !this.isValidUrl(sanitizedData.avatar_url)) {
        throw new Error('Invalid Avatar URL');
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert(sanitizedData)
        .select()
        .single();

      if (error) throw new SupabaseError('Failed to upsert profile', error);
      return data;
    } catch (error) {
      console.error('Error upserting profile:', error);
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
      console.log('🔄 Fetching writeups from Supabase with options:', options);
      
      let query = supabase
        .from('writeups')
        .select('*')
        .order('created_at', { ascending: false });

      if (options.published !== undefined) {
        query = query.eq('published', options.published);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.search) {
        const sanitizedSearch = this.sanitizeString(options.search);
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
        console.error('❌ Writeups fetch error:', error.message);
        console.error('Error details:', error);
        throw new SupabaseError('Failed to fetch writeups', error);
      }

      console.log(`✅ Fetched ${data?.length || 0} writeups`);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching writeups:', error);
      return [];
    }
  }

  static async getWriteupBySlug(slug: string): Promise<Writeup | null> {
    try {
      console.log('🔄 Fetching writeup by slug:', slug);
      const sanitizedSlug = this.sanitizeString(slug);
      
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('slug', sanitizedSlug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
          console.log('ℹ️ Writeup not found for slug:', slug);
          return null;
        }
        console.error('❌ Writeup fetch error:', error.message);
        throw new SupabaseError('Failed to fetch writeup', error);
      }

      console.log('✅ Writeup loaded successfully:', data?.title);
      return data;
    } catch (error) {
      console.error('❌ Error fetching writeup by slug:', error);
      return null;
    }
  }

  static async upsertWriteup(writeupData: Partial<WriteupInsert>): Promise<Writeup | null> {
    try {
      // Sanitize inputs
      const sanitizedData: Partial<WriteupInsert> = {
        ...writeupData,
        title: writeupData.title ? this.sanitizeString(writeupData.title) : undefined,
        excerpt: writeupData.excerpt ? this.sanitizeString(writeupData.excerpt) : undefined,
        slug: writeupData.title ? this.generateSlug(writeupData.title) : writeupData.slug,
      };

      // Validate required fields
      if (!sanitizedData.title || !sanitizedData.content) {
        throw new Error('Title and content are required');
      }

      const { data, error } = await supabase
        .from('writeups')
        .upsert(sanitizedData)
        .select()
        .single();

      if (error) throw new SupabaseError('Failed to upsert writeup', error);
      return data;
    } catch (error) {
      console.error('Error upserting writeup:', error);
      throw error;
    }
  }

  static async deleteWriteup(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('writeups')
        .delete()
        .eq('id', id);

      if (error) throw new SupabaseError('Failed to delete writeup', error);
      return true;
    } catch (error) {
      console.error('Error deleting writeup:', error);
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
      console.log('🔄 Fetching articles from Supabase with options:', options);
      
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
        query = query.eq('category', options.category);
      }

      if (options.search) {
        const sanitizedSearch = this.sanitizeString(options.search);
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
        console.error('❌ Articles fetch error:', error.message);
        console.error('Error details:', error);
        throw new SupabaseError('Failed to fetch articles', error);
      }

      console.log(`✅ Fetched ${data?.length || 0} articles`);
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
      return [];
    }
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      console.log('🔄 Fetching article by slug:', slug);
      const sanitizedSlug = this.sanitizeString(slug);
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', sanitizedSlug)
        .eq('published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('No rows')) {
          console.log('ℹ️ Article not found for slug:', slug);
          return null;
        }
        console.error('❌ Article fetch error:', error.message);
        throw new SupabaseError('Failed to fetch article', error);
      }

      console.log('✅ Article loaded successfully:', data?.title);
      return data;
    } catch (error) {
      console.error('❌ Error fetching article by slug:', error);
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
        title: articleData.title ? this.sanitizeString(articleData.title) : undefined,
        excerpt: articleData.excerpt ? this.sanitizeString(articleData.excerpt) : undefined,
        slug: articleData.title ? this.generateSlug(articleData.title) : articleData.slug,
        read_time: readTime,
      };

      // Validate required fields
      if (!sanitizedData.title || !sanitizedData.content) {
        throw new Error('Title and content are required');
      }

      const { data, error } = await supabase
        .from('articles')
        .upsert(sanitizedData)
        .select()
        .single();

      if (error) throw new SupabaseError('Failed to upsert article', error);
      return data;
    } catch (error) {
      console.error('Error upserting article:', error);
      throw error;
    }
  }

  static async deleteArticle(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw new SupabaseError('Failed to delete article', error);
      return true;
    } catch (error) {
      console.error('Error deleting article:', error);
      return false;
    }
  }

  // Certification operations
  static async upsertCertification(certData: Partial<CertificationInsert>): Promise<Certification | null> {
    try {
      // Sanitize inputs
      const sanitizedData: Partial<CertificationInsert> = {
        ...certData,
        name: certData.name ? this.sanitizeString(certData.name) : undefined,
        issuer: certData.issuer ? this.sanitizeString(certData.issuer) : undefined,
      };

      // Validate URLs
      if (sanitizedData.validation_url && !this.isValidUrl(sanitizedData.validation_url)) {
        throw new Error('Invalid validation URL');
      }
      if (sanitizedData.logo_url && !this.isValidUrl(sanitizedData.logo_url)) {
        throw new Error('Invalid logo URL');
      }

      const { data, error } = await supabase
        .from('certifications')
        .upsert(sanitizedData)
        .select()
        .single();

      if (error) throw new SupabaseError('Failed to upsert certification', error);
      return data;
    } catch (error) {
      console.error('Error upserting certification:', error);
      throw error;
    }
  }

  static async deleteCertification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('certifications')
        .delete()
        .eq('id', id);

      if (error) throw new SupabaseError('Failed to delete certification', error);
      return true;
    } catch (error) {
      console.error('Error deleting certification:', error);
      return false;
    }
  }
}

// Export the service as default
export default SupabaseService;