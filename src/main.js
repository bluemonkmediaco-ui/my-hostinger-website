import { getVideoEmbedInfo, getYouTubeThumbnail, formatThumbnailUrl } from './utils/videoHelpers.js';
import { initHeroAnimation } from './heroAnimation.js';

const initMain = async () => {
  // Initialize Cinematic Sony FX3 Camera Scroll Animation
  initHeroAnimation();

  // Elements
  const header = document.getElementById('header');
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  /* ------------------------------------------------------------------------
     0. FETCH DATA & DYNAMICALLY RENDER CONTENT
     ------------------------------------------------------------------------ */
  let data;
  try {
    const res = await fetch('/data.json?t=' + Date.now());
    data = await res.json();
  } catch (err) {
    try {
      const res = await fetch('/src/data.json?t=' + Date.now());
      data = await res.json();
    } catch (err2) {
      console.error("CMS failed to load config data. Standard template fallback will run.", err2);
      return;
    }
  }

  // A. Apply dynamic style colors to CSS Custom Properties
  if (data.theme) {
    document.documentElement.style.setProperty('--bg-primary', data.theme.backgroundColor || '#020617');
    document.documentElement.style.setProperty('--accent-blue', data.theme.accentBlue || '#0055ff');
    document.documentElement.style.setProperty('--accent-cyan', data.theme.accentCyan || '#00d2ff');
  }

  // B. Populate Brand and Hero Copy
  const logoTextEl = document.getElementById('logoText');
  if (logoTextEl) logoTextEl.textContent = data.brandName;
  
  const heroTitleEl = document.getElementById('heroTitle');
  if (heroTitleEl) heroTitleEl.innerHTML = data.hero.title;
  
  const heroSubtitleEl = document.getElementById('heroSubtitle');
  if (heroSubtitleEl) heroSubtitleEl.textContent = data.hero.subtitle;
  
  const heroPortfolioBtnEl = document.getElementById('heroPortfolioBtn');
  if (heroPortfolioBtnEl) {
    heroPortfolioBtnEl.innerHTML = `
      <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      ${data.hero.viewPortfolioText}
    `;
  }
  
  const heroBookCallBtnEl = document.getElementById('heroBookCallBtn');
  if (heroBookCallBtnEl) heroBookCallBtnEl.textContent = data.hero.bookCallText;

  // C. Populate Hero Gallery Masonry (Opposing columns - strictly native MP4 background loops)
  const renderGalleryItem = (item) => {
    const div = document.createElement('div');
    div.className = 'gallery-item';
    
    div.innerHTML = `
      <video autoplay loop muted playsinline style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;pointer-events:none;">
        <source src="${item.path}" type="video/mp4" />
      </video>
      <div class="glow-accent" style="pointer-events:none;"></div>
    `;
    return div;
  };

  const col1 = document.getElementById('galleryCol1');
  const col2 = document.getElementById('galleryCol2');
  const col3 = document.getElementById('galleryCol3');
  
  if (col1 && col2 && col3 && data.hero.gallery) {
    col1.innerHTML = '';
    col2.innerHTML = '';
    col3.innerHTML = '';
    
    // Distribute 9 items: 3 per column
    const items1 = data.hero.gallery.slice(0, 3);
    const items2 = data.hero.gallery.slice(3, 6);
    const items3 = data.hero.gallery.slice(6, 9);

    // Render each column with 3 full sets for seamless infinite loop animation
    const fillColumn = (col, items) => {
      const sets = 3;
      for (let s = 0; s < sets; s++) {
        items.forEach(item => {
          col.appendChild(renderGalleryItem(item));
        });
      }
    };

    fillColumn(col1, items1);
    fillColumn(col2, items2);
    fillColumn(col3, items3);
  }

  // D. Populate "How We Work" steps
  const stepsContainer = document.getElementById('stepsContainer');
  if (stepsContainer && data.howWeWork) {
    const howWeWorkTitleEl = document.getElementById('howWeWorkTitle');
    if (howWeWorkTitleEl) howWeWorkTitleEl.textContent = data.howWeWork.title;
    stepsContainer.innerHTML = '';

    const stepIcons = {
      'phone': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
      'target': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
      'lightbulb': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>`,
      'video': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z"/></svg>`,
      'monitor': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      'message-square': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      'check': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
    };

    data.howWeWork.steps.forEach(step => {
      const card = document.createElement('div');
      card.className = 'step-card';
      card.innerHTML = `
        <div class="step-icon-wrapper">
          <div class="step-icon">
            ${stepIcons[step.icon] || stepIcons['phone']}
          </div>
          <div class="step-dot"></div>
        </div>
        <div class="step-content">
          <span class="step-number">${step.name}</span>
          <p class="step-desc">${step.desc}</p>
        </div>
      `;
      stepsContainer.appendChild(card);
    });
  }

  // E. Populate "What We Do" services
  const servicesGrid = document.getElementById('servicesGrid');
  if (servicesGrid && data.whatWeDo) {
    const whatWeDoTitleEl = document.getElementById('whatWeDoTitle');
    if (whatWeDoTitleEl) whatWeDoTitleEl.textContent = data.whatWeDo.title;
    servicesGrid.innerHTML = '';

    const serviceIcons = {
      'monitor-play': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><polygon points="10 8 16 11 10 14 10 8"/></svg>`,
      'clapperboard': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
      'rocket': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.5 7.5"/></svg>`,
      'box': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
      'ad-text': `<span class="icon-ad-text">AD</span>`,
      'user': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
      'briefcase': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
      'calendar': `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
    };

    data.whatWeDo.services.forEach(serv => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <div class="service-icon">
          ${serviceIcons[serv.icon] || serviceIcons['monitor-play']}
        </div>
        <h3 class="service-title">${serv.title}</h3>
        <p class="service-desc">${serv.desc}</p>
        <div class="card-glow"></div>
      `;
      servicesGrid.appendChild(card);
    });
  }

  // Video Lightbox Modal Controller
  const videoModal = document.getElementById('videoModal');
  const videoModalBackdrop = document.getElementById('videoModalBackdrop');
  const videoModalClose = document.getElementById('videoModalClose');
  const videoModalTitle = document.getElementById('videoModalTitle');
  const videoModalPlayer = document.getElementById('videoModalPlayer');

  const closeVideoModal = () => {
    if (!videoModal) return;
    videoModal.classList.remove('active');
    videoModal.setAttribute('aria-hidden', 'true');
    if (videoModalPlayer) videoModalPlayer.innerHTML = '';
  };

  if (videoModalBackdrop) videoModalBackdrop.addEventListener('click', closeVideoModal);
  if (videoModalClose) videoModalClose.addEventListener('click', closeVideoModal);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();
  });

  const openVideoModal = (item) => {
    if (!videoModal || !videoModalPlayer) return;
    
    let targetUrl = item.videoUrl || item.path || '';
    let rawEmbedCode = (item.embedCode || '').trim();

    // If user pasted a URL string inside embedCode box, treat it as targetUrl instead of text
    if (rawEmbedCode && (rawEmbedCode.startsWith('http://') || rawEmbedCode.startsWith('https://')) && !rawEmbedCode.includes('<')) {
      targetUrl = rawEmbedCode;
      rawEmbedCode = '';
    }

    const embedInfo = getVideoEmbedInfo(targetUrl, item.path);
    const aspect = item.aspectRatio || embedInfo.defaultAspect || '9:16';
    const aspectClass = aspect === '16:9' ? 'ratio-16-9' : aspect === '1:1' ? 'ratio-1-1' : 'ratio-9-16';
    const isInstagram = embedInfo.type === 'instagram';
    const isYouTube = embedInfo.type === 'youtube';

    videoModalTitle.innerHTML = `
      <span style="display:block;font-size:1.1rem;font-weight:700;color:#38bdf8;letter-spacing:0.05em;text-transform:uppercase;">${item.title || item.alt || 'Video Preview'}</span>
      ${item.description ? `<span style="display:block;font-size:0.88rem;color:#cbd5e1;font-weight:500;margin-top:0.35rem;text-transform:none;letter-spacing:normal;">${item.description}</span>` : ''}
    `;
    videoModalPlayer.className = `video-modal-player ${aspectClass} ${isInstagram ? 'instagram-box' : ''} ${isYouTube ? 'youtube-box' : ''}`;
    videoModalPlayer.innerHTML = ''; // Force reset previous playback state

    const replayBtnHTML = `
      <button type="button" class="custom-replay-btn" id="customReplayBtn" title="Replay video from start">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        Replay Video
      </button>
    `;

    if (rawEmbedCode && rawEmbedCode.includes('<')) {
      videoModalPlayer.innerHTML = `
        <div class="portfolio-reel-wrapper">
          ${replayBtnHTML}
          ${rawEmbedCode}
        </div>
      `;
    } else if (embedInfo.type === 'instagram') {
      const igId = embedInfo.id || extractInstagramId(targetUrl);
      const embedSrc = `https://www.instagram.com/p/${igId}/embed/?utm_source=ig_embed`;
      videoModalPlayer.innerHTML = `
        <div class="portfolio-reel-wrapper">
          ${replayBtnHTML}
          <iframe
            src="${embedSrc}"
            class="portfolio-reel-iframe"
            title="${item.title || 'Instagram Reel Video'}"
            frameborder="0"
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
    } else if (embedInfo.type === 'youtube' || embedInfo.type === 'gdrive') {
      videoModalPlayer.innerHTML = `
        <iframe
          src="${embedInfo.embedUrl}"
          title="${item.title || 'Video Player'}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          scrolling="no"
          style="width:100%;height:100%;border:none;overflow:hidden;"
        ></iframe>
      `;
    } else {
      const mp4Src = embedInfo.framedUrl || embedInfo.embedUrl || item.path;
      videoModalPlayer.innerHTML = `
        <video src="${mp4Src}" controls autoplay playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;"></video>
      `;
    }

    // Attach Replay Button Reset Event Listener
    const replayBtn = videoModalPlayer.querySelector('#customReplayBtn');
    if (replayBtn) {
      replayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const iframe = videoModalPlayer.querySelector('iframe');
        if (iframe) {
          const currentSrc = iframe.src;
          iframe.src = '';
          setTimeout(() => {
            iframe.src = currentSrc;
          }, 50);
        }
      });
    }

    // Re-process Instagram Embeds automatically if blockquote exists
    if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === 'function') {
      window.instgrm.Embeds.process();
    }

    videoModal.classList.add('active');
    videoModal.setAttribute('aria-hidden', 'false');
  };

  // F. Populate Portfolio & Niche Filter Carousel
  const portfolioTrack = document.getElementById('portfolioTrack');
  const nicheTrack = document.getElementById('nicheTrack');
  const prevNicheBtn = document.getElementById('prevNicheBtn');
  const nextNicheBtn = document.getElementById('nextNicheBtn');

  if (portfolioTrack && data.portfolio) {
    const portfolioTitleEl = document.getElementById('portfolioTitle');
    if (portfolioTitleEl) portfolioTitleEl.textContent = data.portfolio.title;
    
    const portfolioSubtitleEl = document.getElementById('portfolioSubtitle');
    if (portfolioSubtitleEl) portfolioSubtitleEl.textContent = data.portfolio.subtitle;

    let activeNicheSlug = 'all';

    // 1. Render Niche Pills with Infinite Auto-Looping Slider
    if (nicheTrack) {
      nicheTrack.innerHTML = '';
      const baseNichesList = [
        { id: 'all', name: 'All Work', slug: 'all' },
        ...(data.portfolio.niches || [])
      ];

      // Duplicate array 3 times for seamless infinite looping
      const loopNichesList = [...baseNichesList, ...baseNichesList, ...baseNichesList];

      loopNichesList.forEach(niche => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `niche-pill ${niche.slug === activeNicheSlug ? 'active' : ''}`;
        button.textContent = niche.name;
        button.setAttribute('data-slug', niche.slug);

        button.addEventListener('click', () => {
          activeNicheSlug = niche.slug;
          document.querySelectorAll('.niche-pill').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-slug') === activeNicheSlug);
          });
          renderFilteredPortfolio();
        });

        nicheTrack.appendChild(button);
      });

      // Smooth Auto-Loop State
      let nicheOffset = 0;
      let isHovered = false;
      let singleSetWidth = 0;

      const calculateSetWidth = () => {
        singleSetWidth = nicheTrack.scrollWidth / 3;
      };

      setTimeout(calculateSetWidth, 100);
      window.addEventListener('resize', calculateSetWidth);

      // Smooth Auto-Looping Animation Loop (60fps)
      const baseSpeed = 0.45; // Eye-comfort smooth pace
      let currentSpeed = baseSpeed;

      const loopNicheSlider = () => {
        if (!isHovered) {
          currentSpeed += (baseSpeed - currentSpeed) * 0.1;
        } else {
          currentSpeed += (0 - currentSpeed) * 0.15;
        }

        nicheOffset -= currentSpeed;

        // Right-side boundary check
        const containerWidth = nicheTrack.parentElement ? nicheTrack.parentElement.clientWidth : 900;
        const maxScroll = Math.min(0, -(nicheTrack.scrollWidth - containerWidth));

        if (nicheOffset < maxScroll) {
          nicheOffset = maxScroll;
        }

        nicheTrack.style.transform = `translate3d(${nicheOffset}px, 0, 0)`;
        requestAnimationFrame(loopNicheSlider);
      };

      // Hover to Pause/Decelerate Loop for Easy Click
      const filterWrapper = document.querySelector('.niche-filter-wrapper');
      if (filterWrapper) {
        filterWrapper.addEventListener('mouseenter', () => { isHovered = true; });
        filterWrapper.addEventListener('mouseleave', () => { isHovered = false; });
      }

      // Prev & Next Navigation Buttons with Strict Left Boundary at 'ALL WORK' (0px)
      const scrollStep = 220;

      if (prevNicheBtn) {
        prevNicheBtn.addEventListener('click', () => {
          // Hard stop at ALL WORK (0px) - Cannot go beyond ALL WORK on the left
          nicheOffset = Math.min(0, nicheOffset + scrollStep);
          nicheTrack.style.transform = `translate3d(${nicheOffset}px, 0, 0)`;
        });
      }

      if (nextNicheBtn) {
        nextNicheBtn.addEventListener('click', () => {
          const containerWidth = nicheTrack.parentElement ? nicheTrack.parentElement.clientWidth : 900;
          const maxScroll = Math.min(0, -(nicheTrack.scrollWidth - containerWidth));
          nicheOffset = Math.max(maxScroll, nicheOffset - scrollStep);
          nicheTrack.style.transform = `translate3d(${nicheOffset}px, 0, 0)`;
        });
      }

      // Start smooth loop
      loopNicheSlider();
    }

    // 2. Render Filtered Portfolio Items
    const renderFilteredPortfolio = () => {
      portfolioTrack.innerHTML = '';

      let itemsToRender = [];
      const niches = data.portfolio.niches || [];

      if (activeNicheSlug === 'all') {
        niches.forEach(n => {
          if (n.videos && Array.isArray(n.videos)) {
            n.videos.forEach(v => {
              itemsToRender.push({ ...v, nicheName: n.name, nicheSlug: n.slug });
            });
          }
        });
      } else {
        const selectedNiche = niches.find(n => n.slug === activeNicheSlug);
        if (selectedNiche && selectedNiche.videos) {
          selectedNiche.videos.forEach(v => {
            itemsToRender.push({ ...v, nicheName: selectedNiche.name, nicheSlug: selectedNiche.slug });
          });
        }
      }

      if (itemsToRender.length === 0) {
        portfolioTrack.innerHTML = `<div style="width:100%;text-align:center;padding:3rem 1rem;color:#94a3b8;font-size:0.95rem;">No video productions in this niche yet.</div>`;
        return;
      }

      itemsToRender.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'portfolio-item';

        const embedInfo = getVideoEmbedInfo(item.videoUrl, item.path);
        const aspect = item.aspectRatio || embedInfo.defaultAspect || '9:16';
        const aspectClass = aspect === '16:9' ? 'ratio-16-9' : aspect === '1:1' ? 'ratio-1-1' : 'ratio-9-16';
        const isInstagram = embedInfo.type === 'instagram';

        let mediaContentHTML = '';
        const rawThumb = item.thumbnail || item.poster || item.cover || (
          (item.path && !item.path.endsWith('.mp4') && !item.path.includes('http')) 
            ? item.path 
            : (embedInfo.thumbnailUrl || (item.path && item.path.endsWith('.mp4') ? embedInfo.framedUrl : ''))
        );

        let finalThumbUrl = formatThumbnailUrl(rawThumb);

        const ytId = embedInfo.type === 'youtube' ? embedInfo.id : null;
        const gdId = embedInfo.type === 'gdrive' ? embedInfo.id : null;
        const igShortcode = (item.videoUrl || item.path || item.embedCode || '').match(/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/)?.[1];
        const fallbackUrl = gdId
          ? `https://images.weserv.nl/?url=https://drive.google.com/thumbnail?id=${gdId}&sz=w1000`
          : (ytId 
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` 
              : (igShortcode 
                  ? `https://images.weserv.nl/?url=https://instagram.com/p/${igShortcode}/media/?size=l` 
                  : 'https://via.placeholder.com/300x533/0b1528/38bdf8?text=Video+Cover'));

        if (finalThumbUrl && finalThumbUrl.includes('.mp4')) {
          mediaContentHTML = `<video src="${finalThumbUrl}" autoplay loop muted playsinline preload="metadata" style="width:100%;height:100%;object-fit:cover;pointer-events:none;"></video>`;
        } else if (finalThumbUrl) {
          mediaContentHTML = `<img src="${finalThumbUrl}" alt="${item.title || item.alt || 'Portfolio work'}" referrerpolicy="no-referrer" loading="lazy" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='${fallbackUrl}';" />`;
        } else {
          mediaContentHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg, #0284c7, #0055ff);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">▶ PLAY VIDEO</div>`;
        }

        slide.innerHTML = `
          <div class="portfolio-media ${aspectClass} ${isInstagram ? 'instagram-embed-box' : ''}">
            ${mediaContentHTML}
            <div class="video-overlay">
              <div class="play-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <div class="portfolio-info">
            <div class="portfolio-title-text">${item.title || item.alt || 'Project Work'}</div>
            ${item.description ? `<div class="portfolio-description-text">${item.description}</div>` : ''}
            <div class="portfolio-tag" style="margin-top:0.35rem;">${item.nicheName ? item.nicheName.toUpperCase() : 'VIDEO'}</div>
          </div>
        `;

        const mediaBox = slide.querySelector('.portfolio-media');
        if (mediaBox) {
          mediaBox.addEventListener('click', (e) => {
            e.preventDefault();
            openVideoModal(item);
          });
        }

        portfolioTrack.appendChild(slide);
      });
    };

    renderFilteredPortfolio();
  }

  // G. Populate Contact grid
  const contactGrid = document.getElementById('contactGrid');
  if (contactGrid && data.contact) {
    const contactTitleEl = document.getElementById('contactTitle');
    if (contactTitleEl) contactTitleEl.textContent = data.contact.title;
    
    const contactSubtitleEl = document.getElementById('contactSubtitle');
    if (contactSubtitleEl) contactSubtitleEl.textContent = data.contact.subtitle;
    
    contactGrid.innerHTML = `
      <!-- Card 1: Phone -->
      <a href="tel:${data.contact.phone.replace(/\s+/g, '')}" class="contact-card">
        <div class="contact-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </div>
        <span class="contact-label">Phone</span>
        <span class="contact-value">${data.contact.phone}</span>
      </a>

      <!-- Card 2: Email -->
      <a href="mailto:${data.contact.email}" class="contact-card">
        <div class="contact-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </div>
        <span class="contact-label">Email</span>
        <span class="contact-value">${data.contact.email}</span>
      </a>

      <!-- Card 3: Instagram -->
      <a href="${data.contact.instagramUrl}" target="_blank" rel="noopener noreferrer" class="contact-card">
        <div class="contact-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
        </div>
        <span class="contact-label">Instagram</span>
        <span class="contact-value">${data.contact.instagram}</span>
      </a>

      <!-- Card 4: LinkedIn -->
      <a href="${data.contact.linkedinUrl}" target="_blank" rel="noopener noreferrer" class="contact-card">
        <div class="contact-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </div>
        <span class="contact-label">LinkedIn</span>
        <span class="contact-value">${data.contact.linkedin}</span>
      </a>
    `;
  }

  // H. Populate Footer text
  const copyrightTextEl = document.getElementById('copyrightText');
  if (copyrightTextEl) {
    copyrightTextEl.innerHTML = `&copy; ${new Date().getFullYear()} ${data.brandName}. All rights reserved.`;
  }

  /* ------------------------------------------------------------------------
     1. FIXED HEADER SCROLL EFFECT
     ------------------------------------------------------------------------ */
  const handleScroll = () => {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  /* ------------------------------------------------------------------------
     2. MOBILE MENU HAMBURGER TOGGLE
     ------------------------------------------------------------------------ */
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. INTERACTIVE SPOTLIGHT GLOW EFFECT (CARD MOUSE TRACKING)
     ------------------------------------------------------------------------ */
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--x', `${x}px`);
      card.style.setProperty('--y', `${y}px`);
    });
  });

  /* ------------------------------------------------------------------------
     4. PORTFOLIO SLIDER / CAROUSEL LOGIC
     ------------------------------------------------------------------------ */
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (portfolioTrack && prevBtn && nextBtn) {
    let currentIdx = 0;
    
    const getSliderMetrics = () => {
      const item = portfolioTrack.querySelector('.portfolio-item');
      if (!item) return { maxIndex: 0, itemWidth: 0, gap: 0, itemsVisible: 1 };
      
      const itemWidth = item.offsetWidth;
      const computedStyle = window.getComputedStyle(portfolioTrack);
      const gap = parseFloat(computedStyle.gap) || 0;
      const containerWidth = portfolioTrack.parentElement.offsetWidth;
      const itemsVisible = Math.round(containerWidth / (itemWidth + gap)) || 1;
      const totalItems = portfolioTrack.querySelectorAll('.portfolio-item').length;
      const maxIndex = Math.max(0, totalItems - itemsVisible);
      
      return { maxIndex, itemWidth, gap, itemsVisible };
    };

    const updateSliderPosition = () => {
      const { maxIndex, itemWidth, gap } = getSliderMetrics();
      
      if (currentIdx > maxIndex) currentIdx = maxIndex;
      if (currentIdx < 0) currentIdx = 0;
      
      const slideAmount = itemWidth + gap;
      const offset = currentIdx * slideAmount;
      
      portfolioTrack.style.transform = `translateX(-${offset}px)`;
      
      if (currentIdx === 0) {
        prevBtn.classList.add('disabled');
      } else {
        prevBtn.classList.remove('disabled');
      }
      
      if (currentIdx >= maxIndex) {
        nextBtn.classList.add('disabled');
      } else {
        nextBtn.classList.remove('disabled');
      }
    };

    nextBtn.addEventListener('click', () => {
      const { maxIndex } = getSliderMetrics();
      if (currentIdx < maxIndex) {
        currentIdx++;
        updateSliderPosition();
      }
    });

    prevBtn.addEventListener('click', () => {
      if (currentIdx > 0) {
        currentIdx--;
        updateSliderPosition();
      }
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateSliderPosition();
      }, 100);
    });

    setTimeout(updateSliderPosition, 200);

    /* ------------------------------------------------------------------------
       PORTFOLIO SWIPE SUPPORT (TOUCH GESTURES FOR MOBILE)
       ------------------------------------------------------------------------ */
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    portfolioTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
    }, { passive: true });

    portfolioTrack.addEventListener('touchmove', (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
    }, { passive: true });

    portfolioTrack.addEventListener('touchend', () => {
      if (!isSwiping) return;
      isSwiping = false;
      const diffX = startX - currentX;
      
      const threshold = 40;
      const { maxIndex } = getSliderMetrics();
      
      if (diffX > threshold && currentIdx < maxIndex) {
        currentIdx++;
        updateSliderPosition();
      } else if (diffX < -threshold && currentIdx > 0) {
        currentIdx--;
        updateSliderPosition();
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. DYNAMIC NAVIGATION ACTIVE STATE ON SCROLL
     ------------------------------------------------------------------------ */
  const sections = document.querySelectorAll('section[id]');
  
  const highlightNavigation = () => {
    const scrollPos = window.scrollY + 200;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNavigation);
};

// Robust Init Guard: executes immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMain);
} else {
  initMain();
}
