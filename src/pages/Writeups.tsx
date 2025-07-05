import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Bug, Calendar, Clock, Tag } from 'lucide-react';
import GlitchText from '../components/GlitchText';
import AnimatedCard from '../components/AnimatedCard';
import { SearchBar } from '../components/SearchBar';
import { supabase, type Writeup } from '../lib/supabase';

export default function Writeups() {
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [filteredWriteups, setFilteredWriteups] = useState<Writeup[]>([]);
  const [filter, setFilter] = useState<'all' | 'ctf' | 'bug-bounty'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWriteups();
  }, []);

  useEffect(() => {
    filterWriteups();
  }, [writeups, filter, searchQuery]);

  const loadWriteups = async () => {
    try {
      const { data, error } = await supabase
        .from('writeups')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading writeups:', error);
      } else {
        setWriteups(data || []);
      }
    } catch (error) {
      console.error('Error loading writeups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWriteups = () => {
    let filtered = writeups;

    // Apply category filter
    if (filter !== 'all') {
      filtered = filtered.filter(writeup => writeup.category === filter);
    }

    // Apply search filter with secure sanitization
    if (searchQuery.trim()) {
      const sanitizedQuery = searchQuery.toLowerCase().trim().slice(0, 100);
      filtered = filtered.filter(writeup => {
        const searchableText = [
          writeup.title,
          writeup.excerpt,
          writeup.content,
          ...writeup.tags
        ].join(' ').toLowerCase();
        
        return searchableText.includes(sanitizedQuery);
      });
    }

    setFilteredWriteups(filtered);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-500/30 bg-green-50 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-900/30';
      case 'hard': return 'text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-500/30 bg-gray-50 dark:bg-gray-900/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="text-blue-600 dark:text-green-400 font-mono text-sm sm:text-base transition-colors duration-300">Loading writeups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 transition-colors duration-300">
            <GlitchText text="WRITEUPS" />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors duration-300">CTF challenges and Bug bounty discoveries</p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col gap-4 mb-8 sm:mb-12">
          {/* Search Bar */}
          <div className="w-full">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search writeups by title, content, or tags..."
              className="w-full"
            />
          </div>

          {/* Filter Buttons */}
          <div className="bg-white/95 dark:bg-black/60 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-1 flex flex-wrap gap-1 shadow-sm dark:shadow-none transition-colors duration-300">
            {[
              { key: 'all', label: 'All' },
              { key: 'ctf', label: 'CTF' },
              { key: 'bug-bounty', label: 'Bug Bounty' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as typeof filter)}
                className={`px-3 sm:px-6 py-2 rounded-md font-mono text-xs sm:text-sm transition-all flex-1 sm:flex-none ${
                  filter === key
                    ? 'bg-blue-600 dark:bg-green-500 text-white dark:text-black'
                    : 'text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 hover:bg-blue-50 dark:hover:bg-green-500/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        {(searchQuery || filter !== 'all') && (
          <div className="mb-6 sm:mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 font-mono text-sm sm:text-base transition-colors duration-300">
              {filteredWriteups.length} writeup{filteredWriteups.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
              {filter !== 'all' && ` in ${filter.replace('-', ' ')}`}
            </p>
          </div>
        )}

        {filteredWriteups.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredWriteups.map((writeup) => (
              <AnimatedCard 
                key={writeup.id} 
                glowColor={writeup.category === 'ctf' ? 'cyan' : 'purple'}
                className="h-full flex flex-col"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center space-x-2">
                    {writeup.category === 'ctf' ? (
                      <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400 transition-colors duration-300" />
                    ) : (
                      <Bug className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded border ${
                      writeup.category === 'ctf' 
                        ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30'
                        : 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/30'
                    } transition-colors duration-300`}>
                      {writeup.category.toUpperCase()}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded border ${getDifficultyColor(writeup.difficulty)} transition-colors duration-300`}>
                    {writeup.difficulty.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono flex-grow leading-tight transition-colors duration-300">
                  {writeup.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-grow text-sm sm:text-base transition-colors duration-300">
                  {writeup.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {writeup.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded flex items-center transition-colors duration-300">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {writeup.tags.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors duration-300">
                      +{writeup.tags.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-4 transition-colors duration-300">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(writeup.created_at)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {Math.ceil(writeup.content.length / 1000)} min read
                  </div>
                </div>

                <Link
                  to={`/writeups/${writeup.slug}`}
                  className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 font-mono text-sm flex items-center justify-center py-2 border border-blue-300 dark:border-green-500/30 rounded hover:bg-blue-50 dark:hover:bg-green-500/10 transition-all mt-auto"
                >
                  Read Writeup →
                </Link>
              </AnimatedCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <Terminal className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 transition-colors duration-300" />
            <h3 className="text-lg sm:text-xl font-mono text-gray-500 dark:text-gray-500 mb-2 transition-colors duration-300">
              {searchQuery ? 'No writeups found' : 'No writeups available'}
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
                className="px-4 py-2 bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white dark:text-black rounded-lg transition-colors text-sm sm:text-base"
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