import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navigation } from './components/Navigation';
import CyberBackground from './components/CyberBackground';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import ProfilePage from './pages/Profile';
import Writeups from './pages/Writeups';
import { WriteupDetail } from './pages/WriteupDetail';
import Articles from './pages/Articles';
import { ArticleDetail } from './pages/ArticleDetail';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ProfileEdit from './pages/admin/ProfileEdit';
import { WriteupEdit } from './pages/admin/WriteupEdit';
import { ArticleEdit } from './pages/admin/ArticleEdit';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white relative transition-colors duration-300">
            <CyberBackground />
            <Navigation />
            <div className="relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/writeups" element={<Writeups />} />
                <Route path="/writeups/:slug" element={<WriteupDetail />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/articles/:slug" element={<ArticleDetail />} />
                
                {/* Admin routes with new /authorize path */}
                <Route path="/authorize" element={<Login />} />
                
                {/* Protected admin routes */}
                <Route 
                  path="/authorize/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/authorize/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfileEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/authorize/writeups/new" 
                  element={
                    <ProtectedRoute>
                      <WriteupEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/authorize/writeups/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <WriteupEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/authorize/articles/new" 
                  element={
                    <ProtectedRoute>
                      <ArticleEdit />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/authorize/articles/edit/:id" 
                  element={
                    <ProtectedRoute>
                      <ArticleEdit />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
            
            {/* Simplified Footer */}
            <footer className="relative z-10 bg-white/95 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-green-500/30 mt-20 transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center">
                  <div className="text-gray-600 dark:text-gray-400 text-sm">
                    Made with <span className="text-red-500 animate-pulse">♥</span> by{' '}
                    <a 
                      href="https://linkedin.com/in/fhexl" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors font-semibold underline decoration-blue-500/50 dark:decoration-green-500/50 hover:decoration-blue-400 dark:hover:decoration-green-300"
                    >
                      Fhexl
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;