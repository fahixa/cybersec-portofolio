import { useEffect, useState } from 'react';
import { Github, Linkedin, Mail, MapPin, Calendar, Award, ExternalLink } from 'lucide-react';
import GlitchText from '../components/GlitchText';
import AnimatedCard from '../components/AnimatedCard';
import { DatabaseService, type Profile, type Certification } from '../lib/supabase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('🔄 Loading profile...');
      
      const connectionOk = await DatabaseService.testConnection();
      if (!connectionOk) {
        console.warn('⚠️ Database connection failed');
        setLoading(false);
        return;
      }
      
      const profileData = await DatabaseService.getProfile();
      console.log('📊 Profile loaded:', profileData?.name || 'No profile');
      setProfile(profileData);
      
      if (profileData) {
        console.log('📜 Setting certifications:', profileData.certifications?.length || 0);
        setCertifications(profileData.certifications || []);
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
    } finally {
      setLoading(false);
    }
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

  // Secure certification URL validation
  const isValidCertificationUrl = (cert: Certification): boolean => {
    return isValidUrl(cert.validation_url) && isValidUrl(cert.logo_url);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Check if certification is expired
  const isCertificationExpired = (cert: Certification): boolean => {
    if (!cert.expiry_date) return false;
    return new Date(cert.expiry_date) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center px-4 bg-gray-50 dark:bg-black transition-colors duration-300">
        <div className="text-blue-600 dark:text-green-400 font-mono text-sm sm:text-base transition-colors duration-300">Loading profile...</div>
      </div>
    );
  }

  const defaultProfile = {
    name: "Anonymous Hacker",
    title: "Cybersecurity Specialist",
    bio: "Passionate about finding vulnerabilities and securing digital infrastructure. Experienced in penetration testing, bug bounty hunting, and competitive hacking.",
    skills: ["Web Application Security", "Network Penetration Testing", "Reverse Engineering", "Cryptography", "Social Engineering", "Bug Bounty Hunting"],
    experience: "5+ years in cybersecurity with focus on web application testing and vulnerability research.",
    avatar_url: null,
  };

  const displayProfile = profile || defaultProfile;

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-gray-50 dark:bg-black transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 transition-colors duration-300">
            <GlitchText text="PROFILE" />
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg transition-colors duration-300">Know your adversary</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Avatar and Basic Info */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <AnimatedCard className="text-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-green-400 dark:to-cyan-400 rounded-full flex items-center justify-center transition-colors duration-300">
                {displayProfile.avatar_url && isValidUrl(displayProfile.avatar_url) ? (
                  <img
                    src={displayProfile.avatar_url}
                    alt={displayProfile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-white dark:text-black font-mono">
                    {displayProfile.name.charAt(0)}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white font-mono mb-2 leading-tight transition-colors duration-300">
                {displayProfile.name}
              </h2>
              <p className="text-blue-600 dark:text-green-400 font-mono mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed transition-colors duration-300">
                {displayProfile.title}
              </p>
              
              <div className="flex justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
                {profile?.github_url && isValidUrl(profile.github_url) && (
                  <a 
                    href={profile.github_url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors"
                    aria-label="GitHub Profile"
                  >
                    <Github className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                <a 
                  href="mailto:fakhrityhikmawan@gmail.com"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-green-400 transition-colors"
                  aria-label="Send Email"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>

              <div className="space-y-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                <div className="flex items-center justify-center">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span>Active since 2017</span>
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span>Indonesia</span>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Bio and Experience */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-2 lg:order-2">
            <AnimatedCard glowColor="cyan">
              <h3 className="text-lg sm:text-xl font-bold text-cyan-600 dark:text-cyan-400 font-mono mb-4 transition-colors duration-300">Bio</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base transition-colors duration-300">{displayProfile.bio}</p>
            </AnimatedCard>

            <AnimatedCard glowColor="purple">
              <h3 className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 font-mono mb-4 transition-colors duration-300">Experience</h3>
              <div className="space-y-6">
                {displayProfile.experience.split('\n\n').map((section, index) => {
                  const lines = section.split('\n');
                  const titleLine = lines[0];
                  const details = lines.slice(1);
                  
                  // Enhanced parsing for better format handling
                  const dashIndices = [];
                  let searchIndex = 0;
                  while ((searchIndex = titleLine.indexOf(' - ', searchIndex)) !== -1) {
                    dashIndices.push(searchIndex);
                    searchIndex += 3;
                  }
                  
                  let position = '';
                  let company = '';
                  let dates = '';
                  
                  if (dashIndices.length >= 2) {
                    position = titleLine.substring(0, dashIndices[0]);
                    company = titleLine.substring(dashIndices[0] + 3, dashIndices[dashIndices.length - 1]);
                    dates = titleLine.substring(dashIndices[dashIndices.length - 1] + 3);
                  } else if (dashIndices.length === 1) {
                    position = titleLine.substring(0, dashIndices[0]);
                    const remainder = titleLine.substring(dashIndices[0] + 3);
                    // Try to detect if remainder contains dates
                    if (remainder.match(/\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)) {
                      dates = remainder;
                    } else {
                      company = remainder;
                    }
                  } else {
                    position = titleLine;
                  }
                  
                  return (
                    <div key={index} className="relative pl-6 pb-6 last:pb-0">
                      {/* Timeline line */}
                      {index < displayProfile.experience.split('\n\n').length - 1 && (
                        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-purple-300 to-purple-200 dark:from-purple-500 dark:via-purple-600 dark:to-purple-700 opacity-60"></div>
                      )}
                      
                      {/* Timeline dot */}
                      <div className="absolute left-0 top-2 w-4 h-4 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full border-2 border-white dark:border-gray-900 shadow-lg ring-2 ring-purple-200 dark:ring-purple-800"></div>
                      
                      {/* Content */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/30 dark:to-gray-900/20 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-gray-700/30 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-100 dark:hover:shadow-purple-900/20 group">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base leading-tight group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                              {position}
                            </h4>
                            {company && (
                              <p className="text-purple-600 dark:text-purple-400 font-medium text-xs sm:text-sm mt-1 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                {company}
                              </p>
                            )}
                          </div>
                          {dates && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 shadow-sm">
                                {dates}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <ul className="space-y-2">
                          {details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                              <div className="w-1.5 h-1.5 bg-gradient-to-br from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-600 rounded-full mt-2 mr-3 flex-shrink-0 shadow-sm"></div>
                              <span>{detail.replace('• ', '')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>

            <AnimatedCard>
              <h3 className="text-lg sm:text-xl font-bold text-blue-600 dark:text-green-400 font-mono mb-4 transition-colors duration-300">Skills & Expertise</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-3">
                {displayProfile.skills.map((skill, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 dark:bg-black/40 border border-blue-200 dark:border-green-500/30 rounded-lg p-2 sm:p-3 text-center transition-colors duration-300"
                  >
                    <span className="text-blue-700 dark:text-green-400 font-mono text-xs sm:text-sm transition-colors duration-300 break-words">{skill}</span>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Certifications Section */}
            {certifications && certifications.length > 0 && (
              <AnimatedCard glowColor="cyan">
                <div className="flex items-center mb-4 sm:mb-6">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 dark:text-cyan-400 mr-2 sm:mr-3 transition-colors duration-300" />
                  <h3 className="text-lg sm:text-xl font-bold text-cyan-600 dark:text-cyan-400 font-mono transition-colors duration-300">Certifications</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className={`bg-gray-50 dark:bg-black/40 border rounded-lg p-3 sm:p-4 transition-all duration-300 hover:scale-105 ${
                        isCertificationExpired(cert)
                          ? 'border-red-300 dark:border-red-500/30 hover:border-red-400 dark:hover:border-red-400/50'
                          : 'border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-300 dark:hover:border-cyan-400/50'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3">
                        {/* Certification Logo */}
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                          {isValidCertificationUrl(cert) ? (
                            <img
                              src={cert.logo_url}
                              alt={`${cert.name} logo`}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg bg-white/10 p-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-cyan-100 dark:bg-cyan-500/20 rounded-lg flex items-center justify-center">
                              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 dark:text-cyan-400" />
                            </div>
                          )}
                        </div>

                        {/* Certification Details */}
                        <div className="flex-1 min-w-0 text-center sm:text-left">
                          <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-1 leading-tight transition-colors duration-300">
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
                              <div className={isCertificationExpired(cert) ? 'text-red-600 dark:text-red-400' : ''}>
                                <span className="text-gray-600 dark:text-gray-400">Expires:</span> {formatDate(cert.expiry_date)}
                                {isCertificationExpired(cert) && (
                                  <span className="ml-2 text-red-600 dark:text-red-400 font-semibold">(Expired)</span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Validation Link */}
                          {isValidCertificationUrl(cert) && (
                            <a
                              href={cert.validation_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center sm:justify-start mt-3 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 transition-colors group"
                            >
                              <span>Verify Credential</span>
                              <ExternalLink className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedCard>
            )}

            {/* Stats */}
          </div>
        </div>
      </div>
    </div>
  );
}