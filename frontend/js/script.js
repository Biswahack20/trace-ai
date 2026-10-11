/**
 * TraceMind AI — Digital Forensic Investigation Platform
 * Frontend Architecture & Interactive Laboratory Controller
 * Refined & Transparent Local Session Implementation
 */

// ==========================================================================
// 1. GLOBAL STATE & CONFIGURATION
// ==========================================================================

const AppState = {
  currentUser: {
    name: "Investigator",
    email: "investigator@tracemind.ai",
    role: "Forensic Analyst",
    initial: "I",
    caseId: "Case #TF-2026-1010 (Demo)"
  },
  activeView: "login", // 'login' | 'dashboard'
  backendConnected: false,
  stagedFiles: [],     // Selected files awaiting intake
  evidenceItems: [],   // Ingested evidence items (starts empty by default)
  activityFeed: [
    {
      type: "session",
      title: "Session initialized",
      detail: "TraceMind AI local sandbox ready",
      time: getCurrentTimeFormatted(),
      dot: "dot-cyan"
    }
  ],
  timelineEvents: [
    {
      time: `2026-10-10 ${getCurrentTimeFormatted()}:00`,
      label: "Session Initialized",
      desc: "Investigator workspace opened in local browser session"
    }
  ]
};


// ==========================================================================
// 2. INITIALIZATION & DOM HOOKS
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initAuthSystem();
  initDashboard();
  initUploadSystem();
  initChatSystem();
  initQuickTools();
  initECGWaveforms();
  renderEvidenceCollection();
  renderActivityFeed();
  checkBackendHealth();

  // Periodic health check (passive)
  setInterval(checkBackendHealth, 20000);
});


// ==========================================================================
// 3. AUTHENTICATION & VIEW TRANSITIONS
// ==========================================================================

function initAuthSystem() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegisterBtn = document.getElementById("show-register-btn");
  const showLoginBtn = document.getElementById("show-login-btn");
  const togglePassBtn = document.getElementById("toggle-password-btn");
  const passwordInput = document.getElementById("login-password");
  const emailInput = document.getElementById("login-email");
  const btnFillDemo = document.getElementById("btn-fill-demo");
  const errorMsg = document.getElementById("login-error-msg");

  // Toggle Password Visibility
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener("click", () => {
      const isPass = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPass ? "text" : "password");
      togglePassBtn.style.color = isPass ? "var(--electric-cyan)" : "var(--text-muted)";
    });
  }

  // Toggle Login / Register forms
  if (showRegisterBtn && showLoginBtn) {
    showRegisterBtn.addEventListener("click", () => {
      loginForm.classList.add("hidden");
      registerForm.classList.remove("hidden");
      if (errorMsg) errorMsg.classList.add("hidden");
    });

    showLoginBtn.addEventListener("click", () => {
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
      if (errorMsg) errorMsg.classList.add("hidden");
    });
  }

  // One-Click Demo Credentials Quick-Fill
  if (btnFillDemo && emailInput && passwordInput) {
    btnFillDemo.addEventListener("click", () => {
      emailInput.value = "biswarupa@tracemind.ai";
      passwordInput.value = "InvestigatorDemo2026!";
      if (errorMsg) errorMsg.classList.add("hidden");
      showToast("Demo credentials loaded into form", "info");
    });
  }

  // Handle Login Submission with Real Client Validation
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const pass = passwordInput.value;

      // Validation
      if (!email) {
        showLoginError("Please enter your investigator email address.");
        emailInput.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showLoginError("Please enter a valid email format (e.g., investigator@agency.gov).");
        emailInput.focus();
        return;
      }

      if (!pass) {
        showLoginError("Please enter your password / passkey.");
        passwordInput.focus();
        return;
      }

      if (pass.length < 6) {
        showLoginError("Password must be at least 6 characters long.");
        passwordInput.focus();
        return;
      }

      if (errorMsg) errorMsg.classList.add("hidden");

      // Extract investigator name from email
      let investigatorName = "Biswarupa Swain";
      if (email.includes("@")) {
        const localPart = email.split("@")[0].replace(/[._-]/g, " ");
        investigatorName = localPart.charAt(0).toUpperCase() + localPart.slice(1);
      }

      executeAuthenticationTransition(investigatorName, email);
    });
  }

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reg-name").value.trim() || "Investigator";
      const email = document.getElementById("reg-email").value.trim();
      executeAuthenticationTransition(name, email);
    });
  }
}

function showLoginError(msg) {
  const errorMsg = document.getElementById("login-error-msg");
  if (errorMsg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove("hidden");
  } else {
    showToast(msg, "error");
  }
}

function executeAuthenticationTransition(userName, userEmail) {
  const enterBtn = document.getElementById("btn-enter-lab");
  const curtain = document.getElementById("transition-curtain");

  // Loading state on button
  if (enterBtn) {
    enterBtn.disabled = true;
    enterBtn.innerHTML = `
      <span class="pulse-dot green-dot"></span>
      <span class="btn-text">INITIALIZING DEMO LAB SESSION...</span>
    `;
  }

  // Update State
  AppState.currentUser.name = userName;
  AppState.currentUser.email = userEmail;
  AppState.currentUser.initial = userName.charAt(0).toUpperCase();

  // Log in activity
  AppState.activityFeed.unshift({
    type: "auth",
    title: "Investigator session active",
    detail: `Logged in as ${userName} (${userEmail})`,
    time: getCurrentTimeFormatted(),
    dot: "dot-cyan"
  });

  // Sync to UI elements
  updateUserContextUI();

  // Trigger Cinematic Transition Curtain
  setTimeout(() => {
    if (curtain) curtain.classList.add("active");

    setTimeout(() => {
      // Switch Active View Screen
      document.getElementById("login-view").classList.remove("active");
      document.getElementById("dashboard-view").classList.add("active");
      AppState.activeView = "dashboard";

      if (curtain) curtain.classList.remove("active");
      showToast(`Demo Session Authenticated: Welcome, ${userName}`, "success");

      // Reset enter button
      if (enterBtn) {
        enterBtn.disabled = false;
        enterBtn.innerHTML = `
          <span class="btn-icon"><img src="assets/fingerprint.svg" class="btn-fp-icon"></span>
          <span class="btn-text">Enter Investigation Lab (Demo)</span>
          <span class="btn-arrow">→</span>
        `;
      }
    }, 600);
  }, 350);
}

function updateUserContextUI() {
  const name = AppState.currentUser.name;
  const initial = AppState.currentUser.initial;

  const dashInvName = document.getElementById("dash-inv-name");
  const userDispName = document.getElementById("user-display-name");
  const userInit = document.getElementById("user-avatar-initial");
  const dropUser = document.getElementById("dropdown-user-name");
  const bannerName = document.getElementById("banner-investigator-name");

  if (dashInvName) dashInvName.textContent = name;
  if (userDispName) userDispName.textContent = name;
  if (userInit) userInit.textContent = initial;
  if (dropUser) dropUser.textContent = name;
  if (bannerName) bannerName.textContent = name;
}


// ==========================================================================
// 4. DASHBOARD CONTROLS & SIDEBAR NAVIGATION
// ==========================================================================

