import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid Supabase URL format');
}

// Create Supabase client with security configurations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'cybersec-portfolio@1.0.0',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10, // Rate limiting
    },
  },
});

// Types for better type safety
export type Profile = Database['public']['Tables']['profiles']['Row'];
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

// Utility functions for secure data operations
export class SupabaseService {
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
      console.log('Fetching profile from Supabase...');
      const query = supabase
        .from('profiles')
        .select('*')
        .limit(1);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error);
        return null;
      }

      // Load certifications separately
      if (data) {
        const { data: certifications } = await supabase
          .from('certifications')
          .select('*')
          .eq('profile_id', data.id);
        
        return {
          ...data,
          certifications: certifications || []
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
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

      if (error) throw error;
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
        query = query.textSearch('title,excerpt,content', sanitizedSearch);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching writeups:', error);
      return [];
    }
  }

  static async getWriteupBySlug(slug: string): Promise<Writeup | null> {
    try {
      const sanitizedSlug = this.sanitizeString(slug);
      
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('slug', sanitizedSlug)
        .eq('published', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching writeup by slug:', error);
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

      if (error) throw error;
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

      if (error) throw error;
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
        query = query.textSearch('title,excerpt,content', sanitizedSearch);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }

  static async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      const sanitizedSlug = this.sanitizeString(slug);
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', sanitizedSlug)
        .eq('published', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching article by slug:', error);
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

      if (error) throw error;
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

      if (error) throw error;
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

      if (error) throw error;
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

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting certification:', error);
      return false;
    }
  }
}

// Export the service as default
export default SupabaseService;