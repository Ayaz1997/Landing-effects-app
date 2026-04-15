/**
 * Enhanced rendering logic for Landing Effects.
 */

export interface AsciiOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  chars?: string;
  fontSize?: number;
  fontFamily?: string;
  brightnessBoost?: number;
  posterize?: number;
  parallaxStrength?: number;
  enableParallax?: boolean;
  enableGlitch?: boolean;
  enableReveal?: boolean;
  animationSpeed?: number;
  scale?: number;
  colorFn?: (luminance: number, distFromCenter: number) => string;
}

export function createAsciiRenderer(options: AsciiOptions) {
  const {
    canvas,
    image,
    chars = ' 0123456789',
    fontSize = 10,
    fontFamily = '"DM Mono", monospace',
    brightnessBoost = 2.2,
    posterize = 32,
    parallaxStrength = 8,
    enableParallax = false,
    enableGlitch = false,
    enableReveal = false,
    animationSpeed = 1,
    scale = 1.15,
    colorFn,
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  // Pre-calculate offscreen sampler dimensions
  const charCols = Math.floor(canvas.width / fontSize);
  const charRows = Math.floor(canvas.height / fontSize);

  // Initialize Offscreen sampler once
  const offscreen = document.createElement('canvas');
  offscreen.width = charCols;
  offscreen.height = charRows;
  const octx = offscreen.getContext('2d', { willReadFrequently: true });

  let animationFrameId: number;
  let mouseX = 0;
  let mouseY = 0;
  let startTime = Date.now();

  const handleMouseMove = (e: MouseEvent) => {
    if (!enableParallax) return;
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;
  };

  const render = () => {
    if (!octx) return;
    const elapsed = (Date.now() - startTime) * animationSpeed;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);

    const px = enableParallax ? mouseX * parallaxStrength : 0;
    const py = enableParallax ? mouseY * parallaxStrength : 0;

    // Draw to sampler
    octx.clearRect(0, 0, offscreen.width, offscreen.height);
    octx.drawImage(image, -px, -py, offscreen.width * scale, offscreen.height * scale);
    const imageData = octx.getImageData(0, 0, offscreen.width, offscreen.height);
    const data = imageData.data;

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let y = 0; y < charRows; y++) {
      let rowOffset = 0;
      if (enableGlitch) {
        const glitchTime = elapsed * 0.005;
        if (Math.sin(glitchTime + y * 0.5) > 0.98) {
          rowOffset = Math.sin(glitchTime * 10) * 20;
        }
      }

      for (let x = 0; x < charCols; x++) {
        const i = (y * charCols + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        let luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        luminance = Math.min(1, luminance * brightnessBoost);

        if (posterize > 0) {
          luminance = Math.floor(luminance * posterize) / posterize;
        }

        if (enableReveal) {
          const revealProgress = Math.min(1, elapsed / 2000);
          const distX = Math.abs((x / charCols) - 0.5) * 2;
          const distY = Math.abs((y / charRows) - 0.5) * 2;
          const maxDist = Math.max(distX, distY);
          if (maxDist > revealProgress) continue;
        }

        const charIndex = Math.floor(luminance * (chars.length - 1));
        const char = chars[charIndex];

        const relX = (x / charCols) - 0.5;
        const relY = (y / charRows) - 0.5;
        const distFromCenter = Math.sqrt(relX * relX + relY * relY);

        if (colorFn) {
          ctx.fillStyle = colorFn(luminance, distFromCenter);
        } else {
          const hue = 180 + luminance * 40; 
          const sat = 100;
          const light = luminance * 70 + 10;
          ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
        }

        ctx.fillText(char, x * fontSize + fontSize / 2 + rowOffset, y * fontSize + fontSize / 2);
      }
    }

    animationFrameId = requestAnimationFrame(render);
  };

  window.addEventListener('mousemove', handleMouseMove);
  render();

  return () => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('mousemove', handleMouseMove);
  };
}

export interface PixelOptions {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  blockSize?: number;
  pixelsPerFrame?: number;
  glitchRegion?: number;
  delay?: number;
  onComplete?: () => void;
}

export function createPixelReveal(options: PixelOptions) {
  const {
    canvas,
    image,
    blockSize = 8,
    pixelsPerFrame = 120,
    glitchRegion = 0.36,
    delay = 200,
    onComplete
  } = options;

  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const w = canvas.width;
  const h = canvas.height;
  const cols = Math.ceil(w / blockSize);
  const rows = Math.ceil(h / blockSize);
  const totalBlocks = cols * rows;

  // Create an offscreen canvas to sample the image once
  const sampler = document.createElement('canvas');
  sampler.width = w;
  sampler.height = h;
  const sctx = sampler.getContext('2d');
  if (sctx) {
    sctx.drawImage(image, 0, 0, w, h);
  }

  const revealed = new Set<number>();
  const indices = Array.from({ length: totalBlocks }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  let animationFrameId: number;
  let startTime = Date.now();

  const render = () => {
    if (Date.now() - startTime < delay) {
      animationFrameId = requestAnimationFrame(render);
      return;
    }

    if (revealed.size < totalBlocks) {
      for (let i = 0; i < pixelsPerFrame; i++) {
        if (indices.length > 0) {
          revealed.add(indices.pop()!);
        }
      }
    } else if (onComplete) {
      onComplete();
      cancelAnimationFrame(animationFrameId);
      // Final crisp draw
      ctx.drawImage(image, 0, 0, w, h);
      return;
    }

    ctx.clearRect(0, 0, w, h);
    
    revealed.forEach(idx => {
      const r = Math.floor(idx / cols);
      const c = idx % cols;
      const x = c * blockSize;
      const y = r * blockSize;

      // Glitch effect in specified region
      const isGlitch = y < h * glitchRegion && Math.random() > 0.95;
      
      if (isGlitch) {
        ctx.fillStyle = `rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`;
        ctx.fillRect(x, y, blockSize, blockSize);
      } else if (sctx) {
        ctx.drawImage(sampler, x, y, blockSize, blockSize, x, y, blockSize, blockSize);
      }
    });

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  return () => {
    cancelAnimationFrame(animationFrameId);
  };
}
