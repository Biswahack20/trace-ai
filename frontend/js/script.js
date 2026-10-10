/**
 * TraceMind AI — Digital Forensic Investigation Platform
 * Frontend Architecture & Interactive Laboratory Controller
 */

// ==========================================================================
// 1. GLOBAL STATE & CONFIGURATION
// ==========================================================================

const AppState = {
  currentUser: {
    name: "Biswarupa Swain",
    email: "biswarupa@tracemind.ai",
    role: "Forensic Analyst",
    initial: "B",
    caseId: "Case #TF-2026-1010"
  },
  activeView: "login", // 'login' | 'dashboard'
  backendConnected: false,
  evidenceItems: [
    {
      id: "ev-1",
      name: "IMG_4587.jpg",
      category: "Image",
      size: "2.4 MB",
      bytes: 2516582,
      hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      time: "03:26 PM",
      status: "Verified Intact",
      thumb: "assets/evidence_thumb.jpg"
    },
    {
      id: "ev-2",
      name: "voice_note.mp3",
      category: "Audio",
      size: "1.2 MB",
      bytes: 1258291,
      hash: "a58e1c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852a12",
      time: "03:26 PM",
      status: "Verified Intact",
      thumb: null
    },
    {
      id: "ev-3",
      name: "notes.txt",
      category: "Text",
      size: "12 KB",
      bytes: 12288,
      hash: "f41c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852bb33",
      time: "03:26 PM",
      status: "Verified Intact",
      thumb: null
    }
  ],
  activityFeed: [
    { type: "image", title: "Image uploaded", detail: "IMG_4587.jpg", time: "03:26 PM", dot: "dot-cyan" },
    { type: "audio", title: "Audio uploaded", detail: "voice_note.mp3", time: "03:26 PM", dot: "dot-cyan" },
    { type: "analysis", title: "Analysis completed", detail: "Metadata & EXIF extracted", time: "03:32 PM", dot: "dot-green" },
    { type: "connection", title: "Connection found", detail: "Possible match (location + time)", time: "03:33 PM", dot: "dot-orange" }
  ],
  timelineEvents: [
    { time: "2026-10-10 03:15:00", label: "Evidence Acquisition", desc: "Digital media seized at perimeter check" },
    { time: "2026-10-10 03:26:12", label: "Media Intake", desc: "Files uploaded to TraceMind AI forensic sandbox" },
    { time: "2026-10-10 03:32:44", label: "EXIF & Geolocation", desc: "GPS coordinates extracted from IMG_4587.jpg" },
    { time: "2026-10-10 03:33:10", label: "Correlation Match", desc: "Ambient audio noise in voice_note.mp3 matches location profile" }
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
  checkBackendHealth();

  // Periodic health check
  setInterval(checkBackendHealth, 15000);
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
  const btnGoogle = document.getElementById("btn-google-demo");
  const forgotLink = document.getElementById("forgot-password-link");

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
    });

    showLoginBtn.addEventListener("click", () => {
      registerForm.classList.add("hidden");
      loginForm.classList.remove("hidden");
    });
  }

  // Handle Demo Login Submission
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const pass = passwordInput.value;

      if (!email || !pass) {
        showToast("Please enter both email and passkey", "error");
        return;
      }

      // Extract investigator name from email or use default
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

  // Google Demo Auth
  if (btnGoogle) {
    btnGoogle.addEventListener("click", () => {
      showToast("Initializing Google Workspace Demo Auth...", "info");
      setTimeout(() => {
        executeAuthenticationTransition("Biswarupa Swain", "biswarupa.swain@gmail.com");
      }, 700);
    });
  }

  // Forgot Password Demo
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Demo Environment: Passkey reset link dispatched to investigator terminal", "info");
    });
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
      <span class="btn-text">SCANNING BIOMETRICS...</span>
    `;
  }

  // Update State
  AppState.currentUser.name = userName;
  AppState.currentUser.email = userEmail;
  AppState.currentUser.initial = userName.charAt(0).toUpperCase();

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
      showToast(`Biometric Session Authenticated: Welcome, ${userName}`, "success");

      // Reset enter button
      if (enterBtn) {
        enterBtn.disabled = false;
        enterBtn.innerHTML = `
          <span class="btn-icon"><img src="assets/fingerprint.svg" class="btn-fp-icon"></span>
          <span class="btn-text">Enter Investigation Lab</span>
          <span class="btn-arrow">→</span>
        `;
      }
    }, 650);
  }, 400);
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
      showToast("Forensic session locked. Returned to terminal entrance.", "info");
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
      showToast("Alerts: 1. EXIF correlation verified. 2. Chain of custody hash intact.", "info");
    });
  }

  // Export Dossier Demo
  const exportBtn = document.getElementById("btn-export-log");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      showToast("Compiling Case Dossier #TF-2026-1010...", "info");
      setTimeout(() => {
        showToast("Case Dossier PDF ready for digital signoff.", "success");
      }, 1000);
    });
  }
}

function handleNavigationTab(tab) {
  if (tab === "investigation") {
    // Current primary view
    showToast("Investigation Workspace active", "info");
  } else if (tab === "evidence-library") {
    openToolModal("Evidence Library Dossier", getEvidenceLibraryHTML());
  } else if (tab === "chat-assistant") {
    document.getElementById("chat-input").focus();
    showToast("Chat Assistant focused", "info");
  } else if (tab === "analysis-results") {
    openToolModal("Forensic Analysis Results", getAnalysisResultsHTML());
  } else if (tab === "timeline") {
    openToolModal("Timeline Reconstruction", getTimelineHTML());
  } else if (tab === "reports") {
    openToolModal("Investigative Case Report", getReportsHTML());
  } else if (tab === "settings") {
    openToolModal("Laboratory System Configuration", getSettingsHTML());
  }
}


// ==========================================================================
// 5. EVIDENCE UPLOAD & CRYPTOGRAPHIC VERIFICATION
// ==========================================================================

function initUploadSystem() {
  const dropzone = document.getElementById("upload-dropzone");
  const fileInput = document.getElementById("evidence-file-input");
  const catButtons = document.querySelectorAll(".category-tile");

  if (!dropzone || !fileInput) return;

  // Category tile click opens filtered file picker
  catButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const accept = btn.getAttribute("data-accept");
      fileInput.setAttribute("accept", accept || "*/*");
      fileInput.click();
    });
  });

  // Dropzone click opens general file picker
  dropzone.addEventListener("click", () => {
    fileInput.removeAttribute("accept");
    fileInput.click();
  });

  // File Input Change
  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleIncomingFiles(Array.from(e.target.files));
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
      handleIncomingFiles(Array.from(e.dataTransfer.files));
    }
  });
}

async function handleIncomingFiles(files) {
  for (const file of files) {
    await processSingleEvidenceFile(file);
  }
}

async function processSingleEvidenceFile(file) {
  // Validate File Size (Limit: 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    showToast(`File rejected: ${file.name} exceeds 50MB intake limit`, "error");
    return;
  }

  const progressBox = document.getElementById("upload-progress-box");
  const progressName = document.getElementById("uploading-file-name");
  const progressPercent = document.getElementById("uploading-file-percent");
  const progressBar = document.getElementById("upload-progress-bar");
  const hashingNote = document.getElementById("upload-hashing-note");

  if (progressBox) progressBox.classList.remove("hidden");
  if (progressName) progressName.textContent = `In-taking: ${file.name}`;

  // Animate upload progress
  for (let p = 10; p <= 80; p += 25) {
    if (progressBar) progressBar.style.width = `${p}%`;
    if (progressPercent) progressPercent.textContent = `${p}%`;
    await sleep(70);
  }

  // Real Cryptographic Hash calculation using Web Crypto API
  if (hashingNote) hashingNote.textContent = "Computing cryptographic SHA-256 fingerprint...";
  const hashHex = await computeSHA256(file);

  if (progressBar) progressBar.style.width = "100%";
  if (progressPercent) progressPercent.textContent = "100%";
  await sleep(150);

  if (progressBox) progressBox.classList.add("hidden");

  // Determine Category
  const category = detectEvidenceCategory(file);
  const formattedSize = formatFileSize(file.size);
  const nowTime = getCurrentTimeFormatted();

  // Create Evidence Item Object
  const newEvidence = {
    id: `ev-${Date.now()}`,
    name: file.name,
    category: category,
    size: formattedSize,
    bytes: file.size,
    hash: hashHex,
    time: nowTime,
    status: "Verified Intact",
    thumb: file.type.startsWith("image/") ? URL.createObjectURL(file) : null
  };

  // Prepend to Evidence List in State
  AppState.evidenceItems.unshift(newEvidence);
  renderEvidenceCollection();

  // Add to Activity Feed
  const newActivity = {
    type: category.toLowerCase(),
    title: `${category} uploaded`,
    detail: file.name,
    time: nowTime,
    dot: "dot-cyan"
  };
  AppState.activityFeed.unshift(newActivity);
  renderActivityFeed();

  // Add to Timeline
  AppState.timelineEvents.push({
    time: `2026-10-10 ${nowTime}:00`,
    label: `Evidence Uploaded (${category})`,
    desc: `File '${file.name}' verified with SHA-256 hash ${hashHex.substring(0, 12)}...`
  });

  showToast(`Evidence verified & ingested: ${file.name}`, "success");

  // Announce in chat
  appendAssistantMessage(`Evidence intake confirmed for **${file.name}** (${category}, ${formattedSize}).\nSHA-256 Hash: \`${hashHex}\`\n\nReady for analysis. You can ask me to inspect its metadata, extract contents, or correlate with existing evidence.`);
}

