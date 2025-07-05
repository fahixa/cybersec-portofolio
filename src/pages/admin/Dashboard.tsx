import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, FileText, User, Plus, LogOut, Edit, Trash2, Eye, EyeOff, Clock, AlertTriangle, BookOpen, Star } from 'lucide-react';
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
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Load writeups
      const { data: writeupsData } = await supabase
        .from('writeups')
        .select('*')
        .order('created_at', { ascending: false });
      setWriteups(writeupsData || []);

      // Load articles
      const { data: articlesData } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      setArticles(articlesData || []);
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
        {/* Header with Session Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 dark:text-green-400 font-mono mb-2 transition-colors duration-300">
              <GlitchText text="ADMIN DASHBOARD" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base transition-colors duration-300">
              Welcome back, Administrator
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
              Logged in as: {user?.email}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Session Timer */}
            <div className="bg-yellow-50 dark:bg-gray-900/50 border border-yellow-300 dark:border-yellow-500/30 rounded-lg px-3 py-2 flex items-center space-x-2 transition-colors duration-300">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400 transition-colors duration-300" />
              <span className="text-yellow-700 dark:text-yellow-400 text-xs sm:text-sm font-mono transition-colors duration-300">
                Session: {sessionTimeRemaining}
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Security Alert */}
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-400 p-3 sm:p-4 rounded-lg mb-6 sm:mb-8 transition-colors duration-300">
          <div className="flex items-start">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1 text-sm sm:text-base">Security Notice</p>
              <p className="text-xs sm:text-sm">
                You are accessing a restricted administrative area. All actions are logged and monitored. 
                This is a single-user admin system with data stored in Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <AnimatedCard className="text-center">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-green-400 mx-auto mb-2 transition-colors duration-300" />
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-mono transition-colors duration-300">1</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Active Profile</div>
          </AnimatedCard>
          <AnimatedCard className="text-center" glowColor="cyan">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 dark:text-cyan-400 mx-auto mb-2 transition-colors duration-300" />
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-mono transition-colors duration-300">{writeups.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Total Writeups</div>
          </AnimatedCard>
          <AnimatedCard className="text-center" glowColor="purple">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2 transition-colors duration-300" />
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-mono transition-colors duration-300">{articles.length}</div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Total Articles</div>
          </AnimatedCard>
          <AnimatedCard className="text-center">
            <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-green-400 mx-auto mb-2 transition-colors duration-300" />
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-mono transition-colors duration-300">
              {writeups.filter(w => w.published).length + articles.filter(a => a.published).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Published</div>
          </AnimatedCard>
          <AnimatedCard className="text-center col-span-2 sm:col-span-1">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 transition-colors duration-300" />
            <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white font-mono transition-colors duration-300">
              {articles.filter(a => a.featured).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">Featured</div>
          </AnimatedCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Profile Management */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono transition-colors duration-300">Profile</h2>
              <Link
                to="/authorize/profile"
                className="flex items-center space-x-2 bg-blue-600 dark:bg-green-600 hover:bg-blue-500 dark:hover:bg-green-500 text-white dark:text-black px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm w-fit"
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Edit Profile</span>
              </Link>
            </div>
            <AnimatedCard>
              {profile ? (
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{profile.name}</h3>
                  <p className="text-blue-600 dark:text-green-400 mb-2 text-sm sm:text-base transition-colors duration-300">{profile.title}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm line-clamp-3 transition-colors duration-300">{profile.bio}</p>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-500 transition-colors duration-300">
                  <User className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" />
                  <p className="text-sm">No profile created yet</p>
                </div>
              )}
            </AnimatedCard>
          </div>

          {/* Writeups Management */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono transition-colors duration-300">Writeups</h2>
              <Link
                to="/authorize/writeups/new"
                className="flex items-center space-x-2 bg-blue-600 dark:bg-green-600 hover:bg-blue-500 dark:hover:bg-green-500 text-white dark:text-black px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm w-fit"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>New Writeup</span>
              </Link>
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {writeups.length > 0 ? (
                writeups.map((writeup) => (
                  <AnimatedCard key={writeup.id} className="p-3 sm:p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate transition-colors duration-300">
                            {writeup.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded ${
                            writeup.published 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                          } transition-colors duration-300`}>
                            {writeup.published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">{writeup.category}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
                          {new Date(writeup.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                        <button
                          onClick={() => toggleWriteupPublished(writeup.id, writeup.published)}
                          className={`p-1 rounded ${
                            writeup.published 
                              ? 'text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300' 
                              : 'text-gray-500 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400'
                          } transition-colors duration-300`}
                        >
                          {writeup.published ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                        <Link
                          to={`/authorize/writeups/edit/${writeup.id}`}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                        <button
                          onClick={() => deleteWriteup(writeup.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors duration-300"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </AnimatedCard>
                ))
              ) : (
                <AnimatedCard className="text-center text-gray-500 dark:text-gray-500 transition-colors duration-300">
                  <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" />
                  <p className="text-sm">No writeups yet</p>
                </AnimatedCard>
              )}
            </div>
          </div>

          {/* Articles Management */}
          <div className="lg:col-span-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
              <h2 className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono transition-colors duration-300">Articles</h2>
              <Link
                to="/authorize/articles/new"
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm w-fit"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>New Article</span>
              </Link>
            </div>
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <AnimatedCard key={article.id} className="p-3 sm:p-4" glowColor="purple">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate transition-colors duration-300">
                            {article.title}
                          </h3>
                          <div className="flex space-x-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              article.published 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                            } transition-colors duration-300`}>
                              {article.published ? 'Published' : 'Draft'}
                            </span>
                            {article.featured && (
                              <span className="text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 transition-colors duration-300">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">{article.category}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
                          {new Date(article.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                        <button
                          onClick={() => toggleArticleFeatured(article.id, article.featured)}
                          className={`p-1 rounded ${
                            article.featured 
                              ? 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-500 dark:hover:text-yellow-300' 
                              : 'text-gray-500 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400'
                          } transition-colors duration-300`}
                        >
                          <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${article.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => toggleArticlePublished(article.id, article.published)}
                          className={`p-1 rounded ${
                            article.published 
                              ? 'text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300' 
                              : 'text-gray-500 dark:text-gray-500 hover:text-gray-400 dark:hover:text-gray-400'
                          } transition-colors duration-300`}
                        >
                          {article.published ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                        <Link
                          to={`/authorize/articles/edit/${article.id}`}
                          className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors duration-300"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                        <button
                          onClick={() => deleteArticle(article.id)}
                          className="p-1 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 transition-colors duration-300"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  </AnimatedCard>
                ))
              ) : (
                <AnimatedCard className="text-center text-gray-500 dark:text-gray-500 transition-colors duration-300" glowColor="purple">
                  <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2" />
                  <p className="text-sm">No articles yet</p>
                </AnimatedCard>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}