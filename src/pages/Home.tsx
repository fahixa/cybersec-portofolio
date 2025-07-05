import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Github, Linkedin, Mail, Terminal, Shield, Bug, BookOpen, Star } from 'lucide-react';
import GlitchText from '../components/GlitchText';
import AnimatedCard from '../components/AnimatedCard';
import { DatabaseService, type Profile, type Writeup, type Article } from '../lib/supabase';

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
      
      console.log('🔄 Starting data load...');
      
      // Test connection first with better error handling
      const connectionOk = await DatabaseService.testConnection();
      if (!connectionOk) {
        console.warn('⚠️ Database connection failed, using fallback data');
        setLoading(false);
        return;
      }
      
      console.log('🔄 Loading data in parallel...');
      const [profileData, writeupsData, articlesData] = await Promise.all([
        DatabaseService.getProfile(),
        DatabaseService.getWriteups({ published: true, limit: 2 }),
        DatabaseService.getArticles({ published: true, featured: true, limit: 2 })
      ]);

      console.log('📊 Data loaded:', {
        profile: profileData?.name || 'No profile',
        writeups: writeupsData.length,
        articles: articlesData.length
      });

      setProfile(profileData);
      setRecentWriteups(writeupsData);
      setFeaturedArticles(articlesData);
    } catch (error) {
      console.error('❌ Error loading data:', error);
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
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 dark:from-black dark:via-green-900/10 dark:to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-500/30 dark:bg-green-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-500/40 dark:bg-cyan-400/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-cyan-500/30 dark:bg-blue-400/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-indigo-500/20 dark:bg-emerald-400/20 rounded-full animate-pulse"></div>
        
        {/* Main Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-4 py-2 mb-8 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full text-sm font-medium text-blue-600 dark:text-green-400 shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Available for Cybersecurity Projects
            </div>

            {/* Main Title with Enhanced Typography */}
          <div className="mb-6 sm:mb-8">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 leading-none">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-green-400 dark:via-cyan-400 dark:to-green-600 bg-clip-text text-transparent animate-gradient-x">
                  <GlitchText text={profile?.name || "Fakhri Tyhikmawan"} />
                </span>
              </h1>
              
              <div className="relative">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-700 dark:text-gray-200 mb-2 tracking-tight">
                  {profile?.title || "Cybersecurity Analyst & Bug Bounty Hunter"}
                </p>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-green-400 dark:to-cyan-400 rounded-full"></div>
              </div>
          </div>

            {/* Enhanced Bio Section */}
            <div className="mb-10 sm:mb-14 max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed font-light tracking-wide">
                {profile?.bio || "Cyber Security Analyst with a Bachelor's in Computer Engineering from Telkom University. Experienced in real-time security monitoring, threat analysis, and implementing defense strategies at PT. Defender Nusa Semesta (Defenxor). Skilled in Microsoft Defender, Azure security, and compliance management. Focused on optimizing web applications and collaborating in team-driven environments."}
              </p>
            </div>
          </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16">
              <Link
                to="/writeups"
                className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 dark:from-green-500 dark:to-green-600 hover:from-blue-500 hover:to-blue-600 dark:hover:from-green-400 dark:hover:to-green-500 text-white dark:text-black font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 dark:hover:shadow-green-500/25 flex items-center space-x-3 min-w-[200px] justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <Terminal className="w-5 h-5 relative z-10" />
                <span className="text-lg relative z-10">View Writeups</span>
              </Link>
              
              <Link
                to="/articles"
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 flex items-center space-x-3 min-w-[200px] justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <BookOpen className="w-5 h-5 relative z-10" />
                <span className="text-lg relative z-10">Read Articles</span>
              </Link>
              
              <Link
                to="/profile"
                className="group relative overflow-hidden bg-transparent border-2 border-blue-500/50 dark:border-green-500/50 hover:border-blue-400 dark:hover:border-green-400 text-blue-600 dark:text-green-400 hover:text-white dark:hover:text-black font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm hover:bg-blue-500 dark:hover:bg-green-500 flex items-center space-x-3 min-w-[200px] justify-center"
              >
                <Shield className="w-5 h-5 relative z-10" />
                <span className="text-lg relative z-10">About Me</span>
              </Link>
            </div>
          </div>

            {/* Enhanced Social Links */}
            <div className="flex justify-center items-center space-x-8">
              {profile?.github_url && isValidUrl(profile.github_url) && (
                <a 
                  href={profile.github_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  aria-label="GitHub Profile"
                >
                  <Github className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-green-400 transition-colors duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-green-400 dark:to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
                </a>
              )}
              {profile?.linkedin_url && isValidUrl(profile.linkedin_url) && (
                <a 
                  href={profile.linkedin_url} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-green-400 transition-colors duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-green-400 dark:to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
                </a>
              )}
              <a 
                href="mailto:fakhrityhikmawan@gmail.com"
                className="group relative p-4 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:shadow-xl"
                aria-label="Send Email"
              >
                <Mail className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-green-400 transition-colors duration-300" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-green-400 dark:to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur"></div>
              </a>
            </div>
          </div>
        </div>

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium tracking-wider uppercase">Scroll Down</div>
          <button
          onClick={scrollToContent}
            className="group p-3 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 hover:scale-110"
          aria-label="Scroll to content"
        >
            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-green-400 group-hover:text-blue-500 dark:group-hover:text-green-300 animate-bounce transition-colors duration-300" />
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
  );
}