/**
 * Cinematic Sony FX3 Camera Scroll Animation
 * Features 3-Phase Scroll Scrubbing:
 *   Phase 1: Extreme Macro Lens Close-up -> Full Rig Zoom Out
 *   Phase 2: Camera Rig Docking to Right Side
 *   Phase 3: Smooth UI Text & Navigation Fade-In on Left
 */

export function initHeroAnimation() {
  const heroSection = document.getElementById('hero-animation');
  const canvas = document.getElementById('cameraAnimationCanvas');
  const contentLeft = document.getElementById('heroContentLeft');

  if (!heroSection || !canvas) return;

  const ctx = canvas.getContext('2d');

  // Frame Image Sources
  const imageSources = {
    frame1: '/images/hero_fx3_frame1.jpg',
    frame3: '/images/hero_fx3_frame3.jpg',
    frame6: '/images/hero_fx3_frame6.jpg'
  };

  const images = {
    frame1: new Image(),
    frame3: new Image(),
    frame6: new Image()
  };

  let imagesLoadedCount = 0;
  const totalImages = 3;

  function onImageLoad() {
    imagesLoadedCount++;
    if (imagesLoadedCount === totalImages) {
      resizeCanvas();
      renderFrame(currentProgress);
    }
  }

  images.frame1.onload = onImageLoad;
  images.frame3.onload = onImageLoad;
  images.frame6.onload = onImageLoad;

  images.frame1.src = imageSources.frame1;
  images.frame3.src = imageSources.frame3;
  images.frame6.src = imageSources.frame6;

  // Animation State
  let currentProgress = 0;
  let targetProgress = 0;
  let animationFrameId = null;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    renderFrame(currentProgress);
  }

  window.addEventListener('resize', resizeCanvas);

  function drawCoverImage(img, opacity = 1, scale = 1, offsetX = 0, offsetY = 0) {
    if (!img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, drawX, drawY;

    if (canvasRatio > imgRatio) {
      drawWidth = canvasWidth * scale;
      drawHeight = (canvasWidth / imgRatio) * scale;
    } else {
      drawHeight = canvasHeight * scale;
      drawWidth = (canvasHeight * imgRatio) * scale;
    }

    drawX = (canvasWidth - drawWidth) / 2 + offsetX;
    drawY = (canvasHeight - drawHeight) / 2 + offsetY;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }

  function renderFrame(progress) {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Phase 1 (0.0 to 0.45): Macro Lens Close-up (Frame 1) to Full Rig (Frame 3)
    if (progress <= 0.45) {
      const phase1Ratio = progress / 0.45;
      
      // Frame 1: Zoom out from 1.8x to 1.0x
      const frame1Scale = 1.8 - (0.8 * phase1Ratio);
      const frame1Opacity = 1 - Math.pow(phase1Ratio, 1.5);

      // Frame 3: Zoom out from 1.3x to 1.0x
      const frame3Scale = 1.3 - (0.3 * phase1Ratio);
      const frame3Opacity = Math.pow(phase1Ratio, 1.2);

      drawCoverImage(images.frame1, frame1Opacity, frame1Scale);
      drawCoverImage(images.frame3, frame3Opacity, frame3Scale);
    } 
    // Phase 2 & 3 (0.45 to 1.0): Full Rig (Frame 3) to Docked Right Rig (Frame 6)
    else {
      const phase2Ratio = (progress - 0.45) / 0.55;

      const frame3Opacity = 1 - phase2Ratio;
      const frame6Opacity = phase2Ratio;

      // Slight camera pan effect towards right
      const shiftX = (w > 768) ? (w * 0.08 * phase2Ratio) : 0;

      drawCoverImage(images.frame3, frame3Opacity, 1.0, shiftX);
      drawCoverImage(images.frame6, frame6Opacity, 1.0 + (0.05 * (1 - phase2Ratio)));
    }

    // UI Content Fade In Logic (Phase 3: 0.5 to 1.0)
    if (contentLeft) {
      if (progress >= 0.45) {
        const uiRatio = Math.min(1, (progress - 0.45) / 0.45);
        contentLeft.style.opacity = uiRatio;
        contentLeft.style.transform = `translateY(${30 * (1 - uiRatio)}px)`;
        contentLeft.style.pointerEvents = uiRatio > 0.5 ? 'auto' : 'none';
      } else {
        contentLeft.style.opacity = 0;
        contentLeft.style.transform = 'translateY(30px)';
        contentLeft.style.pointerEvents = 'none';
      }
    }
  }

  // Smooth Inertial Scroll Loop (60fps)
  function animationLoop() {
    const diff = targetProgress - currentProgress;
    if (Math.abs(diff) > 0.0005) {
      currentProgress += diff * 0.12;
      renderFrame(currentProgress);
    } else {
      currentProgress = targetProgress;
      renderFrame(currentProgress);
    }
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  function onScroll() {
    const rect = heroSection.getBoundingClientRect();
    const totalScrollableHeight = rect.height - window.innerHeight;
    if (totalScrollableHeight <= 0) return;

    const scrollDistance = -rect.top;
    const rawProgress = scrollDistance / totalScrollableHeight;
    targetProgress = Math.max(0, Math.min(1, rawProgress));
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  animationLoop();
}
