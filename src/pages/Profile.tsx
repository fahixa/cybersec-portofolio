import { useEffect, useState } from 'react';
import { Github, Linkedin, Mail, MapPin, Calendar, Award, ExternalLink } from 'lucide-react';
import GlitchText from '../components/GlitchText';
import AnimatedCard from '../components/AnimatedCard';
import { SupabaseService, type Profile, type Certification } from '../lib/supabase';

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
      
      const connectionOk = await SupabaseService.testConnection();
      if (!connectionOk) {
        console.warn('⚠️ Supabase connection failed');
        setLoading(false);
        return;
      }
      
      const profileData = await SupabaseService.getProfile();
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
                  <span>Active since {profile?.created_at ? new Date(profile.created_at).getFullYear() : '2019'}</span>
                </div>
                <div className="flex items-center justify-center">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  <span>Global</span>
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
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base transition-colors duration-300">{displayProfile.experience}</p>
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
            <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 order-3 lg:order-3">
              <AnimatedCard className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-green-400 font-mono mb-1 transition-colors duration-300">50+</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono transition-colors duration-300">CTF Wins</div>
              </AnimatedCard>
              <AnimatedCard className="text-center" glowColor="cyan">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono mb-1 transition-colors duration-300">25+</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono transition-colors duration-300">Bug Bounties</div>
              </AnimatedCard>
              <AnimatedCard className="text-center" glowColor="purple">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono mb-1 transition-colors duration-300">100+</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-mono transition-colors duration-300">Vulnerabilities</div>
              </AnimatedCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}