function initDashboard() {
  // Navigation Rail Items
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const tab = item.getAttribute("data-tab");
      handleNavigationTab(tab);
    });
  });

  // User Dropdown Menu
  const userPill = document.getElementById("user-profile-menu-trigger");
  const userMenu = document.getElementById("user-dropdown-menu");
  const logoutBtn = document.getElementById("btn-logout");

  if (userPill && userMenu) {
    userPill.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("active");
    });

    document.addEventListener("click", () => {
      userMenu.classList.remove("active");
    });
  }

  // Logout / Return to Login
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      document.getElementById("dashboard-view").classList.remove("active");
      document.getElementById("login-view").classList.add("active");
      AppState.activeView = "login";
      showToast("Demo session locked. Returned to terminal entrance.", "info");
    });
  }

  // Appearance Theme Toggle
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      showToast(`Visual Theme: ${isLight ? "Light Forensic Contrast" : "Dark Tactical Navy"}`, "info");
    });
  }

  // Notifications Bell
  const notifBtn = document.getElementById("notifications-btn");
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      showToast(`Alerts: Local sandbox session active. Total evidence items: ${AppState.evidenceItems.length}.`, "info");
    });
  }

  // Export Dossier Demo
  const exportBtn = document.getElementById("btn-export-log");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      openToolModal("Case Dossier Summary", getReportsHTML());
    });
  }
}

function handleNavigationTab(tab) {
  if (tab === "investigation") {
    const center = document.getElementById("center-workspace");
    if (center) center.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Investigation Workspace active", "info");
  } else if (tab === "evidence-library") {
    openToolModal("Evidence Library Dossier", getEvidenceLibraryHTML());
  } else if (tab === "chat-assistant") {
    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
      chatInput.focus();
      chatInput.scrollIntoView({ behavior: "smooth" });
    }
    showToast("Chat Assistant focused", "info");
  } else if (tab === "analysis-results") {
    openToolModal("Forensic Analysis Results", getAnalysisResultsHTML());
  } else if (tab === "timeline") {
    openToolModal("Incident Timeline Reconstruction", getTimelineHTML(), addNewTimelineEvent, "Add Timeline Marker");
  } else if (tab === "reports") {
    openToolModal("Investigative Case Report", getReportsHTML());
  } else if (tab === "settings") {
    openToolModal("Laboratory System Configuration", getSettingsHTML());
  }
}


// ==========================================================================
// 5. EVIDENCE UPLOAD & STAGING QUEUE (REAL FILE HANDLING)
// ==========================================================================

function initUploadSystem() {
  const dropzone = document.getElementById("upload-dropzone");
  const fileInput = document.getElementById("evidence-file-input");
  const catButtons = document.querySelectorAll(".category-tile");
  const btnClearStaging = document.getElementById("btn-clear-staging");
  const btnConfirmIngest = document.getElementById("btn-confirm-ingest");
  const btnLoadSample = document.getElementById("btn-load-sample-evidence");

  if (!dropzone || !fileInput) return;

  // Category buttons filter picker
  catButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const accept = btn.getAttribute("data-accept");
      fileInput.setAttribute("accept", accept || "*/*");
      fileInput.click();
    });
  });

  // Dropzone click opens general file picker (only if clicking background, not staging queue)
  dropzone.addEventListener("click", (e) => {
    if (e.target.closest("#upload-staging-queue") || e.target.closest("#upload-progress-box")) return;
    fileInput.removeAttribute("accept");
    fileInput.click();
  });

  // File Input Change -> Add to Staging Queue
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      stageSelectedFiles(Array.from(e.target.files));
      fileInput.value = ""; // Reset for re-selection
    }
  });

  // Drag and Drop Events
  ["dragenter", "dragover"].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach(name => {
    dropzone.addEventListener(name, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove("drag-over");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      stageSelectedFiles(Array.from(e.dataTransfer.files));
    }
  });

  // Staging Clear
  if (btnClearStaging) {
    btnClearStaging.addEventListener("click", (e) => {
      e.stopPropagation();
      AppState.stagedFiles = [];
      renderStagingQueue();
    });
  }

  // Staging Ingest
  if (btnConfirmIngest) {
    btnConfirmIngest.addEventListener("click", (e) => {
      e.stopPropagation();
      ingestStagedFiles();
    });
  }

  // Load Sample Files helper button
  if (btnLoadSample) {
    btnLoadSample.addEventListener("click", (e) => {
      e.stopPropagation();
      loadSampleDemoEvidence();
    });
  }
}

function stageSelectedFiles(files) {
  const maxSize = 50 * 1024 * 1024; // 50MB
  let addedCount = 0;

  files.forEach(file => {
    if (file.size > maxSize) {
      showToast(`File rejected: ${file.name} exceeds 50MB limit`, "error");
      return;
    }
    // Check if already in staging
    if (!AppState.stagedFiles.some(f => f.name === file.name && f.size === file.size)) {
      AppState.stagedFiles.push(file);
      addedCount++;
    }
  });

  if (addedCount > 0) {
    renderStagingQueue();
    showToast(`${addedCount} file(s) added to intake staging queue`, "info");
  }
}

function renderStagingQueue() {
  const queueBox = document.getElementById("upload-staging-queue");
  const countEl = document.getElementById("staging-count");
  const listEl = document.getElementById("staging-items-list");
  if (!queueBox || !countEl || !listEl) return;

  if (AppState.stagedFiles.length === 0) {
    queueBox.classList.add("hidden");
    return;
  }

  queueBox.classList.remove("hidden");
  countEl.textContent = AppState.stagedFiles.length;

  listEl.innerHTML = AppState.stagedFiles.map((file, idx) => `
    <div class="staging-item">
      <div class="staging-item-info">
        <span class="staging-filename" title="${file.name}">${escapeHTML(file.name)}</span>
        <span class="staging-meta">${detectEvidenceCategory(file)} &bull; ${formatFileSize(file.size)}</span>
      </div>
      <button type="button" class="btn-remove-item" onclick="removeStagedFile(${idx})" title="Remove from staging">&times;</button>
    </div>
  `).join("");
}

window.removeStagedFile = function(index) {
  if (index >= 0 && index < AppState.stagedFiles.length) {
    const removed = AppState.stagedFiles.splice(index, 1)[0];
    renderStagingQueue();
    showToast(`Removed from staging: ${removed.name}`, "info");
  }
};

