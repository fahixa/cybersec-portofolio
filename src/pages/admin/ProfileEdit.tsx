import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Award, ExternalLink, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, type Certification } from '../../lib/supabase';
import GlitchText from '../../components/GlitchText';

export default function ProfileEdit() {
  const { user, isSessionValid } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    skills: [] as string[],
    experience: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    certifications: [] as Certification[]
  });

  // New certification form state
  const [newCert, setNewCert] = useState({
    name: '',
    issuer: '',
    validation_url: '',
    issue_date: '',
    expiry_date: '',
    logo_url: ''
  });
  const [showAddCert, setShowAddCert] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (!user || !isSessionValid()) {
      navigate('/authorize');
      return;
    }
    loadProfile();
  }, [user, navigate, isSessionValid]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
      } else if (data) {
        setFormData({
          name: data.name || '',
          title: data.title || '',
          bio: data.bio || '',
          skills: data.skills || [],
          experience: data.experience || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          twitter_url: data.twitter_url || '',
          certifications: []
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Secure input sanitization
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/script/gi, '') // Remove script tags
      .trim();
  };

  // Secure URL validation
  const isValidUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URLs are allowed
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // Validate date format
  const isValidDate = (dateString: string): boolean => {
    if (!dateString) return true; // Empty dates are allowed for expiry
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && Boolean(dateString.match(/^\d{4}-\d{2}-\d{2}$/));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate URLs
      if (formData.github_url && !isValidUrl(formData.github_url)) {
        throw new Error('Invalid GitHub URL');
      }
      if (formData.linkedin_url && !isValidUrl(formData.linkedin_url)) {
        throw new Error('Invalid LinkedIn URL');
      }
      if (formData.twitter_url && !isValidUrl(formData.twitter_url)) {
        throw new Error('Invalid Twitter URL');
      }

      // Validate certification URLs and dates
      for (const cert of formData.certifications) {
        if (!isValidUrl(cert.validation_url)) {
          throw new Error(`Invalid validation URL for ${cert.name}`);
        }
        if (!isValidUrl(cert.logo_url)) {
          throw new Error(`Invalid logo URL for ${cert.name}`);
        }
        if (!isValidDate(cert.issue_date)) {
          throw new Error(`Invalid issue date for ${cert.name}`);
        }
        if (cert.expiry_date && !isValidDate(cert.expiry_date)) {
          throw new Error(`Invalid expiry date for ${cert.name}`);
        }
      }

      // Sanitize all inputs
      const sanitizedData = {
        ...formData,
        name: sanitizeInput(formData.name),
        title: sanitizeInput(formData.title),
        bio: sanitizeInput(formData.bio),
        experience: sanitizeInput(formData.experience),
        github_url: formData.github_url.trim(),
        linkedin_url: formData.linkedin_url.trim(),
        twitter_url: formData.twitter_url.trim(),
        certifications: formData.certifications.map(cert => ({
          ...cert,
          name: sanitizeInput(cert.name),
          issuer: sanitizeInput(cert.issuer),
          validation_url: cert.validation_url.trim(),
          logo_url: cert.logo_url.trim()
        }))
      };

      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user!.id,
          ...sanitizedData,
          updated_at: new Date().toISOString(),
        } as any);

      if (error) throw error;

      navigate('/authorize/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert(error instanceof Error ? error.message : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const sanitizedSkill = sanitizeInput(newSkill.trim());
    if (sanitizedSkill && !formData.skills.includes(sanitizedSkill)) {
      setFormData({ ...formData, skills: [...formData.skills, sanitizedSkill] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const addCertification = () => {
    // Validate required fields
    if (!newCert.name || !newCert.issuer || !newCert.validation_url || !newCert.issue_date || !newCert.logo_url) {
      alert('Please fill in all required certification fields');
      return;
    }

    // Validate URLs
    if (!isValidUrl(newCert.validation_url) || !isValidUrl(newCert.logo_url)) {
      alert('Please enter valid URLs for validation and logo');
      return;
    }

    // Validate dates
    if (!isValidDate(newCert.issue_date) || (newCert.expiry_date && !isValidDate(newCert.expiry_date))) {
      alert('Please enter valid dates');
      return;
    }

    // Check if expiry date is after issue date
    if (newCert.expiry_date && new Date(newCert.expiry_date) <= new Date(newCert.issue_date)) {
      alert('Expiry date must be after issue date');
      return;
    }

    const certification: Certification = {
      id: Date.now().toString(),
      profile_id: '',
      name: sanitizeInput(newCert.name),
      issuer: sanitizeInput(newCert.issuer),
      validation_url: newCert.validation_url.trim(),
      issue_date: newCert.issue_date,
      expiry_date: newCert.expiry_date || null,
      logo_url: newCert.logo_url.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setFormData({
      ...formData,
      certifications: [...formData.certifications, certification]
    });

    // Reset form
    setNewCert({
      name: '',
      issuer: '',
      validation_url: '',
      issue_date: '',
      expiry_date: '',
      logo_url: ''
    });
    setShowAddCert(false);
  };

  const removeCertification = (id: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter(cert => cert.id !== id)
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-4 transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 dark:border-green-400 mx-auto mb-4 transition-colors duration-300"></div>
          <p className="text-blue-600 dark:text-green-400 font-mono text-sm sm:text-base transition-colors duration-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Mobile-First Header */}
        <div className="flex flex-col space-y-4 mb-6 lg:mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/authorize/dashboard')}
              className="flex items-center space-x-2 text-blue-600 dark:text-green-400 hover:text-blue-500 dark:hover:text-green-300 transition-colors p-2 -ml-2 rounded-lg hover:bg-blue-50 dark:hover:bg-green-500/10"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono transition-colors duration-300">
              <GlitchText text="EDIT PROFILE" />
            </h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-green-500/30 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg dark:shadow-2xl transition-colors duration-300">
            <h2 className="text-lg sm:text-xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 sm:mb-6 transition-colors duration-300">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: sanitizeInput(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm sm:text-base transition-all duration-300"
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: sanitizeInput(e.target.value) })}
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm sm:text-base transition-all duration-300"
                  placeholder="Cybersecurity Specialist"
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Bio *
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: sanitizeInput(e.target.value) })}
                rows={4}
                className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm sm:text-base transition-all duration-300"
                maxLength={1000}
                required
              />
            </div>

            {/* Skills Section */}
            <div className="mt-4 sm:mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Skills
              </label>
              
              {/* Add new skill */}
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(sanitizeInput(e.target.value))}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add skill..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 text-sm transition-all duration-300"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Existing skills */}
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600/30 rounded-full text-sm text-gray-700 dark:text-gray-300 group transition-colors duration-300"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-gray-500 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 sm:mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Experience
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: sanitizeInput(e.target.value) })}
                rows={3}
                className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm sm:text-base transition-all duration-300"
                maxLength={1000}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value.trim() })}
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm sm:text-base transition-all duration-300"
                  placeholder="https://github.com/username"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value.trim() })}
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm sm:text-base transition-all duration-300"
                  placeholder="https://linkedin.com/in/username"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Twitter URL
                </label>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value.trim() })}
                  className="w-full px-3 py-2 bg-white dark:bg-black/40 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-green-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-green-500 text-sm sm:text-base transition-all duration-300"
                  placeholder="https://twitter.com/username"
                  maxLength={200}
                />
              </div>
            </div>
          </div>

          {/* Certifications Section */}
          <div className="bg-white/95 dark:bg-gray-900/50 border border-gray-200 dark:border-cyan-500/30 rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg dark:shadow-2xl transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <div className="flex items-center">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400 mr-2 sm:mr-3 transition-colors duration-300" />
                <h2 className="text-lg sm:text-xl font-bold text-cyan-600 dark:text-cyan-400 font-mono transition-colors duration-300">
                  Certifications
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCert(!showAddCert)}
                className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm w-fit"
              >
                <Plus className="w-4 h-4" />
                <span>Add Certification</span>
              </button>
            </div>

            {/* Add New Certification Form */}
            {showAddCert && (
              <div className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-cyan-500/30 rounded-lg p-4 sm:p-6 mb-6 transition-colors duration-300">
                <h3 className="text-base sm:text-lg font-bold text-cyan-600 dark:text-cyan-400 mb-4 transition-colors duration-300">
                  Add New Certification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Certification Name *
                    </label>
                    <input
                      type="text"
                      value={newCert.name}
                      onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 text-sm transition-all duration-300"
                      placeholder="e.g., Certified Ethical Hacker (CEH)"
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Issuer *
                    </label>
                    <input
                      type="text"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 text-sm transition-all duration-300"
                      placeholder="e.g., EC-Council"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Validation URL *
                    </label>
                    <input
                      type="url"
                      value={newCert.validation_url}
                      onChange={(e) => setNewCert({ ...newCert, validation_url: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 text-sm transition-all duration-300"
                      placeholder="https://verify.example.com"
                      maxLength={300}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Logo URL *
                    </label>
                    <input
                      type="url"
                      value={newCert.logo_url}
                      onChange={(e) => setNewCert({ ...newCert, logo_url: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 text-sm transition-all duration-300"
                      placeholder="https://example.com/logo.png"
                      maxLength={300}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Issue Date *
                    </label>
                    <input
                      type="date"
                      value={newCert.issue_date}
                      onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 text-sm transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={newCert.expiry_date}
                      onChange={(e) => setNewCert({ ...newCert, expiry_date: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:focus:ring-cyan-500 text-sm transition-all duration-300"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                  <button
                    type="button"
                    onClick={addCertification}
                    className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Certification</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCert(false)}
                    className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Existing Certifications */}
            <div className="space-y-4">
              {formData.certifications.length > 0 ? (
                formData.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-cyan-500/30 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors duration-300"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0">
                        <img
                          src={cert.logo_url}
                          alt={`${cert.name} logo`}
                          className="w-12 h-12 object-contain rounded-lg bg-white/10 p-2"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 transition-colors duration-300">
                          {cert.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 transition-colors duration-300">
                          {cert.issuer}
                        </p>
                        
                        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-500 transition-colors duration-300">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Issued:</span> {formatDate(cert.issue_date)}
                          </div>
                          {cert.expiry_date && (
                            <div>
                              <span className="text-gray-600 dark:text-gray-400">Expires:</span> {formatDate(cert.expiry_date)}
                            </div>
                          )}
                        </div>
                        <a
                          href={cert.validation_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors"
                        >
                          <span>Verify Credential</span>
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert.id)}
                      className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm self-start sm:self-center"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-500 transition-colors duration-300">
                  <Award className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                  <p className="text-sm sm:text-base">No certifications added yet</p>
                  <p className="text-xs sm:text-sm mt-1">Click "Add Certification" to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center space-x-2 bg-blue-600 dark:bg-green-600 hover:bg-blue-500 dark:hover:bg-green-500 disabled:bg-blue-400 dark:disabled:bg-green-800 text-white dark:text-black font-bold py-2 px-4 sm:px-6 rounded-lg transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>

        {/* Mobile Save Button (Sticky) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600/30 z-50">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            <Save className="h-5 w-5" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        {/* Mobile padding to prevent content being hidden behind sticky button */}
        <div className="lg:hidden h-20"></div>
      </div>
    </div>
  );
}