import { supabase, SupabaseService } from './supabase';
import type { ProfileInsert } from './supabase';

export class ProfileSetup {
  // Create user account and profile
  static async createUserWithProfile(email: string, password: string) {
    try {
      console.log('Creating user account...');
      
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed');
      }

      console.log('User created successfully:', authData.user.email);

      // 2. If user is immediately confirmed (in development), create profile
      if (authData.session) {
        await this.createDefaultProfile(authData.user.id);
      }

      return {
        user: authData.user,
        session: authData.session,
        needsEmailConfirmation: !authData.session
      };
    } catch (error) {
      console.error('Error creating user with profile:', error);
      throw error;
    }
  }

  // Create default profile for user
  static async createDefaultProfile(userId: string) {
    try {
      console.log('Creating default profile for user:', userId);

      const defaultProfile: ProfileInsert = {
        user_id: userId,
        name: 'Fakhri Tyhikmawan',
        title: 'Cybersecurity Specialist & Penetration Tester',
        bio: 'Passionate cybersecurity professional with expertise in penetration testing, vulnerability research, and bug bounty hunting. Specialized in web application security, network security, and reverse engineering.',
        experience: '5+ years in cybersecurity with focus on web application testing and vulnerability research. Discovered 50+ critical vulnerabilities across various platforms.',
        skills: [
          'Web Application Security',
          'Network Penetration Testing', 
          'Reverse Engineering',
          'Cryptography',
          'Social Engineering',
          'Bug Bounty Hunting',
          'Malware Analysis',
          'Digital Forensics',
          'OWASP Top 10',
          'Burp Suite',
          'Metasploit',
          'Nmap'
        ],
        github_url: 'https://github.com/fakhrityhikmawan',
        linkedin_url: 'https://linkedin.com/in/fakhrityhikmawan',
        twitter_url: 'https://twitter.com/fakhrityhikmawan'
      };

      const profile = await SupabaseService.upsertProfile(defaultProfile);
      
      if (profile) {
        console.log('Default profile created successfully');
        
        // Add sample certifications
        await this.createSampleCertifications(profile.id);
        
        // Add sample writeups
        await this.createSampleWriteups(userId);
        
        // Add sample articles
        await this.createSampleArticles(userId);
      }

      return profile;
    } catch (error) {
      console.error('Error creating default profile:', error);
      throw error;
    }
  }

  // Create sample certifications
  static async createSampleCertifications(profileId: string) {
    try {
      const certifications = [
        {
          profile_id: profileId,
          name: 'Certified Ethical Hacker (CEH)',
          issuer: 'EC-Council',
          validation_url: 'https://aspen.eccouncil.org/VerifyCredential',
          issue_date: '2023-06-15',
          expiry_date: '2026-06-15',
          logo_url: 'https://images.credly.com/size/340x340/images/c2ddc533-ba6c-464d-ac59-b0c44d3d8b16/image.png'
        },
        {
          profile_id: profileId,
          name: 'OSCP - Offensive Security Certified Professional',
          issuer: 'Offensive Security',
          validation_url: 'https://www.offensive-security.com/offsec/oscp/',
          issue_date: '2023-03-20',
          logo_url: 'https://images.credly.com/size/340x340/images/ec81134d-e80b-4eb5-ae07-0eb8e1a60fcd/image.png'
        }
      ];

      for (const cert of certifications) {
        await SupabaseService.upsertCertification(cert);
      }

      console.log('Sample certifications created');
    } catch (error) {
      console.error('Error creating sample certifications:', error);
    }
  }

  // Create sample writeups
  static async createSampleWriteups(userId: string) {
    try {
      const writeups = [
        {
          user_id: userId,
          title: 'SQL Injection in E-commerce Platform',
          slug: 'sql-injection-ecommerce-platform',
          excerpt: 'Critical SQL injection vulnerability discovered in e-commerce platform leading to complete database compromise.',
          content: `# SQL Injection in E-commerce Platform

## Overview
During a bug bounty program, I discovered a critical SQL injection vulnerability in a major e-commerce platform that could lead to complete database compromise.

## Discovery
The vulnerability was found in the product search functionality where user input was not properly sanitized.

## Exploitation
\`\`\`sql
' UNION SELECT 1,2,3,database(),5,6,7,8 --
\`\`\`

This payload revealed the database name and structure, allowing for further exploitation.

## Impact
- Complete database access
- Customer data exposure
- Administrative privilege escalation
- Potential for data manipulation

## Remediation
1. Implement parameterized queries
2. Input validation and sanitization
3. Principle of least privilege for database connections
4. Regular security audits

## Timeline
- **Discovery**: January 15, 2024
- **Reported**: January 15, 2024
- **Acknowledged**: January 16, 2024
- **Fixed**: January 20, 2024
- **Bounty**: $5,000

## Lessons Learned
Always test input fields with various SQL injection payloads, even in seemingly secure applications.`,
          category: 'bug-bounty' as const,
          difficulty: 'hard' as const,
          tags: ['sql-injection', 'web-security', 'database', 'bug-bounty'],
          published: true
        },
        {
          user_id: userId,
          title: 'HackTheBox - Lame Machine Walkthrough',
          slug: 'hackthebox-lame-machine-walkthrough',
          excerpt: 'Complete walkthrough of the Lame machine from HackTheBox, demonstrating SMB exploitation techniques.',
          content: `# HackTheBox - Lame Machine Walkthrough

## Machine Info
- **Name**: Lame
- **OS**: Linux
- **Difficulty**: Easy
- **Points**: 20

## Reconnaissance

### Nmap Scan
\`\`\`bash
nmap -sC -sV -oA lame 10.10.10.3
\`\`\`

Results showed several open ports including SMB on port 445.

## Exploitation

### SMB Vulnerability
The machine was running Samba 3.0.20 which is vulnerable to CVE-2007-2447.

\`\`\`bash
searchsploit samba 3.0.20
\`\`\`

### Metasploit Exploitation
\`\`\`bash
use exploit/multi/samba/usermap_script
set RHOSTS 10.10.10.3
exploit
\`\`\`

## Post-Exploitation
- Gained root access immediately
- Retrieved user and root flags
- No privilege escalation needed

## Key Takeaways
- Always check for known vulnerabilities in identified services
- SMB services often have critical vulnerabilities
- Keep systems updated to prevent exploitation`,
          category: 'ctf' as const,
          difficulty: 'easy' as const,
          tags: ['hackthebox', 'smb', 'metasploit', 'linux'],
          published: true
        }
      ];

      for (const writeup of writeups) {
        await SupabaseService.upsertWriteup(writeup);
      }

      console.log('Sample writeups created');
    } catch (error) {
      console.error('Error creating sample writeups:', error);
    }
  }

  // Create sample articles
  static async createSampleArticles(userId: string) {
    try {
      const articles = [
        {
          user_id: userId,
          title: 'Complete Guide to Web Application Security Testing',
          slug: 'complete-guide-web-application-security-testing',
          excerpt: 'A comprehensive guide covering methodologies, tools, and best practices for web application security testing.',
          content: `# Complete Guide to Web Application Security Testing

## Introduction
Web application security testing is a critical component of any comprehensive security program. This guide covers the essential methodologies, tools, and techniques used by security professionals.

## Testing Methodology

### 1. Information Gathering
- **Passive Reconnaissance**: Gather information without directly interacting with the target
- **Active Reconnaissance**: Direct interaction to enumerate services and technologies
- **Technology Stack Identification**: Determine frameworks, databases, and server technologies

### 2. Authentication Testing
- **Brute Force Attacks**: Test for weak passwords and account lockout mechanisms
- **Session Management**: Analyze session tokens and cookie security
- **Multi-Factor Authentication**: Test MFA implementation and bypass techniques

## Essential Tools

### Automated Scanners
- **Burp Suite Professional**: Industry-standard web application security testing platform
- **OWASP ZAP**: Free and open-source security testing proxy
- **Nessus**: Comprehensive vulnerability scanner

### Manual Testing Tools
- **Burp Suite**: Web application security testing platform
- **SQLMap**: Automated SQL injection testing tool
- **Nikto**: Web server scanner

## OWASP Top 10 Testing

### A01: Broken Access Control
- Test for horizontal and vertical privilege escalation
- Check for insecure direct object references
- Verify proper authorization controls

### A02: Cryptographic Failures
- Test for weak encryption algorithms
- Check for hardcoded secrets
- Verify proper key management

### A03: Injection
- SQL injection testing
- NoSQL injection
- Command injection
- LDAP injection

## Best Practices
- Always obtain proper authorization before testing
- Use a systematic approach
- Document everything
- Verify findings before reporting
- Provide clear remediation guidance

## Conclusion
Web application security testing requires a combination of automated tools and manual techniques. Regular testing helps organizations identify and remediate vulnerabilities before they can be exploited by attackers.`,
          category: 'tutorial' as const,
          tags: ['web-security', 'penetration-testing', 'owasp', 'security-testing'],
          published: true,
          featured: true
        },
        {
          user_id: userId,
          title: 'Top 10 Cybersecurity Tools Every Pentester Should Know',
          slug: 'top-10-cybersecurity-tools-pentester',
          excerpt: 'Essential cybersecurity tools that every penetration tester should have in their arsenal.',
          content: `# Top 10 Cybersecurity Tools Every Pentester Should Know

## Introduction
As a penetration tester, having the right tools can make the difference between a successful assessment and missing critical vulnerabilities. Here are the top 10 tools every pentester should master.

## 1. Nmap
The network discovery and security auditing tool.

\`\`\`bash
# Basic scan
nmap -sC -sV target.com

# Aggressive scan
nmap -A target.com

# Stealth scan
nmap -sS target.com
\`\`\`

## 2. Burp Suite
The web application security testing platform.

### Key Features:
- Proxy for intercepting requests
- Scanner for automated vulnerability detection
- Intruder for brute force attacks
- Repeater for manual testing

## 3. Metasploit
The penetration testing framework.

\`\`\`bash
# Start Metasploit
msfconsole

# Search for exploits
search type:exploit platform:windows

# Use an exploit
use exploit/windows/smb/ms17_010_eternalblue
\`\`\`

## 4. Wireshark
Network protocol analyzer for traffic analysis.

## 5. John the Ripper
Password cracking tool.

\`\`\`bash
# Crack passwords
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt
\`\`\`

## 6. Hashcat
Advanced password recovery tool.

## 7. SQLMap
Automated SQL injection testing tool.

\`\`\`bash
# Basic SQL injection test
sqlmap -u "http://target.com/page.php?id=1" --dbs
\`\`\`

## 8. Gobuster
Directory and file brute-forcer.

\`\`\`bash
# Directory enumeration
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt
\`\`\`

## 9. Nikto
Web server scanner.

\`\`\`bash
# Scan web server
nikto -h http://target.com
\`\`\`

## 10. Aircrack-ng
Wireless network security assessment tool.

## Conclusion
These tools form the foundation of any penetration tester's toolkit. Master these tools and you'll be well-equipped to conduct thorough security assessments.`,
          category: 'tools' as const,
          tags: ['tools', 'penetration-testing', 'nmap', 'burp-suite', 'metasploit'],
          published: true,
          featured: false
        }
      ];

      for (const article of articles) {
        await SupabaseService.upsertArticle(article);
      }

      console.log('Sample articles created');
    } catch (error) {
      console.error('Error creating sample articles:', error);
    }
  }
}