import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, Trash2, Plus, Star } from 'lucide-react';
import { supabase, type Article } from '../../lib/supabase';
import { MarkdownEditor } from '../../components/MarkdownEditor';

export const ArticleEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [article, setArticle] = useState<Partial<Article>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'tutorial',
    tags: [],
    published: false,
    featured: false,
    read_time: 5
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      loadArticle(id);
    }
  }, [id, isNew]);

  const loadArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (err) {
      console.error('Error loading article:', err);
      setError('Failed to load article');
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
    setArticle(prev => ({
      ...prev,
      title: sanitizedTitle,
      slug: generateSlug(sanitizedTitle)
    }));
  };

  const addTag = () => {
    const sanitizedTag = sanitizeInput(newTag.trim());
    if (sanitizedTag && !article.tags?.includes(sanitizedTag)) {
      setArticle(prev => ({
        ...prev,
        tags: [...(prev.tags || []), sanitizedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setArticle(prev => ({
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

  const calculateReadTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!article.title || !article.content) {
        throw new Error('Title and content are required');
      }

      // Sanitize all string inputs
      const sanitizedArticle = {
        ...article,
        title: sanitizeInput(article.title || ''),
        slug: generateSlug(article.title || ''),
        content: article.content || '', // Content is handled by MarkdownEditor
        excerpt: sanitizeInput(article.excerpt || ''),
        read_time: calculateReadTime(article.content || ''),
        updated_at: new Date().toISOString()
      };

      if (isNew) {
        const newArticle = {
          ...sanitizedArticle,
          id: Date.now().toString(),
          user_id: user!.id,
          created_at: new Date().toISOString()
        };
        await supabase.from('articles').insert(newArticle as ArticleInsert);
      } else {
        await supabase.from('articles').update(sanitizedArticle).eq('id', id!);
      }

      navigate('/authorize/dashboard');
    } catch (err) {
      console.error('Error saving article:', err);
      setError(err instanceof Error ? err.message : 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      setSaving(true);
      await supabase.from('articles').delete().eq('id', id!);
      navigate('/authorize/dashboard');
    } catch (err) {
      console.error('Error deleting article:', err);
      setError('Failed to delete article');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (article.slug) {
      window.open(`/articles/${article.slug}`, '_blank');
    }
  };

  if (loading && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-green-400 mx-auto mb-4 transition-colors duration-300"></div>
          <p className="text-blue-600 dark:text-green-400 text-sm sm:text-base transition-colors duration-300">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => navigate('/authorize/dashboard')}
              className="flex items-center space-x-2 text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm sm:text-base">Back to Dashboard</span>
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-green-400 transition-colors duration-300">
              {isNew ? 'Create New Article' : 'Edit Article'}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            {!isNew && (
              <>
                <button
                  onClick={handlePreview}
                  disabled={!article.slug}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm w-full sm:w-auto justify-center"
                >
                  <Eye className="h-4 w-4" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm w-full sm:w-auto justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm w-full sm:w-auto justify-center"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6 text-sm sm:text-base transition-colors duration-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Title *
              </label>
              <input
                type="text"
                value={article.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500/50 text-sm sm:text-base transition-colors duration-300"
                placeholder="Enter article title..."
                maxLength={200}
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Slug
              </label>
              <input
                type="text"
                value={article.slug || ''}
                onChange={(e) => setArticle(prev => ({ ...prev, slug: sanitizeInput(e.target.value) }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500/50 text-sm sm:text-base transition-colors duration-300"
                placeholder="url-friendly-slug"
                maxLength={100}
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300">
                URL: /articles/{article.slug || 'your-slug'}
              </p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Excerpt
              </label>
              <textarea
                value={article.excerpt || ''}
                onChange={(e) => setArticle(prev => ({ ...prev, excerpt: sanitizeInput(e.target.value) }))}
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500/50 resize-none text-sm sm:text-base transition-colors duration-300"
                placeholder="Brief description of the article..."
                maxLength={500}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                Content *
              </label>
              <MarkdownEditor
                value={article.content || ''}
                onChange={(content) => setArticle(prev => ({ ...prev, content }))}
                placeholder="Write your article here using Markdown..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Publish Status */}
            <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-lg dark:shadow-2xl transition-colors duration-300">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Status</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={article.published || false}
                    onChange={(e) => setArticle(prev => ({ ...prev, published: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 dark:focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">Published</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={article.featured || false}
                    onChange={(e) => setArticle(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-yellow-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-yellow-500 dark:focus:ring-yellow-500 focus:ring-2"
                  />
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
                    <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base transition-colors duration-300">Featured</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-lg dark:shadow-2xl transition-colors duration-300">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Category</h3>
              <select
                value={article.category || 'tutorial'}
                onChange={(e) => setArticle(prev => ({ ...prev, category: e.target.value as Article['category'] }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 text-sm sm:text-base transition-colors duration-300"
              >
                <option value="tutorial">Tutorial</option>
                <option value="tools">Tools</option>
                <option value="opinion">Opinion</option>
                <option value="career">Career</option>
                <option value="news">News</option>
              </select>
            </div>

            {/* Read Time */}
            <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-lg dark:shadow-2xl transition-colors duration-300">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Read Time</h3>
              <input
                type="number"
                min="1"
                max="60"
                value={article.read_time || 5}
                onChange={(e) => setArticle(prev => ({ ...prev, read_time: parseInt(e.target.value) || 5 }))}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 text-sm sm:text-base transition-colors duration-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 transition-colors duration-300">
                Estimated reading time in minutes
              </p>
            </div>

            {/* Tags */}
            <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-600/30 rounded-lg p-4 shadow-lg dark:shadow-2xl transition-colors duration-300">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-4 transition-colors duration-300">Tags</h3>
              
              {/* Add new tag */}
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(sanitizeInput(e.target.value))}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-green-500/50 text-sm transition-colors duration-300"
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
                {article.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-full text-sm text-gray-700 dark:text-gray-300 group transition-colors duration-300"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};