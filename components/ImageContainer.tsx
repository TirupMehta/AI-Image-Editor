import React, { useRef, useEffect } from 'react';

interface ImageContainerProps {
  src: string;
  alt: string;
}

export const ImageContainer: React.FC<ImageContainerProps> = ({ src, alt }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      
      // The multiplier determines the intensity of the parallax effect
      const parallaxX = -x * 10;
      const parallaxY = -y * 10;

      el.style.setProperty('--parallax-x', `${parallaxX}px`);
      el.style.setProperty('--parallax-y', `${parallaxY}px`);
    };

    const handleMouseLeave = () => {
      el.style.setProperty('--parallax-x', `0px`);
      el.style.setProperty('--parallax-y', `0px`);
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="group w-full rounded-lg overflow-hidden transition-transform duration-300 ease-out"
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[400ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] group-hover:scale-[1.03]"
        style={{
          transform: 'scale(1.03) translate(var(--parallax-x, 0px), var(--parallax-y, 0px))',
        }}
      />
    </div>
  );
};