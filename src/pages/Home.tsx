import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Github, Linkedin, Mail, Terminal, Shield, Bug, BookOpen, Star } from 'lucide-react';
import GlitchText from '../components/GlitchText';
import AnimatedCard from '../components/AnimatedCard';
import { useProfile, useWriteups, useArticles } from '../hooks/useDataFetching';

export default function Home() {
  // Use optimized data fetching hooks
  const { data: profile, loading: profileLoading } = useProfile();
  const { data: writeupsData, loading: writeupsLoading } = useWriteups({ 
    published: true, 
    limit: 2 
  });
  const { data: articlesData, loading: articlesLoading } = useArticles({ 
    published: true, 
    featured: true, 
    limit: 2 
  });

  // Ensure arrays are never null
  const recentWriteups = writeupsData || [];
  const featuredArticles = articlesData || [];

  const loading = profileLoading || writeupsLoading || articlesLoading;

  const scrollToContent = () => {
    document.getElementById('content')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Secure URL validation
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-blue-600 dark:text-green-400 font-mono text-sm sm:text-base transition-colors duration-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 transition-colors duration-300">
            <GlitchText text={profile?.name || "Alex CyberSec"} />
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 mb-8 transition-colors duration-300">
            {profile?.title || "Senior Penetration Tester & Bug Bounty Hunter"}
          </p>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
            {profile?.bio || "Passionate cybersecurity professional with 5+ years of experience in penetration testing, vulnerability research, and bug bounty hunting. Specialized in web application security, network security, and reverse engineering."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/writeups"
              className="bg-blue-600 dark:bg-green-600 hover:bg-blue-700 dark:hover:bg-green-700 text-white dark:text-black font-bold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Terminal className="w-5 h-5" />
              <span>View Writeups</span>
            </Link>
            
            <Link
              to="/articles"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Read Articles</span>
            </Link>
            
            <Link
              to="/profile"
              className="border-2 border-blue-600 dark:border-green-600 text-blue-600 dark:text-green-400 hover:bg-blue-600 dark:hover:bg-green-600 hover:text-white dark:hover:text-black font-bold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Shield className="w-5 h-5" />
              <span>About Me</span>
            </Link>
          </div>

          <div className="flex justify-center items-center space-x-6">
            {profile?.github_url && isValidUrl(profile.github_url) && (
              <a 
                href={profile.github_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors"
                aria-label="GitHub Profile"
              >
                <Github className="w-6 h-6" />
              </a>
            )}
            {profile?.linkedin_url && isValidUrl(profile.linkedin_url) && (
              <a 
                href={profile.linkedin_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            <a 
              href="mailto:fakhrityhikmawan@gmail.com"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors"
              aria-label="Send Email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <button
            onClick={scrollToContent}
            className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors"
            aria-label="Scroll to content"
          >
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section id="content" className="py-8 sm:py-12 lg:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 transition-colors duration-300">
              <GlitchText text="RECENT ACTIVITIES" />
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors duration-300">Latest writeups and featured articles</p>
          </div>

          {/* Featured Articles Section */}
          {featuredArticles.length > 0 && (
            <div className="mb-12 sm:mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 sm:mr-3" />
                  <h3 className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400 font-mono transition-colors duration-300">Featured Articles</h3>
                </div>
                <Link
                  to="/articles"
                  className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300 font-mono text-sm flex items-center self-start sm:self-auto transition-colors duration-300"
                >
                  View All Articles →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {featuredArticles.map((article) => (
                  <AnimatedCard key={article.id} glowColor="purple" className="h-full flex flex-col">
                    <div className="flex items-center mb-3">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mr-2 transition-colors duration-300" />
                      <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 transition-colors duration-300">
                        {article.category.toUpperCase()}
                      </span>
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 ml-2 fill-current" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono leading-tight transition-colors duration-300 flex-grow-0">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm sm:text-base transition-colors duration-300 flex-grow">{article.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors duration-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto flex-shrink-0">
                      <span className="text-xs text-gray-500 transition-colors duration-300">{article.read_time} min read</span>
                      <Link
                        to={`/articles/${article.slug}`}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 font-mono text-sm flex items-center transition-colors duration-300"
                      >
                        Read More →
                      </Link>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          )}

          {/* Recent Writeups Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono transition-colors duration-300">Recent Writeups</h3>
              <Link
                to="/writeups"
                className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 font-mono text-sm flex items-center self-start sm:self-auto transition-colors duration-300"
              >
                View All Writeups →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {recentWriteups.length > 0 ? (
                recentWriteups.map((writeup) => (
                  <AnimatedCard key={writeup.id} glowColor="cyan" className="h-full flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {writeup.category === 'ctf' ? (
                        <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400 transition-colors duration-300" />
                      ) : (
                        <Bug className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 transition-colors duration-300" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded ${
                        writeup.category === 'ctf' 
                          ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30'
                          : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30'
                      } transition-colors duration-300`}>
                        {writeup.category.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        writeup.difficulty === 'easy' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                          : writeup.difficulty === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                      } transition-colors duration-300`}>
                        {writeup.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono leading-tight transition-colors duration-300 flex-grow-0">{writeup.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm sm:text-base transition-colors duration-300 flex-grow">{writeup.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {writeup.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors duration-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/writeups/${writeup.slug}`}
                      className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 font-mono text-sm flex items-center mt-auto transition-colors duration-300 flex-shrink-0"
                    >
                      Read More →
                    </Link>
                  </AnimatedCard>
                ))
              ) : (
                <div className="col-span-full text-center py-8 sm:py-12">
                  <Terminal className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4 transition-colors duration-300" />
                  <p className="text-gray-500 dark:text-gray-500 font-mono text-sm sm:text-base transition-colors duration-300">No writeups available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}