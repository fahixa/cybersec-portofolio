import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Clock, ExternalLink, BookOpen, Star } from 'lucide-react';
import { SupabaseService, type Article } from '../lib/supabase';
import CyberBackground from '../components/CyberBackground';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const loadArticle = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading article with slug:', slug);
      const data = await SupabaseService.getArticleBySlug(slug);
      
      if (!data) {
        throw new Error('Article not found');
      }
      
      console.log('Article loaded:', data);
      setArticle(data);
    } catch (err) {
      console.error('Error loading article:', err);
      setError(err instanceof Error ? err.message : 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'tutorial': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10 border-blue-300 dark:border-blue-400/30';
      case 'news': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 border-red-300 dark:border-red-400/30';
      case 'opinion': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10 border-purple-300 dark:border-purple-400/30';
      case 'tools': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-400/10 border-green-300 dark:border-green-400/30';
      case 'career': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-400/10 border-yellow-300 dark:border-yellow-400/30';
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
            <p className="text-blue-600 dark:text-green-400 transition-colors duration-300">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white relative overflow-hidden transition-colors duration-300">
        <CyberBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4 transition-colors duration-300">Article Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">{error || 'The requested article could not be found.'}</p>
            <Link
              to="/articles"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white dark:text-black rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Articles</span>
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
          to="/articles"
          className="inline-flex items-center space-x-2 text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Articles</span>
        </Link>

        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-green-500/30 rounded-lg p-8 mb-8 shadow-lg dark:shadow-2xl transition-colors duration-300">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(article.category)} transition-colors duration-300`}>
              {article.category.toUpperCase()}
            </span>
            {article.featured && (
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border border-yellow-300 dark:border-yellow-400/30 bg-yellow-50 dark:bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 transition-colors duration-300">
                <Star className="h-3 w-3 fill-current" />
                <span>FEATURED</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight transition-colors duration-300">
            {article.title}
          </h1>

          <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 leading-relaxed transition-colors duration-300">
            {article.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Published {formatDate(article.created_at)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{article.read_time} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Article</span>
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {article.tags.map((tag, index) => (
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
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg border border-gray-300 dark:border-gray-600/30"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-100 dark:bg-gray-800/50 px-2 py-1 rounded text-blue-600 dark:text-green-400 border border-gray-300 dark:border-gray-600/30 transition-colors duration-300" {...props}>
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
                h4: ({children}) => (
                  <h4 className="text-lg font-bold text-blue-400 dark:text-green-200 mb-2 mt-4 first:mt-0 transition-colors duration-300">
                    {children}
                  </h4>
                ),
                p: ({children}) => (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed transition-colors duration-300">
                    {children}
                  </p>
                ),
                ul: ({children}) => (
                  <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4 transition-colors duration-300">
                    {children}
                  </ul>
                ),
                ol: ({children}) => (
                  <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-2 ml-4 transition-colors duration-300">
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
                ),
                table: ({children}) => (
                  <div className="overflow-x-auto my-6">
                    <table className="min-w-full border border-gray-300 dark:border-gray-600/30 rounded-lg">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({children}) => (
                  <thead className="bg-gray-100 dark:bg-gray-800/50">
                    {children}
                  </thead>
                ),
                th: ({children}) => (
                  <th className="px-4 py-2 text-left text-blue-600 dark:text-green-400 font-semibold border-b border-gray-300 dark:border-gray-600/30 transition-colors duration-300">
                    {children}
                  </th>
                ),
                td: ({children}) => (
                  <td className="px-4 py-2 text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-600/30 transition-colors duration-300">
                    {children}
                  </td>
                )
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link
            to="/articles"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white dark:text-black rounded-lg transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Articles</span>
          </Link>
        </div>
      </div>
    </div>
  );
};