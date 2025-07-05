import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Github, Linkedin, Twitter, Terminal, Shield, Bug, BookOpen, Star } from 'lucide-react';
import GlitchText from '../components/GlitchText';
import AnimatedCard from '../components/AnimatedCard';
import { SupabaseService, type Profile, type Writeup, type Article } from '../lib/supabase';

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentWriteups, setRecentWriteups] = useState<Writeup[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [profileData, writeupsData, articlesData] = await Promise.all([
        SupabaseService.getProfile(),
        SupabaseService.getWriteups({ published: true, limit: 2 }),
        SupabaseService.getArticles({ published: true, featured: true, limit: 2 })
      ]);

      setProfile(profileData);
      setRecentWriteups(writeupsData);
      setFeaturedArticles(articlesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
        <div className="text-center z-10 max-w-4xl w-full">
          <div className="mb-6 sm:mb-8">
            <GlitchText 
              text={profile?.name || "CYBERSEC SPECIALIST"} 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold font-mono text-blue-600 dark:text-green-400 mb-2 sm:mb-4 block leading-tight transition-colors duration-300"
            />
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 font-mono px-4 transition-colors duration-300">
              {profile?.title || "Penetration Tester | Bug Bounty Hunter | CTF Player"}
            </p>
          </div>

          <div className="mb-8 sm:mb-12 px-4">
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
              {profile?.bio || "Securing the digital realm one vulnerability at a time. Specializing in web application security, network penetration testing, and competitive hacking."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4">
            <Link
              to="/writeups"
              className="bg-blue-600 dark:bg-green-600 hover:bg-blue-500 dark:hover:bg-green-500 text-white dark:text-black font-bold py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Terminal className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">View Writeups</span>
            </Link>
            <Link
              to="/articles"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Read Articles</span>
            </Link>
            <Link
              to="/profile"
              className="border border-blue-500 dark:border-green-500 text-blue-600 dark:text-green-400 hover:bg-blue-500 dark:hover:bg-green-500 hover:text-white dark:hover:text-black font-bold py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">About Me</span>
            </Link>
          </div>

          <div className="flex justify-center space-x-4 sm:space-x-6">
            {profile?.github_url && isValidUrl(profile.github_url) && (
              <a 
                href={profile.github_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors duration-300"
                aria-label="GitHub Profile"
              >
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            )}
            {profile?.linkedin_url && isValidUrl(profile.linkedin_url) && (
              <a 
                href={profile.linkedin_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors duration-300"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            )}
            {profile?.twitter_url && isValidUrl(profile.twitter_url) && (
              <a 
                href={profile.twitter_url} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors duration-300"
                aria-label="Twitter Profile"
              >
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            )}
          </div>
        </div>

        <button
          onClick={scrollToContent}
          className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-blue-600 dark:text-green-400 animate-bounce transition-colors duration-300"
          aria-label="Scroll to content"
        >
          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </section>

      {/* Content Section */}
      <section id="content" className="py-12 sm:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 transition-colors duration-300">
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
                  <AnimatedCard key={article.id} glowColor="purple" className="h-full">
                    <div className="flex items-center mb-3">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400 mr-2 transition-colors duration-300" />
                      <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 transition-colors duration-300">
                        {article.category.toUpperCase()}
                      </span>
                      <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 ml-2 fill-current" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono leading-tight transition-colors duration-300">{article.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm sm:text-base transition-colors duration-300">{article.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors duration-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
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
                  <AnimatedCard key={writeup.id} glowColor="cyan" className="h-full">
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
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 font-mono leading-tight transition-colors duration-300">{writeup.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm sm:text-base transition-colors duration-300">{writeup.excerpt}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {writeup.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded transition-colors duration-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to={`/writeups/${writeup.slug}`}
                      className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 font-mono text-sm flex items-center mt-auto transition-colors duration-300"
                    >
                      Read More →
                    </Link>
                  </AnimatedCard>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
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