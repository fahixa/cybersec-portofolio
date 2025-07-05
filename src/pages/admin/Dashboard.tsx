import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, LogOut, Edit, Trash2, Eye, EyeOff, Clock, AlertTriangle, BookOpen, Star, Calendar, User, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Profile, type Writeup, type Article } from '../../lib/supabase';
import GlitchText from '../../components/GlitchText';
import AnimatedCard from '../../components/AnimatedCard';

export default function Dashboard() {
  const { user, signOut, isSessionValid } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/authorize');
      return;
    }
    
    // Check session validity
    if (!isSessionValid()) {
      handleSignOut();
      return;
    }
    
    loadData();
    
    // Update session timer every minute
    const timer = setInterval(updateSessionTimer, 60000);
    updateSessionTimer(); // Initial call
    
    return () => clearInterval(timer);
  }, [user, navigate, isSessionValid]);

  const updateSessionTimer = () => {
    const sessionData = localStorage.getItem('cybersec-session-data');
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const timeLeft = session.expiry - Date.now();
        
        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          setSessionTimeRemaining(`${hours}h ${minutes}m`);
        } else {
          setSessionTimeRemaining('Expired');
          handleSignOut();
        }
      } catch (error) {
        console.error('Error updating session timer:', error);
      }
    }
  };

  const loadData = async () => {
    try {
      console.log('🔄 Loading dashboard data...');
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      if (profileError) {
        if (profileError.code !== 'PGRST116') {
          console.error('❌ Error loading profile:', profileError);
        }
      } else if (profileData) {
        console.log('✅ Profile loaded:', profileData.name);
        setProfile(profileData);
      }

      // Load writeups
      const { data: writeupsData, error: writeupsError } = await supabase
        .from('writeups')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (writeupsError) {
        console.error('❌ Error loading writeups:', writeupsError);
      } else {
        console.log('✅ Writeups loaded:', writeupsData?.length || 0);
        setWriteups(writeupsData || []);
      }

      // Load articles
      const { data: articlesData, error: articlesError } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (articlesError) {
        console.error('❌ Error loading articles:', articlesError);
      } else {
        console.log('✅ Articles loaded:', articlesData?.length || 0);
        setArticles(articlesData || []);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/authorize');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const deleteWriteup = async (id: string) => {
    if (!confirm('Are you sure you want to delete this writeup?')) return;

    try {
      const { error } = await supabase
        .from('writeups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setWriteups(writeups.filter(w => w.id !== id));
    } catch (error) {
      console.error('Error deleting writeup:', error);
      alert('Error deleting writeup');
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setArticles(articles.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article');
    }
  };

  const toggleWriteupPublished = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('writeups')
        .update({ published: !published })
        .eq('id', id);

      if (error) throw error;
      
      setWriteups(writeups.map(w => 
        w.id === id ? { ...w, published: !published } : w
      ));
    } catch (error) {
      console.error('Error updating writeup:', error);
      alert('Error updating writeup');
    }
  };

  const toggleArticlePublished = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ published: !published })
        .eq('id', id);

      if (error) throw error;
      
      setArticles(articles.map(a => 
        a.id === id ? { ...a, published: !published } : a
      ));
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Error updating article');
    }
  };

  const toggleArticleFeatured = async (id: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('articles')
        .update({ featured: !featured })
        .eq('id', id);

      if (error) throw error;
      
      setArticles(articles.map(a => 
        a.id === id ? { ...a, featured: !featured } : a
      ));
    } catch (error) {
      console.error('Error updating article:', error);
      alert('Error updating article');
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Utility functions for content preview
  const truncateText = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const extractContentPreview = (content: string): string => {
    // Remove markdown syntax and get clean text preview
    const cleanContent = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    return truncateText(cleanContent, 150);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tutorial': return BookOpen;
      case 'tools': return TrendingUp;
      case 'career': return User;
      case 'ctf': return FileText;
      case 'bug-bounty': return AlertTriangle;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-green-400 mx-auto mb-4 transition-colors duration-300"></div>
          <p className="text-blue-600 dark:text-green-400 font-mono text-sm sm:text-base transition-colors duration-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-green-500 dark:to-cyan-500 rounded-2xl p-6 sm:p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-mono mb-2">
                <GlitchText text="ADMIN DASHBOARD" />
              </h1>
              <p className="text-blue-100 dark:text-green-100 text-sm sm:text-base mb-2 truncate">
                Welcome back, Administrator
              </p>
              <p className="text-xs text-blue-200 dark:text-green-200 opacity-80 truncate">
                Logged in as: {user?.email}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
              {/* Session Timer */}
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-2 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-mono">
                  Session: {sessionTimeRemaining}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Alert */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-400 p-4 rounded-lg mb-8 transition-colors duration-300">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1 text-sm sm:text-base">Security Notice</p>
              <p className="text-xs sm:text-sm">
                You are accessing a restricted administrative area. All actions are logged and monitored. 
                This is a single-user admin system with data stored in Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <AnimatedCard className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-500/30">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono">{writeups.length}</div>
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Writeups</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-500/30">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300 font-mono">{articles.length}</div>
            <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-400">Articles</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-500/30">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400 mx-auto mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-300 font-mono">
              {writeups.filter(w => w.published).length + articles.filter(a => a.published).length}
            </div>
            <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">Published</div>
          </AnimatedCard>
          
          <AnimatedCard className="text-center bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-500/30">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 sm:mb-3" />
            <div className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-300 font-mono">
              {articles.filter(a => a.featured).length}
            </div>
            <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">Featured</div>
          </AnimatedCard>
        </div>

        {/* Content Management Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Writeups Management */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Writeups</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your security writeups</p>
                </div>
              </div>
              <Link
                to="/authorize/writeups/new"
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Writeup</span>
              </Link>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {writeups.length > 0 ? (
                writeups.map((writeup) => {
                  const CategoryIcon = getCategoryIcon(writeup.category);
                  return (
                    <AnimatedCard key={writeup.id} className="p-4 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              writeup.published 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                            }`}>
                              {writeup.published ? 'Published' : 'Draft'}
                            </span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">
                              {writeup.category.toUpperCase()}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {writeup.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {extractContentPreview(writeup.content)}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(writeup.created_at)}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => toggleWriteupPublished(writeup.id, writeup.published)}
                            className={`p-2 rounded-lg transition-colors ${
                              writeup.published 
                                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
                                : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            title={writeup.published ? 'Unpublish' : 'Publish'}
                          >
                            {writeup.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <Link
                            to={`/authorize/writeups/edit/${writeup.id}`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteWriteup(writeup.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </AnimatedCard>
                  );
                })
              ) : (
                <AnimatedCard className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-500 mb-4">No writeups yet</p>
                  <Link
                    to="/authorize/writeups/new"
                    className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create your first writeup</span>
                  </Link>
                </AnimatedCard>
              )}
            </div>
          </div>

          {/* Articles Management */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Articles</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your articles and tutorials</p>
                </div>
              </div>
              <Link
                to="/authorize/articles/new"
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>New Article</span>
              </Link>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {articles.length > 0 ? (
                articles.map((article) => {
                  const CategoryIcon = getCategoryIcon(article.category);
                  return (
                    <AnimatedCard key={article.id} className="p-4 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryIcon className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              article.published 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                            }`}>
                              {article.published ? 'Published' : 'Draft'}
                            </span>
                            {article.featured && (
                              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-medium">
                                Featured
                              </span>
                            )}
                            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-medium">
                              {article.category.toUpperCase()}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                            {article.title}
                          </h3>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                            {extractContentPreview(article.content)}
                          </p>
                          
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(article.created_at)}
                            <span className="mx-2">•</span>
                            <Clock className="w-3 h-3 mr-1" />
                            {article.read_time} min read
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => toggleArticleFeatured(article.id, article.featured)}
                            className={`p-2 rounded-lg transition-colors ${
                              article.featured 
                                ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                                : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            title={article.featured ? 'Remove from featured' : 'Add to featured'}
                          >
                            <Star className={`w-4 h-4 ${article.featured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => toggleArticlePublished(article.id, article.published)}
                            className={`p-2 rounded-lg transition-colors ${
                              article.published 
                                ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
                                : 'text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                            title={article.published ? 'Unpublish' : 'Publish'}
                          >
                            {article.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <Link
                            to={`/authorize/articles/edit/${article.id}`}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </AnimatedCard>
                  );
                })
              ) : (
                <AnimatedCard className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-500 mb-4">No articles yet</p>
                  <Link
                    to="/authorize/articles/new"
                    className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create your first article</span>
                  </Link>
                </AnimatedCard>
              )}
            </div>
          </div>
        </div>

        {/* Profile Section */}
        <div className="mt-8">
          {/* Profile Management */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your public profile</p>
                </div>
              </div>
              <Link
                to="/authorize/profile"
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>

            <AnimatedCard className="p-6">
              {profile ? (
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 truncate">{profile.name}</h3>
                    <p className="text-green-600 dark:text-green-400 mb-3 font-medium truncate">{profile.title}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">{profile.bio}</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.slice(0, 4).map((skill, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {profile.skills?.length > 4 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
                          +{profile.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-500 mb-4">No profile created yet</p>
                  <Link
                    to="/authorize/profile"
                    className="inline-flex items-center space-x-2 text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create your profile</span>
                  </Link>
                </div>
              )}
            </AnimatedCard>
          </div>
        </div>
      </div>
    </div>
  );
}