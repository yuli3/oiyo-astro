import {
  animate,
  type AnimationPlaybackControls,
  cubicBezier,
  stagger,
} from "framer-motion";

type AnimatableTarget = Element | Element[] | NodeListOf<Element>;

type Keyframes = Record<string, KeyframeValue | KeyframeValue[]>;

type KeyframeValue = number | string;

const easeSmooth = cubicBezier(0.25, 0.1, 0.25, 1);
const easeExpo = cubicBezier(0.19, 1, 0.22, 1);

export const ANIMATION_CONFIG = {
  duration: {
    fast: 0.3,
    hero: 2.0,
    normal: 0.6,
    slow: 1.2,
  },
  easing: {
    expo: easeExpo,
    smooth: easeSmooth,
  },
  stagger: {
    fast: 0.1,
    normal: 0.15,
    slow: 0.3,
  },
};

const toArray = (target: AnimatableTarget): Element[] => {
  if (Array.isArray(target)) return target;
  if (target instanceof Element) return [target];
  return Array.from(target);
};

const animateElements = (
  target: AnimatableTarget,
  keyframes: Keyframes,
  options: Parameters<typeof animate>[2] = {},
): AnimationPlaybackControls[] => {
  const elements = toArray(target);
  return elements.map((element) => animate(element, keyframes, options));
};

// Basic animation presets
export const fadeInUp = (target: AnimatableTarget, delay = 0) =>
  animateElements(
    target,
    {
      filter: ["blur(10px)", "blur(0px)"],
      opacity: [0, 1],
      y: [30, 0],
    },
    {
      delay,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.smooth,
    },
  );

export const fadeInDown = (target: AnimatableTarget, delay = 0) =>
  animateElements(
    target,
    {
      filter: ["blur(10px)", "blur(0px)"],
      opacity: [0, 1],
      y: [-30, 0],
    },
    {
      delay,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.smooth,
    },
  );

export const fadeInLeft = (target: AnimatableTarget, delay = 0) =>
  animateElements(
    target,
    {
      filter: ["blur(10px)", "blur(0px)"],
      opacity: [0, 1],
      x: [-50, 0],
    },
    {
      delay,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.smooth,
    },
  );

export const fadeInRight = (target: AnimatableTarget, delay = 0) =>
  animateElements(
    target,
    {
      filter: ["blur(10px)", "blur(0px)"],
      opacity: [0, 1],
      x: [50, 0],
    },
    {
      delay,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.smooth,
    },
  );

export const scaleIn = (target: AnimatableTarget, delay = 0) =>
  animateElements(
    target,
    {
      filter: ["blur(5px)", "blur(0px)"],
      opacity: [0, 1],
      scale: [0.5, 1],
    },
    {
      delay,
      duration: ANIMATION_CONFIG.duration.normal,
      ease: ANIMATION_CONFIG.easing.smooth,
    },
  );

export const slideInFromBottom = (target: AnimatableTarget, delay = 0) =>
  animateElements(
    target,
    {
      opacity: [0, 1],
      scale: [0.9, 1],
      y: [100, 0],
    },
    {
      delay,
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.easing.expo,
    },
  );

// Text animation utilities
export const typewriterEffect = (
  element: HTMLElement,
  delay = 0,
  speed = 0.05,
) => {
  const originalText = element.textContent ?? "";
  element.textContent = "";
  element.style.opacity = "1";

  let frameId: null | number = null;
  let startTime: null | number = null;

  const totalDuration = originalText.length * speed * 1000;

  const step = (timestamp: number) => {
    if (startTime === null) {
      startTime = timestamp;
    }
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / totalDuration, 1);
    const currentLength = Math.round(progress * originalText.length);
    element.textContent = originalText.slice(0, currentLength);

    if (progress < 1) {
      frameId = requestAnimationFrame(step);
    }
  };

  const timeoutId = window.setTimeout(() => {
    frameId = requestAnimationFrame(step);
  }, delay * 1000);

  return () => {
    if (frameId !== null) {
      cancelAnimationFrame(frameId);
    }
    clearTimeout(timeoutId);
    element.textContent = originalText;
  };
};

export const staggerText = (elements: Element[], delay = 0) =>
  elements.map((element, index) =>
    animate(
      element,
      {
        opacity: [0, 1],
        rotateX: [-90, 0],
        y: [20, 0],
      },
      {
        delay: delay + index * ANIMATION_CONFIG.stagger.normal,
        duration: ANIMATION_CONFIG.duration.normal,
        ease: ANIMATION_CONFIG.easing.smooth,
      },
    ),
  );

// Hover animation utilities
export const pulseEffect = (target: AnimatableTarget, scale = 1.05) =>
  animateElements(
    target,
    { scale: [1, scale] },
    {
      duration: ANIMATION_CONFIG.duration.slow,
      ease: ANIMATION_CONFIG.easing.smooth,
      repeat: Infinity,
      repeatType: "reverse",
    },
  );

// Particle animation utilities
export const floatingParticles = (
  particles: Element[],
  containerWidth: number,
  containerHeight: number,
) => {
  const controls = particles.map((particle) => {
    const startX = getRandomFloat(0, containerWidth);
    const startY = getRandomFloat(0, containerHeight);
    const moveX = getRandomFloat(-200, 200);
    const moveY = getRandomFloat(-100, 100);
    const rotation = getRandomFloat(-180, 180);
    const startOpacity = getRandomFloat(0.1, 0.6);
    const endOpacity = Math.min(1, startOpacity + getRandomFloat(0, 0.3));
    const startScale = getRandomFloat(0.5, 1.5);
    const endScale = startScale * getRandomFloat(0.8, 1.2);

    Object.assign((particle as HTMLElement).style, {
      opacity: startOpacity.toString(),
      transform: `translate(${startX}px, ${startY}px) scale(${startScale})`,
    });

    return animate(
      particle,
      {
        opacity: [startOpacity, endOpacity],
        rotate: [0, rotation],
        scale: [startScale, endScale],
        x: [startX, startX + moveX],
        y: [startY, startY + moveY],
      },
      {
        delay: getRandomFloat(0, 5),
        duration: getRandomFloat(20, 40),
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      },
    );
  });

  return () => controls.forEach((control) => control.stop());
};

// Utility timeline helper using Framer Motion's sequence API
export const createHeroSequence = (sequence: Parameters<typeof animate>[0][]) =>
  animate(sequence, {
    duration: ANIMATION_CONFIG.duration.hero,
    ease: ANIMATION_CONFIG.easing.expo,
  });

// Utility functions
export const getRandomFloat = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: T) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export { stagger };