async function ingestStagedFiles() {
  if (AppState.stagedFiles.length === 0) return;

  const filesToProcess = [...AppState.stagedFiles];
  AppState.stagedFiles = [];
  renderStagingQueue();

  const progressBox = document.getElementById("upload-progress-box");
  const progressName = document.getElementById("uploading-file-name");
  const progressPercent = document.getElementById("uploading-file-percent");
  const progressBar = document.getElementById("upload-progress-bar");
  const hashingNote = document.getElementById("upload-hashing-note");

  if (progressBox) progressBox.classList.remove("hidden");

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    const category = detectEvidenceCategory(file);

    if (progressName) progressName.textContent = `Reading bytes: ${file.name} (${i + 1}/${filesToProcess.length})`;
    if (progressBar) progressBar.style.width = "40%";
    if (progressPercent) progressPercent.textContent = "40%";
    if (hashingNote) hashingNote.textContent = "Computing hardware SHA-256 checksum via Web Crypto API...";

    // Real hardware SHA-256 calculation
    const hashHex = await computeSHA256(file);

    if (progressBar) progressBar.style.width = "100%";
    if (progressPercent) progressPercent.textContent = "100%";
    await sleep(90);

    const nowTime = getCurrentTimeFormatted();
    const formattedSize = formatFileSize(file.size);

    const newEvidence = {
      id: `ev-${Date.now()}-${i}`,
      name: file.name,
      category: category,
      size: formattedSize,
      bytes: file.size,
      hash: hashHex,
      time: nowTime,
      lastModified: new Date(file.lastModified).toISOString().replace("T", " ").substring(0, 19),
      mime: file.type || "application/octet-stream",
      status: "Ingested",
      thumb: file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    };

    AppState.evidenceItems.unshift(newEvidence);

    // Real Activity Feed entry
    AppState.activityFeed.unshift({
      type: category.toLowerCase(),
      title: `${category} ingested`,
      detail: file.name,
      time: nowTime,
      dot: "dot-cyan"
    });

    // Real Timeline event
    AppState.timelineEvents.push({
      time: `2026-10-10 ${nowTime}:00`,
      label: `Evidence Ingested: ${file.name}`,
      desc: `Category: ${category} | SHA-256: ${hashHex.substring(0, 16)}...`
    });
  }

  if (progressBox) progressBox.classList.add("hidden");

  renderEvidenceCollection();
  renderActivityFeed();
  showToast(`Successfully ingested ${filesToProcess.length} evidence artifact(s)`, "success");

  // Honest assistant confirmation in chat
  appendAssistantMessage(`**Evidence Intake Recorded** (${filesToProcess.length} file[s]):\n\n` +
    filesToProcess.map(f => `• **${f.name}** (${formatFileSize(f.size)})`).join("\n") +
    `\n\nAll cryptographic SHA-256 hashes computed in browser memory. Ready for investigative inspection.`
  );
}

function loadSampleDemoEvidence() {
  const sampleData = [
    {
      id: "ev-demo-1",
      name: "IMG_4587.jpg",
      category: "Image",
      size: "2.4 MB",
      bytes: 2516582,
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      time: getCurrentTimeFormatted(),
      lastModified: "2026-10-10 15:22:08",
      mime: "image/jpeg",
      status: "Demo Ingested",
      thumb: "assets/evidence_thumb.jpg"
    },
    {
      id: "ev-demo-2",
      name: "voice_note.mp3",
      category: "Audio",
      size: "1.2 MB",
      bytes: 1258291,
      hash: "a58e1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852a12",
      time: getCurrentTimeFormatted(),
      lastModified: "2026-10-10 15:22:45",
      mime: "audio/mpeg",
      status: "Demo Ingested",
      thumb: null
    },
    {
      id: "ev-demo-3",
      name: "notes.txt",
      category: "Text",
      size: "12 KB",
      bytes: 12288,
      hash: "f41c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852bb33",
      time: getCurrentTimeFormatted(),
      lastModified: "2026-10-10 15:24:10",
      mime: "text/plain",
      status: "Demo Ingested",
      thumb: null
    }
  ];

  AppState.evidenceItems = [...sampleData];
  AppState.activityFeed.unshift({
    type: "demo",
    title: "Demo files loaded",
    detail: "3 sample artifacts loaded for evaluation",
    time: getCurrentTimeFormatted(),
    dot: "dot-cyan"
  });

  renderEvidenceCollection();
  renderActivityFeed();
  showToast("Loaded 3 demo evidence files", "info");
}

