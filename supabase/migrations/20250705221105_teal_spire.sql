/*
  # Update Professional Experience
  
  1. Changes
    - Update experience section with professional LinkedIn data
    - Remove verbose descriptions and focus on key achievements
    - Maintain chronological order and professional formatting
*/

UPDATE profiles 
SET experience = 'Security Analyst - Defenxor (PT. Defender Nusa Semesta) - May 2024 to Present
• Monitor 12+ customer security appliances in real-time ensuring continuous threat visibility
• Escalate critical incidents to internal teams and clients for swift resolution
• Generate daily reports and monthly threat intelligence summaries with actionable recommendations

Member - Google Developer Student Clubs Telkom University - Dec 2023 to Oct 2024
• Engaged in collaborative learning across product management, UI/UX design, machine learning, cloud computing, and web development
• Participated in hands-on workshops including Git 101 and website development bootcamps with GCP deployment
• Enhanced professional skills through CV optimization, LinkedIn profile building, and GitHub portfolio development

Head of Laboratory Assistant - Security Laboratory (SECULAB), Telkom University - Jun 2023 to Jun 2024
• Coordinated laboratory assistants ensuring efficient task management and smooth operations
• Supervised practical teaching processes and facilitated Computer System Security courses
• Conducted study groups and research discussions fostering collaborative learning environment

Study Group Speaker - Security Laboratory (SECULAB) - Nov 2023
• Delivered presentation on Social Engineering to 85 participants from 2020-2023 batches
• Demonstrated practical tools used in social engineering attacks
• Enhanced awareness of security measures essential in safeguarding information systems

Security Operations Analyst - Digital Talent Scholarship - Feb 2024 to Mar 2024
• Built strong foundation in Identity Management with Azure Active Directory authentication
• Gained hands-on experience with Microsoft Defender solutions and threat detection
• Completed practical labs in security management and compliance workflows

Guest Speaker - Bangkit Academy led by Google, Tokopedia, Gojek & Traveloka - Dec 2023
• Delivered impactful insights to 114 Computer Engineering students at Telkom University
• Engaged audience with interactive communication fostering enthusiastic participation
• Contributed to professional growth of emerging technologists in tech community

IBM Academy Student for Hybrid Cloud & AI - Infinite Learning Indonesia - Aug 2023 to Dec 2023
• Completed intensive Red Hat Certified System Administrator Bootcamp
• Specialized in IBM Security Verify with Device Flow approach for website login security
• Developed capstone project implementing authentication systems in real-world scenarios

Student of Cloud Computing Learning Path - Bangkit Academy - Feb 2023 to Jul 2023
• Developed and deployed RestAPI Endpoint integrated with Mobile Development
• Executed deployment through Google Cloud Platform ensuring scalable and robust service
• Completed RelaVerse Capstone Project focused on Sustainable Development Goals

Staff of Supervisory and Evaluation Board - MPM HMTK, Telkom University - May 2022 to Jul 2023
• Supervised execution of work programs as member of Student Representative Council
• Served as Vice-Chair and Presidium 2 in HMTK Cohort Deliberation
• Oversaw election processes ensuring integrity and smooth operations

Network Security Penetration Testing Student - Cisco Networking Academy - Aug 2021 to Oct 2021
• Completed comprehensive 144-hour curriculum (3 SKS) at Universitas Indonesia
• Focused on vulnerability assessment, penetration testing, and security implementations
• Participated in KMMI program supporting Merdeka Belajar - Kampus Merdeka initiative',
updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fakhrityhikmawan@gmail.com');

-- Verify the update
SELECT name, experience FROM profiles WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fakhrityhikmawan@gmail.com');