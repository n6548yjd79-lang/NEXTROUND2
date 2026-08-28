(() => {
  "use strict";

  const testerAccessKey = "nextround-notification-test-access-v1";
  const testerParam = new URLSearchParams(window.location.search).get("notification-test");
  if (testerParam === "1") localStorage.setItem(testerAccessKey, "1");
  if (testerParam === "0") localStorage.removeItem(testerAccessKey);
  const testerTrigger = document.querySelector("#notificationTesterTrigger");
  let testerTapCount = 0;
  let testerTapTimer = null;
  testerTrigger?.addEventListener("click", () => {
    testerTapCount += 1;
    clearTimeout(testerTapTimer);
    testerTapTimer = setTimeout(() => { testerTapCount = 0; }, 2500);
    if (testerTapCount < 7) return;
    localStorage.setItem(testerAccessKey, "1");
    window.location.reload();
  });
  const testerAccessEnabled = window.NEXTROUND_NOTIFICATION_PRIVATE_PREVIEW === true
    || localStorage.getItem(testerAccessKey) === "1";
  document.querySelectorAll("[data-notification-feature]").forEach(element => {
    element.hidden = !testerAccessEnabled;
  });
  if (!testerAccessEnabled) return;

  const panel = document.querySelector("#notificationPanel");
  if (!panel) return;

  const state = document.querySelector("#notificationState");
  const status = document.querySelector("#notificationStatus");
  const enableBtn = document.querySelector("#enableNotificationsBtn");
  const testBtn = document.querySelector("#testNotificationBtn");
  const disableBtn = document.querySelector("#disableNotificationsBtn");
  const deadline7Input = document.querySelector("#notifyDeadline7");
  const deadline1Input = document.querySelector("#notifyDeadline1");
  const scheduleTodayInput = document.querySelector("#notifyScheduleToday");
  const timeInput = document.querySelector("#notificationTime");
  const apiBase = String(window.NEXTROUND_NOTIFICATION_API || "").trim().replace(/\/+$/, "");
  const prefsKey = "nextround-notification-prefs-v1";
  const enabledKey = "nextround-notifications-enabled-v1";
  const deviceKey = "nextround-notification-device-v1";
  const encoder = new TextEncoder();
  let syncTimer = null;
  let busy = false;
  let lastScheduleCount = null;

  function readPrefs() {
    const defaults = { deadline7: true, deadline1: true, scheduleToday: true, time: "09:00" };
    try {
      const saved = JSON.parse(localStorage.getItem(prefsKey));
      return {
        deadline7: saved?.deadline7 !== false,
        deadline1: saved?.deadline1 !== false,
        scheduleToday: saved?.scheduleToday !== false,
        time: /^([01]\d|2[0-3]):[0-5]\d$/.test(saved?.time) ? saved.time : defaults.time
      };
    } catch {
      return defaults;
    }
  }

  function currentPrefs() {
    return {
      deadline7: deadline7Input.checked,
      deadline1: deadline1Input.checked,
      scheduleToday: scheduleTodayInput.checked,
      time: /^([01]\d|2[0-3]):[0-5]\d$/.test(timeInput.value) ? timeInput.value : "09:00"
    };
  }

  function applyPrefs() {
    const prefs = readPrefs();
    deadline7Input.checked = prefs.deadline7;
    deadline1Input.checked = prefs.deadline1;
    scheduleTodayInput.checked = prefs.scheduleToday;
    timeInput.value = prefs.time;
  }

  function savePrefs() {
    localStorage.setItem(prefsKey, JSON.stringify(currentPrefs()));
  }

  function notificationsEnabled() {
    return localStorage.getItem(enabledKey) === "1";
  }

  function notificationPermission() {
    return "Notification" in window ? Notification.permission : "default";
  }

  function signedInUser() {
    return typeof cloudUser !== "undefined" ? cloudUser : null;
  }

  function isIosDevice() {
    return /iPad|iPhone|iPod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  }

  function supportProblem() {
    if (!/^https?:$/.test(window.location.protocol)) {
      return "通知はファイルを直接開いた画面では使えません。GitHub Pagesの公開URLから開いてください。";
    }
    if (!window.isSecureContext) return "通知は公開URL（HTTPS）でのみ利用できます。";
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      return "このブラウザはWeb通知に対応していません。";
    }
    if (isIosDevice() && !isStandalone()) {
      return "iPhone・iPadでは、Safariからホーム画面に追加したNEXTROUNDで設定してください。";
    }
    if (!apiBase) return "Cloudflare通知サーバーの接続設定がまだ完了していません。";
    try {
      const apiUrl = new URL(apiBase);
      if (apiUrl.protocol !== "https:") return "通知サーバーのURL設定が正しくありません。";
    } catch {
      return "通知サーバーのURL設定が正しくありません。";
    }
    if (!signedInUser()) return "通知を端末ごとに安全に管理するため、先にログインしてください。";
    if (Notification.permission === "denied") {
      return "通知が端末側で拒否されています。端末の設定からNEXTROUNDの通知を許可してください。";
    }
    return "";
  }

  function setBusy(value) {
    busy = value;
    panel.classList.toggle("is-busy", value);
    enableBtn.disabled = value;
    testBtn.disabled = value;
    disableBtn.disabled = value;
  }

  function updateUi(message = "") {
    const permission = notificationPermission();
    const enabled = notificationsEnabled() && permission === "granted";
    const problem = supportProblem();
    state.dataset.state = permission === "denied" ? "blocked" : enabled ? "on" : "off";
    state.querySelector("b").textContent = permission === "denied" ? "許可が必要" : enabled ? "通知ON" : "未設定";
    enableBtn.hidden = enabled;
    testBtn.hidden = !enabled;
    disableBtn.hidden = !enabled;
    enableBtn.disabled = busy || Boolean(problem);
    testBtn.disabled = busy;
    disableBtn.disabled = busy;
    if (message) status.textContent = message;
    else if (problem) status.textContent = problem;
    else if (enabled && lastScheduleCount !== null) status.textContent = `通知予約を${lastScheduleCount}件同期済みです。`;
    else if (enabled) status.textContent = "通知は有効です。締切や予定の変更は自動で反映されます。";
    else status.textContent = "ボタンを押した時だけ、端末の通知許可を確認します。";
  }

  function getDeviceId() {
    let id = localStorage.getItem(deviceKey);
    if (id) return id;
    id = crypto.randomUUID ? crypto.randomUUID() : randomHex(16);
    localStorage.setItem(deviceKey, id);
    return id;
  }

  function randomHex(byteLength) {
    const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
    return [...bytes].map(value => value.toString(16).padStart(2, "0")).join("");
  }

  async function apiRequest(path, options = {}, authenticated = true) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.body) headers.set("Content-Type", "application/json");
    if (authenticated) {
      const user = signedInUser();
      if (!user) throw new Error("先にログインしてください。");
      headers.set("Authorization", `Bearer ${await user.getIdToken()}`);
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(`${apiBase}${path}`, { ...options, headers, signal: controller.signal });
      const payload = await readLimitedResponseJson(response, 200_000).catch(() => ({}));
      if (!response.ok) throw new Error(payload.message || payload.error || `通知サーバーでエラーが発生しました（${response.status}）。`);
      return payload;
    } finally {
      clearTimeout(timeout);
    }
  }

  function urlBase64ToUint8Array(value) {
    const padding = "=".repeat((4 - value.length % 4) % 4);
    const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    return Uint8Array.from(raw, char => char.charCodeAt(0));
  }

  async function serviceWorkerRegistration() {
    await navigator.serviceWorker.register("./service-worker.js");
    return navigator.serviceWorker.ready;
  }

  function subscriptionJson(subscription) {
    const json = subscription.toJSON();
    return {
      endpoint: json.endpoint,
      expirationTime: json.expirationTime || null,
      keys: { p256dh: json.keys?.p256dh || "", auth: json.keys?.auth || "" }
    };
  }

  async function registerSubscription(subscription) {
    return apiRequest("/v1/subscription", {
      method: "POST",
      body: JSON.stringify({
        deviceId: getDeviceId(),
        subscription: subscriptionJson(subscription),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Tokyo"
      })
    });
  }

  async function enableNotifications() {
    const problem = supportProblem();
    if (problem) {
      updateUi(problem);
      return;
    }
    setBusy(true);
    updateUi("端末の通知許可を確認しています...");
    let createdSubscription = null;
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") throw new Error("通知が許可されませんでした。端末の設定を確認してください。");
      const [{ publicKey }, registration] = await Promise.all([
        apiRequest("/v1/public-key", {}, false),
        serviceWorkerRegistration()
      ]);
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey)
        });
        createdSubscription = subscription;
      }
      await registerSubscription(subscription);
      localStorage.setItem(enabledKey, "1");
      await syncSchedules({ showStatus: true });
    } catch (error) {
      if (createdSubscription) await createdSubscription.unsubscribe().catch(() => {});
      localStorage.removeItem(enabledKey);
      updateUi(readableError(error));
    } finally {
      setBusy(false);
      updateUi(status.textContent);
    }
  }

  function readableError(error) {
    if (error?.name === "AbortError") return "通知サーバーの応答がありません。少し待って再度お試しください。";
    if (error?.name === "SecurityError" || /script URL whose protocol/i.test(error?.message || "")) {
      return "通知はGitHub Pagesの公開URLから開いたNEXTROUNDで設定してください。";
    }
    if (error instanceof TypeError && /fetch|network|load/i.test(error.message)) {
      return "通知サーバーに接続できませんでした。通信環境を確認してください。";
    }
    if (error?.name === "InvalidStateError") {
      return "以前の通知設定が残っています。一度通知を停止してから、もう一度有効にしてください。";
    }
    return error?.message || "通知の設定に失敗しました。";
  }

  async function hashId(value) {
    const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
    const bytes = new Uint8Array(digest);
    let binary = "";
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 32);
  }

  function notifyAt(dateKey, offsetDays, time) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
    const [year, month, day] = dateKey.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);
    const date = new Date(year, month - 1, day, hour, minute, 0, 0);
    if (Number.isNaN(date.getTime())) return null;
    date.setDate(date.getDate() - offsetDays);
    return date.getTime();
  }

  async function buildSchedules() {
    const prefs = currentPrefs();
    const groups = new Map();
    const now = Date.now();
    const latest = now + 730 * 24 * 60 * 60 * 1000;
    const add = (dateKey, offsetDays, kind, timing) => {
      const timestamp = notifyAt(dateKey, offsetDays, prefs.time);
      if (!timestamp || timestamp <= now + 30_000 || timestamp > latest) return;
      const key = `${timestamp}|${kind}|${timing}`;
      groups.set(key, { notifyAt: timestamp, kind, timing });
    };

    entries.forEach(entry => {
      const finished = doneStages.has(entry.stage);
      if (!finished && entry.deadline) {
        if (prefs.deadline7) add(entry.deadline, 7, "deadline", "7d");
        if (prefs.deadline1) add(entry.deadline, 1, "deadline", "1d");
      }
      if (!finished && prefs.scheduleToday && entry.nextDate) add(entry.nextDate, 0, "schedule", "today");
      if (entry.stage === "内定" && entry.offerResponseDeadline && entry.offerDecision !== "辞退") {
        if (prefs.deadline7) add(entry.offerResponseDeadline, 7, "offer", "7d");
        if (prefs.deadline1) add(entry.offerResponseDeadline, 1, "offer", "1d");
      }
      if (prefs.scheduleToday && getInternScheduleStatus(entry) === "confirmed") {
        internshipDateKeys(entry).forEach(dateKey => add(dateKey, 0, "intern", "today"));
      }
    });

    return Promise.all([...groups.entries()]
      .sort((first, second) => first[1].notifyAt - second[1].notifyAt)
      .slice(0, 500)
      .map(async ([key, schedule]) => ({
      id: await hashId(key),
      ...schedule
    })));
  }

  async function syncSchedules({ showStatus = false } = {}) {
    if (!notificationsEnabled() || !signedInUser() || !apiBase || notificationPermission() !== "granted") return;
    try {
      const schedules = await buildSchedules();
      await apiRequest("/v1/schedules", {
        method: "PUT",
        body: JSON.stringify({ deviceId: getDeviceId(), schedules })
      });
      lastScheduleCount = schedules.length;
      if (showStatus) updateUi(`通知予約を${schedules.length}件同期しました。`);
    } catch (error) {
      if (showStatus) updateUi(readableError(error));
      throw error;
    }
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncSchedules().then(() => updateUi()).catch(() => {}), 1400);
  }

  async function restoreEnabledSubscription() {
    if (!notificationsEnabled() || !signedInUser() || supportProblem()) {
      updateUi();
      return;
    }
    try {
      const registration = await serviceWorkerRegistration();
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        localStorage.removeItem(enabledKey);
        updateUi("この端末の通知購読が見つかりません。もう一度有効にしてください。");
        return;
      }
      await registerSubscription(subscription);
      await syncSchedules();
      updateUi();
    } catch (error) {
      updateUi(readableError(error));
    }
  }

  async function disableNotifications({ silent = false } = {}) {
    setBusy(true);
    let serverError = false;
    try {
      if (apiBase && signedInUser()) {
        await apiRequest("/v1/subscription", {
          method: "DELETE",
          body: JSON.stringify({ deviceId: getDeviceId() })
        }).catch(() => { serverError = true; });
      }
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration("./").catch(() => null);
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) await subscription.unsubscribe().catch(() => {});
      }
    } finally {
      localStorage.removeItem(enabledKey);
      lastScheduleCount = null;
      setBusy(false);
      if (!silent) {
        updateUi(serverError
          ? "この端末の通知は停止しました。サーバー側の無効な購読も自動的に削除されます。"
          : "この端末の通知を停止し、未送信の通知予約を削除しました。");
      }
    }
  }

  async function sendTestNotification() {
    setBusy(true);
    updateUi("テスト通知を送っています...");
    try {
      await apiRequest("/v1/test", {
        method: "POST",
        body: JSON.stringify({ deviceId: getDeviceId() })
      });
      updateUi("テスト通知を送信しました。数秒待って端末を確認してください。");
    } catch (error) {
      updateUi(readableError(error));
    } finally {
      setBusy(false);
      updateUi(status.textContent);
    }
  }

  function handlePrefsChange() {
    savePrefs();
    if (notificationsEnabled()) {
      updateUi("通知設定を更新しています...");
      scheduleSync();
    }
  }

  applyPrefs();
  enableBtn.addEventListener("click", enableNotifications);
  testBtn.addEventListener("click", sendTestNotification);
  disableBtn.addEventListener("click", () => disableNotifications());
  [deadline7Input, deadline1Input, scheduleTodayInput, timeInput].forEach(input => {
    input.addEventListener("change", handlePrefsChange);
  });
  window.addEventListener("nextround:data-changed", scheduleSync);
  window.addEventListener("nextround:auth-changed", event => {
    if (event.detail?.signedIn) restoreEnabledSubscription();
    else if (notificationsEnabled()) disableNotifications({ silent: true });
    else updateUi();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updateUi();
      if (notificationsEnabled() && signedInUser()) scheduleSync();
    }
  });

  window.nextroundNotifications = {
    disableBeforeLogout: () => disableNotifications({ silent: true }),
    sync: () => syncSchedules({ showStatus: true })
  };
  updateUi();
})();