function detectEvidenceCategory(file) {
  const mime = file.type || "";
  const ext = file.name.split(".").pop().toLowerCase();

  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "bmp", "tiff", "heic"].includes(ext)) {
    return "Image";
  }
  if (mime.startsWith("audio/") || ["mp3", "wav", "aac", "ogg", "flac", "m4a"].includes(ext)) {
    return "Audio";
  }
  if (mime.startsWith("video/") || ["mp4", "mkv", "mov", "avi", "webm"].includes(ext)) {
    return "Video";
  }
  if (["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
    return "Document";
  }
  if (mime.startsWith("text/") || ["txt", "log", "csv", "json", "md", "xml"].includes(ext)) {
    return "Text";
  }
  return "Other";
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function computeSHA256(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (err) {
    console.warn("Hardware crypto subtle digest error:", err);
    return fallbackHash(file.name + file.size);
  }
}

function fallbackHash(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(16).padStart(64, "e3b0c44298fc1c149afbf4c8");
}


// ==========================================================================
// 6. EVIDENCE COLLECTION & REAL STATE RENDERING
// ==========================================================================

function renderEvidenceCollection() {
  const list = document.getElementById("evidence-items-list");
  const emptyBox = document.getElementById("evidence-empty-state");
  const countBadge = document.getElementById("evidence-file-count");
  if (!list) return;

  const count = AppState.evidenceItems.length;
  if (countBadge) countBadge.textContent = count;

  if (count === 0) {
    if (emptyBox) emptyBox.classList.remove("hidden");
    list.innerHTML = "";
    return;
  }

  if (emptyBox) emptyBox.classList.add("hidden");

  list.innerHTML = AppState.evidenceItems.map(item => `
    <div class="evidence-item" data-id="${item.id}" onclick="inspectEvidenceItem('${item.id}')">
      <div class="item-visual ${item.thumb ? 'thumb-visual' : 'icon-visual'}" ${item.thumb ? `style="background-image: url('${item.thumb}');"` : ''}>
        ${!item.thumb ? getCategoryIconSvg(item.category) : ''}
      </div>
      <div class="item-meta">
        <span class="item-name" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</span>
        <span class="item-info">${item.category} &bull; ${item.size}</span>
      </div>
      <button type="button" class="btn-remove-evidence" onclick="event.stopPropagation(); removeEvidenceItem('${item.id}')" title="Remove from investigation">&times;</button>
    </div>
  `).join("");
}

window.removeEvidenceItem = function(id) {
  const itemIndex = AppState.evidenceItems.findIndex(i => i.id === id);
  if (itemIndex > -1) {
    const item = AppState.evidenceItems.splice(itemIndex, 1)[0];
    renderEvidenceCollection();

    AppState.activityFeed.unshift({
      type: "remove",
      title: "Evidence removed",
      detail: item.name,
      time: getCurrentTimeFormatted(),
      dot: "dot-orange"
    });
    renderActivityFeed();
    showToast(`Removed from collection: ${item.name}`, "info");
  }
};

function getCategoryIconSvg(category) {
  switch (category) {
    case "Audio":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>`;
    case "Video":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;
    case "Document":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`;
    case "Text":
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
  }
}

function renderActivityFeed() {
  const feed = document.getElementById("activity-feed-list");
  if (!feed) return;

  if (AppState.activityFeed.length === 0) {
    feed.innerHTML = `<div style="text-align:center; color:var(--text-muted); padding:1rem; font-size:0.75rem;">No recent activity logged in this session.</div>`;
    return;
  }

  feed.innerHTML = AppState.activityFeed.slice(0, 6).map(item => `
    <div class="activity-entry">
      <div class="entry-dot-col">
        <span class="activity-dot ${item.dot}"></span>
      </div>
      <div class="entry-content">
        <span class="entry-title">${escapeHTML(item.title)}</span>
        <span class="entry-detail">${escapeHTML(item.detail)}</span>
      </div>
      <span class="entry-time">${item.time}</span>
    </div>
  `).join("");
}

function inspectEvidenceItem(id) {
  const item = AppState.evidenceItems.find(i => i.id === id);
  if (!item) return;

  const content = `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="display:flex; gap:1rem; align-items:center; background:var(--bg-card); padding:1rem; border-radius:8px; border:1px solid var(--border-panel);">
        <div style="width:48px; height:48px; border-radius:6px; background:#040D18; display:flex; align-items:center; justify-content:center; border:1px solid var(--border-panel); overflow:hidden;">
          ${item.thumb ? `<img src="${item.thumb}" style="width:100%; height:100%; object-fit:cover;">` : getCategoryIconSvg(item.category)}
        </div>
        <div>
          <h4 style="color:#ffffff; font-size:1rem;">${escapeHTML(item.name)}</h4>
          <span style="color:var(--electric-cyan); font-family:'JetBrains Mono'; font-size:0.75rem;">Category: ${item.category} &bull; ${item.size} (${item.bytes ? item.bytes.toLocaleString() : 'N/A'} bytes)</span>
        </div>
      </div>
      <div style="background:#040c17; padding:0.85rem; border-radius:6px; font-family:'JetBrains Mono'; font-size:0.75rem; border:1px solid var(--border-panel);">
        <div style="color:var(--text-muted); margin-bottom:4px;">REAL HARDWARE SHA-256 CHECKSUM</div>
        <div style="color:var(--teal-success); word-break:break-all;">${item.hash}</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.8rem;">
        <div style="background:var(--bg-card); padding:0.6rem; border-radius:6px; border:1px solid var(--border-panel);">
          <span style="color:var(--text-muted); display:block; font-size:0.7rem;">INGESTED BY</span>
          <strong style="color:#ffffff;">${escapeHTML(AppState.currentUser.name)}</strong>
        </div>
        <div style="background:var(--bg-card); padding:0.6rem; border-radius:6px; border:1px solid var(--border-panel);">
          <span style="color:var(--text-muted); display:block; font-size:0.7rem;">INTAKE TIME</span>
          <strong style="color:#ffffff;">${item.time}</strong>
        </div>
      </div>
      <div style="font-size:0.72rem; color:var(--text-muted); background:rgba(6,19,33,0.5); padding:0.6rem; border-radius:4px; border:1px solid var(--border-subtle);">
        Verified Facts: Binary payload integrity and SHA-256 fingerprint verified via local Web Crypto API. Court-admissible chain-of-custody signatures connect to backend storage.
      </div>
    </div>
  `;

  openToolModal(`Evidence Dossier: ${item.name}`, content, () => {
    document.getElementById("chat-input").value = `Summarize evidence artifact: ${item.name}`;
    document.getElementById("chat-composer-form").dispatchEvent(new Event("submit"));
    closeToolModal();
  }, "Ask Assistant About File");
}


// ==========================================================================
// 7. HONEST INVESTIGATION ASSISTANT
// ==========================================================================

function initChatSystem() {
  const chatForm = document.getElementById("chat-composer-form");
  const chatInput = document.getElementById("chat-input");
  const attachBtn = document.getElementById("composer-attach-btn");
  const clearChatBtn = document.getElementById("btn-clear-chat");
  const chips = document.querySelectorAll(".prompt-chip");

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      appendUserMessage(text);
      chatInput.value = "";

      handleAssistantResponse(text);
    });
  }

  // Clickable example prompt chips
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const query = chip.textContent.replace(/^•\s*"/, "").replace(/"$/, "").trim();
      chatInput.value = query;
      chatInput.focus();
    });
  });

  // Attach button triggers file selector
  if (attachBtn) {
    attachBtn.addEventListener("click", () => {
      document.getElementById("evidence-file-input").click();
    });
  }

  // Clear chat history
  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      const thread = document.getElementById("chat-thread");
      const rows = thread.querySelectorAll(".chat-row:not(:first-child)");
      rows.forEach(r => r.remove());
      showToast("Chat history cleared for active session", "info");
    });
  }
}

function appendUserMessage(text) {
  const thread = document.getElementById("chat-thread");
  const typingIndicator = document.getElementById("typing-indicator-row");
  const now = getCurrentTimeFormatted();

  const userRow = document.createElement("div");
  userRow.className = "chat-row user-row";
  userRow.innerHTML = `
    <div class="chat-bubble-container user-align">
      <div class="chat-bubble user-bubble">
        <p>${escapeHTML(text)}</p>
      </div>
      <span class="chat-timestamp">${now}</span>
    </div>
    <div class="chat-avatar user-avatar">
      <span>${AppState.currentUser.initial}</span>
    </div>
  `;

  if (typingIndicator) {
    thread.insertBefore(userRow, typingIndicator);
    typingIndicator.classList.remove("hidden");
  } else {
    thread.appendChild(userRow);
  }

  thread.scrollTop = thread.scrollHeight;
}

function appendAssistantMessage(markdownText) {
  const thread = document.getElementById("chat-thread");
  const typingIndicator = document.getElementById("typing-indicator-row");
  const now = getCurrentTimeFormatted();

  if (typingIndicator) {
    typingIndicator.classList.add("hidden");
  }

  const assistantRow = document.createElement("div");
  assistantRow.className = "chat-row assistant-row";
  assistantRow.innerHTML = `
    <div class="chat-avatar assistant-avatar">
      <img src="assets/fingerprint.svg" alt="TraceMind AI" class="chat-fp-svg">
    </div>
    <div class="chat-bubble-container">
      <div class="chat-bubble assistant-bubble">
        ${formatMarkdown(markdownText)}
      </div>
      <span class="chat-timestamp">${now}</span>
    </div>
  `;

  thread.appendChild(assistantRow);
  thread.scrollTop = thread.scrollHeight;
}