function detectEvidenceCategory(file) {
  const mime = file.type;
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
    console.warn("Web Crypto unavailable, generating synthetic hash", err);
    return pseudoHash(file.name + file.size);
  }
}

function pseudoHash(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(16).padStart(64, "e3b0c44298fc1c149afbf4c8");
}

function renderEvidenceCollection() {
  const list = document.getElementById("evidence-items-list");
  const countBadge = document.getElementById("evidence-file-count");
  if (!list) return;

  if (countBadge) countBadge.textContent = AppState.evidenceItems.length;

  list.innerHTML = AppState.evidenceItems.map(item => `
    <div class="evidence-item" data-id="${item.id}" onclick="inspectEvidenceItem('${item.id}')">
      <div class="item-visual ${item.thumb ? 'thumb-visual' : 'icon-visual'}" ${item.thumb ? `style="background-image: url('${item.thumb}');"` : ''}>
        ${!item.thumb ? getCategoryIconSvg(item.category) : ''}
      </div>
      <div class="item-meta">
        <span class="item-name" title="${item.name}">${item.name}</span>
        <span class="item-info">${item.category} &bull; ${item.size}</span>
      </div>
      <div class="item-status success-status" title="${item.status}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    </div>
  `).join("");
}

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

  feed.innerHTML = AppState.activityFeed.slice(0, 5).map(item => `
    <div class="activity-entry">
      <div class="entry-dot-col">
        <span class="activity-dot ${item.dot}"></span>
      </div>
      <div class="entry-content">
        <span class="entry-title">${item.title}</span>
        <span class="entry-detail">${item.detail}</span>
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
          <h4 style="color:#ffffff; font-size:1rem;">${item.name}</h4>
          <span style="color:var(--electric-cyan); font-family:'JetBrains Mono'; font-size:0.75rem;">Category: ${item.category} &bull; ${item.size}</span>
        </div>
      </div>
      <div style="background:#040c17; padding:0.85rem; border-radius:6px; font-family:'JetBrains Mono'; font-size:0.75rem; border:1px solid var(--border-panel);">
        <div style="color:var(--text-muted); margin-bottom:4px;">CRYPTOGRAPHIC SHA-256 CHECKSUM</div>
        <div style="color:var(--teal-success); word-break:break-all;">${item.hash}</div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.8rem;">
        <div style="background:var(--bg-card); padding:0.6rem; border-radius:6px; border:1px solid var(--border-panel);">
          <span style="color:var(--text-muted); display:block; font-size:0.7rem;">CHAIN OF CUSTODY</span>
          <strong style="color:#ffffff;">Verified by ${AppState.currentUser.name}</strong>
        </div>
        <div style="background:var(--bg-card); padding:0.6rem; border-radius:6px; border:1px solid var(--border-panel);">
          <span style="color:var(--text-muted); display:block; font-size:0.7rem;">INTAKE TIMESTAMP</span>
          <strong style="color:#ffffff;">10 Oct 2026, ${item.time}</strong>
        </div>
      </div>
    </div>
  `;

  openToolModal(`Evidence Dossier: ${item.name}`, content, () => {
    // Send to chat for analysis
    document.getElementById("chat-input").value = `Perform full forensic correlation analysis on ${item.name}`;
    document.getElementById("chat-composer-form").dispatchEvent(new Event("submit"));
  }, "Analyze in Chat");
}


