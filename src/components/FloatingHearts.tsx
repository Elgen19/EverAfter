"use client";

import React, { useEffect, useRef } from "react";

interface Heart {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  fadeSpeed: number;
  rotation: number;
  rotationSpeed: number;
  scaleSpeed: number;
  color: string;
}

export default function FloatingHearts() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let startTimeoutId: NodeJS.Timeout;
    const hearts: Heart[] = [];

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const colors = [
      "rgba(255, 75, 114, 0.45)",  // Soft Rose
      "rgba(255, 115, 140, 0.4)",  // Pastel Pink
      "rgba(156, 108, 250, 0.35)", // Soft Violet
      "rgba(226, 184, 87, 0.3)",   // Soft Gold
      "rgba(255, 192, 203, 0.4)"   // Baby Pink
    ];

    const createHeart = (x: number, y: number, isClick = false): Heart => {
      const size = Math.random() * 15 + (isClick ? 10 : 8);
      return {
        x,
        y,
        size,
        speedY: -(Math.random() * 1.2 + 0.6 + (isClick ? 0.8 : 0)),
        speedX: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.4 + 0.5,
        fadeSpeed: Math.random() * 0.003 + 0.002,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        scaleSpeed: 0.998,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    // Draw heart path
    const drawHeartShape = (context: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      context.moveTo(x, y + size / 4);
      context.quadraticCurveTo(x, y, x + size / 2, y);
      context.quadraticCurveTo(x + size, y, x + size, y + size / 3);
      context.quadraticCurveTo(x + size, y + (size * 2) / 3, x + size / 2, y + size);
      context.quadraticCurveTo(x, y + (size * 2) / 3, x, y + size / 3);
      context.quadraticCurveTo(x, y, x, y + size / 4);
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create new background hearts occasionally (limit to 25 on mobile to save CPU)
      const maxHearts = window.innerWidth < 768 ? 25 : 80;
      if (Math.random() < 0.03 && hearts.length < maxHearts) {
        hearts.push(createHeart(Math.random() * canvas.width, canvas.height + 20));
      }

      hearts.forEach((heart, index) => {
        heart.y += heart.speedY;
        heart.x += heart.speedX + Math.sin(heart.y / 30) * 0.2; // slight sway
        heart.opacity -= heart.fadeSpeed;
        heart.size *= heart.scaleSpeed;
        heart.rotation += heart.rotationSpeed;

        if (heart.opacity <= 0 || heart.size <= 2 || heart.y < -20) {
          hearts.splice(index, 1);
          return;
        }

        ctx.save();
        ctx.translate(heart.x, heart.y);
        ctx.rotate(heart.rotation);
        ctx.beginPath();
        ctx.fillStyle = heart.color;
        
        if (window.innerWidth >= 768) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = heart.color;
        }
        
        // Center drawing around translated coords
        drawHeartShape(ctx, -heart.size / 2, -heart.size / 2, heart.size);
        
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      startTimeoutId = setTimeout(() => {
        animate();
      }, 1500);
    } else {
      animate();
    }

    // Spawn hearts on click
    const handleClick = (e: MouseEvent) => {
      const count = Math.floor(Math.random() * 5) + 4;
      for (let i = 0; i < count; i++) {
        hearts.push(createHeart(e.clientX, e.clientY, true));
      }
    };
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleClick);
      if (startTimeoutId) clearTimeout(startTimeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}