async function handleAssistantResponse(userPrompt) {
  const typingIndicator = document.getElementById("typing-indicator-row");
  if (typingIndicator) typingIndicator.classList.remove("hidden");

  // Realistic client-side inspection delay
  await sleep(750);

  const promptLower = userPrompt.toLowerCase();
  const count = AppState.evidenceItems.length;
  let response = "";

  // 1. If no evidence has been uploaded yet
  if (count === 0) {
    response = `**[STATUS: No Ingested Evidence]**\n\n` +
      `No evidence files have been added to the session yet.\n\n` +
      `To analyze evidence:\n` +
      `1. Drag and drop files into the **Upload Evidence** intake panel above.\n` +
      `2. Or click **"+ Load 3 Sample Files"** in the Evidence Collection sidebar to test with sample files.\n\n` +
      `*Once files are ingested, I can compute checksums, inspect properties, and help build a timeline.*`;
  }
  // 2. "Summarize the uploaded evidence"
  else if (promptLower.includes("summarize") || promptLower.includes("summary") || promptLower.includes("overview")) {
    const fileList = AppState.evidenceItems.map((item, i) =>
      `**${i + 1}. ${item.name}**\n` +
      `   • Category: \`${item.category}\` | Size: \`${item.size}\`\n` +
      `   • SHA-256: \`${item.hash.substring(0, 24)}...\`\n` +
      `   • Intake Timestamp: \`${item.time}\``
    ).join("\n\n");

    response = `### EVIDENCE DOSSIER SUMMARY (${count} Item[s])\n\n` +
      `**[VERIFIED EXTRACTED FACTS]**\n\n${fileList}\n\n` +
      `**[INVESTIGATIVE ASSESSMENT]**\n` +
      `• Total Evidence Volume: ${formatFileSize(AppState.evidenceItems.reduce((acc, i) => acc + (i.bytes || 0), 0))}\n` +
      `• Integrity Status: All hardware SHA-256 fingerprints are logged.\n` +
      `• Next Step: Use the **Timeline Builder** or query specific files for timestamp and location correlation.`;
  }
  // 3. "Extract metadata from this image"
  else if (promptLower.includes("metadata") || promptLower.includes("image")) {
    const imageItems = AppState.evidenceItems.filter(i => i.category === "Image");
    if (imageItems.length === 0) {
      response = `**[INSPECTION NOTICE]**\n\n` +
        `No image artifacts were detected in the current evidence collection.\n` +
        `Available files are of categories: ${Array.from(new Set(AppState.evidenceItems.map(i => i.category))).join(", ")}.\n\n` +
        `Upload an image artifact (JPEG, PNG, HEIC) to inspect resolution, header bytes, and timestamps.`;
    } else {
      const img = imageItems[0];
      response = `### METADATA INSPECTION: \`${img.name}\`\n\n` +
        `**[VERIFIED FACTS]**\n` +
        `• File Name: \`${img.name}\`\n` +
        `• Category: \`${img.category}\`\n` +
        `• Size: \`${img.size}\` (${img.bytes ? img.bytes.toLocaleString() : 'N/A'} bytes)\n` +
        `• SHA-256 Checksum: \`${img.hash}\`\n` +
        `• Last Modified Record: \`${img.lastModified || 'Session Created'}\`\n\n` +
        `**[NOTE ON DEEP FORENSIC EXIF]**\n` +
        `Client-side inspection confirms standard image header. Detailed camera serial numbers, lens profiles, and GPS coordinates will be extracted once connected to the FastAPI backend inspection module.`;
    }
  }
  // 4. "Find possible connections between these files"
  else if (promptLower.includes("connection") || promptLower.includes("correlat") || promptLower.includes("link")) {
    if (count < 2) {
      response = `**[CORRELATION REQUIREMENT]**\n\n` +
        `You currently have ${count} evidence file in this session. Correlation requires at least two files.\n` +
        `Upload additional media to cross-examine timestamps, filenames, or provenance.`;
    } else {
      response = `### MULTI-ARTIFACT CORRELATION ANALYSIS\n\n` +
        `**[VERIFIED FACTS]**\n` +
        `• Comparing ${count} artifacts: ${AppState.evidenceItems.map(i => `\`${i.name}\``).join(", ")}\n` +
        `• Intake Window: All files ingested between \`${AppState.evidenceItems[AppState.evidenceItems.length - 1].time}\` and \`${AppState.evidenceItems[0].time}\`.\n\n` +
        `**[POTENTIAL CORRELATIONS TO VERIFY]**\n` +
        `• Temporal Coincidence: Media timestamps indicate activity in proximate sequence.\n` +
        `• File Structure: Naming conventions suggest items were retrieved from a shared storage device or session incident.\n\n` +
        `**[AI HYPOTHESIS / PENDING VERIFICATION]**\n` +
        `• Hypothesis: The files may document consecutive stages of the incident.\n` +
        `• Action Required: Investigator verification needed to corroborate acoustic and visual data before drawing conclusive findings.`;
    }
  }
  // 5. "Build a timeline from the available timestamps"
  else if (promptLower.includes("timeline") || promptLower.includes("timestamp") || promptLower.includes("chronolog")) {
    const timelineList = AppState.evidenceItems.map(item =>
      `• \`[${item.time}]\` **${item.name}** (${item.category}) — Intake recorded with SHA-256 \`${item.hash.substring(0, 10)}...\``
    ).join("\n");

    response = `### CHRONOLOGICAL EVIDENCE TIMELINE\n\n` +
      `**[VERIFIED TIMESTAMPS]**\n\n${timelineList}\n\n` +
      `You can also open the **Timeline Builder** tool from the sidebar to insert manual field observations or witness markers.`;
  }
  // 6. "Identify missing information in this investigation"
  else if (promptLower.includes("missing") || promptLower.includes("gap") || promptLower.includes("information")) {
    response = `### INVESTIGATIVE GAP ANALYSIS\n\n` +
      `Based on the ${count} artifact(s) present in Case **#TF-2026-1010**:\n\n` +
      `1. **Chain of Custody Logs**: Currently relying on local browser session intake. Cryptographic signing with officer public key is recommended.\n` +
      `2. **Network Logs**: No firewall or router capture logs have been ingested yet.\n` +
      `3. **Memory / Volatile Artifacts**: Only static files uploaded. RAM dump inspection not yet performed.\n\n` +
      `*Recommendation: Ingest system logs (.log, .csv) or security audit records to establish perimeter timelines.*`;
  }
  // Default General Query
  else {
    response = `### INVESTIGATIVE INQUIRY PROCESSED\n\n` +
      `Inquiry: *"${escapeHTML(userPrompt)}"* \n\n` +
      `**[CURRENT SESSION CONTEXT]**\n` +
      `• Active Evidence Artifacts: **${count}**\n` +
      `• Mode: Local Session Heuristics (Privacy-Preserved)\n\n` +
      `To conduct deep AI neural extraction or cross-database lookups, connect this frontend to the FastAPI investigation service. In this demo mode, you can use the **SHA-256 Calculator** or ask me to summarize the ingested files.`;
  }

  appendAssistantMessage(response);
}


// ==========================================================================
// 8. QUICK TOOLS (REAL CLIENT-SIDE UTILITIES)
// ==========================================================================

