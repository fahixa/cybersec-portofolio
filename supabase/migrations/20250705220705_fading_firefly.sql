/*
  # Update Professional Experience
  
  1. Changes
    - Update experience field with new professional content
    - More concise and professional format
    - Focus on key achievements and roles
*/

UPDATE profiles 
SET experience = 'Security Analyst at PT. Defender Nusa Semesta (Defenxor) - May 2024 to Present
• Monitor 12+ customer security appliances in real-time ensuring continuous threat visibility
• Escalate critical incidents and validate flagged activities through proactive customer communication
• Generate daily reports and monthly threat intelligence summaries with actionable recommendations

Head of Laboratory Assistant at Security Laboratory (SECULAB), Telkom University - Jun 2023 to Jun 2024
• Led laboratory assistants and delivered Computer System Security courses
• Coordinated laboratory operations and supervised practical teaching processes
• Conducted study groups and research discussions on cybersecurity topics

Digital Talent Scholarship - Security Operations Analyst - Feb 2024 to Mar 2024
• Built expertise in Azure Active Directory authentication and identity protection
• Gained hands-on experience with Microsoft Defender solutions and threat detection
• Completed practical labs in security management and compliance workflows

IBM Academy Student for Hybrid Cloud & AI at Infinite Learning Indonesia - Aug 2023 to Dec 2023
• Completed Red Hat Certified System Administrator Bootcamp
• Specialized in IBM Security Verify with Device Flow approach for website login security
• Developed capstone project implementing authentication systems in real-world scenarios

Cloud Computing Learning Path at Bangkit Academy (Google, Tokopedia, Gojek, Traveloka) - Feb 2023 to Jul 2023
• Developed and deployed RestAPI Endpoint integrated with Mobile Development
• Executed deployment through Google Cloud Platform ensuring scalable service
• Completed RelaVerse Capstone Project focused on Sustainable Development Goals

Staff of Supervisory and Evaluation Board at MPM HMTK, Telkom University - May 2022 to Jul 2023
• Supervised execution of work programs and ensured alignment with organizational objectives
• Served as Vice-Chair and Presidium 2 in HMTK Cohort Deliberation
• Oversaw election processes ensuring integrity and smooth operations

Network Security Penetration Testing Student at Cisco Networking Academy - Aug 2021 to Oct 2021
• Completed comprehensive 144-hour curriculum (3 SKS) at Universitas Indonesia
• Focused on vulnerability assessment, penetration testing, and security implementations
• Participated in KMMI program supporting Merdeka Belajar - Kampus Merdeka initiative',
updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'fakhrityhikmawan@gmail.com');