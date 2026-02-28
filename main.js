/**
 * Casper Holden Portfolio
 * Vanilla JS: fetch Google Sheets (via Apps Script JSON), render projects, grow effect, panel.
 */

(function () {
  'use strict';

  // SHA-256 hash of the gate password. Default: "preview"
  // To change it, run in the browser console:
  //   crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
  //     .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('')))
  // Then paste the hex string below.
  const PASSWORD_HASH = '5975cf1bba432391c94667f5886225f69377c0aa8b9fa21fddfb21c89bcf9092';
  const STORAGE_KEY = 'portfolio_access';

  // Replace with your Google Apps Script Web App URL after deployment
  const SHEETS_JSON_URL = 'https://script.google.com/macros/s/AKfycbyyKa5N1xOaf3ZCP3Af7lzGhiaxPa-_UebM3U61pMVmHvk6idtqRI5XvbRq3qnsmBoS/exec'; // e.g. 'https://script.google.com/macros/s/xxx/exec'

  const state = {
    showGrid: false,
    showPanel: true,
    growEffect: true,
    growFromRight: false,
    expandedRows: new Set(),
    imageFiveCols: false,
    lockImageRatio: false,
    version: 1, // 1: Fixed, 2: Shifting
    hideEmptyImage: false,
    showDummyContent: true,
    projects: [],
    copy: {},
    colorMode: 'light'
  };

  const dom = {
    gridOverlay: null,
    panel: null,
    projectList: null,
    bio: null,
    headline: null,
    linkLinkedin: null,
    linkMail: null,
    toggleGridBtn: null,
    toggleGrow: null,
    toggleGrowFromRight: null,
    toggleImageFiveCols: null,
    toggleLockImageRatio: null,
    toggleV1: null,
    toggleV2: null,
    toggleHideEmpty: null,
    toggleDummyCopy: null,
    colorModeToggle: null
  };

  const IMAGE_EXTENSIONS = ['jpg', 'png', 'gif', 'webp'];
  const VIDEO_EXTENSIONS = ['mp4', 'webm'];
  const ALL_MEDIA_EXTENSIONS = ['jpg', 'png', 'gif', 'webp', 'mp4', 'webm'];
  const BASE_MEDIA_PATH = 'project';
  const DUMMY_DESCRIPTION = 'Description';
  const DUMMY_DISCIPLINE = '(discipline)';

  function formatDiscipline(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
      .map(s => '(' + s + ')')
      .join(' ');
  }

  function buildDisplayTitle(row) {
    const title = (row.title || '').trim();
    const project = (row.project || '').trim();
    if (title && project) return title + ' ' + project;
    return title || project || '';
  }

  function mapRowToProject(row) {
    const titleMain = (row.title || '').trim();
    const projectSubtitle = (row.project || '').trim();
    const disciplines = formatDiscipline(row.discipline || row.dicipline);
    const linkOut = (row.link_out || '').trim();
    const folderName = (row.folder_name || '').trim();
    const imageVisibility = (row.image_visibility || '').trim().toLowerCase();
    return {
      year: (row.year || '').trim(),
      title: titleMain,
      projectSubtitle: projectSubtitle,
      description: (row.description || '').trim(),
      disciplines,
      linkOut: linkOut || null,
      folderName: folderName && folderName !== 'Yes' ? folderName : null,
      imageVisibility: imageVisibility === 'yes' ? 'yes' : imageVisibility === 'locked' ? 'locked' : 'no'
    };
  }

  function fetchData() {
    if (!SHEETS_JSON_URL) {
      useFallbackData();
      return Promise.resolve();
    }
    return fetch(SHEETS_JSON_URL)
      .then(res => {
        if (!res.ok) throw new Error('Sheets response: ' + res.status);
        return res.json();
      })
      .then(data => {
        const projects = (data.projects || [])
          .filter(row => (row.show || '').toString().toLowerCase() === 'yes')
          .map(mapRowToProject);
        const copy = data.copy || {};
        state.projects = projects;
        state.copy = copy;
        render();
        return data;
      })
      .catch(err => {
        console.warn('Could not load Sheets data:', err);
        useFallbackData();
      });
  }

  function useFallbackData() {
    state.copy = {
      bio: 'Art director and senior designer with 15+ years of experience in interactive experiences, branding and story-driven design. I create thoughtful, emotion-evoking experiences at @hm (Hello Monday), New York, Copenhagen, Aarhus. My speciality is nothing. My dedication and curious approach is everything.',
      headline: 'Casper Holden',
      linkedin: 'linkedin',
      mail: 'mail',
      visit: 'Visit'
    };
    state.projects = [
      {
        year: '2026',
        title: 'Paradigm',
        projectSubtitle: 'Corporate website',
        description: 'Corporate site for crypto-focused investment firm.',
        disciplines: '(concept) (prototyping) (website)',
        linkOut: 'http://paradigm.xyz',
        folderName: 'paradigm',
        imageVisibility: 'yes'
      }
    ];
    render();
  }

  function setCopy() {
    if (dom.bio) dom.bio.textContent = state.copy.bio || '';
    if (dom.headline) dom.headline.textContent = state.copy.headline || 'Casper Holden';
    if (dom.linkLinkedin) {
      dom.linkLinkedin.textContent = state.copy.linkedin || 'linkedin';
      dom.linkLinkedin.href = state.copy.linkedin_url || '#';
    }
    if (dom.linkMail) {
      dom.linkMail.textContent = state.copy.mail || 'mail';
      const mailUrl = (state.copy.mail_url || '').trim();
      dom.linkMail.href = mailUrl.startsWith('mailto:') ? mailUrl : (mailUrl ? 'mailto:' + mailUrl : 'mailto:');
    }
  }

  function trySetImageSrc(wrap, folderName, onAllFailed) {
    if (!folderName) return;
    const base = BASE_MEDIA_PATH + '/' + folderName + '/1.';
    let tried = 0;
    function tryNext() {
      if (tried >= IMAGE_EXTENSIONS.length) {
        if (onAllFailed) onAllFailed();
        return;
      }
      const ext = IMAGE_EXTENSIONS[tried];
      const img = wrap.querySelector('img');
      if (!img) return;
      img.src = base + ext;
      img.onerror = function () {
        tried++;
        tryNext();
      };
      img.onload = function () {
        wrap.dataset.mediaIndex = String(tried);
        wrap.dataset.fileNumber = '1';
      };
    }
    tryNext();
  }

  function trySetMediaFromFolder(wrap, folderName, onAllFailed, imgAlt) {
    if (!folderName) {
      if (onAllFailed) onAllFailed();
      return;
    }
    wrap.dataset.folderName = folderName;
    let img = wrap.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.loading = 'lazy';
      if (imgAlt != null) img.alt = imgAlt;
      wrap.appendChild(img);
    }
    trySetImageSrc(wrap, folderName, function () {
      wrap.removeChild(img);
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('muted', '');
      video.setAttribute('loop', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('playsinline', '');
      wrap.appendChild(video);
      trySetVideoSrc(wrap, folderName, onAllFailed);
    });
  }

  function clearMediaWrap(wrap) {
    const img = wrap.querySelector('img');
    if (img) wrap.removeChild(img);
    const video = wrap.querySelector('video');
    if (video) wrap.removeChild(video);
  }

  /** Shallow copy shuffled (Fisher–Yates). */
  function shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** Try each donor in order until one loads; onAllFailed when none work. Makes dummy media show consistently. */
  function trySetMediaFromDonors(wrap, donorList, onAllFailed, imgAlt) {
    if (!donorList || donorList.length === 0) {
      if (onAllFailed) onAllFailed();
      return;
    }
    const rest = donorList.slice(1);
    trySetMediaFromFolder(wrap, donorList[0].folderName, function () {
      clearMediaWrap(wrap);
      trySetMediaFromDonors(wrap, rest, onAllFailed, imgAlt);
    }, imgAlt);
  }

  function trySetVideoSrc(wrap, folderName, onAllFailed) {
    if (!folderName) return;
    const base = BASE_MEDIA_PATH + '/' + folderName + '/1.';
    const video = wrap.querySelector('video');
    if (!video) return;
    let tried = 0;
    function tryNext() {
      if (tried >= VIDEO_EXTENSIONS.length) {
        if (onAllFailed) onAllFailed();
        return;
      }
      const ext = VIDEO_EXTENSIONS[tried];
      let source = video.querySelector('source');
      if (!source) {
        source = document.createElement('source');
        video.appendChild(source);
      }
      source.src = base + ext;
      source.type = 'video/' + (ext === 'mp4' ? 'mp4' : 'webm');
      const onError = function () {
        video.onerror = null;
        if (source) source.onerror = null;
        tried++;
        tryNext();
      };
      video.onerror = onError;
      source.onerror = onError;
      video.oncanplay = function () {
        video.oncanplay = null;
        wrap.dataset.mediaIndex = String(4 + tried);
        wrap.dataset.fileNumber = '1';
        video.play().catch(function () {});
      };
      video.load();
    }
    tryNext();
  }

  /** Try to show media at index (0–3 image, 4–5 video). onSuccess when loaded, onAllFailed when all 6 tried. */
  function trySetMediaAtIndex(wrap, folderName, index, imgAlt, onSuccess, onAllFailed) {
    if (!folderName) {
      if (onAllFailed) onAllFailed();
      return;
    }
    const base = BASE_MEDIA_PATH + '/' + folderName + '/1.';
    const total = ALL_MEDIA_EXTENSIONS.length;
    let tried = 0;

    function tryNext() {
      if (tried >= total) {
        if (onAllFailed) onAllFailed();
        return;
      }
      const idx = (index + tried) % total;
      tried++;

      if (idx < 4) {
        clearMediaWrap(wrap);
        const img = document.createElement('img');
        img.loading = 'lazy';
        if (imgAlt != null) img.alt = imgAlt;
        wrap.appendChild(img);
        img.src = base + IMAGE_EXTENSIONS[idx];
        img.onerror = tryNext;
        img.onload = function () {
          wrap.dataset.mediaIndex = String(idx);
          if (onSuccess) onSuccess();
        };
      } else {
        clearMediaWrap(wrap);
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('loop', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        const ext = VIDEO_EXTENSIONS[idx - 4];
        const source = document.createElement('source');
        source.src = base + ext;
        source.type = 'video/' + (ext === 'mp4' ? 'mp4' : 'webm');
        video.appendChild(source);
        wrap.appendChild(video);
        video.onerror = tryNext;
        video.oncanplay = function () {
          video.oncanplay = null;
          wrap.dataset.mediaIndex = String(idx);
          video.play().catch(function () {});
          if (onSuccess) onSuccess();
        };
        video.load();
      }
    }
    tryNext();
  }

  /** Load a specific file number from a project folder, trying all extensions. */
  function loadFileByNumber(wrap, folderName, fileNum, imgAlt, onSuccess, onAllFailed) {
    if (!folderName) { if (onAllFailed) onAllFailed(); return; }
    var base = BASE_MEDIA_PATH + '/' + folderName + '/' + fileNum + '.';
    var tried = 0;
    function tryNext() {
      if (tried >= ALL_MEDIA_EXTENSIONS.length) { if (onAllFailed) onAllFailed(); return; }
      var ext = ALL_MEDIA_EXTENSIONS[tried];
      tried++;
      if (VIDEO_EXTENSIONS.indexOf(ext) === -1) {
        clearMediaWrap(wrap);
        var img = document.createElement('img');
        if (imgAlt != null) img.alt = imgAlt;
        wrap.appendChild(img);
        img.src = base + ext;
        img.onerror = tryNext;
        img.onload = function () {
          wrap.dataset.fileNumber = String(fileNum);
          if (onSuccess) onSuccess();
        };
      } else {
        clearMediaWrap(wrap);
        var video = document.createElement('video');
        video.muted = true; video.loop = true; video.autoplay = true; video.playsInline = true;
        video.setAttribute('muted', ''); video.setAttribute('loop', '');
        video.setAttribute('autoplay', ''); video.setAttribute('playsinline', '');
        var source = document.createElement('source');
        source.src = base + ext;
        source.type = 'video/' + (ext === 'mp4' ? 'mp4' : 'webm');
        video.appendChild(source);
        wrap.appendChild(video);
        var onErr = function () { video.onerror = null; source.onerror = null; tryNext(); };
        video.onerror = onErr;
        source.onerror = onErr;
        video.oncanplay = function () {
          video.oncanplay = null;
          wrap.dataset.fileNumber = String(fileNum);
          video.play().catch(function () {});
          if (onSuccess) onSuccess();
        };
        video.load();
      }
    }
    tryNext();
  }

  /** Cycle to next file in the project folder on click. */
  function cycleMediaInWrap(wrap) {
    var folderName = wrap.dataset.folderName;
    if (!folderName) return;
    var current = parseInt(wrap.dataset.fileNumber || '1', 10);
    var next = current + 1;
    var alt = (wrap.querySelector('img') || {}).alt || '';
    loadFileByNumber(wrap, folderName, next, alt || undefined, function () {}, function () {
      if (next > 1) {
        loadFileByNumber(wrap, folderName, 1, alt || undefined, function () {}, function () {});
      }
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function buildTitleHtml(project, visitLabel) {
    const label = visitLabel || 'Visit';
    let line1 = escapeHtml(project.title);
    if (project.linkOut) {
      line1 += ' (<a href="' + escapeHtml(project.linkOut) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(label) + '</a>)';
    }
    const line2 = (project.projectSubtitle || '').trim();
    return line2 ? line1 + ' ' + escapeHtml(line2) : line1;
  }

  function createProjectRow(project, visitLabel, rowIndex) {
    const row = document.createElement('article');
    row.className = 'project-row';
    row.dataset.rowIndex = String(rowIndex);
    row.style.setProperty('--grow-progress', state.growEffect ? '1' : '0');

    const inner = document.createElement('div');
    inner.className = 'project-row-inner';

    const yearEl = document.createElement('p');
    yearEl.className = 'project-year';
    yearEl.textContent = project.year;

    const donors = state.projects.filter(p => p.folderName && p.imageVisibility === 'yes');
    const hasImageFolder = project.folderName && project.imageVisibility === 'yes';
    const hasDummyImage = state.showDummyContent && donors.length > 0 && !hasImageFolder && project.imageVisibility !== 'locked';
    const shouldHideEmpty = state.hideEmptyImage && !hasDummyImage && (!project.folderName || project.imageVisibility === 'no' || project.imageVisibility === 'locked');

    const imageWrap = document.createElement('div');
    imageWrap.className = 'project-image-wrap';
    imageWrap.setAttribute('role', 'button');
    imageWrap.setAttribute('tabindex', '0');
    imageWrap.setAttribute('aria-label', 'Expand or collapse image; click to cycle through media');

    if (project.imageVisibility === 'locked') {
      imageWrap.classList.add('is-locked');
      imageWrap.textContent = 'Locked';
    } else if (hasImageFolder) {
      imageWrap.dataset.folderName = project.folderName;
      const img = document.createElement('img');
      img.alt = project.title + (project.projectSubtitle ? ' ' + project.projectSubtitle : '');
      img.loading = 'lazy';
      imageWrap.appendChild(img);
      trySetImageSrc(imageWrap, project.folderName, function () {
        // No image found, try video from this folder
        imageWrap.removeChild(img);
        const video = document.createElement('video');
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        video.setAttribute('muted', '');
        video.setAttribute('loop', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        imageWrap.appendChild(video);
        trySetVideoSrc(imageWrap, project.folderName, function () {
          // No video either – try each donor until one loads, or hide
          imageWrap.removeChild(video);
          const otherDonors = donors.filter(p => p.folderName !== project.folderName);
          if (state.showDummyContent && otherDonors.length > 0) {
            trySetMediaFromDonors(imageWrap, shuffle(otherDonors), function () {
              clearMediaWrap(imageWrap);
              if (state.hideEmptyImage) row.classList.add('row-hide-image');
            }, project.title + (project.projectSubtitle ? ' ' + project.projectSubtitle : ''));
          } else if (state.hideEmptyImage) {
            row.classList.add('row-hide-image');
          }
        });
      });
    } else if (state.showDummyContent && donors.length > 0) {
      const img = document.createElement('img');
      img.alt = project.title + (project.projectSubtitle ? ' ' + project.projectSubtitle : '');
      img.loading = 'lazy';
      imageWrap.appendChild(img);
      trySetMediaFromDonors(imageWrap, shuffle(donors), function () {
        clearMediaWrap(imageWrap);
      });
    }

    if (shouldHideEmpty) row.classList.add('row-hide-image');

    if (!row.classList.contains('row-hide-image') && !imageWrap.classList.contains('is-locked') && (hasImageFolder || (state.showDummyContent && donors.length > 0))) {
      imageWrap.addEventListener('click', function () {
        if (imageWrap.dataset.folderName) {
          cycleMediaInWrap(imageWrap);
        }
        if (!state.growEffect) {
          const idx = parseInt(row.dataset.rowIndex, 10);
          if (state.expandedRows.has(idx)) state.expandedRows.delete(idx);
          else state.expandedRows.add(idx);
          updateGrowProgress();
        }
      });
      imageWrap.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (imageWrap.dataset.folderName) {
            cycleMediaInWrap(imageWrap);
          }
          if (!state.growEffect) {
            const idx = parseInt(row.dataset.rowIndex, 10);
            if (state.expandedRows.has(idx)) state.expandedRows.delete(idx);
            else state.expandedRows.add(idx);
            updateGrowProgress();
          }
        }
      });
    }

    const titleCell = document.createElement('div');
    titleCell.className = 'project-title-cell';
    const titleLine = document.createElement('p');
    titleLine.className = 'project-title-line';
    titleLine.innerHTML = buildTitleHtml(project, visitLabel);
    titleCell.appendChild(titleLine);

    const descEl = document.createElement('p');
    descEl.className = 'project-desc';
    descEl.textContent = (project.description || (state.showDummyContent ? DUMMY_DESCRIPTION : '')).trim();

    const discEl = document.createElement('p');
    discEl.className = 'project-disciplines';
    discEl.textContent = (project.disciplines || (state.showDummyContent ? DUMMY_DISCIPLINE : '')).trim();

    const imageTitleWrap = document.createElement('div');
    imageTitleWrap.className = 'project-image-title-wrap';
    imageTitleWrap.appendChild(imageWrap);
    imageTitleWrap.appendChild(titleCell);

    inner.appendChild(yearEl);
    inner.appendChild(imageTitleWrap);
    inner.appendChild(descEl);
    inner.appendChild(discEl);
    row.appendChild(inner);
    return row;
  }

  function render() {
    if (dom.bio) dom.bio.textContent = state.copy.bio || '';
    if (dom.headline) dom.headline.textContent = state.copy.headline || 'Casper Holden';
    if (dom.linkLinkedin) {
      dom.linkLinkedin.textContent = state.copy.linkedin || 'linkedin';
      dom.linkLinkedin.href = state.copy.linkedin_url || '#';
    }
    if (dom.linkMail) {
      dom.linkMail.textContent = state.copy.mail || 'mail';
      const mailUrl = (state.copy.mail_url || '').trim();
      dom.linkMail.href = mailUrl.startsWith('mailto:') ? mailUrl : (mailUrl ? 'mailto:' + mailUrl : 'mailto:');
    }

    if (!dom.projectList) return;
    dom.projectList.innerHTML = '';
    state.expandedRows.clear();
    const visitLabel = state.copy.visit || 'Visit';
    state.projects.forEach((p, i) => {
      dom.projectList.appendChild(createProjectRow(p, visitLabel, i));
    });
    observeGrow();
  }

  function updateGrowProgress() {
    const vh = window.innerHeight;
    const triggerStart = vh - 4;
    const triggerEnd = vh / 2;
    const rows = document.querySelectorAll('.project-row');
    rows.forEach(row => {
      if (row.classList.contains('row-hide-image')) {
        row.style.setProperty('--grow-progress', '1');
        return;
      }
      const index = parseInt(row.dataset.rowIndex, 10);
      let progress;
      if (state.growEffect) {
        const rect = row.getBoundingClientRect();
        const rowCenter = rect.top + rect.height / 2;
        if (rowCenter <= triggerEnd) progress = 1;
        else if (rowCenter >= triggerStart) progress = 0;
        else progress = 1 - (rowCenter - triggerEnd) / (triggerStart - triggerEnd);
      } else {
        progress = state.expandedRows.has(index) ? 1 : 0;
      }
      row.style.setProperty('--grow-progress', String(progress));
    });
  }

  function observeGrow() {
    updateGrowProgress();
    const io = new IntersectionObserver(
      () => updateGrowProgress(),
      { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '0px' }
    );
    document.querySelectorAll('.project-row').forEach(el => io.observe(el));
  }

  function onScroll() {
    updateGrowProgress();
  }

  function bindPanel() {
    if (dom.toggleGrow) {
      dom.toggleGrow.addEventListener('click', function () {
        state.growEffect = !state.growEffect;
        dom.toggleGrow.setAttribute('aria-pressed', state.growEffect);
        dom.toggleGrow.textContent = (state.growEffect ? '[x]' : '[ ]') + ' Grow Effect';
        updateGrowProgress();
      });
    }
    if (dom.toggleGrowFromRight) {
      dom.toggleGrowFromRight.addEventListener('click', function () {
        state.growFromRight = !state.growFromRight;
        document.body.classList.toggle('grow-from-right', state.growFromRight);
        dom.toggleGrowFromRight.setAttribute('aria-pressed', state.growFromRight);
        dom.toggleGrowFromRight.textContent = (state.growFromRight ? '[x]' : '[ ]') + ' Grow from right';
      });
    }
    if (dom.toggleImageFiveCols) {
      dom.toggleImageFiveCols.addEventListener('click', function () {
        state.imageFiveCols = !state.imageFiveCols;
        document.body.classList.toggle('image-five-cols', state.imageFiveCols);
        dom.toggleImageFiveCols.setAttribute('aria-pressed', state.imageFiveCols);
        dom.toggleImageFiveCols.textContent = (state.imageFiveCols ? '[x]' : '[ ]') + ' 5-col image';
      });
    }
    if (dom.toggleLockImageRatio) {
      dom.toggleLockImageRatio.addEventListener('click', function () {
        state.lockImageRatio = !state.lockImageRatio;
        document.body.classList.toggle('lock-image-ratio', state.lockImageRatio);
        dom.toggleLockImageRatio.setAttribute('aria-pressed', state.lockImageRatio);
        dom.toggleLockImageRatio.textContent = (state.lockImageRatio ? '[x]' : '[ ]') + ' Lock image ratio';
      });
    }
    if (dom.toggleV1) {
      dom.toggleV1.addEventListener('click', function () {
        state.version = 1;
        document.body.classList.remove('version-shift');
        dom.toggleV1.setAttribute('aria-pressed', 'true');
        dom.toggleV1.textContent = '[x] Ver 1: Fixed';
        if (dom.toggleV2) {
          dom.toggleV2.setAttribute('aria-pressed', 'false');
          dom.toggleV2.textContent = '[ ] Ver 2: Shift';
        }
      });
    }
    if (dom.toggleV2) {
      dom.toggleV2.addEventListener('click', function () {
        state.version = 2;
        document.body.classList.add('version-shift');
        dom.toggleV2.setAttribute('aria-pressed', 'true');
        dom.toggleV2.textContent = '[x] Ver 2: Shift';
        if (dom.toggleV1) {
          dom.toggleV1.setAttribute('aria-pressed', 'false');
          dom.toggleV1.textContent = '[ ] Ver 1: Fixed';
        }
      });
    }
    if (dom.toggleHideEmpty) {
      dom.toggleHideEmpty.addEventListener('click', function () {
        state.hideEmptyImage = !state.hideEmptyImage;
        dom.toggleHideEmpty.setAttribute('aria-pressed', state.hideEmptyImage);
        dom.toggleHideEmpty.textContent = (state.hideEmptyImage ? '[x]' : '[ ]') + ' Hide empty image';
        render();
      });
    }
    if (dom.toggleDummyCopy) {
      dom.toggleDummyCopy.addEventListener('click', function () {
        state.showDummyContent = !state.showDummyContent;
        dom.toggleDummyCopy.setAttribute('aria-pressed', state.showDummyContent);
        dom.toggleDummyCopy.textContent = (state.showDummyContent ? '[x]' : '[ ]') + ' Dummy content';
        render();
      });
    }
  }

  function toggleGrid() {
    state.showGrid = !state.showGrid;
    dom.gridOverlay.classList.toggle('is-visible', state.showGrid);
    if (dom.toggleGridBtn) {
      dom.toggleGridBtn.setAttribute('aria-pressed', state.showGrid);
      dom.toggleGridBtn.textContent = (state.showGrid ? '[x]' : '[ ]') + ' Grid';
    }
  }

  function bindKeys() {
    document.addEventListener('keydown', function (e) {
      if (e.key === 'g' || e.key === 'G') {
        toggleGrid();
      }
      if (e.key === 'p' || e.key === 'P') {
        state.showPanel = !state.showPanel;
        dom.panel.classList.toggle('is-hidden', !state.showPanel);
      }
    });
  }

  function sha256(str) {
    return crypto.subtle
      .digest('SHA-256', new TextEncoder().encode(str))
      .then(function (buf) {
        return Array.from(new Uint8Array(buf))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');
      });
  }

  function checkPasswordGate(onGranted) {
    var gate = document.getElementById('passwordGate');
    var input = document.getElementById('passwordInput');

    if (!gate || !PASSWORD_HASH) {
      onGranted();
      return;
    }

    if (localStorage.getItem(STORAGE_KEY) === PASSWORD_HASH) {
      gate.classList.add('is-hidden');
      onGranted();
      return;
    }

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        sha256(input.value).then(function (hash) {
          if (hash === PASSWORD_HASH) {
            localStorage.setItem(STORAGE_KEY, PASSWORD_HASH);
            gate.classList.add('is-hidden');
            onGranted();
          } else {
            input.classList.add('is-wrong');
            input.value = '';
            setTimeout(function () { input.classList.remove('is-wrong'); }, 600);
          }
        });
      }
    });
  }

  function init() {
    dom.gridOverlay = document.getElementById('gridOverlay');
    dom.panel = document.getElementById('panel');
    dom.projectList = document.getElementById('projectList');
    dom.bio = document.getElementById('bio');
    dom.headline = document.getElementById('headline');
    dom.linkLinkedin = document.getElementById('linkLinkedin');
    dom.linkMail = document.getElementById('linkMail');
    dom.toggleGridBtn = document.getElementById('toggleGridBtn');
    dom.toggleGrow = document.getElementById('toggleGrow');
    dom.toggleGrowFromRight = document.getElementById('toggleGrowFromRight');
    dom.toggleImageFiveCols = document.getElementById('toggleImageFiveCols');
    dom.toggleLockImageRatio = document.getElementById('toggleLockImageRatio');
    dom.toggleV1 = document.getElementById('toggleV1');
    dom.toggleV2 = document.getElementById('toggleV2');
    dom.toggleHideEmpty = document.getElementById('toggleHideEmpty');
    dom.toggleDummyCopy = document.getElementById('toggleDummyCopy');
    dom.colorModeToggle = document.getElementById('colorModeToggle');

    if (dom.colorModeToggle) {
      dom.colorModeToggle.addEventListener('click', function () {
        state.colorMode = state.colorMode === 'light' ? 'dark' : 'light';
        document.body.classList.toggle('color-mode-dark', state.colorMode === 'dark');
        dom.colorModeToggle.textContent = state.colorMode;
        dom.colorModeToggle.setAttribute('aria-pressed', state.colorMode === 'dark');
      });
    }

    if (dom.toggleGridBtn) {
      dom.toggleGridBtn.addEventListener('click', toggleGrid);
    }

    bindPanel();
    bindKeys();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateGrowProgress);

    checkPasswordGate(function () {
      fetchData();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
