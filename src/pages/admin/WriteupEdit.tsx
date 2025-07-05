import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Trash2, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Writeup, type WriteupInsert } from '../../lib/supabase';
import { MarkdownEditor } from '../../components/MarkdownEditor';

export const WriteupEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === 'new';

  const [writeup, setWriteup] = useState<Partial<Writeup>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'ctf',
    difficulty: 'medium',
    tags: [],
    published: false
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  useEffect(() => {
    if (!isNew && id) {
      loadWriteup(id);
    }
  }, [id, isNew]);

  const loadWriteup = async (writeupId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('id', writeupId)
        .single();

      if (error) throw error;
      setWriteup(data);
    } catch (err) {
      console.error('Error loading writeup:', err);
      setError('Failed to load writeup');
    } finally {
      setLoading(false);
    }
  };

  // Secure slug generation
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .slice(0, 100); // Limit length
  };

  // Secure input sanitization
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  };

  const handleTitleChange = (title: string) => {
    const sanitizedTitle = sanitizeInput(title);
    setWriteup(prev => ({
      ...prev,
      title: sanitizedTitle,
      slug: generateSlug(sanitizedTitle)
    }));
  };

  const addTag = () => {
    const sanitizedTag = sanitizeInput(newTag.trim());
    if (sanitizedTag && !writeup.tags?.includes(sanitizedTag)) {
      setWriteup(prev => ({
        ...prev,
        tags: [...(prev.tags || []), sanitizedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setWriteup(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!writeup.title || !writeup.content) {
        throw new Error('Title and content are required');
      }

      // Sanitize all string inputs
      const sanitizedWriteup = {
        ...writeup,
        title: sanitizeInput(writeup.title || ''),
        slug: generateSlug(writeup.title || ''),
        content: writeup.content || '', // Content is handled by MarkdownEditor
        excerpt: sanitizeInput(writeup.excerpt || ''),
        updated_at: new Date().toISOString()
      };

      if (isNew) {
        const newWriteup = {
          ...sanitizedWriteup,
          id: Date.now().toString(),
          user_id: user!.id,
          created_at: new Date().toISOString()
        };
        await supabase.from('writeups').insert(newWriteup as WriteupInsert);
      } else {
        await supabase.from('writeups').update(sanitizedWriteup).eq('id', id!);
      }

      navigate('/authorize/dashboard');
    } catch (err) {
      console.error('Error saving writeup:', err);
      setError(err instanceof Error ? err.message : 'Failed to save writeup');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this writeup?')) return;

    try {
      setSaving(true);
      await supabase.from('writeups').delete().eq('id', id!);
      navigate('/authorize/dashboard');
    } catch (err) {
      console.error('Error deleting writeup:', err);
      setError('Failed to delete writeup');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (writeup.slug) {
      window.open(`/writeups/${writeup.slug}`, '_blank');
    }
  };

  if (loading && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-green-400 mx-auto mb-4 transition-colors duration-300"></div>
          <p className="text-blue-600 dark:text-green-400 text-sm sm:text-base transition-colors duration-300">Loading writeup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Mobile-First Header */}
        <div className="flex flex-col space-y-4 mb-6 lg:mb-8">
          {/* Top Row - Back Button & Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/authorize/dashboard')}
              className="flex items-center space-x-2 text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors p-2 -ml-2 rounded-lg hover:bg-blue-50 dark:hover:bg-green-500/10"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-green-400 transition-colors duration-300 flex-1">
              {isNew ? 'Create Writeup' : 'Edit Writeup'}
            </h1>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {!isNew && (
              <>
                <button
                  onClick={handlePreview}
                  disabled={!writeup.slug}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm flex-1 sm:flex-none justify-center min-w-0"
                >
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Preview</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm flex-1 sm:flex-none justify-center min-w-0"
                >
                  <Trash2 className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">Delete</span>
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm flex-1 sm:flex-none justify-center min-w-0 font-medium"
            >
              <Save className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base transition-colors duration-300">
            {error}
          </div>
        )}

        {/* Responsive Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content - Full width on mobile, 3/4 on desktop */}
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Title *
              </label>
              <input
                type="text"
                value={writeup.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500/50 text-sm sm:text-base transition-all duration-300"
                placeholder="Enter writeup title..."
                maxLength={200}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                URL Slug
              </label>
              <input
                type="text"
                value={writeup.slug || ''}
                onChange={(e) => setWriteup(prev => ({ ...prev, slug: sanitizeInput(e.target.value) }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500/50 text-sm sm:text-base transition-all duration-300"
                placeholder="url-friendly-slug"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
                URL: /writeups/{writeup.slug || 'your-slug'}
              </p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Excerpt
              </label>
              <textarea
                value={writeup.excerpt || ''}
                onChange={(e) => setWriteup(prev => ({ ...prev, excerpt: sanitizeInput(e.target.value) }))}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500/50 resize-none text-sm sm:text-base transition-all duration-300"
                placeholder="Brief description of the writeup..."
                maxLength={500}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Content *
              </label>
              <div className="relative">
                <MarkdownEditor
                  value={writeup.content || ''}
                  onChange={(content) => setWriteup(prev => ({ ...prev, content }))}
                  placeholder="Write your detailed writeup here using Markdown..."
                  className="min-h-[400px] sm:min-h-[500px]"
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Stacked on mobile, sidebar on desktop */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Mobile Settings Toggle */}
            <div className="xl:hidden">
              <button
                onClick={() => setShowMobilePreview(!showMobilePreview)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white transition-all duration-300"
              >
                <span className="font-medium">Settings & Options</span>
                <div className={`transform transition-transform duration-200 ${showMobilePreview ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Settings Panel */}
            <div className={`space-y-4 sm:space-y-6 ${!showMobilePreview ? 'hidden xl:block' : ''}`}>
              {/* Publish Status */}
              <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-sm transition-colors duration-300">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  Publication
                </h3>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={writeup.published || false}
                    onChange={(e) => setWriteup(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">
                    Publish writeup
                  </span>
                </label>
              </div>

              {/* Category */}
              <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-sm transition-colors duration-300">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  Category
                </h3>
                <select
                  value={writeup.category || 'ctf'}
                  onChange={(e) => setWriteup(prev => ({ ...prev, category: e.target.value as 'ctf' | 'bug-bounty' }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 text-sm sm:text-base transition-all duration-300"
                >
                  <option value="ctf">CTF Challenge</option>
                  <option value="bug-bounty">Bug Bounty</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-sm transition-colors duration-300">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  Difficulty
                </h3>
                <select
                  value={writeup.difficulty || 'medium'}
                  onChange={(e) => setWriteup(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 text-sm sm:text-base transition-all duration-300"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-sm transition-colors duration-300">
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                  Tags
                </h3>
                
                {/* Add new tag */}
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(sanitizeInput(e.target.value))}
                    onKeyPress={handleKeyPress}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 text-sm transition-all duration-300"
                    maxLength={50}
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex-shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Existing tags */}
                <div className="flex flex-wrap gap-2">
                  {writeup.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-full text-sm text-gray-700 dark:text-gray-300 group transition-colors duration-300"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Save Button (Sticky) */}
        <div className="xl:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600/30 z-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save Writeup'}</span>
          </button>
        </div>

        {/* Mobile padding to prevent content being hidden behind sticky button */}
        <div className="xl:hidden h-20"></div>
      </div>
    </div>
  );
};