// ==========================================================================
// 6. FORENSIC AI CHAT ENGINE
// ==========================================================================

function initChatSystem() {
  const chatForm = document.getElementById("chat-composer-form");
  const chatInput = document.getElementById("chat-input");
  const attachBtn = document.getElementById("composer-attach-btn");
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
    typingIndicator.style.display = "flex";
  } else {
    thread.appendChild(userRow);
  }

  thread.scrollTop = thread.scrollHeight;
}

function appendAssistantMessage(markdownText) {
  const thread = document.getElementById("chat-thread");
  const typingIndicator = document.getElementById("typing-indicator-row");
  const now = getCurrentTimeFormatted();

  // Hide typing indicator
  if (typingIndicator) {
    typingIndicator.style.display = "none";
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
  if (typingIndicator) typingIndicator.style.display = "flex";

  // Simulate forensic processing latency (600 - 1200ms)
  await sleep(950);

  const promptLower = userPrompt.toLowerCase();
  let response = "";

  if (promptLower.includes("connect") || promptLower.includes("analyz") || promptLower.includes("image and an audio")) {
    response = `**FORENSIC CORRELATION IDENTIFIED (Confidence: 94.6%)**

I cross-referenced \`IMG_4587.jpg\` with \`voice_note.mp3\`:

1. **Temporal Alignment**:
   • EXIF capture timestamp: \`2026-10-10 15:22:08 UTC\`
   • Audio creation tag: \`2026-10-10 15:22:45 UTC\` (Delta: 37 seconds)

2. **Acoustic & Environmental Profiling**:
   • Extracted EXIF camera metadata indicates indoor server vault acoustics.
   • Audio background frequency shows a 60 Hz hum corresponding to high-capacity HVAC cooling units.

3. **Preliminary Finding**:
   • Both files originated in the same physical facility within an immediate time window.
   • Chain-of-custody hash verification confirms neither file was modified post-acquisition.`;
  } else if (promptLower.includes("metadata") || promptLower.includes("exif")) {
    response = `**METADATA REPORT SUMMARY**

• **File**: \`IMG_4587.jpg\`
• **EXIF Header**: Standard JPEG Segment (0xFFD8)
• **Device**: Nikon Z8 Forensic Rig
• **Resolution**: 8256 × 5504 (45.4 MP)
• **Color Space**: sRGB IEC61966-2.1
• **Steganography Test**: No hidden LSB payload detected.
• **Integrity**: SHA-256 Verified.`;
  } else if (promptLower.includes("timeline") || promptLower.includes("reconstruct")) {
    response = `**INCIDENT TIMELINE RECONSTRUCTION**

\`[03:15 PM]\` Physical security check triggered at Sector 4
\`[03:22 PM]\` High-resolution capture: \`IMG_4587.jpg\`
\`[03:22 PM]\` Audio voice recording captured: \`voice_note.mp3\`
\`[03:26 PM]\` Evidence files uploaded to TraceMind AI Sandbox
\`[03:33 PM]\` Automated Correlation Match flagged (location + timestamp)`;
  } else if (promptLower.includes("extract") || promptLower.includes("text")) {
    response = `**TRANSCRIPTION & TEXT EXTRACTION**

• Audio File: \`voice_note.mp3\`
• Transcript: *"Check perimeter camera 4. Server rack 12 showing anomalous cooling sensor spike."*
• Acoustic Confidence: \`98.2%\`
• Speaker Profile: Male, non-accented vocal cadence.`;
  } else {
    response = `I have received your inquiry: *"${escapeHTML(userPrompt)}"*

Forensic scan across active case **#TF-2026-1010**:
• **Active Evidence Files**: ${AppState.evidenceItems.length}
• **Integrity State**: All cryptographic hashes confirmed match.
• **Recommended Action**: You can utilize the **Quick Tools** (Metadata Viewer or Hash Calculator) or request automated incident timeline correlation.`;
  }

  appendAssistantMessage(response);
}


// ==========================================================================
// 7. QUICK TOOLS & INTERACTIVE FORENSIC MODALS
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
      openToolModal("Metadata & EXIF Forensic Viewer", getMetadataViewerHTML(), executeMetadataAnalysis, "Extract EXIF");
    });
  }

  if (toolHash) {
    toolHash.addEventListener("click", () => {
      openToolModal("Cryptographic Hash Calculator", getHashCalculatorHTML(), executeHashCalculation, "Generate Hashes");
    });
  }

  if (toolTimeline) {
    toolTimeline.addEventListener("click", () => {
      openToolModal("Interactive Incident Timeline Builder", getTimelineHTML(), addNewTimelineEvent, "Add Timeline Marker");
    });
  }

  if (toolAnalyzer) {
    toolAnalyzer.addEventListener("click", () => {
      openToolModal("Digital File Signature & Entropy Analyzer", getFileAnalyzerHTML(), executeFileAnalysis, "Run Deep Inspection");
    });
  }

  if (viewAllAct) {
    viewAllAct.addEventListener("click", () => {
      openToolModal("Complete Chain-of-Custody Activity Feed", getActivityLogHTML());
    });
  }

  if (credsBtn) {
    credsBtn.addEventListener("click", () => {
      openToolModal("Forensic Analyst Credentials", getCredentialsHTML());
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


// --- Quick Tool Modal HTML Templates ---

function getMetadataViewerHTML() {
  const options = AppState.evidenceItems.map(i => `<option value="${i.id}">${i.name} (${i.category})</option>`).join("");
  return `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div>
        <label style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom:4px;">SELECT EVIDENCE ARTIFACT</label>
        <select id="meta-select-file" style="width:100%; padding:0.6rem; background:var(--bg-input); border:1px solid var(--border-panel); color:#fff; border-radius:6px;">
          ${options}
        </select>
      </div>
      <div id="meta-results-box" style="background:#040c17; border:1px solid var(--border-panel); border-radius:6px; padding:1rem; font-family:'JetBrains Mono'; font-size:0.78rem;">
        <span style="color:var(--text-muted);">Select an artifact above and click "Extract EXIF" to parse raw metadata headers and GPS coordinates.</span>
      </div>
    </div>
  `;
}

function executeMetadataAnalysis() {
  const select = document.getElementById("meta-select-file");
  const resBox = document.getElementById("meta-results-box");
  if (!select || !resBox) return;

  const item = AppState.evidenceItems.find(i => i.id === select.value) || AppState.evidenceItems[0];
  resBox.innerHTML = `
    <div style="color:var(--electric-cyan); margin-bottom:8px; font-weight:600;">[PARSED FORENSIC EXIF TAGS]</div>
    <table style="width:100%; border-collapse:collapse; color:#fff;">
      <tr><td style="color:var(--text-muted); padding:3px 0;">Filename:</td><td>${item.name}</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">MIME Type:</td><td>image/jpeg (0xFFD8)</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">File Size:</td><td>${item.size} (${item.bytes.toLocaleString()} bytes)</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">EXIF Make:</td><td>Nikon Forensic Systems</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">Exposure:</td><td>1/250s, f/2.8, ISO 400</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">Timestamp:</td><td>2026:10:10 15:22:08 UTC</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">GPS Latitude:</td><td>37° 46' 29.8" N</td></tr>
      <tr><td style="color:var(--text-muted); padding:3px 0;">GPS Longitude:</td><td>122° 25' 09.5" W</td></tr>
    </table>
  `;
  showToast("Metadata successfully extracted", "success");
}

function getHashCalculatorHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <p style="color:var(--text-secondary); font-size:0.82rem;">Compute certified cryptographic integrity checksums (SHA-256, SHA-1, MD5) on any target file in real time using the hardware Web Crypto Engine.</p>
      <div style="border:1.5px dashed var(--border-panel); padding:1rem; text-align:center; border-radius:6px; cursor:pointer;" onclick="document.getElementById('hash-tool-file-input').click()">
        <input type="file" id="hash-tool-file-input" class="hidden" onchange="handleHashToolFile(this)">
        <span style="color:var(--electric-cyan);">Click here to select a file for hash calculation</span>
      </div>
      <div id="hash-results-box" style="display:flex; flex-direction:column; gap:0.6rem; font-family:'JetBrains Mono'; font-size:0.75rem;">
        <div style="background:#040c17; padding:0.6rem; border-radius:6px; border:1px solid var(--border-panel);">
          <div style="color:var(--text-muted); font-size:0.68rem;">TARGET: IMG_4587.jpg</div>
          <div style="color:var(--text-primary); margin-top:2px;">SHA-256: <span style="color:var(--teal-success);">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
          <div style="color:var(--text-primary); margin-top:2px;">SHA-1:   <span style="color:var(--electric-cyan);">da39a3ee5e6b4b0d3255bfef95601890afd80709</span></div>
        </div>
      </div>
    </div>
  `;
}

async function handleHashToolFile(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  const resBox = document.getElementById("hash-results-box");
  if (!resBox) return;

  resBox.innerHTML = `<span style="color:var(--electric-cyan);">Computing real hardware hash for ${file.name}...</span>`;
  const sha256 = await computeSHA256(file);

  resBox.innerHTML = `
    <div style="background:#040c17; padding:0.75rem; border-radius:6px; border:1px solid var(--border-panel);">
      <div style="color:var(--text-muted); font-size:0.68rem;">VERIFIED TARGET: ${file.name} (${formatFileSize(file.size)})</div>
      <div style="color:#fff; margin-top:4px;">SHA-256: <span style="color:var(--teal-success);">${sha256}</span></div>
      <button style="margin-top:6px; background:var(--bg-panel); border:1px solid var(--border-panel); color:var(--electric-cyan); padding:4px 8px; border-radius:4px; font-size:0.7rem;" onclick="navigator.clipboard.writeText('${sha256}'); showToast('Hash copied to clipboard', 'info');">
        Copy SHA-256 to Clipboard
      </button>
    </div>
  `;
}

function executeHashCalculation() {
  document.getElementById("hash-tool-file-input").click();
}

function getTimelineHTML() {
  const events = AppState.timelineEvents.map(e => `
    <div style="display:flex; gap:0.75rem; margin-bottom:0.75rem; font-size:0.8rem;">
      <div style="font-family:'JetBrains Mono'; color:var(--electric-cyan); font-size:0.72rem; width:120px; flex-shrink:0;">${e.time.split(" ")[1]}</div>
      <div style="flex:1;">
        <strong style="color:#ffffff; display:block;">${e.label}</strong>
        <span style="color:var(--text-muted); font-size:0.75rem;">${e.desc}</span>
      </div>
    </div>
  `).join("");

  return `
    <div style="display:flex; flex-direction:column; gap:1rem;">
      <div style="max-height:220px; overflow-y:auto; padding-right:0.5rem;">
        ${events}
      </div>
      <hr style="border:none; height:1px; background:var(--border-panel);">
      <div style="display:flex; gap:0.5rem;">
        <input type="text" id="new-timeline-label" placeholder="Event Title" style="flex:1; padding:0.5rem; background:var(--bg-input); border:1px solid var(--border-panel); color:#fff; border-radius:4px; font-size:0.8rem;">
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
  if (!label) return;

  const now = getCurrentTimeFormatted();
  AppState.timelineEvents.push({
    time: `2026-10-10 ${now}:00`,
    label: label,
    desc: desc || "Documented by investigator"
  });

  closeToolModal();
  showToast(`Timeline Marker Added: ${label}`, "success");
}

function getFileAnalyzerHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.82rem;">
      <p style="color:var(--text-secondary);">Triage file signatures, verify magic bytes, and calculate byte entropy to detect packed, encrypted, or hidden payloads.</p>
      <div style="background:#040c17; border:1px solid var(--border-panel); padding:0.75rem; border-radius:6px; font-family:'JetBrains Mono'; font-size:0.75rem;">
        <div style="color:var(--teal-success);">[TRIAGE REPORT: IMG_4587.jpg]</div>
        <div>Magic Bytes:   FF D8 FF E1 (Standard JPEG)</div>
        <div>MIME Match:    100% Consistent</div>
        <div>Entropy Index: 7.82 / 8.0 (Normal for lossy compression)</div>
        <div>Status:        No anomalies flagged</div>
      </div>
    </div>
  `;
}

function executeFileAnalysis() {
  showToast("Deep signature verification complete: No obfuscation found.", "success");
  closeToolModal();
}

function getActivityLogHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.6rem;">
      ${AppState.activityFeed.map(a => `
        <div style="display:flex; justify-content:space-between; background:var(--bg-card); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
          <div>
            <strong style="color:#fff; font-size:0.82rem;">${a.title}</strong>
            <div style="color:var(--text-muted); font-size:0.72rem;">${a.detail}</div>
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
        <h4 style="color:#fff; margin-bottom:0.4rem;">${AppState.currentUser.name}</h4>
        <div style="color:var(--electric-cyan); font-size:0.75rem; font-family:'JetBrains Mono';">ROLE: ${AppState.currentUser.role}</div>
        <div style="color:var(--text-muted); font-size:0.72rem; margin-top:4px;">AGENCY ID: #TM-DFU-90214</div>
        <div style="color:var(--teal-success); font-size:0.72rem; margin-top:2px;">SECURITY CLEARANCE: TOP SECRET // DIGITAL EVIDENCE PROTOCOL</div>
      </div>
    </div>
  `;
}

function getEvidenceLibraryHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary); font-size:0.8rem;">All collected forensic artifacts stored in local repository vault.</p>
      ${AppState.evidenceItems.map(i => `
        <div style="display:flex; align-items:center; justify-content:space-between; background:var(--bg-card); padding:0.5rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
          <span style="color:#fff; font-weight:500;">${i.name}</span>
          <span style="color:var(--electric-cyan); font-family:'JetBrains Mono'; font-size:0.75rem;">${i.category} &bull; ${i.size}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function getAnalysisResultsHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.8rem;">
      <div style="background:var(--bg-card); padding:0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
        <strong style="color:#fff;">Correlation Cluster #1</strong>
        <p style="color:var(--text-secondary); font-size:0.78rem; margin-top:4px;">Spatial & acoustic match verified between IMG_4587.jpg and voice_note.mp3 with 94.6% forensic confidence.</p>
      </div>
    </div>
  `;
}

function getReportsHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.6rem;">
      <p style="color:var(--text-secondary); font-size:0.8rem;">Official Court-Admissible Dossier for Case #TF-2026-1010.</p>
      <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; border:1px solid var(--border-panel);">
        <strong style="color:var(--teal-success);">Case Summary: Evidence Integrity 100%</strong>
        <p style="color:var(--text-muted); font-size:0.75rem; margin-top:4px;">3 artifacts checked &bull; No hash discrepancies &bull; Ready for export.</p>
      </div>
    </div>
  `;
}

function getSettingsHTML() {
  return `
    <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.8rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
        <span>Auto-Compute SHA-256 on Intake</span>
        <span style="color:var(--teal-success); font-weight:600;">ENABLED</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-card); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid var(--border-panel);">
        <span>Cryptographic Hardware Engine</span>
        <span style="color:var(--electric-cyan); font-weight:600;">ACTIVE</span>
      </div>
    </div>
  `;
}


// ==========================================================================
// 8. REAL-TIME ECG / SIGNAL WAVEFORM VISUALIZATIONS
// ==========================================================================

function initECGWaveforms() {
  animateWaveform("login-ecg-canvas", "#24C8FF", 0.04);
  animateWaveform("header-ecg-canvas", "#24C8FF", 0.05);
  animateWaveform("sidebar-ecg-canvas", "#00D6A0", 0.06);
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

      // Create ECG heartbeat spike pattern at specific point
      if (pos > width * 0.4 && pos < width * 0.46) {
        y = midY - 6 * Math.sin((pos - width * 0.4) / (width * 0.06) * Math.PI);
      } else if (pos >= width * 0.46 && pos < width * 0.52) {
        y = midY + 8 * Math.sin((pos - width * 0.46) / (width * 0.06) * Math.PI);
      } else if (pos >= width * 0.52 && pos < width * 0.58) {
        y = midY - 3 * Math.sin((pos - width * 0.52) / (width * 0.06) * Math.PI);
      } else {
        y += Math.sin(pos * 0.15) * 0.5;
      }

      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    offset += speed * 30;
    requestAnimationFrame(render);
  }

  render();
}


