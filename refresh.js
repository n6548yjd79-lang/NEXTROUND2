(() => {
  "use strict";

  const localAccessKey = "nextround-local-access-v1";
  const loginScreen = document.querySelector("#refreshLogin");
  const homeScreen = document.querySelector("#refreshHome");
  const selectionScreen = document.querySelector("#refreshSelection");
  const aiScreen = document.querySelector("#refreshAi");
  const bottomNav = document.querySelector("#refreshBottomNav");
  const menuDialog = document.querySelector("#refreshMenuDialog");
  const notificationDialog = document.querySelector("#notificationDialog");
  const featureGuideDialog = document.querySelector("#featureGuideDialog");
  const securityDialog = document.querySelector("#securityDialog");
  const updatesDialog = document.querySelector("#updatesDialog");
  const termsDialog = document.querySelector("#termsDialog");
  const disclaimerDialog = document.querySelector("#disclaimerDialog");
  const selectionListView = document.querySelector("#selectionListView");
  const selectionPipelineView = document.querySelector("#selectionPipelineView");
  const selectionOffersView = document.querySelector("#selectionOffersView");
  const loginError = document.querySelector("#refreshLoginError");
  const refreshEmail = document.querySelector("#refreshEmail");
  const refreshPassword = document.querySelector("#refreshPassword");
  let localAccess = sessionStorage.getItem(localAccessKey) === "1";
  let authResolved = false;
  let currentView = "home";

  function hasLocalSelectionData() {
    try {
      return typeof hasLocalUserData === "function" && hasLocalUserData();
    } catch {
      return false;
    }
  }

  function signedIn() {
    return Boolean(typeof cloudUser !== "undefined" && cloudUser);
  }

  function playViewTransition(target) {
    if (!target) return;
    target.classList.remove("view-enter");
    void target.offsetWidth;
    target.classList.add("view-enter");
  }

  function showLogin() {
    loginScreen.hidden = false;
    homeScreen.hidden = true;
    selectionScreen.hidden = true;
    aiScreen.hidden = true;
    bottomNav.hidden = true;
    const hasLocal = hasLocalSelectionData();
    document.querySelector("#migrationNotice").hidden = !hasLocal;
    document.querySelector("#refreshLocalEntry").hidden = !hasLocal;
    document.querySelector("#refreshEmailLogin").textContent = hasLocal ? "ログインしてデータを引き継ぐ" : "ログイン";
    document.querySelector("#refreshEmailRegister").textContent = hasLocal ? "新規登録してデータを引き継ぐ" : "新規登録";
    document.querySelector("#refreshGoogleLoginLabel").textContent = hasLocal
      ? "Googleで続けてデータを引き継ぐ"
      : "Googleでログイン・新規登録";
    if (hasLocal) {
      const memoCount = entries.filter(entry => entry.memo || entry.esArchiveVault).length;
      const scheduleCount = getCalendarEvents().length;
      document.querySelector("#migrationCounts").innerHTML = `
        <span>選考 <strong>${entries.length}件</strong></span>
        <span>ES・メモ <strong>${memoCount}件</strong></span>
        <span>予定 <strong>${scheduleCount}件</strong></span>
      `;
    }
    playViewTransition(loginScreen);
  }

  function showApp(view = currentView) {
    currentView = ["selection", "ai"].includes(view) ? view : "home";
    loginScreen.hidden = true;
    homeScreen.hidden = currentView !== "home";
    selectionScreen.hidden = currentView !== "selection";
    aiScreen.hidden = currentView !== "ai";
    bottomNav.hidden = false;
    bottomNav.querySelectorAll("[data-refresh-view]").forEach(button => {
      button.classList.toggle("active", button.dataset.refreshView === currentView);
    });
    updateAccountUi();
    updateHome();
    if (currentView === "selection") render();
    if (currentView === "ai") window.nextroundAi?.activate();
    window.scrollTo({ top: 0, behavior: "auto" });
    playViewTransition(currentView === "selection" ? selectionScreen : currentView === "ai" ? aiScreen : homeScreen);
  }

  function resolveAccess() {
    if (signedIn() || localAccess) showApp(currentView);
    else showLogin();
  }

  function openMenu() {
    updateAccountUi();
    menuDialog.showModal();
  }

  function closeMenu() {
    if (menuDialog.open) menuDialog.close();
  }

  function openCalendarView() {
    selectedCalendarDate = localDateKey(new Date());
    const today = new Date();
    calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
    openCalendar();
  }

  function navigate(action) {
    if (action === "home" || action === "selection" || action === "ai") {
      showApp(action);
      return;
    }
    if (action === "calendar") {
      openCalendarView();
      return;
    }
    if (action === "menu") openMenu();
  }

  function dateKeyOffset(days) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return localDateKey(date);
  }

  function homeEventMarkup(event) {
    const isDeadline = event.label.includes("締切");
    const tone = isDeadline ? "deadline" : event.label.includes("確定") ? "confirmed" : "plan";
    return `
      <button class="home-event ${tone}" type="button" data-home-event-date="${escapeHtml(event.date)}">
        <time>${escapeHtml(formatHomeDate(event.date))}</time>
        <span><strong>${escapeHtml(event.company)}</strong><small>${escapeHtml(event.label)} / ${escapeHtml(event.detail)}</small></span>
        <b>›</b>
      </button>
    `;
  }

  function formatHomeDate(value) {
    const date = parseDateKey(value);
    const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(date);
    return `${date.getMonth() + 1}/${date.getDate()} ${weekday}`;
  }

  function renderHomeEvents(container, eventList, emptyText) {
    container.innerHTML = eventList.length
      ? eventList.map(homeEventMarkup).join("")
      : `<p class="home-empty">${escapeHtml(emptyText)}</p>`;
    container.querySelectorAll("[data-home-event-date]").forEach(button => {
      button.addEventListener("click", () => {
        selectedCalendarDate = button.dataset.homeEventDate;
        const date = parseDateKey(selectedCalendarDate);
        calendarCursor = new Date(date.getFullYear(), date.getMonth(), 1);
        openCalendar();
      });
    });
  }

  function updateHomeGreeting(currentDate = new Date()) {
    const hour = currentDate.getHours();
    const isMorning = hour >= 5 && hour < 12;
    const isDaytime = hour >= 12 && hour < 18;
    document.querySelector("#homeDateLabel").textContent = new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    }).format(currentDate);
    document.querySelector("#homeGreeting").textContent = isMorning
      ? "おはようございます。今日の締切と予定を確認しましょう。"
      : isDaytime
        ? "こんにちは。直近の締切と予定を確認しましょう。"
        : "こんばんは。今日の残りと、明日以降の予定を確認しましょう。";
  }

  function updateHome() {
    if (!homeScreen || typeof entries === "undefined") return;
    const currentDate = new Date();
    updateHomeGreeting(currentDate);
    const active = entries.filter(entry => !doneStages.has(entry.stage)).length;
    const soon = entries.filter(entry => {
      const left = daysLeft(entry.deadline);
      return left !== null && left >= 0 && left <= 7 && !doneStages.has(entry.stage);
    }).length;
    document.querySelector("#homeSelectionSummary").textContent = `進行中 ${active}件 / 締切間近 ${soon}件`;

    const migrationBanner = document.querySelector("#migrationCompleteBanner");
    let migrationState = {};
    try {
      migrationState = JSON.parse(localStorage.getItem(migrationStateKey) || "{}") || {};
    } catch {
      migrationState = {};
    }
    const migrationVerified = Boolean(migrationState.verifiedAt && migrationState.entryCount === entries.length);
    migrationBanner.hidden = !migrationVerified || localStorage.getItem(migrationAckKey) === migrationState.verifiedAt;
    document.querySelector("#migrationCompleteText").textContent = migrationVerified
      ? `選考データ ${migrationState.entryCount}/${migrationState.entryCount}件を確認済み。刷新前の退避データも端末内に残っています。`
      : "";

    const todayKey = dateKeyOffset(0);
    const weekEndKey = dateKeyOffset(7);
    const calendarEvents = getCalendarEvents()
      .sort((first, second) => first.date.localeCompare(second.date) || first.priority - second.priority);
    const todayEvents = calendarEvents.filter(event => event.date === todayKey);
    const weekEvents = calendarEvents.filter(event => event.date > todayKey && event.date <= weekEndKey);
    document.querySelector("#todayEventCount").textContent = `${todayEvents.length}件`;
    renderHomeEvents(document.querySelector("#homeTodayEvents"), todayEvents, "今日の締切・予定はありません。");
    renderHomeEvents(document.querySelector("#homeWeekEvents"), weekEvents, "7日以内の締切・予定はありません。");
  }

  function pipelineGroup(entry) {
    if (doneStages.has(entry.stage)) return "完了";
    if (entry.stage === "結果待ち") return "結果待ち";
    if (["気になる", "応募予定"].includes(entry.stage)) return "応募準備";
    if (["書類選考中", "ES提出済", "Webテスト"].includes(entry.stage)) return "書類・テスト";
    return "選考中";
  }

  function renderPipeline() {
    if (!selectionPipelineView) return;
    const groups = ["応募準備", "書類・テスト", "選考中", "結果待ち", "完了"];
    const visibleEntries = typeof filteredEntries === "function" ? filteredEntries() : entries;
    selectionPipelineView.innerHTML = groups.map(group => {
      const groupEntries = visibleEntries.filter(entry => pipelineGroup(entry) === group);
      return `
        <section class="pipeline-column">
          <header><div><small>${escapeHtml(group === "完了" ? "RESULT" : "STAGE")}</small><h2>${escapeHtml(group)}</h2></div><span>${groupEntries.length}</span></header>
          <div class="pipeline-items">
            ${groupEntries.length ? groupEntries.map(entry => `
              <button class="pipeline-item${winStages.has(entry.stage) ? " win" : ""}" type="button" data-pipeline-entry="${escapeHtml(entry.id)}">
                <strong>${escapeHtml(entry.company)}</strong>
                <span>${escapeHtml(entry.stage)}</span>
                <small>${escapeHtml(entry.deadline ? deadlineText(entry) : entry.type)}</small>
              </button>
            `).join("") : `<p>該当する選考はありません</p>`}
          </div>
        </section>
      `;
    }).join("");
    selectionPipelineView.querySelectorAll("[data-pipeline-entry]").forEach(button => {
      button.addEventListener("click", () => {
        const entry = entries.find(item => item.id === button.dataset.pipelineEntry);
        if (entry) openForm(entry);
      });
    });
  }

  function setSelectionView(view) {
    const pipeline = view === "pipeline";
    const offers = view === "offers";
    const selectedView = pipeline ? "pipeline" : offers ? "offers" : "list";
    const viewOrder = ["list", "pipeline", "offers"];
    selectionListView.hidden = pipeline || offers;
    selectionPipelineView.hidden = !pipeline;
    selectionOffersView.hidden = !offers;
    const selectionViewSegment = document.querySelector("#selectionViewSegment");
    if (selectionViewSegment) {
      selectionViewSegment.dataset.activeIndex = String(viewOrder.indexOf(selectedView));
    }
    document.querySelectorAll("[data-selection-view]").forEach(button => {
      button.classList.toggle("active", button.dataset.selectionView === selectedView);
    });
    localStorage.setItem("nextround-selection-view-v1", selectedView);
    if (pipeline) renderPipeline();
    if (offers && typeof renderOffers === "function") renderOffers();
  }

  function updateAccountUi() {
    const user = signedIn() ? cloudUser : null;
    const label = user?.displayName || user?.email || "端末内で利用中";
    const detail = user
      ? (cloudAutoSaveEnabled ? "Firebaseへ暗号化して自動保存" : "ログイン済み / 自動保存は停止中")
      : "データはこの端末に保存されています";
    const initial = (user?.displayName || user?.email || "N").trim().charAt(0).toUpperCase();
    const profileImage = document.querySelector("#profileImage");
    const menuAccountImage = document.querySelector("#menuAccountImage");
    const hasPhoto = Boolean(user?.photoURL);
    [profileImage, menuAccountImage].forEach(image => {
      image.hidden = !hasPhoto;
      if (hasPhoto) image.src = user.photoURL;
      else image.removeAttribute("src");
    });
    document.querySelector("#profileInitial").textContent = initial;
    document.querySelector("#profileInitial").hidden = hasPhoto;
    document.querySelector("#menuAccountInitial").textContent = initial;
    document.querySelector("#menuAccountInitial").hidden = hasPhoto;
    document.querySelector("#menuAccountName").textContent = label;
    document.querySelector("#menuAccountDetail").textContent = detail;
    document.querySelector("#menuSyncState").textContent = user ? (cloudAutoSaveEnabled ? "SYNC ON" : "SIGNED IN") : "LOCAL";
    document.querySelector("#refreshLogoutBtn").hidden = !user;
  }

  async function runEmailAuth(mode) {
    loginError.textContent = "";
    cloudEmail.value = refreshEmail.value.trim();
    cloudPassword.value = refreshPassword.value;
    try {
      if (mode === "register") await cloudEmailRegister();
      else await cloudEmailLogin();
      loginError.textContent = cloudEmailError.textContent;
      if (signedIn()) showApp("home");
    } catch {
      loginError.textContent = "ログイン処理を完了できませんでした。通信環境を確認してください。";
    } finally {
      refreshPassword.value = "";
      cloudPassword.value = "";
    }
  }

  async function runPasswordReset() {
    cloudEmail.value = refreshEmail.value.trim();
    await cloudPasswordReset();
    loginError.textContent = cloudEmailError.textContent;
  }

  async function runGoogleAuth() {
    loginError.textContent = "";
    try {
      await cloudGoogleLogin();
      loginError.textContent = cloudEmailError.textContent;
      if (signedIn()) showApp("home");
    } catch {
      loginError.textContent = "Googleログインを完了できませんでした。通信環境を確認してください。";
    }
  }

  function openLegal(name) {
    closeMenu();
    if (name === "privacy") privacyDialog.showModal();
    if (name === "terms") termsDialog.showModal();
    if (name === "disclaimer") disclaimerDialog.showModal();
  }

  document.addEventListener("pointerdown", event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("button");
    if (!button || button.disabled) return;
    button.classList.remove("tap-signal");
    void button.offsetWidth;
    button.classList.add("tap-signal");
  }, { passive: true });

  document.addEventListener("animationend", event => {
    if (event.animationName === "tapSignal" && event.target instanceof Element) {
      event.target.classList.remove("tap-signal");
    }
  });

  document.querySelector("#refreshLoginForm").addEventListener("submit", event => {
    event.preventDefault();
    runEmailAuth("login");
  });
  document.querySelector("#refreshEmailRegister").addEventListener("click", () => runEmailAuth("register"));
  document.querySelector("#refreshGoogleLogin").addEventListener("click", runGoogleAuth);
  document.querySelector("#refreshPasswordReset").addEventListener("click", runPasswordReset);
  document.querySelector("#refreshPasswordToggle").addEventListener("click", event => {
    const showing = refreshPassword.type === "text";
    refreshPassword.type = showing ? "password" : "text";
    event.currentTarget.textContent = showing ? "表示" : "隠す";
    event.currentTarget.setAttribute("aria-label", showing ? "パスワードを表示" : "パスワードを隠す");
  });
  document.querySelector("#refreshLocalEntry").addEventListener("click", () => {
    localAccess = true;
    sessionStorage.setItem(localAccessKey, "1");
    showApp("home");
  });
  document.querySelector("#selectionLaunchBtn").addEventListener("click", () => showApp("selection"));
  document.querySelector("#homeCalendarBtn").addEventListener("click", openCalendarView);
  document.querySelector("#homeUpdatesBtn").addEventListener("click", () => updatesDialog.showModal());
  document.querySelector("#profileMenuBtn").addEventListener("click", openMenu);
  document.querySelector("#dismissMigrationComplete").addEventListener("click", () => {
    let migrationState = {};
    try {
      migrationState = JSON.parse(localStorage.getItem(migrationStateKey) || "{}") || {};
    } catch {}
    if (migrationState.verifiedAt) localStorage.setItem(migrationAckKey, migrationState.verifiedAt);
    document.querySelector("#migrationCompleteBanner").hidden = true;
  });
  document.querySelector("#closeRefreshMenu").addEventListener("click", closeMenu);
  document.querySelector("#closeNotificationDialog").addEventListener("click", () => notificationDialog.close());
  document.querySelector("#closeFeatureGuideDialog").addEventListener("click", () => featureGuideDialog.close());
  document.querySelector("#closeSecurityDialog").addEventListener("click", () => securityDialog.close());
  document.querySelector("#closeUpdatesDialog").addEventListener("click", () => updatesDialog.close());
  document.querySelector("#featureGuideSelectionBtn").addEventListener("click", () => {
    featureGuideDialog.close();
    showApp("selection");
  });
  document.querySelector("#featureGuideCalendarBtn").addEventListener("click", () => {
    featureGuideDialog.close();
    openCalendarView();
  });
  bottomNav.querySelectorAll("[data-refresh-view]").forEach(button => {
    button.addEventListener("click", () => navigate(button.dataset.refreshView));
  });
  document.querySelectorAll("[data-open-legal]").forEach(button => {
    button.addEventListener("click", () => openLegal(button.dataset.openLegal));
  });
  document.querySelectorAll("[data-close-dialog]").forEach(button => {
    button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeDialog}`).close());
  });
  document.querySelectorAll("[data-selection-view]").forEach(button => {
    button.addEventListener("click", () => setSelectionView(button.dataset.selectionView));
  });
  document.querySelectorAll("[data-menu-action]").forEach(button => {
    button.addEventListener("click", () => {
      const action = button.dataset.menuAction;
      closeMenu();
      if (action === "cloud") openCloudDialog();
      if (action === "settings") openSettings();
      if (action === "inbox") window.nextroundInbox?.open();
      if (action === "notifications") notificationDialog.showModal();
      if (action === "features") featureGuideDialog.showModal();
      if (action === "security") securityDialog.showModal();
      if (action === "updates") updatesDialog.showModal();
    });
  });
  document.querySelector("#refreshLogoutBtn").addEventListener("click", async () => {
    closeMenu();
    await cloudLogout();
    localAccess = false;
    sessionStorage.removeItem(localAccessKey);
    showLogin();
  });

  window.addEventListener("nextround:auth-changed", event => {
    authResolved = true;
    if (event.detail?.signedIn) showApp("home");
    else if (!localAccess) showLogin();
    updateAccountUi();
  });
  window.addEventListener("nextround:data-changed", () => {
    updateHome();
    renderPipeline();
    if (typeof renderOffers === "function") renderOffers();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") updateHome();
  });
  setInterval(updateHomeGreeting, 60 * 1000);
  setSelectionView(localStorage.getItem("nextround-selection-view-v1") || "list");
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {});
  }
  setTimeout(() => {
    if (!authResolved) resolveAccess();
  }, 420);
})();
