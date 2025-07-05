import { supabase } from '../lib/supabase';

export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'admin@cybersec.local',
  password: 'CyberSec2024!'
};

export async function createDefaultAdminUser() {
  try {
    console.log('Creating default admin user...');
    
    const { data, error } = await supabase.auth.signUp({
      email: DEFAULT_ADMIN_CREDENTIALS.email,
      password: DEFAULT_ADMIN_CREDENTIALS.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('Admin user already exists');
        return { success: true, message: 'Admin user already exists' };
      }
      throw error;
    }

    console.log('Default admin user created successfully');
    return { 
      success: true, 
      message: 'Default admin user created. Please check your email for confirmation if email confirmation is enabled.',
      user: data.user 
    };
  } catch (error: any) {
    console.error('Error creating default admin user:', error);
    return { 
      success: false, 
      message: error.message || 'Failed to create admin user' 
    };
  }
}

export async function checkAdminUserExists() {
  try {
    // Try to sign in with default credentials to check if user exists
    const { error } = await supabase.auth.signInWithPassword({
      email: DEFAULT_ADMIN_CREDENTIALS.email,
      password: DEFAULT_ADMIN_CREDENTIALS.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { exists: false, message: 'Admin user does not exist' };
      }
      throw error;
    }

    // Sign out immediately after checking
    await supabase.auth.signOut();
    
    return { exists: true, message: 'Admin user exists and credentials are valid' };
  } catch (error: any) {
    console.error('Error checking admin user:', error);
    return { exists: false, message: error.message || 'Error checking admin user' };
  }
}