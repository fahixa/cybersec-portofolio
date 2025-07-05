import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '../lib/supabase';
import { BookOpen, Calendar, Clock, Tag, Star, TrendingUp, User, Award } from 'lucide-react';
import GlitchText from '../components/GlitchText';
import AnimatedCard from '../components/AnimatedCard';
import { SearchBar } from '../components/SearchBar';
import { useArticles } from '../hooks/useDataFetching';
import { type Article } from '../lib/supabase';

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [filter, setFilter] = useState<'all' | 'tutorial' | 'news' | 'opinion' | 'tools' | 'career'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await DatabaseService.getArticles({ published: true });
      setArticles(data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  // Remove hook-based loading
  // const { data: articlesData = [], loading } = useArticles({ published: true, search: searchQuery || undefined });

  useEffect(() => {
    filterArticles();
  }, [articles, filter, searchQuery]);

  const filterArticles = () => {
    let filtered = articles || [];

    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(article => article.category === filter);
    }

    // Apply search filter with secure sanitization
    if (searchQuery.trim()) {
      const sanitizedQuery = searchQuery.toLowerCase().trim().slice(0, 100);
      filtered = filtered.filter(article => {
        const searchableText = [
          article.title,
          article.excerpt,
          article.content,
          ...article.tags
        ].join(' ').toLowerCase();
        
        return searchableText.includes(sanitizedQuery);
      });
    }

    setFilteredArticles(filtered);
  };

  const handleSearch = (query: string) => {
    // Secure input sanitization
    const sanitizedQuery = query
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim()
      .slice(0, 100); // Limit length
    
    setSearchQuery(sanitizedQuery);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tutorial': return 'text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-900/30';
      case 'news': return 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-900/30';
      case 'opinion': return 'text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-900/30';
      case 'tools': return 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-500/30 bg-green-50 dark:bg-green-900/30';
      case 'career': return 'text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/30';
      default: return 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/30 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tutorial': return BookOpen;
      case 'news': return TrendingUp;
      case 'opinion': return User;
      case 'tools': return Award;
      case 'career': return Star;
      default: return BookOpen;
    }
  };

  const featuredArticles = (filteredArticles || []).filter(article => article.featured);
  const regularArticles = (filteredArticles || []).filter(article => !article.featured);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="text-blue-600 dark:text-green-400 font-mono text-sm sm:text-base transition-colors duration-300">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 transition-colors duration-300">
            <GlitchText text="ARTICLES" />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors duration-300">Insights, tutorials, and thoughts on cybersecurity</p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-8 sm:mb-12">
          {/* Search Bar */}
          <div className="w-full">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search articles by title, content, or tags..."
              className="w-full"
            />
          </div>

          {/* Filter Buttons */}
          <div className="bg-white/95 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-1 grid grid-cols-3 sm:flex sm:flex-wrap gap-1 shadow-sm dark:shadow-none transition-colors duration-300">
            {[
              { key: 'all', label: 'All' },
              { key: 'tutorial', label: 'Tutorials' },
              { key: 'tools', label: 'Tools' },
              { key: 'opinion', label: 'Opinion' },
              { key: 'career', label: 'Career' },
              { key: 'news', label: 'News' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={`px-2 sm:px-4 py-2 rounded-md font-mono text-xs sm:text-sm transition-all text-center ${
                  filter === key
                    ? 'bg-blue-600 dark:bg-green-500 text-white dark:text-black'
                    : 'text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 hover:bg-blue-50 dark:hover:bg-green-500/10'
                }`}
              >
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {(searchQuery || filter !== 'all') && (
          <div className="mb-6 sm:mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 font-mono text-sm sm:text-base transition-colors duration-300">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
              {filter !== 'all' && ` in ${filter}`}
            </p>
          </div>
        )}

        {filteredArticles.length > 0 ? (
          <div className="space-y-8 sm:space-y-12">
            {/* Featured Articles */}
            {featuredArticles.length > 0 && (
              <div>
                <div className="flex items-center mb-6 sm:mb-8">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 mr-2 sm:mr-3 transition-colors duration-300" />
                  <h2 className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400 font-mono transition-colors duration-300">Featured Articles</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  {featuredArticles.map((article) => {
                    const CategoryIcon = getCategoryIcon(article.category);
                    return (
                      <AnimatedCard
                        key={article.id} 
                        glowColor="purple"
                        className="h-full flex flex-col relative p-4 sm:p-6"
                      >
                        <div className="absolute top-4 right-4">
                          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 fill-current transition-colors duration-300" />
                        </div>
                        
                        <div className="flex items-center justify-between mb-4 pr-8">
                          <div className="flex items-center space-x-2">
                            <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                            <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(article.category)} transition-colors duration-300`}>
                              {article.category.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono flex-grow leading-tight transition-colors duration-300">
                          {article.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow text-sm sm:text-base transition-colors duration-300">
                          {article.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded flex items-center transition-colors duration-300">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors duration-300">
                              +{article.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 dark:text-gray-500 mb-4 gap-2 sm:gap-0 transition-colors duration-300">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(article.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.read_time} min read
                          </div>
                        </div>

                        <Link
                          to={`/articles/${article.slug}`}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-mono text-sm flex items-center justify-center py-2 sm:py-3 border border-purple-300 dark:border-purple-500/30 rounded hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all mt-auto"
                        >
                          Read Article →
                        </Link>
                      </AnimatedCard>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Regular Articles */}
            {regularArticles.length > 0 && (
              <div>
                {featuredArticles.length > 0 && (
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono mb-6 sm:mb-8 transition-colors duration-300">All Articles</h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {regularArticles.map((article) => {
                    const CategoryIcon = getCategoryIcon(article.category);
                    return (
                      <AnimatedCard
                        key={article.id} 
                        glowColor="cyan"
                        className="h-full flex flex-col p-4 sm:p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400 transition-colors duration-300" />
                            <span className={`text-xs px-2 py-1 rounded border ${getCategoryColor(article.category)} transition-colors duration-300`}>
                              {article.category.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono flex-grow leading-tight transition-colors duration-300">
                          {article.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow text-sm sm:text-base transition-colors duration-300">
                          {article.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                          {article.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded flex items-center transition-colors duration-300">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors duration-300">
                              +{article.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 dark:text-gray-500 mb-4 gap-2 sm:gap-0 transition-colors duration-300">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(article.created_at)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {article.read_time} min read
                          </div>
                        </div>

                        <Link
                          to={`/articles/${article.slug}`}
                          className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 font-mono text-sm flex items-center justify-center py-2 sm:py-3 border border-blue-300 dark:border-green-500/30 rounded hover:bg-blue-50 dark:hover:bg-green-500/10 transition-all mt-auto"
                        >
                          Read Article →
                        </Link>
                      </AnimatedCard>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 lg:py-16">
            <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-lg sm:text-xl font-mono text-gray-500 dark:text-gray-500 mb-2 transition-colors duration-300">
              {searchQuery ? 'No articles found' : 'No articles available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-600 text-sm sm:text-base mb-4 transition-colors duration-300">
              {searchQuery 
                ? 'Try adjusting your search terms or filters' 
                : 'Check back later for new content'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white dark:text-black rounded-lg transition-colors text-sm sm:text-base mt-4"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}