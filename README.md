# 🛡️ CyberSec Portfolio

A modern, responsive cybersecurity portfolio website built with React, TypeScript, and Tailwind CSS. Features a dark/light theme toggle, animated components, and a professional design perfect for cybersecurity professionals.

## ✨ Features

- **🎨 Modern Design**: Clean, professional interface with cybersecurity-themed aesthetics
- **🌓 Dark/Light Mode**: Smooth theme switching with persistent preferences
- **📱 Responsive**: Fully responsive design that works on all devices
- **⚡ Fast**: Built with Vite for optimal performance
- **🔒 Secure**: Input sanitization and security best practices
- **📝 Content Management**: Admin panel for managing writeups and articles
- **🎯 SEO Optimized**: Proper meta tags and semantic HTML

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript  
- **Database**: PostgreSQL with real-time features
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Markdown**: React Markdown with syntax highlighting
- **Authentication**: Secure JWT-based authentication
- **Deployment**: Docker + Nginx

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cybersec-portfolio.git
   cd cybersec-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_database_url
VITE_SUPABASE_ANON_KEY=your_database_key
```

### Admin Access

Default admin credentials for demo:
- **Email**: `admin@cybersec.local`
- **Password**: `CyberSec2024!`

> ⚠️ **Security Note**: Change these credentials in production!

## 🐳 Docker Deployment

### Quick Start
```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Manual Docker Build
```bash
# Build image
docker build -t cybersec-portfolio .

# Run container
docker run -d -p 3000:80 --name cybersec-portfolio cybersec-portfolio
```

## 🌐 Production Deployment

### Option 1: Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push

### Option 2: Self-hosted with Docker
See [README-DEPLOYMENT.md](./README-DEPLOYMENT.md) for detailed deployment instructions including:
- Radxa deployment
- Cloudflare Tunnel setup
- Zero Trust configuration

## 📁 Project Structure

```
cybersec-portfolio/
├── src/
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth, Theme)
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin panel pages
│   │   └── ...             # Public pages
│   ├── lib/                # Utilities and configurations
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Docker build instructions
├── nginx.conf             # Nginx configuration
└── README.md              # This file
```

## 🎨 Customization

### Theme Colors
Edit `tailwind.config.js` to customize colors:

```javascript
theme: {
  extend: {
    colors: {
      // Add your custom colors here
    }
  }
}
```

### Content Management
1. Access admin panel at `/authorize`
2. Use default credentials or set up your own
3. Manage writeups, articles, and profile information

## 🔒 Security Features

- **Input Sanitization**: All user inputs are sanitized
- **Session Management**: Secure session handling with expiration
- **Rate Limiting**: Protection against brute force attacks
- **HTTPS Ready**: SSL/TLS configuration included
- **Security Headers**: Comprehensive security headers in Nginx

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Modern cybersecurity aesthetics
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: PostgreSQL with real-time capabilities
- **Build Tool**: [Vite](https://vitejs.dev/)

## 📞 Support

If you have any questions or need help with deployment, please:

1. Check the [deployment guide](./README-DEPLOYMENT.md)
2. Open an issue on GitHub
3. Contact the maintainer

---

**Made with ❤️ for the cybersecurity community**