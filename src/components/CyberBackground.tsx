import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      pulseSpeed: number;
      pulsePhase: number;
    }> = [];

    // Create more particles for enhanced effect
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let animationTime = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationTime += 0.016; // ~60fps

      // Dynamic colors based on theme
      const gridColor = isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.06)';
      const particleBaseColor = isDark ? '16, 185, 129' : '59, 130, 246';
      const accentColor = isDark ? '6, 182, 212' : '147, 51, 234';

      // Draw enhanced grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;
      const gridSize = 100;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Update and draw particles with enhanced effects
      particles.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Keep particles in bounds
        particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        particle.y = Math.max(0, Math.min(canvas.height, particle.y));

        // Pulsing effect
        particle.pulsePhase += particle.pulseSpeed;
        const pulseMultiplier = 0.5 + 0.5 * Math.sin(particle.pulsePhase);
        const currentOpacity = particle.opacity * pulseMultiplier;
        const currentSize = particle.size * (0.8 + 0.4 * pulseMultiplier);

        // Use accent color for some particles
        const useAccent = index % 7 === 0;
        const colorRGB = useAccent ? accentColor : particleBaseColor;

        // Draw main particle
        ctx.fillStyle = `rgba(${colorRGB}, ${currentOpacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for larger particles
        if (currentSize > 1.5) {
          ctx.fillStyle = `rgba(${colorRGB}, ${currentOpacity * 0.3})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, currentSize * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Add subtle trail effect for moving particles
        if (Math.abs(particle.vx) > 0.3 || Math.abs(particle.vy) > 0.3) {
          const trailLength = 3;
          for (let t = 1; t <= trailLength; t++) {
            const trailX = particle.x - particle.vx * t * 5;
            const trailY = particle.y - particle.vy * t * 5;
            const trailOpacity = currentOpacity * (1 - t / trailLength) * 0.5;
            const trailSize = currentSize * (1 - t / trailLength * 0.5);

            ctx.fillStyle = `rgba(${colorRGB}, ${trailOpacity})`;
            ctx.beginPath();
            ctx.arc(trailX, trailY, trailSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Add floating orbs that move slowly
      const orbCount = 5;
      for (let i = 0; i < orbCount; i++) {
        const orbX = canvas.width * 0.2 + (canvas.width * 0.6 * (i / orbCount)) + 
                    Math.sin(animationTime * 0.5 + i) * 50;
        const orbY = canvas.height * 0.3 + Math.sin(animationTime * 0.3 + i * 2) * 100;
        const orbSize = 1 + Math.sin(animationTime * 0.8 + i) * 0.5;
        const orbOpacity = 0.1 + Math.sin(animationTime * 0.4 + i) * 0.05;

        const orbColor = i % 2 === 0 ? particleBaseColor : accentColor;
        
        // Outer glow
        ctx.fillStyle = `rgba(${orbColor}, ${orbOpacity * 0.3})`;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbSize * 8, 0, Math.PI * 2);
        ctx.fill();

        // Inner orb
        ctx.fillStyle = `rgba(${orbColor}, ${orbOpacity})`;
        ctx.beginPath();
        ctx.arc(orbX, orbY, orbSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add connection lines between nearby particles
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.15;
            ctx.strokeStyle = `rgba(${particleBaseColor}, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
      style={{ 
        background: isDark 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a1a0a 100%)' 
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)'
      }}
    />
  );
}