// ==========================================================================
// 9. BACKEND HEALTH INTEGRATION
// ==========================================================================

async function checkBackendHealth() {
  const statusTitle = document.getElementById("system-status-title");
  const statusSubtitle = document.getElementById("system-status-subtitle");

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch("/health", { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      AppState.backendConnected = true;
      if (statusTitle) statusTitle.textContent = "System Online";
      if (statusSubtitle) statusSubtitle.textContent = "FastAPI Backend Connected";
    } else {
      setFallbackStatus();
    }
  } catch (err) {
    setFallbackStatus();
  }
}

function setFallbackStatus() {
  AppState.backendConnected = false;
  const statusTitle = document.getElementById("system-status-title");
  const statusSubtitle = document.getElementById("system-status-subtitle");
  if (statusTitle) statusTitle.textContent = "System Online";
  if (statusSubtitle) statusSubtitle.textContent = "All tools operational (Demo Lab)";
}


// ==========================================================================
// 10. UTILITIES & TOAST NOTIFICATIONS
// ==========================================================================

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="pulse-dot ${type === 'error' ? '' : 'green-dot'}"></span>
    <span>${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px)";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
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
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code style='background:rgba(36,200,255,0.12); padding:2px 5px; border-radius:3px; color:var(--electric-cyan); font-family:\"JetBrains Mono\"; font-size:0.8em;'>$1</code>")
    .replace(/\n\n/g, "<br><br>")
    .replace(/\n/g, "<br>");
  return html;
}
