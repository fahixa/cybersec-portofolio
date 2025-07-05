// Local Storage Database Implementation
export interface DatabaseTable {
  profiles: Profile[];
  writeups: Writeup[];
  articles: Article[];
}

export type Profile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  skills: string[];
  experience: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  certifications?: Certification[];
  created_at: string;
  updated_at: string;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  validation_url: string;
  issue_date: string;
  expiry_date?: string;
  logo_url: string;
};

export type Writeup = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'ctf' | 'bug-bounty';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: 'tutorial' | 'news' | 'opinion' | 'tools' | 'career';
  tags: string[];
  published: boolean;
  featured: boolean;
  read_time: number;
  created_at: string;
  updated_at: string;
};

class LocalDatabase {
  private dbKey = 'cybersec-portfolio-db';
  private db: DatabaseTable;

  constructor() {
    this.db = this.loadDatabase();
  }

  private loadDatabase(): DatabaseTable {
    try {
      const stored = localStorage.getItem(this.dbKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading database:', error);
    }
    
    // Return default data if no stored data
    return this.getDefaultData();
  }

  private saveDatabase(): void {
    try {
      localStorage.setItem(this.dbKey, JSON.stringify(this.db));
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  private getDefaultData(): DatabaseTable {
    return {
      profiles: [{
        id: '1',
        name: 'Alex CyberSec',
        title: 'Senior Penetration Tester & Bug Bounty Hunter',
        bio: 'Passionate cybersecurity professional with 5+ years of experience in penetration testing, vulnerability research, and bug bounty hunting. Specialized in web application security, network security, and reverse engineering.',
        skills: [
          'Web Application Security',
          'Network Penetration Testing', 
          'Reverse Engineering',
          'Cryptography',
          'Social Engineering',
          'Bug Bounty Hunting',
          'Malware Analysis',
          'Digital Forensics'
        ],
        experience: '5+ years in cybersecurity with focus on web application testing and vulnerability research. Discovered 50+ critical vulnerabilities across various platforms.',
        github_url: 'https://github.com/alexcybersec',
        linkedin_url: 'https://linkedin.com/in/alexcybersec',
        twitter_url: 'https://twitter.com/alexcybersec',
        certifications: [
          {
            id: '1',
            name: 'Certified Ethical Hacker (CEH)',
            issuer: 'EC-Council',
            validation_url: 'https://aspen.eccouncil.org/VerifyCredential',
            issue_date: '2023-06-15',
            expiry_date: '2026-06-15',
            logo_url: 'https://images.credly.com/size/340x340/images/c2ddc533-ba6c-464d-ac59-b0c44d3d8b16/image.png'
          }
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }],
      writeups: [
        {
          id: '1',
          title: 'SQL Injection in E-commerce Platform',
          slug: 'sql-injection-ecommerce-platform',
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
          excerpt: 'Critical SQL injection vulnerability discovered in e-commerce platform leading to complete database compromise.',
          category: 'bug-bounty',
          difficulty: 'hard',
          tags: ['sql-injection', 'web-security', 'database', 'bug-bounty'],
          published: true,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z'
        }
      ],
      articles: [
        {
          id: '1',
          title: 'Complete Guide to Web Application Security Testing',
          slug: 'complete-guide-web-application-security-testing',
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

## Best Practices
- Always obtain proper authorization before testing
- Use a systematic approach
- Document everything
- Verify findings before reporting
- Provide clear remediation guidance

## Conclusion
Web application security testing requires a combination of automated tools and manual techniques. Regular testing helps organizations identify and remediate vulnerabilities before they can be exploited by attackers.`,
          excerpt: 'A comprehensive guide covering methodologies, tools, and best practices for web application security testing.',
          category: 'tutorial',
          tags: ['web-security', 'penetration-testing', 'owasp', 'security-testing'],
          published: true,
          featured: true,
          read_time: 12,
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z'
        }
      ]
    };
  }

  // Generic query methods
  select(table: keyof DatabaseTable, filters?: any): any[] {
    let data = [...this.db[table]];
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        data = data.filter(item => (item as any)[key] === filters[key]);
      });
    }
    
    return data;
  }

  insert(table: keyof DatabaseTable, data: any): boolean {
    try {
      const newItem = {
        ...data,
        id: data.id || Date.now().toString(),
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      (this.db[table] as any[]).push(newItem);
      this.saveDatabase();
      return true;
    } catch (error) {
      console.error('Error inserting data:', error);
      return false;
    }
  }

  update(table: keyof DatabaseTable, id: string, data: any): boolean {
    try {
      const items = this.db[table] as any[];
      const index = items.findIndex(item => item.id === id);
      
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        this.saveDatabase();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating data:', error);
      return false;
    }
  }

  upsert(table: keyof DatabaseTable, data: any): boolean {
    try {
      const items = this.db[table] as any[];
      const existingIndex = items.findIndex(item => item.id === data.id);
      
      if (existingIndex !== -1) {
        // Update existing
        items[existingIndex] = {
          ...items[existingIndex],
          ...data,
          updated_at: new Date().toISOString()
        };
      } else {
        // Insert new
        const newItem = {
          ...data,
          id: data.id || Date.now().toString(),
          created_at: data.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        items.push(newItem);
      }
      
      this.saveDatabase();
      return true;
    } catch (error) {
      console.error('Error upserting data:', error);
      return false;
    }
  }

  delete(table: keyof DatabaseTable, id: string): boolean {
    try {
      const items = this.db[table] as any[];
      const index = items.findIndex(item => item.id === id);
      
      if (index !== -1) {
        items.splice(index, 1);
        this.saveDatabase();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }

  // Export/Import functionality
  exportData(): string {
    return JSON.stringify(this.db, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData);
      this.db = importedData;
      this.saveDatabase();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data
  clearDatabase(): void {
    this.db = this.getDefaultData();
    this.saveDatabase();
  }
}

export const localDB = new LocalDatabase();