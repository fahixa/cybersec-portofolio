import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Clock, ExternalLink } from 'lucide-react';
import { DatabaseService, type Writeup } from '../lib/supabase';
import CyberBackground from '../components/CyberBackground';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const WriteupDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [writeup, setWriteup] = useState<Writeup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadWriteup(slug);
    }
  }, [slug]);

  const loadWriteup = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading writeup with slug:', slug);
      const data = await DatabaseService.getWriteupBySlug(slug);
      
      if (!data) {
        throw new Error('Writeup not found');
      }
      
      console.log('Writeup loaded:', data);
      setWriteup(data);
    } catch (err) {
      console.error('Error loading writeup:', err);
      setError(err instanceof Error ? err.message : 'Failed to load writeup');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 border-green-300 dark:border-green-400/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 border-yellow-300 dark:border-yellow-400/30';
      case 'hard': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-300 dark:border-red-400/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ctf': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 border-blue-300 dark:border-blue-400/30';
      case 'bug-bounty': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10 border-purple-300 dark:border-purple-400/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-400/10 border-gray-300 dark:border-gray-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
        <CyberBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-green-400 mx-auto mb-4 transition-colors duration-300"></div>
            <p className="text-blue-600 dark:text-green-400 transition-colors duration-300">Loading writeup...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !writeup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
        <CyberBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4 transition-colors duration-300">Writeup Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">{error || 'The requested writeup could not be found.'}</p>
            <Link
              to="/writeups"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white dark:text-black rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Write-ups</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      <CyberBackground />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/writeups"
          className="inline-flex items-center space-x-2 text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Write-ups</span>
        </Link>

        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-8 mb-8 shadow-lg dark:shadow-2xl transition-colors duration-300">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(writeup.category)} transition-colors duration-300`}>
              {writeup.category.toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(writeup.difficulty)} transition-colors duration-300`}>
              {writeup.difficulty.toUpperCase()}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors duration-300">
            {writeup.title}
          </h1>

          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed transition-colors duration-300">
            {writeup.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Published {formatDate(writeup.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>~{Math.ceil(writeup.content.length / 1000)} min read</span>
            </div>
          </div>

          {/* Tags */}
          {writeup.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {writeup.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600/30 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-colors duration-300"
                >
                  <Tag className="h-3 w-3" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="bg-white/95 dark:bg-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-green-500/20 rounded-lg p-8 shadow-lg dark:shadow-2xl transition-colors duration-300">
          <div className="prose prose-gray dark:prose-invert prose-blue dark:prose-green max-w-none">
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isTerminalOutput = String(children).includes('PORT') && String(children).includes('STATE') && String(children).includes('SERVICE');
                  
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow as any}
                      language={match[1]}
                      PreTag="div"
                      className={`rounded-lg border border-gray-300 dark:border-gray-600/30 my-6 overflow-x-auto shadow-sm ${isTerminalOutput ? 'terminal-output' : ''}`}
                      customStyle={{
                        backgroundColor: isTerminalOutput ? '#0f172a' : 'transparent',
                        padding: '1.5rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.6',
                        fontFamily: 'JetBrains Mono, Fira Code, Consolas, Monaco, monospace',
                        border: 'none',
                        color: isTerminalOutput ? '#00ff41' : undefined
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                      showLineNumbers={!isTerminalOutput}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 px-3 py-1.5 rounded-md text-blue-600 dark:text-green-400 border border-blue-200 dark:border-gray-600/30 transition-all duration-300 font-mono text-sm font-medium hover:shadow-md" {...props}>
                      {children}
                    </code>
                  );
                },
                h1: ({children}) => (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 mt-8 first:mt-0 border-b border-gray-300 dark:border-green-500/30 pb-2 transition-colors duration-300">
                    {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 className="text-2xl font-bold text-blue-600 dark:text-green-400 mb-4 mt-8 first:mt-0 transition-colors duration-300">
                    {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 className="text-xl font-bold text-blue-500 dark:text-green-300 mb-3 mt-6 first:mt-0 transition-colors duration-300">
                    {children}
                  </h3>
                ),
                p: ({children}) => (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed transition-colors duration-300">
                    {children}
                  </p>
                ),
                ul: ({children}) => (
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 transition-colors duration-300">
                    {children}
                  </ul>
                ),
                ol: ({children}) => (
                  <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 transition-colors duration-300">
                    {children}
                  </ol>
                ),
                li: ({children}) => (
                  <li className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    {children}
                  </li>
                ),
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-blue-500 dark:border-green-500/50 pl-4 italic text-gray-600 dark:text-gray-400 my-4 bg-blue-50 dark:bg-gray-800/30 py-2 transition-colors duration-300">
                    {children}
                  </blockquote>
                ),
                a: ({href, children}) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 underline decoration-blue-500/50 dark:decoration-green-500/50 hover:decoration-blue-400 dark:hover:decoration-green-300 transition-colors inline-flex items-center gap-1"
                  >
                    {children}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ),
                strong: ({children}) => (
                  <strong className="text-gray-900 dark:text-white font-bold transition-colors duration-300">
                    {children}
                  </strong>
                ),
                em: ({children}) => (
                  <em className="text-blue-600 dark:text-green-300 italic transition-colors duration-300">
                    {children}
                  </em>
                )
              }}
            >
              {writeup.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            to="/writeups"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white dark:text-black rounded-lg transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Write-ups</span>
          </Link>
        </div>
      </div>
    </div>
  );
};