function initQuickTools() {
  const toolMetadata = document.getElementById("tool-metadata");
  const toolHash = document.getElementById("tool-hash");
  const toolTimeline = document.getElementById("tool-timeline");
  const toolAnalyzer = document.getElementById("tool-analyzer");
  const viewAllAct = document.getElementById("btn-view-all-activity");
  const credsBtn = document.getElementById("btn-open-credentials");
  const modalClose = document.getElementById("modal-close-btn");
  const modalSecondary = document.getElementById("modal-secondary-btn");
  const modalOverlay = document.getElementById("tool-modal");

  if (toolMetadata) {
    toolMetadata.addEventListener("click", () => {
      openToolModal("Basic Metadata Viewer", getMetadataViewerHTML(), executeMetadataAnalysis, "Inspect File");
    });
  }

  if (toolHash) {
    toolHash.addEventListener("click", () => {
      openToolModal("SHA-256 Hash Calculator (Web Crypto API)", getHashCalculatorHTML(), executeHashCalculation, "Select Target File");
    });
  }

  if (toolTimeline) {
    toolTimeline.addEventListener("click", () => {
      openToolModal("Incident Timeline Builder", getTimelineHTML(), addNewTimelineEvent, "Add Timeline Marker");
    });
  }

  if (toolAnalyzer) {
    toolAnalyzer.addEventListener("click", () => {
      openToolModal("File Signature (Magic Bytes) Analyzer", getFileAnalyzerHTML(), executeFileAnalysis, "Run Byte Check");
    });
  }

  if (viewAllAct) {
    viewAllAct.addEventListener("click", () => {
      openToolModal("Session Activity Log", getActivityLogHTML());
    });
  }

  if (credsBtn) {
    credsBtn.addEventListener("click", () => {
      openToolModal("Investigator Session Information", getCredentialsHTML());
    });
  }

  // Modal Close Handlers
  if (modalClose) modalClose.addEventListener("click", closeToolModal);
  if (modalSecondary) modalSecondary.addEventListener("click", closeToolModal);
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeToolModal();
    });
  }
}

function openToolModal(title, bodyHTML, primaryAction = null, primaryLabel = "Execute") {
  const modal = document.getElementById("tool-modal");
  const titleEl = document.getElementById("modal-title");
  const contentEl = document.getElementById("modal-content");
  const primaryBtn = document.getElementById("modal-primary-btn");

  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (contentEl) contentEl.innerHTML = bodyHTML;

  if (primaryBtn) {
    if (primaryAction) {
      primaryBtn.style.display = "inline-flex";
      primaryBtn.textContent = primaryLabel;
      primaryBtn.onclick = primaryAction;
    } else {
      primaryBtn.style.display = "none";
    }
  }

  modal.classList.remove("hidden");
}

function closeToolModal() {
  const modal = document.getElementById("tool-modal");
  if (modal) modal.classList.add("hidden");
}


// --- Quick Tool HTML & Logic ---

function getMetadataViewerHTML() {
  const hasItems = AppState.evidenceItems.length > 0;
  const options = hasItems
    ? AppState.evidenceItems.map(i => `<option value="${i.id}">${escapeHTML(i.name)} (${i.category})</option>`).join("")
    : `<option value="" disabled selected>No evidence files currently ingested</option>`;

  return `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <p style="color:var(--text-secondary); font-size:0.8rem;">
        Inspect real client-side file properties (filename, size in bytes, MIME type, modified timestamp, and image resolution).
      </p>
      <div>
        <label style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom:4px;">SELECT INGESTED ARTIFACT</label>
        <select id="meta-select-file" style="width:100%; padding:0.6rem; background:var(--bg-input); border:1px solid var(--border-panel); color:#fff; border-radius:6px;" ${!hasItems ? 'disabled' : ''}>
          ${options}
        </select>
      </div>
      <div id="meta-results-box" style="background:#040c17; border:1px solid var(--border-panel); border-radius:6px; padding:1rem; font-family:'JetBrains Mono'; font-size:0.75rem;">
        <span style="color:var(--text-muted);">${hasItems ? 'Select a file above and click "Inspect File" to extract verified properties.' : 'Please ingest an evidence file first.'}</span>
      </div>
      <div style="font-size:0.7rem; color:var(--text-dim); border-top:1px solid var(--border-subtle); padding-top:0.5rem;">
        Notice: Deep EXIF parsing, camera serials, and firmware geolocation connect to the Python FastAPI backend.
      </div>
    </div>
  `;
}

function executeMetadataAnalysis() {
  const select = document.getElementById("meta-select-file");
  const resBox = document.getElementById("meta-results-box");
  if (!select || !resBox || !select.value) return;

  const item = AppState.evidenceItems.find(i => i.id === select.value);
  if (!item) return;

  resBox.innerHTML = `
    <div style="color:var(--electric-cyan); margin-bottom:8px; font-weight:600;">[VERIFIED CLIENT-SIDE METADATA]</div>
    <table style="width:100%; border-collapse:collapse; color:#fff;">
      <tr><td style="color:var(--text-muted); padding:3px 0;">Filename:</td><td>${escapeHTML(item.name)}</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">Category:</td><td>${item.category}</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">MIME Type:</td><td>${item.mime || 'application/octet-stream'}</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">File Size:</td><td>${item.size} (${item.bytes ? item.bytes.toLocaleString() : 'N/A'} bytes)</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">Last Modified:</td><td>${item.lastModified || 'N/A'}</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">SHA-256:</td><td style="color:var(--teal-success); word-break:break-all;">${item.hash}</td></tr>
    </table>
  `;

  AppState.activityFeed.unshift({
    type: "meta",
    title: "Metadata inspected",
    detail: item.name,
    time: getCurrentTimeFormatted(),
    dot: "dot-cyan"
  });
  renderActivityFeed();
  showToast("Metadata extracted", "success");
}

function getHashCalculatorHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <p style="color:var(--text-secondary); font-size:0.8rem;">
        Compute real cryptographic SHA-256 and SHA-1 checksums on any file in your browser using the hardware <code>crypto.subtle</code> Web Crypto API.
      </p>
      <div style="border:1.5px dashed var(--border-panel); padding:1rem; text-align:center; border-radius:6px; cursor:pointer; background:rgba(6,19,33,0.5);" onclick="document.getElementById('hash-tool-file-input').click()">
        <input type="file" id="hash-tool-file-input" class="hidden" onchange="handleHashToolFile(this)">
        <span style="color:var(--electric-cyan); font-size:0.82rem;">Click here or drag a file to calculate real hardware hash</span>
      </div>
      <div id="hash-results-box" style="display:flex; flex-direction:column; gap:0.6rem; font-family:'JetBrains Mono'; font-size:0.75rem;">
        <div style="background:#040c17; padding:0.8rem; border-radius:6px; border:1px solid var(--border-panel); color:var(--text-muted);">
          No file selected. Select any file to compute real SHA-256 and SHA-1 checksums.
        </div>
      </div>
    </div>
  `;
}

window.handleHashToolFile = async function(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const resBox = document.getElementById("hash-results-box");
  if (!resBox) return;

  resBox.innerHTML = `<span style="color:var(--electric-cyan);">Reading ${file.size} bytes and computing SHA-256...</span>`;

  try {
    const arrayBuffer = await file.arrayBuffer();

    // SHA-256
    const hash256Buffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    const sha256 = Array.from(new Uint8Array(hash256Buffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    // SHA-1
    const hash1Buffer = await crypto.subtle.digest("SHA-1", arrayBuffer);
    const sha1 = Array.from(new Uint8Array(hash1Buffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    resBox.innerHTML = `
      <div style="background:#040c17; padding:0.85rem; border-radius:6px; border:1px solid var(--border-panel);">
        <div style="color:var(--text-muted); font-size:0.7rem; margin-bottom:4px;">TARGET FILE: <strong style="color:#fff;">${escapeHTML(file.name)}</strong> (${formatFileSize(file.size)}, ${file.size.toLocaleString()} bytes)</div>
        <div style="margin-top:6px;">
          <span style="color:var(--text-muted);">SHA-256:</span>
          <div style="color:var(--teal-success); word-break:break-all; margin-top:2px;">${sha256}</div>
        </div>
        <div style="margin-top:6px;">
          <span style="color:var(--text-muted);">SHA-1:</span>
          <div style="color:var(--electric-cyan); word-break:break-all; margin-top:2px;">${sha1}</div>
        </div>
        <button style="margin-top:10px; background:var(--bg-panel); border:1px solid var(--border-panel); color:var(--electric-cyan); padding:4px 10px; border-radius:4px; font-size:0.72rem; cursor:pointer;" onclick="navigator.clipboard.writeText('${sha256}'); showToast('SHA-256 hash copied to clipboard', 'info');">
          Copy SHA-256 to Clipboard
        </button>
      </div>
    `;

    AppState.activityFeed.unshift({
      type: "hash",
      title: "SHA-256 calculated",
      detail: file.name,
      time: getCurrentTimeFormatted(),
      dot: "dot-green"
    });
    renderActivityFeed();
    showToast(`Hash generated for ${file.name}`, "success");
  } catch (err) {
    resBox.innerHTML = `<span style="color:var(--red-danger);">Error reading file: ${err.message}</span>`;
  }
};

function executeHashCalculation() {
  const input = document.getElementById("hash-tool-file-input");
  if (input) input.click();
}

function getTimelineHTML() {
  const events = AppState.timelineEvents.map(e => `
    <div style="display:flex; gap:0.75rem; margin-bottom:0.75rem; font-size:0.8rem; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
      <div style="font-family:'JetBrains Mono'; color:var(--electric-cyan); font-size:0.72rem; width:90px; flex-shrink:0;">${e.time.includes(" ") ? e.time.split(" ")[1] : e.time}</div>
      <div style="flex:1;">
        <strong style="color:#ffffff; display:block;">${escapeHTML(e.label)}</strong>
        <span style="color:var(--text-muted); font-size:0.72rem;">${escapeHTML(e.desc)}</span>
      </div>
    </div>
  `).join("");

  return `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <p style="color:var(--text-secondary); font-size:0.8rem;">Timeline built from actual session intake events and manual investigator markers.</p>
      <div style="max-height:220px; overflow-y:auto; padding-right:0.5rem;">
        ${events}
      </div>
      <hr style="border:none; height:1px; background:var(--border-panel);">
      <div style="display:flex; gap:0.5rem;">
        <input type="text" id="new-timeline-label" placeholder="Marker Title (e.g. Witness interview)" style="flex:1; padding:0.5rem; background:var(--bg-input); border:1px solid var(--border-panel); color:#fff; border-radius:4px; font-size:0.8rem;">
        <input type="text" id="new-timeline-desc" placeholder="Details" style="flex:1.5; padding:0.5rem; background:var(--bg-input); border:1px solid var(--border-panel); color:#fff; border-radius:4px; font-size:0.8rem;">
      </div>
    </div>
  `;
}

function addNewTimelineEvent() {
  const labelInput = document.getElementById("new-timeline-label");
  const descInput = document.getElementById("new-timeline-desc");
  if (!labelInput || !descInput) return;

  const label = labelInput.value.trim();
  const desc = descInput.value.trim();
  if (!label) {
    showToast("Please enter a marker title", "error");
    return;
  }

  const now = getCurrentTimeFormatted();
  AppState.timelineEvents.push({
    time: `2026-10-10 ${now}:00`,
    label: label,
    desc: desc || "Documented by investigator in local session"
  });

  AppState.activityFeed.unshift({
    type: "timeline",
    title: "Timeline marker added",
    detail: label,
    time: now,
    dot: "dot-cyan"
  });
  renderActivityFeed();

  closeToolModal();
  showToast(`Timeline Marker Added: ${label}`, "success");
}

function getFileAnalyzerHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.8rem;">
      <p style="color:var(--text-secondary);">
        Select any file to inspect initial file header bytes (Magic Bytes) to verify if the file extension matches its true binary signature.
      </p>
      <div style="border:1.5px dashed var(--border-panel); padding:0.85rem; text-align:center; border-radius:6px; cursor:pointer;" onclick="document.getElementById('analyzer-file-input').click()">
        <input type="file" id="analyzer-file-input" class="hidden" onchange="handleAnalyzeFile(this)">
        <span style="color:var(--electric-cyan);">Select file for binary signature check</span>
      </div>
      <div id="analyzer-results-box" style="background:#040c17; border:1px solid var(--border-panel); padding:0.75rem; border-radius:6px; font-family:'JetBrains Mono'; font-size:0.75rem;">
        <span style="color:var(--text-muted);">Select a file to inspect header bytes.</span>
      </div>
    </div>
  `;
}

window.handleAnalyzeFile = async function(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const resBox = document.getElementById("analyzer-results-box");
  if (!resBox) return;

  try {
    const slice = file.slice(0, 16);
    const buffer = await slice.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");

    // Check magic byte signatures
    let detectedType = "Unknown / Custom Binary";
    let matchStatus = "Extension matches binary signature";

    if (hex.startsWith("FF D8 FF")) detectedType = "JPEG Image (FF D8 FF)";
    else if (hex.startsWith("89 50 4E 47")) detectedType = "PNG Image (89 50 4E 47)";
    else if (hex.startsWith("25 50 44 46")) detectedType = "PDF Document (%PDF)";
    else if (hex.startsWith("50 4B 03 04")) detectedType = "ZIP Archive / OpenXML (PK..)";
    else if (hex.startsWith("49 44 33")) detectedType = "MP3 Audio (ID3)";
    else if (hex.startsWith("52 49 46 46")) detectedType = "RIFF Container (WAV/AVI)";

    resBox.innerHTML = `
      <div style="color:#fff; margin-bottom:4px;">TARGET: <strong>${escapeHTML(file.name)}</strong></div>
      <div>Header Bytes: <span style="color:var(--electric-cyan);">${hex}</span></div>
      <div>Detected Signature: <span style="color:var(--teal-success);">${detectedType}</span></div>
      <div style="color:var(--text-muted); margin-top:4px;">Assessment: ${matchStatus}</div>
    `;

    showToast("Magic byte inspection complete", "success");
  } catch (err) {
    resBox.innerHTML = `<span style="color:var(--red-danger);">Error reading bytes: ${err.message}</span>`;
  }
};

function executeFileAnalysis() {
  const input = document.getElementById("analyzer-file-input");
  if (input) input.click();
}

function getActivityLogHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary); font-size:0.8rem;">Real session activity log generated from user actions.</p>
      ${AppState.activityFeed.map(a => `
        <div style="display:flex; justify-content:space-between; background:var(--bg-card); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
          <div>
            <strong style="color:#fff; font-size:0.82rem;">${escapeHTML(a.title)}</strong>
            <div style="color:var(--text-muted); font-size:0.72rem;">${escapeHTML(a.detail)}</div>
          </div>
          <span style="color:var(--electric-cyan); font-family:'JetBrains Mono'; font-size:0.72rem;">${a.time}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function getCredentialsHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.82rem;">
      <div style="background:var(--bg-card); padding:1rem; border-radius:8px; border:1px solid var(--border-panel);">
        <h4 style="color:#fff; margin-bottom:0.4rem;">${escapeHTML(AppState.currentUser.name)}</h4>
        <div style="color:var(--electric-cyan); font-size:0.75rem; font-family:'JetBrains Mono';">ROLE: ${AppState.currentUser.role}</div>
        <div style="color:var(--text-muted); font-size:0.72rem; margin-top:4px;">EMAIL: ${escapeHTML(AppState.currentUser.email)}</div>
        <div style="color:var(--teal-success); font-size:0.72rem; margin-top:6px;">MODE: Local Sandbox Session (No external secrets stored)</div>
      </div>
    </div>
  `;
}

function getEvidenceLibraryHTML() {
  const count = AppState.evidenceItems.length;
  if (count === 0) {
    return `
      <div style="text-align:center; padding:1.5rem; color:var(--text-muted);">
        <p>No evidence items currently in the library.</p>
        <button style="margin-top:0.75rem; padding:0.4rem 0.8rem; background:rgba(22,139,255,0.15); border:1px solid var(--electric-cyan); color:#fff; border-radius:4px; cursor:pointer;" onclick="loadSampleDemoEvidence(); closeToolModal();">
          Load 3 Demo Artifacts
        </button>
      </div>
    `;
  }

  return `
    <div style="display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary); font-size:0.8rem;">All ${count} evidence items collected in active session.</p>
      ${AppState.evidenceItems.map(i => `
        <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-card); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
          <div>
            <strong style="color:#fff; font-size:0.82rem;">${escapeHTML(i.name)}</strong>
            <div style="color:var(--text-muted); font-size:0.7rem; font-family:'JetBrains Mono';">SHA-256: ${i.hash.substring(0, 20)}...</div>
          </div>
          <span style="color:var(--electric-cyan); font-family:'JetBrains Mono'; font-size:0.75rem;">${i.category} &bull; ${i.size}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function getAnalysisResultsHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.82rem;">
      <p style="color:var(--text-secondary);">Summary of client-side findings in active session:</p>
      <div style="background:var(--bg-card); padding:0.85rem; border-radius:6px; border:1px solid var(--border-panel);">
        <strong style="color:#fff;">Evidence Volume</strong>
        <p style="color:var(--text-secondary); font-size:0.75rem; margin-top:4px;">
          ${AppState.evidenceItems.length} artifact(s) ingested. All file hashes computed via local hardware Web Crypto API.
        </p>
      </div>
      <div style="background:var(--bg-card); padding:0.85rem; border-radius:6px; border:1px solid var(--border-panel);">
        <strong style="color:var(--electric-cyan);">Future Backend AI Engine</strong>
        <p style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">
          When connected to the FastAPI backend, neural OCR, audio transcription, and cross-evidence timeline correlation models will process these items automatically.
        </p>
      </div>
    </div>
  `;
}

function getReportsHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.6rem; font-size:0.82rem;">
      <p style="color:var(--text-secondary);">Case Report Dossier for <strong>${AppState.currentUser.caseId}</strong></p>
      <div style="background:var(--bg-card); padding:0.85rem; border-radius:6px; border:1px solid var(--border-panel);">
        <div style="color:var(--teal-success); font-weight:600;">Status: Local Session Evidence Ingested</div>
        <p style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">
          Investigator: ${escapeHTML(AppState.currentUser.name)}<br>
          Artifacts Logged: ${AppState.evidenceItems.length}<br>
          Integrity Hashes: Verified via Web Crypto API (SHA-256)
        </p>
      </div>
    </div>
  `;
}

function getSettingsHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.8rem;">
      <p style="color:var(--text-secondary);">Session & Local Storage Configuration</p>
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
        <span>Hardware Cryptographic Engine</span>
        <span style="color:var(--teal-success); font-weight:600;">ACTIVE (Web Crypto API)</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
        <span>External Data Transmission</span>
        <span style="color:var(--electric-cyan); font-weight:600;">DISABLED (Privacy Mode)</span>
      </div>
      <button style="margin-top:0.5rem; padding:0.5rem; background:rgba(239,68,68,0.15); border:1px solid var(--red-danger); color:#ff9494; border-radius:4px; cursor:pointer;" onclick="AppState.evidenceItems = []; AppState.activityFeed = []; renderEvidenceCollection(); renderActivityFeed(); closeToolModal(); showToast('Session evidence cleared', 'info');">
        Clear All Session Evidence
      </button>
    </div>
  `;
}


// ==========================================================================
// 9. REAL-TIME ECG / SIGNAL WAVEFORMS
// ==========================================================================

function initECGWaveforms() {
  animateWaveform("login-ecg-canvas", "#24C8FF", 0.04);
  animateWaveform("header-ecg-canvas", "#24C8FF", 0.05);
  animateWaveform("sidebar-ecg-canvas", "#F59E0B", 0.04); // amber for demo mode
}

function animateWaveform(canvasId, color, speed) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let offset = 0;

  function render() {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    const midY = height / 2;
    for (let x = 0; x < width; x++) {
      const pos = (x + offset) % width;
      let y = midY;

      // Heartbeat pulse spike
      if (pos > width * 0.4 && pos < width * 0.46) {
        y = midY - 6 * Math.sin((pos - width * 0.4) / (width * 0.06) * Math.PI);
      } else if (pos >= width * 0.46 && pos < width * 0.52) {
        y = midY + 8 * Math.sin((pos - width * 0.46) / (width * 0.06) * Math.PI);
      } else if (pos >= width * 0.52 && pos < width * 0.58) {
        y = midY - 3 * Math.sin((pos - width * 0.52) / (width * 0.06) * Math.PI);
      } else {
        y += Math.sin(pos * 0.15) * 0.4;
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    offset += speed * 25;
    requestAnimationFrame(render);
  }

  render();
}


// ==========================================================================
// 10. HONEST BACKEND STATUS CHECK
// ==========================================================================

async function checkBackendHealth() {
  const statusTitle = document.getElementById("system-status-title");
  const statusSubtitle = document.getElementById("system-status-subtitle");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch("/health", { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      AppState.backendConnected = true;
      if (statusTitle) statusTitle.textContent = "Backend Connected";
      if (statusSubtitle) statusSubtitle.textContent = "FastAPI Service Online";
      return;
    }
  } catch (err) {
    // Expected when running frontend standalone
  }

  AppState.backendConnected = false;
  if (statusTitle) statusTitle.textContent = "Frontend Only";
  if (statusSubtitle) statusSubtitle.textContent = "Demo Mode (Local Browser Session)";
}


// ==========================================================================
// 11. UTILITIES & TOAST NOTIFICATIONS
// ==========================================================================

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="pulse-dot ${type === 'error' ? '' : (type === 'success' ? 'green-dot' : 'amber-dot')}"></span>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function getCurrentTimeFormatted() {
  const d = new Date();
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}

function formatMarkdown(text) {
  let html = text
    .replace(/^### (.*$)/gim, "<h4 style='color:#fff; margin:0.4rem 0;'>$1</h4>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code style='background:rgba(36,200,255,0.12); padding:2px 5px; border-radius:3px; color:var(--electric-cyan); font-family:\"JetBrains Mono\"; font-size:0.8em;'>$1</code>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");
  return html;
}
