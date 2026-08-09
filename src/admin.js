import { getVideoEmbedInfo } from './utils/videoHelpers.js';

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
      res = await fetch('/data.json');
    } catch (e) {
      res = await fetch('/src/data.json');
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

    // F. Portfolio slide items list
    renderPortfolioList();
  }

  /* ------------------------------------------------------------------------
     4. PORTFOLIO SLIDES RENDER & LIST ACTIONS (ADD/DELETE)
     ------------------------------------------------------------------------ */
  function renderPortfolioList() {
    const editor = document.getElementById('portfolioListEditor');
    if (!editor || !configData || !configData.portfolio || !configData.portfolio.items) return;

    editor.innerHTML = '';
    
    configData.portfolio.items.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'portfolio-item-card';
      card.style.cssText = 'position:relative;background:rgba(5,11,20,0.95);border:1px solid rgba(0,85,255,0.2);border-radius:10px;padding:1.25rem;margin-bottom:1.25rem;';
      
      const aspect = item.aspectRatio || '9:16';
      const aspectStyle = aspect === '16:9' ? 'aspect-ratio:16/9;max-width:280px;' : aspect === '1:1' ? 'aspect-ratio:1/1;max-width:200px;' : 'aspect-ratio:9/16;max-width:180px;';

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <div class="media-card-title" style="font-weight:700;color:#38bdf8;font-size:1.05rem;">
            Project #${index + 1}: ${item.title || 'Untitled Video'}
          </div>
          <button type="button" class="item-delete-btn" data-index="${index}" style="position:static;">Delete Project</button>
        </div>
        
        <div style="display:grid;grid-template-columns: 200px 1fr;gap:1.5rem;align-items:start;">
          <!-- Aspect Ratio Thumbnail Preview -->
          <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:center;">
            <div class="port-preview-box" style="${aspectStyle}width:100%;background:#020617;border-radius:8px;overflow:hidden;border:1px solid rgba(0,210,255,0.3);position:relative;display:flex;align-items:center;justify-content:center;">
              ${item.path && item.path.endsWith('.mp4') 
                ? `<video src="${item.path}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;"></video>`
                : item.path 
                  ? `<img src="${item.path}" style="width:100%;height:100%;object-fit:cover;">`
                  : `<div style="color:#64748b;font-size:0.8rem;text-align:center;padding:0.5rem;">▶ ${aspect} Preview</div>`
              }
            </div>
            <span style="font-size:0.75rem;color:#38bdf8;font-weight:bold;">${aspect} Ratio Preview</span>
          </div>

          <!-- Form Fields -->
          <div>
            <div class="form-row">
              <div class="form-group">
                <label>Project Title / Name</label>
                <input type="text" class="port-item-title" data-index="${index}" value="${item.title || ''}" placeholder="e.g. Luxury Sedan Campaign">
              </div>
              <div class="form-group">
                <label>Aspect Ratio</label>
                <select class="port-item-aspect" data-index="${index}">
                  <option value="9:16" ${aspect === '9:16' ? 'selected' : ''}>📱 9:16 (Vertical / Reels / Shorts)</option>
                  <option value="16:9" ${aspect === '16:9' ? 'selected' : ''}>🎬 16:9 (Horizontal / YouTube)</option>
                  <option value="1:1" ${aspect === '1:1' ? 'selected' : ''}>🟦 1:1 (Square)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>📹 Video Link / Embed URL (YouTube, Instagram Reel, Google Drive, MP4)</label>
              <input type="text" class="port-item-videourl" data-index="${index}" value="${item.videoUrl || ''}" placeholder="Paste YouTube, Instagram Reel, Google Drive, or MP4 link">
              <span style="font-size:0.72rem;color:#94a3b8;margin-top:0.25rem;display:block;">
                Supports: <strong style="color:#f8fafc;">https://youtu.be/...</strong>, <strong style="color:#f8fafc;">https://instagram.com/reel/...</strong>, <strong style="color:#f8fafc;">https://drive.google.com/file/d/...</strong>, or <strong style="color:#f8fafc;">/assets/video.mp4</strong>
              </span>
            </div>

            <div class="form-row" style="margin-bottom:0;">
              <div class="form-group" style="margin-bottom:0;">
                <label>Custom Thumbnail Image / Poster Path (Optional)</label>
                <input type="text" class="port-item-path" data-index="${index}" value="${item.path || ''}" placeholder="Auto-detected if empty, or paste image URL / /assets/thumb.jpg">
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label>Alt Description</label>
                <input type="text" class="port-item-alt" data-index="${index}" value="${item.alt || ''}" placeholder="Description of the video">
              </div>
            </div>
          </div>
        </div>
      `;
      editor.appendChild(card);
    });

    // Bind portfolio delete click listeners
    const deleteBtns = editor.querySelectorAll('.item-delete-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idxToDelete = parseInt(e.target.getAttribute('data-index'));
        configData.portfolio.items.splice(idxToDelete, 1);
        renderPortfolioList();
      });
    });
  }

  // Add Portfolio Button Listener
  const btnAddPortfolio = document.getElementById('btnAddPortfolio');
  if (btnAddPortfolio) {
    btnAddPortfolio.addEventListener('click', () => {
      if (!configData || !configData.portfolio || !configData.portfolio.items) return;
      
      const newId = configData.portfolio.items.length > 0 
        ? Math.max(...configData.portfolio.items.map(i => i.id)) + 1 
        : 1;

      configData.portfolio.items.push({
        id: newId,
        title: 'New Video Project',
        aspectRatio: '9:16',
        videoUrl: 'https://www.youtube.com/watch?v=KRMCZwYmcuI',
        path: '',
        alt: 'New video work'
      });

      renderPortfolioList();
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
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

      // H. Portfolio Items List
      const portTitles = document.querySelectorAll('.port-item-title');
      const portAspects = document.querySelectorAll('.port-item-aspect');
      const portVideoUrls = document.querySelectorAll('.port-item-videourl');
      const portPaths = document.querySelectorAll('.port-item-path');
      const portAlts = document.querySelectorAll('.port-item-alt');

      updatedConfig.portfolio.items = Array.from(portTitles).map((input, idx) => {
        return {
          id: idx + 1,
          title: input.value || `Project ${idx + 1}`,
          aspectRatio: portAspects[idx] ? portAspects[idx].value : '9:16',
          videoUrl: portVideoUrls[idx] ? portVideoUrls[idx].value : '',
          path: portPaths[idx] ? portPaths[idx].value : '',
          alt: portAlts[idx] ? portAlts[idx].value : ''
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
};

// Robust Init Guard: executes immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAdmin);
} else {
  initAdmin();
}
