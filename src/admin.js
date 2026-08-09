import { getVideoEmbedInfo, formatThumbnailUrl } from './utils/videoHelpers.js';
import { getThumbnailOptions } from './utils/thumbnailGenerator.js';

const initAdmin = async () => {
  // Global Data State
  let configData = null;

  // Selectors
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.admin-content-panel');
  const toastAlert = document.getElementById('toastAlert');
  const toastAlertText = document.getElementById('toastAlertText');
  const btnSaveMaster = document.getElementById('btnSaveMaster');

  /* ------------------------------------------------------------------------
     1. TAB SWITCHING LOGIC
     ------------------------------------------------------------------------ */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs & panels
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Add active to current
      tab.classList.add('active');
      const targetPanel = tab.getAttribute('data-tab');
      const panelEl = document.getElementById(targetPanel);
      if (panelEl) {
        panelEl.classList.add('active');
      }
    });
  });

  /* ------------------------------------------------------------------------
     2. DYNAMIC COLOR PICKER SYNCHRONIZATION
     ------------------------------------------------------------------------ */
  const setupColorPicker = (inputEl, textEl) => {
    if (inputEl && textEl) {
      inputEl.addEventListener('input', (e) => {
        textEl.textContent = e.target.value.toUpperCase();
      });
    }
  };

  setupColorPicker(document.getElementById('colorBg'), document.getElementById('valBg'));
  setupColorPicker(document.getElementById('colorAccent'), document.getElementById('valAccent'));
  setupColorPicker(document.getElementById('colorCyan'), document.getElementById('valCyan'));

  /* ------------------------------------------------------------------------
     3. LOAD CONFIG DATA AND POPULATE FORM
     ------------------------------------------------------------------------ */
  try {
    let res;
    try {
      res = await fetch('/data.json?t=' + Date.now());
    } catch (e) {
      res = await fetch('/src/data.json?t=' + Date.now());
    }
    configData = await res.json();
    populateForm(configData);
  } catch (err) {
    showToast("Error loading website data!", "error");
    console.error(err);
  }

  function populateForm(data) {
    if (!data) return;

    // Helper functions for safe rendering
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    
    const setText = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || "";
    };

    // A. Styling & Theme Panel
    if (data.theme) {
      setVal('colorBg', data.theme.backgroundColor);
      setText('valBg', data.theme.backgroundColor.toUpperCase());
      
      setVal('colorAccent', data.theme.accentBlue);
      setText('valAccent', data.theme.accentBlue.toUpperCase());
      
      setVal('colorCyan', data.theme.accentCyan);
      setText('valCyan', data.theme.accentCyan.toUpperCase());
    }

    // B. Brand & Hero Panel
    setVal('inputBrandName', data.brandName);
    setVal('inputHeroTitle', data.hero.title);
    setVal('inputHeroSubtitle', data.hero.subtitle);
    setVal('inputBtnPortfolio', data.hero.viewPortfolioText);
    setVal('inputBtnCall', data.hero.bookCallText);

    // C. About Us Panel
    if (data.aboutUs) {
      setVal('inputAboutTitle', data.aboutUs.title);
      setVal('inputAboutPara1', data.aboutUs.para1);
      setVal('inputAboutPara2', data.aboutUs.para2);
    }
    if (data.howWeWork) {
      setVal('inputHowWeWorkTitle', data.howWeWork.title);
    }
    if (data.whatWeDo) {
      setVal('inputWhatWeDoTitle', data.whatWeDo.title);
    }

    // Render 9 hero gallery slots — VIDEO ONLY, 9:16 preview
    const heroGalleryList = document.getElementById('heroGalleryList');
    if (heroGalleryList && data.hero.gallery) {
      heroGalleryList.innerHTML = '';
      data.hero.gallery.forEach((item, index) => {
        const col = index < 3 ? 1 : index < 6 ? 2 : 3;
        const posInCol = (index % 3) + 1;
        const slotDiv = document.createElement('div');
        slotDiv.className = 'media-card-edit';
        slotDiv.style.cssText = 'display:flex;flex-direction:column;gap:0.75rem;';
        slotDiv.innerHTML = `
          <div class="media-card-title">Col ${col} · Slot ${posInCol}</div>
          <!-- 9:16 live video preview -->
          <div style="aspect-ratio:9/16;background:#040c1a;border-radius:8px;overflow:hidden;border:1px solid rgba(0,85,255,0.2);position:relative;">
            <video
              class="slot-preview-video"
              data-index="${index}"
              src="${item.path || ''}"
              autoplay loop muted playsinline
              style="width:100%;height:100%;object-fit:cover;display:block;"
            ></video>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
              <div style="background:rgba(0,85,255,0.15);border:1px solid rgba(0,85,255,0.3);border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label style="font-size:0.75rem;color:#64748b;margin-bottom:0.4rem;">
              📹 Video URL or /assets/filename.mp4
            </label>
            <input
              type="text"
              class="hero-media-path"
              data-index="${index}"
              value="${item.path || ''}"
              placeholder="Paste video URL or /assets/my-video.mp4"
              style="font-size:0.8rem;"
            >
          </div>
        `;
        heroGalleryList.appendChild(slotDiv);

        // Live preview update on input change
        const input = slotDiv.querySelector('.hero-media-path');
        const video = slotDiv.querySelector('.slot-preview-video');
        input.addEventListener('input', () => {
          video.src = input.value;
          video.load();
          video.play().catch(() => {});
        });
      });
    }

    // C. Workflow Steps (7 Steps)
    const stepsListEditor = document.getElementById('stepsListEditor');
    if (stepsListEditor && data.howWeWork && data.howWeWork.steps) {
      stepsListEditor.innerHTML = '';
      data.howWeWork.steps.forEach((step, index) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'portfolio-item-card';
        stepDiv.innerHTML = `
          <div class="media-card-title" style="margin-bottom: 1rem; color:#38bdf8;">Step ${index + 1} Settings</div>
          <div class="form-row">
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Step Title</label>
              <input type="text" class="step-input-name" data-index="${index}" value="${step.name || ''}">
            </div>
            <div class="form-group" style="margin-bottom: 0.75rem;">
              <label>Icon Style (lucide icon)</label>
              <select class="step-input-icon" data-index="${index}">
                <option value="phone" ${step.icon === 'phone' ? 'selected' : ''}>Phone</option>
                <option value="target" ${step.icon === 'target' ? 'selected' : ''}>Target / Target</option>
                <option value="lightbulb" ${step.icon === 'lightbulb' ? 'selected' : ''}>Lightbulb</option>
                <option value="video" ${step.icon === 'video' ? 'selected' : ''}>Video / Camera</option>
                <option value="monitor" ${step.icon === 'monitor' ? 'selected' : ''}>Monitor / Screen</option>
                <option value="message-square" ${step.icon === 'message-square' ? 'selected' : ''}>Speech Bubble</option>
                <option value="check" ${step.icon === 'check' ? 'selected' : ''}>Checkmark</option>
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label>Step Description</label>
            <textarea class="step-input-desc" data-index="${index}">${step.desc || ''}</textarea>
          </div>
        `;
        stepsListEditor.appendChild(stepDiv);
      });
    }

    // D. Services Cards (8 Cards)
    const servicesListEditor = document.getElementById('servicesListEditor');
    if (servicesListEditor && data.whatWeDo && data.whatWeDo.services) {
      servicesListEditor.innerHTML = '';
      data.whatWeDo.services.forEach((serv, index) => {
        const servDiv = document.createElement('div');
        servDiv.className = 'media-card-edit';
        servDiv.innerHTML = `
          <div class="media-card-title" style="color:#38bdf8;">Service ${index + 1}</div>
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label>Service Title</label>
            <input type="text" class="serv-input-title" data-index="${index}" value="${serv.title || ''}">
          </div>
          <div class="form-group" style="margin-bottom: 0.75rem;">
            <label>Icon style</label>
            <select class="serv-input-icon" data-index="${index}">
              <option value="monitor-play" ${serv.icon === 'monitor-play' ? 'selected' : ''}>Play Screen</option>
              <option value="clapperboard" ${serv.icon === 'clapperboard' ? 'selected' : ''}>Clapperboard</option>
              <option value="rocket" ${serv.icon === 'rocket' ? 'selected' : ''}>Rocket / Jet</option>
              <option value="box" ${serv.icon === 'box' ? 'selected' : ''}>3D Box / Product</option>
              <option value="ad-text" ${serv.icon === 'ad-text' ? 'selected' : ''}>"AD" Text</option>
              <option value="user" ${serv.icon === 'user' ? 'selected' : ''}>User Profile</option>
              <option value="briefcase" ${serv.icon === 'briefcase' ? 'selected' : ''}>Briefcase</option>
              <option value="calendar" ${serv.icon === 'calendar' ? 'selected' : ''}>Calendar</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label>Service Description</label>
            <textarea class="serv-input-desc" data-index="${index}" style="min-height:75px;">${serv.desc || ''}</textarea>
          </div>
        `;
        servicesListEditor.appendChild(servDiv);
      });
    }

    // E. Contact details
    if (data.contact) {
      setVal('inputContactPhone', data.contact.phone);
      setVal('inputContactEmail', data.contact.email);
      setVal('inputContactInstagram', data.contact.instagram);
      setVal('inputContactInstagramUrl', data.contact.instagramUrl);
      setVal('inputContactLinkedin', data.contact.linkedin);
      setVal('inputContactLinkedinUrl', data.contact.linkedinUrl);
    }

    // F. Portfolio Niche-by-Niche list
    renderNicheManager();
  }

  /* ------------------------------------------------------------------------
     4. UNIFIED NICHE-BY-NICHE PORTFOLIO MANAGER ACTIONS
     ------------------------------------------------------------------------ */
  function renderNicheManager() {
    const listEl = document.getElementById('nicheManagerList');
    if (!listEl || !configData || !configData.portfolio) return;
    if (!configData.portfolio.niches) configData.portfolio.niches = [];

    listEl.innerHTML = '';

    configData.portfolio.niches.forEach((niche, nicheIdx) => {
      const nicheBlock = document.createElement('div');
      nicheBlock.className = 'niche-block-card';
      nicheBlock.style.cssText = 'background:rgba(5,11,20,0.95);border:1px solid rgba(0,210,255,0.3);border-radius:12px;padding:1.5rem;position:relative;box-shadow:0 8px 32px rgba(0,0,0,0.4);';

      if (!niche.videos) niche.videos = [];

      let videosHTML = '';
      niche.videos.forEach((vid, vidIdx) => {
        const aspect = vid.aspectRatio || '9:16';
        const aspectStyle = aspect === '16:9' ? 'aspect-ratio:16/9;max-width:240px;' : aspect === '1:1' ? 'aspect-ratio:1/1;max-width:180px;' : 'aspect-ratio:9/16;max-width:160px;';
        const thumbOptions = getThumbnailOptions(vid.videoUrl || vid.path || vid.embedCode || '');
        const activeThumb = formatThumbnailUrl(vid.thumbnail || '');

        videosHTML += `
          <div class="niche-video-card" style="background:rgba(2,6,23,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:1.25rem;margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
              <span style="font-weight:700;color:#38bdf8;font-size:0.95rem;">Video #${vidIdx + 1}: ${vid.title || 'Untitled Video'}</span>
              <button type="button" class="btn-delete-video" data-niche="${nicheIdx}" data-video="${vidIdx}" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:0.3rem 0.6rem;font-size:0.75rem;border-radius:4px;cursor:pointer;">Delete Video</button>
            </div>

            <div style="display:grid;grid-template-columns:180px 1fr;gap:1.25rem;align-items:start;">
              <!-- Live Aspect Ratio Card Preview -->
              <div style="display:flex;flex-direction:column;gap:0.4rem;align-items:center;">
                <div style="${aspectStyle}width:100%;background:#020617;border-radius:6px;overflow:hidden;border:1px solid rgba(0,210,255,0.3);display:flex;align-items:center;justify-content:center;">
                  ${activeThumb
                    ? `<img src="${activeThumb}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x533/0b1528/38bdf8?text=Video+Cover';">`
                    : vid.path && vid.path.endsWith('.mp4')
                      ? `<video src="${vid.path}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
                      : vid.path
                        ? `<img src="${formatThumbnailUrl(vid.path)}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x533/0b1528/38bdf8?text=Video+Cover';">`
                        : `<div style="color:#64748b;font-size:0.75rem;text-align:center;">▶ ${aspect} Preview</div>`
                  }
                </div>
                <span style="font-size:0.7rem;color:#00d2ff;font-weight:bold;">${aspect} Ratio Preview</span>
              </div>

              <!-- Video Inputs -->
              <div>
                <div class="form-row">
                  <div class="form-group">
                    <label style="font-size:0.8rem;">Video Title / Name</label>
                    <input type="text" class="vid-title-input" data-niche="${nicheIdx}" data-video="${vidIdx}" value="${vid.title || ''}" placeholder="e.g. Luxury Diamond Ring Shoot">
                  </div>
                  <div class="form-group">
                    <label style="font-size:0.8rem;">Aspect Ratio</label>
                    <select class="vid-aspect-select" data-niche="${nicheIdx}" data-video="${vidIdx}">
                      <option value="9:16" ${aspect === '9:16' ? 'selected' : ''}>📱 9:16 (Vertical / Reels)</option>
                      <option value="16:9" ${aspect === '16:9' ? 'selected' : ''}>🎬 16:9 (Horizontal / YouTube)</option>
                      <option value="1:1" ${aspect === '1:1' ? 'selected' : ''}>🟦 1:1 (Square)</option>
                    </select>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom:0.75rem;">
                  <label style="font-size:0.8rem;">📹 Video URL (YouTube, Instagram Reel, Google Drive, MP4)</label>
                  <input type="text" class="vid-url-input" data-niche="${nicheIdx}" data-video="${vidIdx}" value="${vid.videoUrl || vid.path || ''}" placeholder="Paste YouTube link, Instagram Reel link, Drive link, or /videos/video.mp4">
                </div>

                <!-- Select Thumbnail Frame Section -->
                <div class="form-group" style="margin-bottom:0.75rem;">
                  <label style="font-size:0.8rem;display:flex;align-items:center;justify-content:space-between;color:#f8fafc;margin-bottom:0.35rem;">
                    <span>🖼️ Select Thumbnail Frame</span>
                    <span style="font-size:0.7rem;color:#94a3b8;">Choose poster frame for card</span>
                  </label>
                  <div class="thumbnail-options-grid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:0.5rem;">
                    ${thumbOptions && thumbOptions.length > 0 ? thumbOptions.map(opt => {
                      const isSelected = vid.thumbnail === opt.url || (!vid.thumbnail && opt.id === 1);
                      return `
                        <div class="thumb-frame-card ${isSelected ? 'selected' : ''}" 
                             data-niche="${nicheIdx}" 
                             data-video="${vidIdx}" 
                             data-thumb="${opt.url}" 
                             style="cursor:pointer;background:#020617;border:${isSelected ? '2px solid #0055ff' : '1px solid rgba(255,255,255,0.15)'};border-radius:6px;padding:0.4rem;text-align:center;transition:all 0.2s ease;box-shadow:${isSelected ? '0 0 12px rgba(0,85,255,0.5)' : 'none'};">
                          <div style="aspect-ratio:16/9;background:#0f172a;border-radius:4px;overflow:hidden;margin-bottom:0.3rem;display:flex;align-items:center;justify-content:center;">
                            <img src="${opt.url}" referrerpolicy="no-referrer" alt="${opt.label}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x533/0b1528/38bdf8?text=Video+Cover';">
                          </div>
                          <span style="font-size:0.68rem;color:${isSelected ? '#38bdf8' : '#94a3b8'};font-weight:${isSelected ? 'bold' : 'normal'};">${opt.label}</span>
                        </div>
                      `;
                    }).join('') : '<div style="grid-column:span 3;color:#64748b;font-size:0.75rem;padding:0.45rem;background:rgba(15,23,42,0.5);border-radius:4px;text-align:center;">Enter a YouTube, Instagram Reel, Drive, or MP4 URL above to extract 3 frame options</div>'}
                  </div>
                  <div style="margin-top:0.45rem;">
                    <label style="font-size:0.72rem;color:#94a3b8;display:block;margin-bottom:0.2rem;">Or Paste Custom Thumbnail Image URL / Upload Image:</label>
                    <input type="text" class="vid-custom-thumb-input" data-niche="${nicheIdx}" data-video="${vidIdx}" value="${vid.thumbnail || ''}" placeholder="Paste custom image URL (e.g. https://... or /images/thumb.jpg)" style="font-size:0.75rem;padding:0.35rem 0.6rem;background:rgba(15,23,42,0.8);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:#f8fafc;width:100%;">
                  </div>
                </div>

                <div class="form-group" style="margin-bottom:0.75rem;">
                  <label style="font-size:0.8rem;">🧩 Raw Embed Code / HTML (Optional)</label>
                  <textarea class="vid-embedcode-input" data-niche="${nicheIdx}" data-video="${vidIdx}" style="min-height:55px;font-family:monospace;font-size:0.75rem;" placeholder="Paste raw <iframe> or <blockquote class='instagram-media'> HTML embed code">${vid.embedCode || ''}</textarea>
                </div>

                <div class="form-group" style="margin-bottom:0;">
                  <label style="font-size:0.8rem;">Description (Optional)</label>
                  <input type="text" class="vid-desc-input" data-niche="${nicheIdx}" data-video="${vidIdx}" value="${vid.description || ''}" placeholder="Short video description">
                </div>
              </div>
            </div>
          </div>
        `;
      });

      const isCollapsed = niche.collapsed === true;

      nicheBlock.innerHTML = `
        <div class="niche-header-bar" style="display:flex;justify-content:space-between;align-items:center;padding-bottom:${isCollapsed ? '0' : '1rem'};margin-bottom:${isCollapsed ? '0' : '1.25rem'};${isCollapsed ? '' : 'border-bottom:1px solid rgba(255,255,255,0.1);'}">
          <div style="display:flex;align-items:center;gap:0.75rem;flex:1;max-width:560px;">
            <button type="button" class="btn-toggle-niche-collapse" data-niche="${nicheIdx}" style="background:rgba(0,210,255,0.12);color:#00d2ff;border:1px solid rgba(0,210,255,0.3);width:34px;height:34px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s ease;font-size:0.85rem;flex-shrink:0;" title="${isCollapsed ? 'Expand Niche (Make Bigger)' : 'Collapse Niche (Make Smaller)'}">
              ${isCollapsed ? '▶' : '▼'}
            </button>
            <span style="font-size:1.05rem;font-weight:700;color:#00d2ff;white-space:nowrap;">Niche #${nicheIdx + 1}:</span>
            <input type="text" class="niche-name-input" data-niche="${nicheIdx}" value="${niche.name || ''}" placeholder="Niche Name (e.g. Jewelry, Real Estate)" style="font-size:1.05rem;font-weight:700;color:#f8fafc;background:rgba(15,23,42,0.8);border:1px solid rgba(0,210,255,0.4);border-radius:6px;padding:0.4rem 0.8rem;width:100%;">
            <span style="font-size:0.75rem;color:#94a3b8;white-space:nowrap;background:rgba(255,255,255,0.05);padding:0.25rem 0.6rem;border-radius:12px;border:1px solid rgba(255,255,255,0.1);">${niche.videos ? niche.videos.length : 0} Videos</span>
          </div>

          <div style="display:flex;align-items:center;gap:0.5rem;">
            <button type="button" class="btn-toggle-niche-collapse-text" data-niche="${nicheIdx}" style="background:rgba(0,85,255,0.15);color:#38bdf8;border:1px solid rgba(0,210,255,0.3);padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:6px;cursor:pointer;font-weight:600;">
              ${isCollapsed ? '🔍 Expand (Make Big)' : '📐 Collapse (Make Small)'}
            </button>
            <button type="button" class="btn-delete-niche" data-niche="${nicheIdx}" style="background:rgba(239,68,68,0.15);color:#ef4444;border:1px solid rgba(239,68,68,0.3);padding:0.4rem 0.85rem;font-size:0.8rem;border-radius:6px;cursor:pointer;">Delete Niche</button>
          </div>
        </div>

        <div class="niche-body-content" style="display: ${isCollapsed ? 'none' : 'block'};">
          <div class="niche-videos-container">
            ${videosHTML || '<div style="color:#64748b;font-size:0.85rem;padding:1rem;text-align:center;">No videos added to this niche yet. Click "+ Add Video" below to add one!</div>'}
          </div>

          <button type="button" class="btn-add-video-to-niche" data-niche="${nicheIdx}" style="width:100%;margin-top:0.5rem;background:rgba(0,85,255,0.12);border:1px dashed rgba(0,210,255,0.4);color:#38bdf8;padding:0.75rem;border-radius:6px;cursor:pointer;font-weight:600;font-size:0.85rem;">
            + Add Video to ${niche.name || 'this Niche'}
          </button>
        </div>
      `;

      listEl.appendChild(nicheBlock);
    });

    // Input Sync Listeners
    listEl.querySelectorAll('.niche-name-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const newName = e.target.value;
        if (configData.portfolio.niches[nIdx]) {
          configData.portfolio.niches[nIdx].name = newName;
          configData.portfolio.niches[nIdx].slug = newName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
          const btn = input.closest('.niche-block-card').querySelector('.btn-add-video-to-niche');
          if (btn) btn.textContent = `+ Add Video to ${newName || 'this Niche'}`;
        }
      });
    });

    listEl.querySelectorAll('.vid-title-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].title = e.target.value;
        }
      });
    });

    listEl.querySelectorAll('.vid-aspect-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].aspectRatio = e.target.value;
          renderNicheManager();
        }
      });
    });

    listEl.querySelectorAll('.vid-url-input').forEach(input => {
      const handleUrlUpdate = (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].videoUrl = e.target.value;
          configData.portfolio.niches[nIdx].videos[vIdx].path = e.target.value;
          
          // Auto-select first extracted frame if available
          const opts = getThumbnailOptions(e.target.value);
          if (opts && opts.length > 0) {
            configData.portfolio.niches[nIdx].videos[vIdx].thumbnail = opts[0].url;
          }
          renderNicheManager();
        }
      };

      input.addEventListener('change', handleUrlUpdate);
      input.addEventListener('input', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].videoUrl = e.target.value;
          configData.portfolio.niches[nIdx].videos[vIdx].path = e.target.value;
        }
      });
    });

    // Frame Card Click Handler
    listEl.querySelectorAll('.thumb-frame-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const targetCard = e.currentTarget;
        const nIdx = parseInt(targetCard.getAttribute('data-niche'));
        const vIdx = parseInt(targetCard.getAttribute('data-video'));
        const thumbUrl = targetCard.getAttribute('data-thumb');

        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].thumbnail = thumbUrl;
          
          // Update active border highlight
          const parentGrid = targetCard.parentElement;
          if (parentGrid) {
            parentGrid.querySelectorAll('.thumb-frame-card').forEach(c => {
              c.style.border = '1px solid rgba(255,255,255,0.15)';
              c.style.boxShadow = 'none';
              const span = c.querySelector('span');
              if (span) {
                span.style.color = '#94a3b8';
                span.style.fontWeight = 'normal';
              }
            });
          }

          targetCard.style.border = '2px solid #0055ff';
          targetCard.style.boxShadow = '0 0 12px rgba(0,85,255,0.5)';
          const activeSpan = targetCard.querySelector('span');
          if (activeSpan) {
            activeSpan.style.color = '#38bdf8';
            activeSpan.style.fontWeight = 'bold';
          }

          // Update Aspect Ratio Card Preview
          const previewCard = targetCard.closest('.niche-video-card').querySelector('div[style*="aspect-ratio"]');
          if (previewCard) {
            previewCard.innerHTML = `<img src="${thumbUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x533/0b1528/38bdf8?text=Reel+Cover';">`;
          }
        }
      });
    });

    listEl.querySelectorAll('.vid-custom-thumb-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        const customUrl = e.target.value;
        const formattedThumb = formatThumbnailUrl(customUrl);
        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].thumbnail = formattedThumb;
          const previewCard = e.target.closest('.niche-video-card').querySelector('div[style*="aspect-ratio"]');
          if (previewCard) {
            previewCard.innerHTML = `<img src="${formattedThumb}" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover;" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x533/0b1528/38bdf8?text=Video+Cover';">`;
          }
        }
      });
    });

    listEl.querySelectorAll('.vid-embedcode-input').forEach(textarea => {
      textarea.addEventListener('input', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].embedCode = e.target.value;
        }
      });
    });

    listEl.querySelectorAll('.vid-desc-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        if (configData.portfolio.niches[nIdx] && configData.portfolio.niches[nIdx].videos[vIdx]) {
          configData.portfolio.niches[nIdx].videos[vIdx].description = e.target.value;
        }
      });
    });

    // Toggle Collapse / Expand Listeners
    listEl.querySelectorAll('.btn-toggle-niche-collapse, .btn-toggle-niche-collapse-text').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nIdx = parseInt(e.currentTarget.getAttribute('data-niche'));
        if (configData.portfolio.niches[nIdx]) {
          configData.portfolio.niches[nIdx].collapsed = !configData.portfolio.niches[nIdx].collapsed;
          renderNicheManager();
        }
      });
    });

    // Delete Niche
    listEl.querySelectorAll('.btn-delete-niche').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        configData.portfolio.niches.splice(nIdx, 1);
        renderNicheManager();
      });
    });

    // Add Video to Niche
    listEl.querySelectorAll('.btn-add-video-to-niche').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        if (!configData.portfolio.niches[nIdx].videos) configData.portfolio.niches[nIdx].videos = [];
        
        configData.portfolio.niches[nIdx].videos.push({
          id: Date.now(),
          title: 'New Video Project',
          aspectRatio: '9:16',
          videoUrl: '/videos/portfolio_video_1.mp4',
          path: '/videos/portfolio_video_1.mp4',
          description: ''
        });

        renderNicheManager();
      });
    });

    // Delete Video
    listEl.querySelectorAll('.btn-delete-video').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const nIdx = parseInt(e.target.getAttribute('data-niche'));
        const vIdx = parseInt(e.target.getAttribute('data-video'));
        configData.portfolio.niches[nIdx].videos.splice(vIdx, 1);
        renderNicheManager();
      });
    });
  }

  // Add Niche Button Listener
  const btnAddNiche = document.getElementById('btnAddNiche');
  if (btnAddNiche) {
    btnAddNiche.addEventListener('click', () => {
      if (!configData || !configData.portfolio) return;
      if (!configData.portfolio.niches) configData.portfolio.niches = [];

      const newName = 'New Niche';
      const newSlug = `niche-${Date.now().toString().slice(-4)}`;
      configData.portfolio.niches.push({
        id: newSlug,
        name: newName,
        slug: newSlug,
        videos: [
          {
            id: Date.now(),
            title: 'Sample Video Project',
            aspectRatio: '9:16',
            videoUrl: '/videos/portfolio_video_1.mp4',
            path: '/videos/portfolio_video_1.mp4',
            description: ''
          }
        ]
      });

      renderNicheManager();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  // Global Collapse / Expand All Niches Listeners
  const btnCollapseAllNiches = document.getElementById('btnCollapseAllNiches');
  const btnExpandAllNiches = document.getElementById('btnExpandAllNiches');

  if (btnCollapseAllNiches) {
    btnCollapseAllNiches.addEventListener('click', () => {
      if (configData && configData.portfolio && configData.portfolio.niches) {
        configData.portfolio.niches.forEach(n => n.collapsed = true);
        renderNicheManager();
      }
    });
  }

  if (btnExpandAllNiches) {
    btnExpandAllNiches.addEventListener('click', () => {
      if (configData && configData.portfolio && configData.portfolio.niches) {
        configData.portfolio.niches.forEach(n => n.collapsed = false);
        renderNicheManager();
      }
    });
  }

  /* ------------------------------------------------------------------------
     5. SAVE ALL MASTER CHANGES CLICK ACTION
     ------------------------------------------------------------------------ */
  if (btnSaveMaster) {
    btnSaveMaster.addEventListener('click', async () => {
      if (!configData) {
        showToast("Error: No config data loaded to update!", "error");
        return;
      }

      const updatedConfig = { ...configData };

      // A. Theme settings
      updatedConfig.theme.backgroundColor = document.getElementById('colorBg').value;
      updatedConfig.theme.accentBlue = document.getElementById('colorAccent').value;
      updatedConfig.theme.accentCyan = document.getElementById('colorCyan').value;

      // B. Brand name
      updatedConfig.brandName = document.getElementById('inputBrandName').value;

      // C. Hero Copy
      updatedConfig.hero.title = document.getElementById('inputHeroTitle').value;
      updatedConfig.hero.subtitle = document.getElementById('inputHeroSubtitle').value;
      updatedConfig.hero.viewPortfolioText = document.getElementById('inputBtnPortfolio').value;
      updatedConfig.hero.bookCallText = document.getElementById('inputBtnCall').value;

      // C2. About Us & Sub-block Titles
      if (!updatedConfig.aboutUs) updatedConfig.aboutUs = {};
      const inputAboutTitle = document.getElementById('inputAboutTitle');
      const inputAboutPara1 = document.getElementById('inputAboutPara1');
      const inputAboutPara2 = document.getElementById('inputAboutPara2');
      if (inputAboutTitle) updatedConfig.aboutUs.title = inputAboutTitle.value;
      if (inputAboutPara1) updatedConfig.aboutUs.para1 = inputAboutPara1.value;
      if (inputAboutPara2) updatedConfig.aboutUs.para2 = inputAboutPara2.value;

      const inputHowWeWorkTitle = document.getElementById('inputHowWeWorkTitle');
      if (inputHowWeWorkTitle && updatedConfig.howWeWork) {
        updatedConfig.howWeWork.title = inputHowWeWorkTitle.value;
      }

      const inputWhatWeDoTitle = document.getElementById('inputWhatWeDoTitle');
      if (inputWhatWeDoTitle && updatedConfig.whatWeDo) {
        updatedConfig.whatWeDo.title = inputWhatWeDoTitle.value;
      }

      // D. Hero Gallery Slots
      const pathInputs = document.querySelectorAll('.hero-media-path');
      
      updatedConfig.hero.gallery = Array.from(pathInputs).map((input, idx) => {
        return {
          type: "video",
          path: input.value
        };
      });

      // E. Workflow Steps
      const stepNames = document.querySelectorAll('.step-input-name');
      const stepIcons = document.querySelectorAll('.step-input-icon');
      const stepDescs = document.querySelectorAll('.step-input-desc');
      
      updatedConfig.howWeWork.steps = Array.from(stepNames).map((input, idx) => {
        return {
          id: idx + 1,
          name: input.value,
          icon: stepIcons[idx].value,
          desc: stepDescs[idx].value
        };
      });

      // F. Services Cards
      const servTitles = document.querySelectorAll('.serv-input-title');
      const servIcons = document.querySelectorAll('.serv-input-icon');
      const servDescs = document.querySelectorAll('.serv-input-desc');
      
      updatedConfig.whatWeDo.services = Array.from(servTitles).map((input, idx) => {
        return {
          id: idx + 1,
          title: input.value,
          icon: servIcons[idx].value,
          desc: servDescs[idx].value
        };
      });

      // G. Contact Fields
      updatedConfig.contact.phone = document.getElementById('inputContactPhone').value;
      updatedConfig.contact.email = document.getElementById('inputContactEmail').value;
      updatedConfig.contact.instagram = document.getElementById('inputContactInstagram').value;
      updatedConfig.contact.instagramUrl = document.getElementById('inputContactInstagramUrl').value;
      updatedConfig.contact.linkedin = document.getElementById('inputContactLinkedin').value;
      updatedConfig.contact.linkedinUrl = document.getElementById('inputContactLinkedinUrl').value;

      // H. Portfolio Niches & Nested Videos
      updatedConfig.portfolio.niches = (configData.portfolio.niches || []).map((niche, nIdx) => {
        const slugVal = niche.name ? niche.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : `niche-${nIdx + 1}`;
        return {
          id: slugVal,
          name: niche.name || `Niche ${nIdx + 1}`,
          slug: slugVal,
          videos: (niche.videos || []).map((vid, vIdx) => ({
            id: vid.id || (vIdx + 1),
            title: vid.title || 'Untitled Video',
            aspectRatio: vid.aspectRatio || '9:16',
            videoUrl: vid.videoUrl || vid.path || '',
            path: vid.path || vid.videoUrl || '',
            embedCode: vid.embedCode || '',
            thumbnail: vid.thumbnail || '',
            description: vid.description || ''
          }))
        };
      });

      // Send POST request to dev server API
      try {
        const response = await fetch('/api/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedConfig)
        });

        const result = await response.json();
        
        if (result.success) {
          showToast("All changes saved successfully!", "success");
          configData = updatedConfig;
        } else {
          showToast(`Error saving configuration: ${result.error}`, "error");
        }
      } catch (err) {
        showToast("Error connecting to editor server API!", "error");
        console.error(err);
      }
    });
  }

  /* ------------------------------------------------------------------------
     6. TOAST ALERT HELPER
     ------------------------------------------------------------------------ */
  function showToast(message, type = "success") {
    if (!toastAlert || !toastAlertText) return;
    toastAlertText.textContent = message;
    
    toastAlert.className = 'toast-alert';
    
    if (type === "success") {
      toastAlert.classList.add('toast-success');
    } else {
      toastAlert.classList.add('toast-error');
    }
    
    toastAlert.classList.add('show');
    
    setTimeout(() => {
      toastAlert.classList.remove('show');
    }, 4000);
  }

  /* ------------------------------------------------------------------------
     7. DEVICE FRAME PREVIEW SWITCHER LOGIC
     ------------------------------------------------------------------------ */
  const deviceSwitchBtns = document.querySelectorAll('.device-switch-btn');
  const deviceFrameWrapper = document.getElementById('deviceFrameWrapper');
  const deviceScreenBadge = document.getElementById('deviceScreenBadge');
  const devicePreviewIframe = document.getElementById('devicePreviewIframe');
  const btnRotateDevice = document.getElementById('btnRotateDevice');
  const btnRefreshDeviceIframe = document.getElementById('btnRefreshDeviceIframe');

  let currentDevice = 'desktop';
  let isLandscape = false;

  const updateDeviceFrame = () => {
    if (!deviceFrameWrapper || !deviceScreenBadge) return;

    if (currentDevice === 'desktop') {
      deviceFrameWrapper.style.width = '100%';
      deviceFrameWrapper.style.height = '680px';
      deviceFrameWrapper.style.border = 'none';
      deviceFrameWrapper.style.borderRadius = '8px';
      deviceScreenBadge.textContent = '💻 Desktop View (100% Responsive)';
    } else if (currentDevice === 'tablet') {
      const w = isLandscape ? '1024px' : '768px';
      const h = isLandscape ? '768px' : '960px';
      deviceFrameWrapper.style.width = w;
      deviceFrameWrapper.style.height = h;
      deviceFrameWrapper.style.border = '14px solid #1e293b';
      deviceFrameWrapper.style.borderRadius = '32px';
      deviceScreenBadge.textContent = `📱 Tablet iPad View (${w} x ${h} ${isLandscape ? 'Landscape' : 'Portrait'})`;
    } else if (currentDevice === 'mobile') {
      const w = isLandscape ? '667px' : '375px';
      const h = isLandscape ? '375px' : '667px';
      deviceFrameWrapper.style.width = w;
      deviceFrameWrapper.style.height = h;
      deviceFrameWrapper.style.border = '12px solid #1e293b';
      deviceFrameWrapper.style.borderRadius = '36px';
      deviceScreenBadge.textContent = `📱 Mobile iPhone View (${w} x ${h} ${isLandscape ? 'Landscape' : 'Portrait'})`;
    }
  };

  deviceSwitchBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceSwitchBtns.forEach(b => {
        b.style.background = 'rgba(255,255,255,0.05)';
        b.style.color = '#94a3b8';
        b.style.borderColor = 'rgba(255,255,255,0.1)';
        b.classList.remove('active');
      });

      btn.style.background = 'rgba(0,85,255,0.3)';
      btn.style.color = '#38bdf8';
      btn.style.borderColor = 'rgba(0,210,255,0.4)';
      btn.classList.add('active');

      currentDevice = btn.getAttribute('data-device');
      isLandscape = false;
      updateDeviceFrame();
    });
  });

  if (btnRotateDevice) {
    btnRotateDevice.addEventListener('click', () => {
      if (currentDevice === 'desktop') return;
      isLandscape = !isLandscape;
      updateDeviceFrame();
    });
  }

  if (btnRefreshDeviceIframe && devicePreviewIframe) {
    btnRefreshDeviceIframe.addEventListener('click', () => {
      const src = devicePreviewIframe.src;
      devicePreviewIframe.src = '';
      setTimeout(() => {
        devicePreviewIframe.src = src;
      }, 50);
    });
  }
};

// Robust Init Guard: executes immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
