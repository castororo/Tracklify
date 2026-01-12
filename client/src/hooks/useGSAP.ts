import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Stagger fade-in animation for multiple elements
export const useStaggerAnimation = <T extends HTMLElement>(
  selector: string,
  options: gsap.TweenVars = {}
) => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements = containerRef.current.querySelectorAll(selector);
    if (elements.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          ...options,
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [selector]);

  return containerRef;
};

// Fade up animation
export const useFadeUp = <T extends HTMLElement>(delay = 0) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, delay, ease: 'power3.out' }
      );
    });

    return () => ctx.revert();
  }, [delay]);

  return elementRef;
};

// Scroll-triggered animation
export const useScrollReveal = <T extends HTMLElement>(options: gsap.TweenVars = {}) => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: elementRef.current,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
          },
          ...options,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return elementRef;
};

// Counter animation for numbers
export const useCountUp = (
  endValue: number,
  duration = 2,
  startOnMount = true
) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!elementRef.current || !startOnMount || hasAnimated.current) return;

    hasAnimated.current = true;
    const element = elementRef.current;
    const obj = { value: 0 };

    gsap.to(obj, {
      value: endValue,
      duration,
      ease: 'power1.out',
      onUpdate: () => {
        element.textContent = Math.round(obj.value).toString();
      },
    });
  }, [endValue, duration, startOnMount]);

  return elementRef;
};

// Text reveal animation
export const useTextReveal = <T extends HTMLElement>() => {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elementRef.current,
        { 
          clipPath: 'inset(0 100% 0 0)',
          opacity: 0,
        },
        { 
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1,
          ease: 'power3.inOut',
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return elementRef;
};

// Hover scale effect (returns handlers)
export const useHoverScale = (scale = 1.05) => {
  return {
    onMouseEnter: (e: React.MouseEvent) => {
      gsap.to(e.currentTarget, { scale, duration: 0.3, ease: 'power2.out' });
    },
    onMouseLeave: (e: React.MouseEvent) => {
      gsap.to(e.currentTarget, { scale: 1, duration: 0.3, ease: 'power2.out' });
    },
  };
};

// Page transition animation
export const animatePageIn = (container: HTMLElement) => {
  gsap.fromTo(
    container,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  );
};

export const animatePageOut = (container: HTMLElement) => {
  return gsap.to(container, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' });
};
