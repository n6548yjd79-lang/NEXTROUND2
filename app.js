const stages = [
  "気になる",
  "応募予定",
  "書類選考中",
  "ES提出済",
  "Webテスト",
  "GD",
  "面接",
  "一次面接",
  "二次面接",
  "最終面接",
  "結果待ち",
  "ES不合格",
  "Webテスト不合格",
  "GD不合格",
  "面接不合格",
  "インターン合格",
  "インターン不合格",
  "内定",
  "辞退",
  "不採用"
];

const entryTypes = ["インターン", "本選考", "説明会", "OB/OG訪問"];
const industryOptions = ["未設定", "IT・通信", "金融", "メーカー", "商社", "コンサル", "広告・メディア", "人材", "不動産・建設", "インフラ", "小売・サービス", "官公庁・団体", "医療・ヘルスケア", "教育", "その他"];
const doneStages = new Set(["ES不合格", "Webテスト不合格", "GD不合格", "面接不合格", "インターン合格", "インターン不合格", "内定", "辞退", "不採用"]);
const winStages = new Set(["インターン合格", "内定"]);
const stageColors = {
  "気になる": "#95a3b5",
  "応募予定": "#4bb3fd",
  "書類選考中": "#61f4de",
  "ES提出済": "#61f4de",
  "Webテスト": "#b79cff",
  "GD": "#ffcf5a",
  "面接": "#36d399",
  "一次面接": "#36d399",
  "二次面接": "#36d399",
  "最終面接": "#36d399",
  "結果待ち": "#ffcf5a",
  "ES不合格": "#ff6678",
  "Webテスト不合格": "#ff6678",
  "GD不合格": "#ff6678",
  "面接不合格": "#ff6678",
  "インターン合格": "#36d399",
  "インターン不合格": "#ff6678",
  "内定": "#36d399",
  "辞退": "#95a3b5",
  "不採用": "#ff6678"
};
const storageKey = "senkou-deck-v1";
const vaultStorageKey = "nextround-vault-v1";
const cloudAutoSaveKey = "nextround-cloud-autosave-v1";
const cloudAutoSavePendingKey = "nextround-cloud-autosave-pending-v1";
const cloudRestoreKeyPrefix = "nextround-cloud-restore-key-v1:";
const firebaseConfig = {
  apiKey: "AIzaSyAgOSNkun1DDVS7Npnv67Yg1iv1sFBk8y4",
  authDomain: "next-round-936c6.firebaseapp.com",
  projectId: "next-round-936c6",
  storageBucket: "next-round-936c6.firebasestorage.app",
  messagingSenderId: "56935391489",
  appId: "1:56935391489:web:40e1cd53f78bbbfc997b00",
  measurementId: "G-8M43T90SXQ"
};
const protectedUnlockMs = 30 * 60 * 1000;
const esArchiveLabels = ["ガクチカ", "自己PR", "志望動機", "研究内容", "長所・短所", "挫折経験", "将来像", "企業理解", "その他"];
const selectionTagOptions = ["ES+Webテスト同時提出", "動画選考", "AI面接", "適性検査", "ケース面接", "面談", "その他"];
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const phaseStages = {
  es: ["書類選考中", "ES提出済", "ES不合格"],
  webTest: ["Webテスト", "Webテスト不合格"],
  gd: ["GD", "GD不合格"],
  interview: ["面接", "一次面接", "二次面接", "最終面接", "面接不合格"]
};
const analysisPhaseDefinitions = [
  { label: "ES", key: "es", passStages: ["Webテスト", "GD", "面接", "一次面接", "二次面接", "最終面接", "結果待ち", "インターン合格", "内定"], failStages: ["ES不合格"], color: "#61f4de" },
  { label: "Webテスト", key: "webTest", passStages: ["GD", "面接", "一次面接", "二次面接", "最終面接", "結果待ち", "インターン合格", "内定"], failStages: ["Webテスト不合格"], color: "#b79cff" },
  { label: "GD", key: "gd", passStages: ["面接", "一次面接", "二次面接", "最終面接", "結果待ち", "インターン合格", "内定"], failStages: ["GD不合格"], color: "#ffcf5a" }
];
const industryColors = ["#61f4de", "#ffcf5a", "#b79cff", "#36d399", "#ff9f7a", "#7ad7ff", "#ff8fb3", "#c5ff7a"];
const seed = [
  {
    id: crypto.randomUUID(),
    company: "Blue Orbit",
    type: "インターン",
    industry: "IT・通信",
    role: "事業企画 3days",
    stage: "結果待ち",
    deadline: nextDate(3),
    nextDate: nextDate(6),
    internSchedule: "",
    internScheduleMode: "single",
    internSingleDate: "",
    internStartDate: "",
    internEndDate: "",
    memo: "GD終了。結果待ち。通ったら次は人事面談。"
  },
  {
    id: crypto.randomUUID(),
    company: "Nexa Bank",
    type: "本選考",
    industry: "金融",
    role: "総合職",
    stage: "書類選考中",
    deadline: nextDate(1),
    nextDate: "",
    internSchedule: "",
    internScheduleMode: "single",
    internSingleDate: "",
    internStartDate: "",
    internEndDate: "",
    memo: "ES提出済。志望動機を面接用に短くする。"
  },
  {
    id: crypto.randomUUID(),
    company: "Sakura Systems",
    type: "インターン",
    industry: "IT・通信",
    role: "エンジニア",
    stage: "応募予定",
    deadline: nextDate(8),
    nextDate: "",
    internSchedule: "",
    internScheduleMode: "single",
    internSingleDate: "",
    internStartDate: "",
    internEndDate: "",
    memo: "締切前にポートフォリオURLを確認。"
  }
];

let entries = load();
let vaultConfig = loadVaultConfig();
let activeFilter = "all";
let editingId = null;
let resultTargetId = null;
let credentialTargetId = null;
let esArchiveTargetId = null;
let vaultResolver = null;
let importCandidates = [];
let calendarCursor = null;
let selectedCalendarDate = "";
let protectedSession = { password: "", until: 0 };
let protectedLockTimer = null;
let esArchiveDraft = [];
let cloudAuth = null;
let cloudDb = null;
let cloudUser = null;
let cloudReady = false;
let cloudAutoSaveEnabled = localStorage.getItem(cloudAutoSaveKey) === "1";
let cloudSaveTimer = null;
let cloudSaving = false;
let cloudAutoLoadCheckedUid = "";
let cloudRestoreMode = "create";
let cloudSnapshotPending = null;
let cloudEncryptionConfig = null;
let cloudAuthNotice = "";

const cards = document.querySelector("#cards");
const chips = document.querySelector("#chips");
const deadlineStrip = document.querySelector("#deadlineStrip");
const addChoiceDialog = document.querySelector("#addChoiceDialog");
const dialog = document.querySelector("#entryDialog");
const form = document.querySelector("#entryForm");
const stageSelect = form.elements.stage;
const industrySelect = form.elements.industry;
const selectionTagOptionsEl = document.querySelector("#selectionTagOptions");
const selectionTagOtherField = document.querySelector("#selectionTagOtherField");
const deleteBtn = document.querySelector("#deleteBtn");
const internScheduleField = document.querySelector("#internScheduleField");
const resultDialog = document.querySelector("#resultDialog");
const resultForm = document.querySelector("#resultForm");
const resultTitle = document.querySelector("#resultTitle");
const resultScheduleField = document.querySelector("#resultScheduleField");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsStatus = document.querySelector("#settingsStatus");
const cloudDialog = document.querySelector("#cloudDialog");
const cloudBtn = document.querySelector("#cloudBtn");
const cloudStatus = document.querySelector("#cloudStatus");
const cloudLoginBtn = document.querySelector("#cloudLoginBtn");
const cloudLogoutBtn = document.querySelector("#cloudLogoutBtn");
const cloudEmail = document.querySelector("#cloudEmail");
const cloudPassword = document.querySelector("#cloudPassword");
const cloudEmailLoginBtn = document.querySelector("#cloudEmailLoginBtn");
const cloudEmailRegisterBtn = document.querySelector("#cloudEmailRegisterBtn");
const cloudPasswordResetBtn = document.querySelector("#cloudPasswordResetBtn");
const cloudEmailError = document.querySelector("#cloudEmailError");
const cloudRestoreSection = document.querySelector("#cloudRestoreSection");
const cloudRestoreTitle = document.querySelector("#cloudRestoreTitle");
const cloudRestoreNote = document.querySelector("#cloudRestoreNote");
const cloudRestoreKey = document.querySelector("#cloudRestoreKey");
const cloudRestoreConfirmField = document.querySelector("#cloudRestoreConfirmField");
const cloudRestoreConfirm = document.querySelector("#cloudRestoreConfirm");
const cloudRestoreSubmitBtn = document.querySelector("#cloudRestoreSubmitBtn");
const cloudRestoreError = document.querySelector("#cloudRestoreError");
const vaultSettingsStatus = document.querySelector("#vaultSettingsStatus");
const privacyDialog = document.querySelector("#privacyDialog");
const importFile = document.querySelector("#importFile");
const syncCodeDialog = document.querySelector("#syncCodeDialog");
const syncCodeOutput = document.querySelector("#syncCodeOutput");
const syncCodeStatus = document.querySelector("#syncCodeStatus");
const syncImportDialog = document.querySelector("#syncImportDialog");
const syncCodeInput = document.querySelector("#syncCodeInput");
const syncImportStatus = document.querySelector("#syncImportStatus");
const analyticsDialog = document.querySelector("#analyticsDialog");
const analyticsContent = document.querySelector("#analyticsContent");
const calendarDialog = document.querySelector("#calendarDialog");
const calendarGrid = document.querySelector("#calendarGrid");
const calendarMonthLabel = document.querySelector("#calendarMonthLabel");
const calendarSelectedLabel = document.querySelector("#calendarSelectedLabel");
const calendarEventList = document.querySelector("#calendarEventList");
const clearCredentialField = document.querySelector("#clearCredentialField");
const credentialFormNote = document.querySelector("#credentialFormNote");
const credentialDialog = document.querySelector("#credentialDialog");
const credentialTitle = document.querySelector("#credentialTitle");
const credentialPassword = document.querySelector("#credentialPassword");
const credentialError = document.querySelector("#credentialError");
const credentialResult = document.querySelector("#credentialResult");
const esArchiveDialog = document.querySelector("#esArchiveDialog");
const esArchiveTitle = document.querySelector("#esArchiveTitle");
const esArchiveItems = document.querySelector("#esArchiveItems");
const esArchiveError = document.querySelector("#esArchiveError");
const esArchiveLockNote = document.querySelector("#esArchiveLockNote");
const vaultDialog = document.querySelector("#vaultDialog");
const vaultTitle = document.querySelector("#vaultTitle");
const vaultMessage = document.querySelector("#vaultMessage");
const vaultPassword = document.querySelector("#vaultPassword");
const vaultConfirmField = document.querySelector("#vaultConfirmField");
const vaultConfirmPassword = document.querySelector("#vaultConfirmPassword");
const vaultError = document.querySelector("#vaultError");
const forgotVaultDialog = document.querySelector("#forgotVaultDialog");
const forgotVaultConfirm = document.querySelector("#forgotVaultConfirm");
const forgotVaultPassword = document.querySelector("#forgotVaultPassword");
const forgotVaultConfirmPassword = document.querySelector("#forgotVaultConfirmPassword");
const forgotVaultError = document.querySelector("#forgotVaultError");
const importDialog = document.querySelector("#importDialog");
const importText = document.querySelector("#importText");
const importPreview = document.querySelector("#importPreview");
const confirmImportBtn = document.querySelector("#confirmImportBtn");
const importStatus = document.querySelector("#importStatus");
const splash = document.querySelector("#splash");

setTimeout(() => {
  splash?.classList.add("hide");
}, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 1250);

const now = new Date();
calendarCursor = new Date(now.getFullYear(), now.getMonth(), 1);
selectedCalendarDate = localDateKey(now);
document.querySelector("#dateLabel").textContent = `${now.getMonth() + 1}/${now.getDate()}`;
document.querySelector("#weekdayLabel").textContent = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(now);
stages.forEach(stage => stageSelect.add(new Option(stage, stage)));
industryOptions.forEach(industry => industrySelect.add(new Option(industry, industry)));
selectionTagOptionsEl.innerHTML = selectionTagOptions.map(tag => `
  <label><input class="selection-tag" type="checkbox" value="${escapeHtml(tag)}"><span>${escapeHtml(tag)}</span></label>
`).join("");

const filters = ["all", "インターン", "本選考", "書類選考中", "GD", "結果待ち", "面接", "合格"];
const names = { all: "すべて", 面接: "面接中", 合格: "合格/内定" };
filters.forEach(filter => {
  const button = document.createElement("button");
  button.className = "chip" + (filter === activeFilter ? " active" : "");
  button.textContent = names[filter] || filter;
  button.addEventListener("click", () => {
    activeFilter = filter;
    syncNav();
    render();
  });
  chips.append(button);
});

document.querySelector("#search").addEventListener("input", render);
document.querySelector("#addBtn").addEventListener("click", () => addChoiceDialog.showModal());
document.querySelector("#closeAddChoiceDialog").addEventListener("click", () => addChoiceDialog.close());
document.querySelector("#singleAddBtn").addEventListener("click", () => {
  addChoiceDialog.close();
  openForm();
});
document.querySelector("#memoImportBtn").addEventListener("click", () => {
  addChoiceDialog.close();
  openImportDialog();
});
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
document.querySelector("#closeImportDialog").addEventListener("click", () => importDialog.close());
document.querySelector("#parseImportBtn").addEventListener("click", parseImportText);
confirmImportBtn.addEventListener("click", confirmImportCandidates);
document.querySelector("#closeResultDialog").addEventListener("click", () => resultDialog.close());
document.querySelector("#passResultBtn").addEventListener("click", () => applyResult(true));
document.querySelector("#failResultBtn").addEventListener("click", () => applyResult(false));
document.querySelector("#settingsBtn").addEventListener("click", openSettings);
document.querySelector("#closeSettingsDialog").addEventListener("click", () => settingsDialog.close());
document.querySelector("#createSyncCodeBtn").addEventListener("click", openSyncCodeDialog);
document.querySelector("#readSyncCodeBtn").addEventListener("click", openSyncImportDialog);
document.querySelector("#closeSyncCodeDialog").addEventListener("click", () => syncCodeDialog.close());
document.querySelector("#closeSyncImportDialog").addEventListener("click", () => syncImportDialog.close());
document.querySelector("#copySyncCodeBtn").addEventListener("click", copySyncCode);
document.querySelector("#applySyncCodeBtn").addEventListener("click", applySyncCode);
document.querySelector("#cloudBtn").addEventListener("click", openCloudDialog);
document.querySelector("#closeCloudDialog").addEventListener("click", () => cloudDialog.close());
cloudLoginBtn.addEventListener("click", cloudLogin);
cloudLogoutBtn.addEventListener("click", cloudLogout);
cloudEmailLoginBtn.addEventListener("click", cloudEmailLogin);
cloudEmailRegisterBtn.addEventListener("click", cloudEmailRegister);
cloudPasswordResetBtn.addEventListener("click", cloudPasswordReset);
cloudRestoreSubmitBtn.addEventListener("click", submitCloudRestoreKey);
cloudPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") cloudEmailLogin();
});
cloudRestoreKey.addEventListener("keydown", event => {
  if (event.key === "Enter") submitCloudRestoreKey();
});
cloudRestoreConfirm.addEventListener("keydown", event => {
  if (event.key === "Enter") submitCloudRestoreKey();
});
document.querySelector("#exportBtn").addEventListener("click", exportData);
document.querySelector("#importBtn").addEventListener("click", () => importFile.click());
importFile.addEventListener("change", importData);
document.querySelector("#changeVaultBtn").addEventListener("click", changeVaultPassword);
document.querySelector("#forgotVaultBtn").addEventListener("click", openForgotVaultDialog);
document.querySelector("#closeForgotVaultDialog").addEventListener("click", () => forgotVaultDialog.close());
document.querySelector("#forgotVaultSubmitBtn").addEventListener("click", resetForgottenVaultPassword);
document.querySelector("#privacyBtn").addEventListener("click", () => privacyDialog.showModal());
document.querySelector("#closePrivacyDialog").addEventListener("click", () => privacyDialog.close());
document.querySelector("#analyticsBtn").addEventListener("click", openAnalytics);
document.querySelector("#closeAnalyticsDialog").addEventListener("click", () => analyticsDialog.close());
document.querySelector("#calendarBtn").addEventListener("click", openCalendar);
document.querySelector("#closeCalendarDialog").addEventListener("click", () => calendarDialog.close());
document.querySelector("#calendarPrevBtn").addEventListener("click", () => moveCalendarMonth(-1));
document.querySelector("#calendarNextBtn").addEventListener("click", () => moveCalendarMonth(1));
document.querySelector("#calendarTodayBtn").addEventListener("click", () => {
  const today = new Date();
  calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  selectedCalendarDate = localDateKey(today);
  renderCalendar();
});
document.querySelector("#closeCredentialDialog").addEventListener("click", () => credentialDialog.close());
document.querySelector("#unlockCredentialBtn").addEventListener("click", unlockCredential);
document.querySelector("#closeEsArchiveDialog").addEventListener("click", () => esArchiveDialog.close());
document.querySelector("#addArchiveItemBtn").addEventListener("click", () => addEsArchiveItem());
document.querySelector("#saveEsArchiveBtn").addEventListener("click", saveEsArchive);
document.querySelector("#lockArchiveBtn").addEventListener("click", lockProtectedSession);
document.querySelector("#closeVaultDialog").addEventListener("click", () => closeVaultRequest(null));
document.querySelector("#vaultSubmitBtn").addEventListener("click", submitVaultPassword);
vaultPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") submitVaultPassword();
});
vaultConfirmPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") submitVaultPassword();
});
forgotVaultPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") resetForgottenVaultPassword();
});
forgotVaultConfirmPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") resetForgottenVaultPassword();
});
credentialPassword.addEventListener("keydown", event => {
  if (event.key === "Enter") unlockCredential();
});
vaultDialog.addEventListener("cancel", event => {
  event.preventDefault();
  closeVaultRequest(null);
});
form.elements.type.addEventListener("change", updateInternScheduleVisibility);
form.elements.type.addEventListener("change", updateInterviewCountState);
form.elements.stage.addEventListener("change", updateInternScheduleVisibility);
form.elements.flowInterview.addEventListener("change", updateInterviewCountState);
selectionTagOptionsEl.addEventListener("change", updateSelectionTagOtherVisibility);
Array.from(form.elements.internScheduleMode).forEach(input => {
  input.addEventListener("change", () => updateScheduleMode(form, "intern"));
});
Array.from(resultForm.elements.resultScheduleMode).forEach(input => {
  input.addEventListener("change", () => updateScheduleMode(resultForm, "result"));
});
document.querySelectorAll(".nav-btn[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    syncNav();
    render();
  });
});

form.addEventListener("submit", async event => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const existingEntry = entries.find(entry => entry.id === editingId);
  let credentialVault;
  try {
    credentialVault = await buildCredentialVault(data, existingEntry);
  } catch (error) {
    if (error.message) credentialFormNote.textContent = error.message;
    return;
  }
  const item = {
    id: editingId || crypto.randomUUID(),
    company: data.company.trim(),
    type: data.type,
    industry: normalizeIndustry(data.industry),
    role: data.role.trim(),
    stage: data.stage,
    deadline: data.deadline,
    nextDate: data.nextDate,
    nextPlan: data.nextPlan.trim(),
    internSchedule: buildScheduleFromForm(form, "intern", existingEntry?.internSchedule || ""),
    internScheduleMode: form.elements.internScheduleMode.value,
    internSingleDate: data.internSingleDate || "",
    internStartDate: data.internStartDate || "",
    internEndDate: data.internEndDate || "",
    memo: data.memo.trim(),
    flow: getFlowFromForm(),
    interviewCount: form.elements.interviewCount.value,
    selectionTags: getSelectionTagsFromForm(),
    portalUrl: data.clearCredential === "1" ? "" : normalizePortalUrl(data.portalUrl),
    credentialVault,
    esArchiveVault: existingEntry?.esArchiveVault || null,
    stageHistory: addStageToHistory(existingEntry?.stageHistory, data.stage)
  };
  entries = editingId
    ? entries.map(entry => entry.id === editingId ? item : entry)
    : [item, ...entries];
  save();
  dialog.close();
  render();
});

deleteBtn.addEventListener("click", () => {
  if (!editingId) return;
  entries = entries.filter(entry => entry.id !== editingId);
  save();
  dialog.close();
  render();
});

function openImportDialog() {
  importCandidates = [];
  importText.value = "";
  importPreview.innerHTML = "";
  importStatus.textContent = "";
  confirmImportBtn.hidden = true;
  confirmImportBtn.textContent = "候補をまとめて追加";
  importDialog.showModal();
  setTimeout(() => importText.focus(), 0);
}

function parseImportText() {
  const lines = importText.value
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean);
  importCandidates = lines.map(parseMemoLine);
  renderImportPreview();
}

function parseMemoLine(line) {
  const stage = guessStage(line);
  const type = guessType(line);
  const deadline = guessDeadline(line);
  const company = guessCompany(line);
  const role = guessRole(line);
  const industry = guessIndustry(line);
  const flow = inferImportFlow(line, stage);
  return {
    company,
    type,
    industry,
    role,
    stage,
    deadline,
    nextDate: "",
    nextPlan: "",
    portalUrl: "",
    memo: line,
    flow,
    interviewCount: type === "本選考" ? "3" : "1",
    selectionTags: []
  };
}

function renderImportPreview() {
  if (!importCandidates.length) {
    importPreview.innerHTML = "";
    importStatus.textContent = "メモが空です。1行1社くらいで貼り付けてください。";
    confirmImportBtn.hidden = true;
    return;
  }
  importPreview.innerHTML = importCandidates.map((candidate, index) => `
    <section class="import-item" data-index="${index}">
      <div class="import-item-head">
        <strong>候補 ${index + 1}</strong>
        <button class="soft-btn danger" type="button" data-remove-import="${index}">除外</button>
      </div>
      <label>会社名
        <input class="import-company" value="${escapeHtml(candidate.company)}" placeholder="読み取れない場合は入力">
      </label>
      <div class="form-grid">
        <label>種類
          <select class="import-type">${optionsHtml(entryTypes, candidate.type)}</select>
        </label>
        <label>ステータス
          <select class="import-stage">${optionsHtml(stages, candidate.stage)}</select>
        </label>
      </div>
      <label>業界
        <select class="import-industry">${optionsHtml(industryOptions, candidate.industry)}</select>
      </label>
      <div class="form-grid">
        <label>職種/コース
          <input class="import-role" value="${escapeHtml(candidate.role)}" placeholder="空欄でもOK">
        </label>
        <label>締切日
          <input class="import-deadline" type="date" value="${escapeHtml(candidate.deadline)}">
        </label>
      </div>
      <section class="schedule-picker">
        <label>この選考であるフェーズ</label>
        <div class="flow-options">
          <label><input class="import-flow-es" type="checkbox" ${candidate.flow.es ? "checked" : ""}><span>ES</span></label>
          <label><input class="import-flow-webTest" type="checkbox" ${candidate.flow.webTest ? "checked" : ""}><span>Webテスト</span></label>
          <label><input class="import-flow-gd" type="checkbox" ${candidate.flow.gd ? "checked" : ""}><span>GD</span></label>
          <label><input class="import-flow-interview" type="checkbox" ${candidate.flow.interview ? "checked" : ""}><span>面接</span></label>
        </div>
      </section>
      <label>メモ
        <textarea class="import-memo">${escapeHtml(candidate.memo)}</textarea>
      </label>
    </section>
  `).join("");
  importPreview.querySelectorAll("[data-remove-import]").forEach(button => {
    button.addEventListener("click", () => {
      button.closest(".import-item").remove();
      updateImportConfirmState();
    });
  });
  importStatus.textContent = `${importCandidates.length}件の候補を作りました。内容を確認してから追加できます。`;
  updateImportConfirmState();
}

function updateImportConfirmState() {
  const count = importPreview.querySelectorAll(".import-item").length;
  confirmImportBtn.hidden = count === 0;
  confirmImportBtn.textContent = `候補をまとめて追加（${count}件）`;
  if (!count) importStatus.textContent = "候補がありません。もう一度メモを貼り付けてください。";
}

function confirmImportCandidates() {
  const candidates = [...importPreview.querySelectorAll(".import-item")].map(readImportCandidate);
  const missingCompany = candidates.some(candidate => !candidate.company);
  if (missingCompany) {
    importStatus.textContent = "会社名が空欄の候補があります。会社名だけ入れてから追加してください。";
    return;
  }
  const imported = candidates.map(candidate => ({
    id: crypto.randomUUID(),
    company: candidate.company,
    type: candidate.type,
    industry: candidate.industry,
    role: candidate.role,
    stage: candidate.stage,
    deadline: candidate.deadline,
    nextDate: candidate.nextDate,
    nextPlan: candidate.nextPlan,
    portalUrl: candidate.portalUrl || "",
    internSchedule: "",
    internScheduleMode: "single",
    internSingleDate: "",
    internStartDate: "",
    internEndDate: "",
    memo: candidate.memo,
    flow: candidate.flow,
    interviewCount: candidate.interviewCount,
    selectionTags: candidate.selectionTags,
    credentialVault: null,
    esArchiveVault: null,
    stageHistory: buildImportStageHistory(candidate.stage, candidate.flow)
  }));
  entries = [...imported, ...entries];
  save();
  render();
  importDialog.close();
}

function readImportCandidate(item) {
  return {
    company: item.querySelector(".import-company").value.trim(),
    type: item.querySelector(".import-type").value,
    industry: normalizeIndustry(item.querySelector(".import-industry").value),
    role: item.querySelector(".import-role").value.trim(),
    stage: item.querySelector(".import-stage").value,
    deadline: item.querySelector(".import-deadline").value,
    nextDate: "",
    nextPlan: "",
    portalUrl: "",
    memo: item.querySelector(".import-memo").value.trim(),
    flow: {
      es: item.querySelector(".import-flow-es").checked,
      webTest: item.querySelector(".import-flow-webTest").checked,
      gd: item.querySelector(".import-flow-gd").checked,
      interview: item.querySelector(".import-flow-interview").checked
    },
    interviewCount: item.querySelector(".import-type").value === "本選考" ? "3" : "1",
    selectionTags: []
  };
}

function optionsHtml(values, selected) {
  return values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
}

function guessType(line) {
  if (/OB[\/・]?OG|OB訪問|OG訪問/i.test(line)) return "OB/OG訪問";
  if (/説明会/.test(line)) return "説明会";
  if (/本選考|本選/.test(line)) return "本選考";
  if (/インターン|intern/i.test(line)) return "インターン";
  return "インターン";
}

function guessStage(line) {
  const text = line.replace(/\s+/g, "");
  const rules = [
    ["Webテスト不合格", /(Web|WEB|ウェブ|SPI|玉手箱|適性検査).*?(不合格|落ち|NG)|不合格.*?(Web|WEB|ウェブ|SPI|玉手箱|適性検査)/i],
    ["ES不合格", /(ES|エントリーシート|書類).*?(不合格|落ち|NG)|不合格.*?(ES|エントリーシート|書類)/i],
    ["GD不合格", /(GD|グループディスカッション).*?(不合格|落ち|NG)|不合格.*?(GD|グループディスカッション)/i],
    ["面接不合格", /(面接|面談|一次|1次|二次|2次|最終).*?(不合格|落ち|NG)|不合格.*?(面接|面談|一次|1次|二次|2次|最終)/i],
    ["インターン不合格", /インターン.*?(不合格|落ち|NG)/i],
    ["インターン合格", /インターン.*?(合格|通過)|合格.*?インターン/i],
    ["内定", /内定|内々定/],
    ["不採用", /不採用|お祈り/],
    ["辞退", /辞退/],
    ["結果待ち", /結果待ち|連絡待ち|返事待ち|選考待ち/],
    ["最終面接", /最終面接|最終/],
    ["二次面接", /二次面接|2次面接|二次|2次/],
    ["一次面接", /一次面接|1次面接|一次|1次/],
    ["面接", /面接|面談/],
    ["GD", /GD|グループディスカッション/i],
    ["Webテスト", /Webテスト|WEBテスト|ウェブテスト|SPI|玉手箱|適性検査/i],
    ["ES提出済", /ES提出済|ES済|提出済|提出完了/i],
    ["書類選考中", /書類選考中|書類|ES|エントリーシート/i],
    ["応募予定", /応募予定|応募/],
    ["気になる", /気になる|候補|検討/]
  ];
  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "応募予定";
}

function guessDeadline(line) {
  const ymd = line.match(/(20\d{2})[\/.-](\d{1,2})[\/.-](\d{1,2})/);
  if (ymd) return toDateInput(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]), false);
  const md = line.match(/(?:^|[^\d])(\d{1,2})[\/月](\d{1,2})(?:日)?/);
  if (!md) return "";
  return toDateInput(new Date().getFullYear(), Number(md[1]), Number(md[2]), true);
}

function toDateInput(year, month, day, allowNextYear) {
  if (month < 1 || month > 12 || day < 1 || day > 31) return "";
  let date = new Date(year, month - 1, day);
  if (allowNextYear) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < new Date(today.getTime() - 30 * 86400000)) {
      date = new Date(year + 1, month - 1, day);
    }
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function guessCompany(line) {
  const cleaned = line
    .replace(/20\d{2}[\/.-]\d{1,2}[\/.-]\d{1,2}/g, " ")
    .replace(/(?:^|[^\d])\d{1,2}[\/月]\d{1,2}(?:日)?/g, " ")
    .replace(/OB[\/・]?OG|OB訪問|OG訪問|インターン|intern|本選考|本選|説明会/gi, " ")
    .replace(/締切|〆切|〆|まで|予定|候補|検討|選考中|選考|応募予定|応募/g, " ")
    .replace(/IT・通信|IT|通信|金融|銀行|証券|保険|リース|メーカー|商社|コンサル|広告|メディア|出版|テレビ|新聞|人材|不動産|建設|インフラ|電力|ガス|鉄道|航空|小売|サービス|官公庁|団体|医療|ヘルスケア|教育/gi, " ")
    .replace(/ES提出済|ES済|エントリーシート|ES|書類選考中|書類/gi, " ")
    .replace(/Webテスト|WEBテスト|ウェブテスト|SPI|玉手箱|適性検査/gi, " ")
    .replace(/グループディスカッション|GD|一次面接|1次面接|二次面接|2次面接|最終面接|一次|1次|二次|2次|最終|面接|面談/gi, " ")
    .replace(/結果待ち|連絡待ち|返事待ち|合格|不合格|落ち|NG|内定|内々定|不採用|お祈り|辞退/gi, " ")
    .replace(/[：:、,，／/|｜\[\]【】()（）]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.split(" ")[0] || "";
}

function guessRole(line) {
  const match = line.match(/(総合職|営業|企画|マーケ|エンジニア|デザイナー|コンサル|開発|事業企画|人事|経理|法務|研究|技術職|3days?|5days?)/i);
  return match?.[0] || "";
}

function guessIndustry(line) {
  const rules = [
    ["IT・通信", /(IT|通信|SaaS|SIer|システム|ソフトウェア|アプリ|クラウド|データ|AI|DX)/i],
    ["金融", /(金融|銀行|証券|保険|カード|リース|信託|フィンテック|FinTech)/i],
    ["メーカー", /(メーカー|製造|自動車|電機|食品|化学|素材|機械|製薬|消費財)/i],
    ["商社", /(商社|総合商社|専門商社)/i],
    ["コンサル", /(コンサル|戦略|シンクタンク)/i],
    ["広告・メディア", /(広告|メディア|出版|テレビ|新聞|放送|PR|エンタメ)/i],
    ["人材", /(人材|HR|採用|転職|求人)/i],
    ["不動産・建設", /(不動産|建設|住宅|デベロッパー|ゼネコン)/i],
    ["インフラ", /(インフラ|電力|ガス|鉄道|航空|物流|海運|通信キャリア)/i],
    ["小売・サービス", /(小売|サービス|百貨店|EC|旅行|ホテル|外食)/i],
    ["官公庁・団体", /(官公庁|自治体|団体|NPO|公益)/i],
    ["医療・ヘルスケア", /(医療|ヘルスケア|病院|介護|バイオ)/i],
    ["教育", /(教育|塾|学校|EdTech)/i]
  ];
  return rules.find(([, pattern]) => pattern.test(line))?.[0] || "未設定";
}

function inferImportFlow(line, stage) {
  const text = `${line} ${stage}`;
  const isAfterEs = ["Webテスト", "GD", "面接", "一次面接", "二次面接", "最終面接", "結果待ち", "Webテスト不合格", "GD不合格", "面接不合格", "インターン合格", "インターン不合格", "内定", "不採用", "辞退"].includes(stage);
  return {
    es: /(ES|エントリーシート|書類)/i.test(text) || isAfterEs,
    webTest: /(Web|WEB|ウェブ|SPI|玉手箱|適性検査|テスト)/i.test(text),
    gd: /(GD|グループディスカッション)/i.test(text),
    interview: /(面接|面談|一次|1次|二次|2次|最終)/i.test(text)
  };
}

function buildImportStageHistory(stage, flow) {
  const sequence = sequenceFromFlow(flow);
  if (winStages.has(stage) || ["インターン不合格", "不採用", "辞退"].includes(stage)) {
    return [...sequence, stage];
  }
  const failPrevious = {
    "ES不合格": flow.es ? "ES提出済" : "応募予定",
    "Webテスト不合格": "Webテスト",
    "GD不合格": "GD",
    "面接不合格": "面接"
  };
  if (failPrevious[stage]) {
    const previous = failPrevious[stage];
    const index = sequence.indexOf(previous);
    return [...(index >= 0 ? sequence.slice(0, index + 1) : []), stage];
  }
  const index = sequence.indexOf(stage);
  if (index >= 0) return sequence.slice(0, index + 1);
  return [stage];
}

function sequenceFromFlow(flow) {
  return [
    "気になる",
    "応募予定",
    ...(flow.es ? ["書類選考中", "ES提出済"] : []),
    ...(flow.webTest ? ["Webテスト"] : []),
    ...(flow.gd ? ["GD"] : []),
    ...(flow.interview ? ["面接", "一次面接", "二次面接", "最終面接"] : []),
    "結果待ち"
  ];
}

function load() {
  try {
    return (JSON.parse(localStorage.getItem(storageKey)) || seed).map(entry => ({
      internSchedule: "",
      internScheduleMode: "single",
      internSingleDate: "",
      internStartDate: "",
      internEndDate: "",
      credentialVault: null,
      esArchiveVault: null,
      ...entry,
      industry: normalizeIndustry(entry.industry),
      portalUrl: normalizePortalUrl(entry.portalUrl),
      nextPlan: entry.nextPlan || "",
      interviewCount: normalizeInterviewCount(entry),
      selectionTags: normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther),
      flow: normalizeFlow(entry.flow, entry.stageHistory, entry.stage),
      stageHistory: normalizeStageHistory(entry.stageHistory, entry.stage)
    }));
  } catch {
    return seed.map(entry => ({
      ...entry,
      flow: normalizeFlow(entry.flow, entry.stageHistory, entry.stage),
      stageHistory: normalizeStageHistory(entry.stageHistory, entry.stage)
    }));
  }
}

function save({ cloud = true } = {}) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
  if (cloud) scheduleCloudAutoSave();
}

function initCloudSync() {
  if (!window.firebase?.initializeApp) {
    cloudStatus.textContent = "Firebaseを読み込めませんでした。通信環境を確認してください。";
    setCloudButtons(false);
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    cloudAuth = firebase.auth();
    cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
    cloudDb = firebase.firestore();
    cloudReady = true;
    cloudAuth.onAuthStateChanged(user => {
      handleCloudAuthUser(user);
    });
    cloudAuth.getRedirectResult?.().then(result => {
      if (result?.user) handleCloudAuthUser(result.user, { forceAutoLoad: true });
    }).catch(error => {
      cloudAuthNotice = cloudAuthErrorMessage(error);
      localStorage.removeItem(cloudAutoSavePendingKey);
      updateCloudUi();
    });
  } catch {
    cloudStatus.textContent = "Firebaseの初期化に失敗しました。設定を確認してください。";
    setCloudButtons(false);
  }
}

function handleCloudAuthUser(user, { forceAutoLoad = false } = {}) {
  cloudUser = user;
  if (!user) {
    updateCloudUi();
    return;
  }
  cloudAuthNotice = "";
  const shouldStartCloudSync = localStorage.getItem(cloudAutoSavePendingKey) === "1";
  if (shouldStartCloudSync) {
    localStorage.removeItem(cloudAutoSavePendingKey);
    setCloudAutoSave(true);
  } else {
    updateCloudUi();
  }
  if (shouldStartCloudSync || forceAutoLoad || cloudAutoSaveEnabled) {
    autoLoadCloudDataAfterLogin();
  }
}

function updateCloudUi() {
  if (!cloudReady) {
    setCloudButtons(false);
    return;
  }
  const signedIn = Boolean(cloudUser);
  cloudStatus.textContent = signedIn
    ? `ログイン中: ${cloudUser.email || "Googleアカウント"} / 自動保存${cloudAutoSaveEnabled ? "ON" : "OFF"}`
    : cloudAuthNotice || "未ログイン";
  cloudLoginBtn.textContent = signedIn ? "自動保存を有効にする" : "Googleでログイン";
  cloudLoginBtn.hidden = signedIn && cloudAutoSaveEnabled;
  cloudLogoutBtn.hidden = !signedIn;
  cloudBtn.textContent = signedIn && cloudAutoSaveEnabled ? "同期済" : "ログイン";
  cloudBtn.classList.toggle("synced", signedIn && cloudAutoSaveEnabled);
  setCloudButtons(signedIn);
}

function setCloudButtons(enabled) {
  return enabled;
}

function openCloudDialog() {
  updateCloudUi();
  cloudDialog.showModal();
}

function setCloudAutoSave(enabled) {
  cloudAutoSaveEnabled = enabled;
  if (enabled) localStorage.setItem(cloudAutoSaveKey, "1");
  else localStorage.removeItem(cloudAutoSaveKey);
  updateCloudUi();
}

function cloudEmailValue() {
  return cloudEmail.value.trim();
}

function cloudPasswordValue() {
  return cloudPassword.value;
}

function setCloudEmailBusy(isBusy) {
  cloudEmailLoginBtn.disabled = isBusy;
  cloudEmailRegisterBtn.disabled = isBusy;
  cloudPasswordResetBtn.disabled = isBusy;
}

async function finishCloudEmailAuth(user) {
  cloudUser = user;
  cloudAuthNotice = "";
  cloudEmailError.textContent = "";
  setCloudAutoSave(true);
  await autoLoadCloudDataAfterLogin();
  updateCloudUi();
}

async function cloudEmailLogin() {
  if (!cloudReady || !cloudAuth) {
    cloudEmailError.textContent = "Firebaseの準備ができていません。少し待ってから試してください。";
    return;
  }
  const email = cloudEmailValue();
  const password = cloudPasswordValue();
  if (!email || !password) {
    cloudEmailError.textContent = "メールアドレスとパスワードを入力してください。";
    return;
  }
  setCloudEmailBusy(true);
  cloudEmailError.textContent = "";
  cloudStatus.textContent = "メールでログイン中...";
  try {
    await cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL);
    const result = await cloudAuth.signInWithEmailAndPassword(email, password);
    await finishCloudEmailAuth(result.user);
  } catch (error) {
    cloudEmailError.textContent = cloudEmailAuthErrorMessage(error);
    cloudAuthNotice = cloudEmailError.textContent;
    updateCloudUi();
  } finally {
    setCloudEmailBusy(false);
  }
}

async function cloudEmailRegister() {
  if (!cloudReady || !cloudAuth) {
    cloudEmailError.textContent = "Firebaseの準備ができていません。少し待ってから試してください。";
    return;
  }
  const email = cloudEmailValue();
  const password = cloudPasswordValue();
  if (!email || !password) {
    cloudEmailError.textContent = "メールアドレスとパスワードを入力してください。";
    return;
  }
  if (password.length < 6) {
    cloudEmailError.textContent = "パスワードは6文字以上で設定してください。";
    return;
  }
  setCloudEmailBusy(true);
  cloudEmailError.textContent = "";
  cloudStatus.textContent = "アカウント作成中...";
  try {
    await cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL);
    const result = await cloudAuth.createUserWithEmailAndPassword(email, password);
    await finishCloudEmailAuth(result.user);
  } catch (error) {
    cloudEmailError.textContent = cloudEmailAuthErrorMessage(error);
    cloudAuthNotice = cloudEmailError.textContent;
    updateCloudUi();
  } finally {
    setCloudEmailBusy(false);
  }
}

async function cloudPasswordReset() {
  if (!cloudReady || !cloudAuth) {
    cloudEmailError.textContent = "Firebaseの準備ができていません。少し待ってから試してください。";
    return;
  }
  const email = cloudEmailValue();
  if (!email) {
    cloudEmailError.textContent = "再設定メールを送るメールアドレスを入力してください。";
    return;
  }
  setCloudEmailBusy(true);
  cloudEmailError.textContent = "";
  try {
    await cloudAuth.sendPasswordResetEmail(email);
    cloudEmailError.textContent = "パスワード再設定メールを送信しました。メールを確認してください。";
  } catch (error) {
    cloudEmailError.textContent = cloudEmailAuthErrorMessage(error);
  } finally {
    setCloudEmailBusy(false);
  }
}

function cloudRestoreStorageKey() {
  return cloudUser ? `${cloudRestoreKeyPrefix}${cloudUser.uid}` : "";
}

function getStoredCloudRestoreKey() {
  const key = cloudRestoreStorageKey();
  return key ? localStorage.getItem(key) || "" : "";
}

function rememberCloudRestoreKey(value) {
  const key = cloudRestoreStorageKey();
  if (key && value) localStorage.setItem(key, value);
}

function clearCloudRestoreKey() {
  const key = cloudRestoreStorageKey();
  if (key) localStorage.removeItem(key);
}

function showCloudRestoreKey(mode, snapshot = null) {
  cloudRestoreMode = mode;
  cloudSnapshotPending = snapshot;
  cloudRestoreSection.hidden = false;
  cloudRestoreError.textContent = "";
  cloudRestoreKey.value = "";
  cloudRestoreConfirm.value = "";
  cloudRestoreConfirmField.hidden = mode !== "create";
  cloudRestoreTitle.textContent = mode === "create" ? "復元キーを設定" : "復元キーを入力";
  cloudRestoreSubmitBtn.textContent = mode === "create" ? "復元キーを設定" : "復元して読み込む";
  cloudRestoreNote.textContent = mode === "create"
    ? "復元キーでクラウドデータを暗号化します。別端末で開く時に必要です。忘れるとクラウドの中身は復元できません。"
    : "このクラウドデータは暗号化されています。設定した復元キーを入力してください。";
  setTimeout(() => cloudRestoreKey.focus(), 0);
}

function hideCloudRestoreKey() {
  cloudRestoreSection.hidden = true;
  cloudSnapshotPending = null;
  cloudRestoreError.textContent = "";
  cloudRestoreKey.value = "";
  cloudRestoreConfirm.value = "";
}

async function submitCloudRestoreKey() {
  const value = cloudRestoreKey.value.trim();
  if (value.length < 4) {
    cloudRestoreError.textContent = "4文字以上で入力してください。";
    return;
  }
  if (cloudRestoreMode === "create" && value !== cloudRestoreConfirm.value.trim()) {
    cloudRestoreError.textContent = "確認用の入力が一致していません。";
    return;
  }
  const pendingSnapshot = cloudSnapshotPending;
  const mode = cloudRestoreMode;
  rememberCloudRestoreKey(value);
  hideCloudRestoreKey();
  if (mode === "unlock" && pendingSnapshot) {
    await applyCloudSnapshot(pendingSnapshot, { auto: false });
  } else {
    setCloudAutoSave(true);
    scheduleCloudAutoSave(120);
  }
}

async function cloudLogin() {
  if (!cloudReady || !cloudAuth) {
    cloudStatus.textContent = "Firebaseの準備ができていません。少し待ってから試してください。";
    return;
  }
  if (cloudUser) {
    if (!confirm("クラウド自動保存を有効にしますか？ログイン中は選考データを復元キーで暗号化してFirebaseに自動保存します。")) return;
    setCloudAutoSave(true);
    autoLoadCloudDataAfterLogin();
    return;
  }
  if (!confirm("Googleログインすると、ログイン中は選考データを復元キーで暗号化してFirebaseに自動保存します。クラウド同期を有効にしますか？")) {
    return;
  }
  if (isStandaloneApp()) {
    cloudAuthNotice = "ホーム画面版ではGoogleログインが失敗する場合があります。Safariの通常タブで公開URLを開いてログインしてください。";
    localStorage.removeItem(cloudAutoSavePendingKey);
    updateCloudUi();
    return;
  }
  localStorage.setItem(cloudAutoSavePendingKey, "1");
  const provider = new firebase.auth.GoogleAuthProvider();
  cloudStatus.textContent = "Googleログインを開いています...";
  try {
    await cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL);
    const result = await cloudAuth.signInWithPopup(provider);
    if (result?.user) handleCloudAuthUser(result.user, { forceAutoLoad: true });
  } catch (error) {
    if (["auth/popup-blocked", "auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(error.code)) {
      try {
        await cloudAuth.signInWithRedirect(provider);
      } catch (redirectError) {
        cloudAuthNotice = cloudAuthErrorMessage(redirectError);
        localStorage.removeItem(cloudAutoSavePendingKey);
        updateCloudUi();
      }
    } else {
      cloudAuthNotice = cloudAuthErrorMessage(error);
      localStorage.removeItem(cloudAutoSavePendingKey);
      updateCloudUi();
    }
  }
}

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function cloudAuthErrorMessage(error = {}) {
  const code = error.code || "unknown";
  const messages = {
    "auth/operation-not-allowed": "GoogleログインがFirebase側で有効になっていません。Authentication > Sign-in methodでGoogleを有効にしてください。",
    "auth/unauthorized-domain": "このURLがFirebaseの承認済みドメインに入っていません。Authorized domainsにn6548yjd79-lang.github.ioを追加してください。",
    "auth/operation-not-supported-in-this-environment": "この開き方ではGoogleログインに対応していません。Safariの通常タブで公開URLを開いてログインしてください。ホーム画面版やプレビュー画面では失敗する場合があります。",
    "auth/popup-blocked": "ログイン画面がブロックされました。もう一度押すか、Safariで開いて試してください。",
    "auth/popup-closed-by-user": "ログイン画面が閉じられました。もう一度試してください。",
    "auth/cancelled-popup-request": "ログイン処理が中断されました。もう一度試してください。"
  };
  return messages[code] || `ログインできませんでした。Firebase設定を確認してください。エラー: ${code}`;
}

function cloudEmailAuthErrorMessage(error = {}) {
  const code = error.code || "unknown";
  const messages = {
    "auth/email-already-in-use": "このメールアドレスはすでに登録されています。メールでログインしてください。",
    "auth/invalid-email": "メールアドレスの形式を確認してください。",
    "auth/missing-password": "パスワードを入力してください。",
    "auth/weak-password": "パスワードは6文字以上で設定してください。",
    "auth/user-not-found": "このメールアドレスのアカウントが見つかりません。新規登録してください。",
    "auth/wrong-password": "パスワードが違います。",
    "auth/invalid-credential": "メールアドレスまたはパスワードが違います。",
    "auth/operation-not-allowed": "メールログインがFirebase側で有効になっていません。Authentication > Sign-in methodでメール/パスワードを有効にしてください。",
    "auth/too-many-requests": "試行回数が多すぎます。少し時間を置いてから試してください。",
    "auth/network-request-failed": "通信に失敗しました。ネット接続を確認してください。"
  };
  return messages[code] || `ログインできませんでした。エラー: ${code}`;
}

async function cloudLogout() {
  if (!cloudAuth) return;
  await cloudAuth.signOut();
  cloudAuthNotice = "";
  setCloudAutoSave(false);
  cloudEncryptionConfig = null;
  cloudAutoLoadCheckedUid = "";
  hideCloudRestoreKey();
  cloudStatus.textContent = "ログアウトしました。";
}

function cloudDocRef() {
  if (!cloudDb || !cloudUser) return null;
  return cloudDb.collection("users").doc(cloudUser.uid).collection("appData").doc("main");
}

async function getCloudEncryptionKey() {
  const restoreKey = getStoredCloudRestoreKey();
  if (!restoreKey) {
    showCloudRestoreKey("create");
    throw new Error("restore-key-required");
  }
  if (!cloudEncryptionConfig) {
    cloudEncryptionConfig = await createVaultConfig(restoreKey);
  }
  const key = await deriveVaultKey(restoreKey, cloudEncryptionConfig.salt);
  await decryptPayload(key, cloudEncryptionConfig.verifier);
  return key;
}

async function cloudPayload() {
  const key = await getCloudEncryptionKey();
  const encryptedData = await encryptPayload(key, {
    entries,
    vault: vaultConfig
  });
  return {
    version: 2,
    encryptedData,
    cloudKey: cloudEncryptionConfig,
    savedAt: new Date().toISOString(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
}

function scheduleCloudAutoSave(delay = 700) {
  if (!cloudAutoSaveEnabled || !cloudUser || !cloudReady) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(() => saveCloudData(), delay);
}

async function saveCloudData() {
  const ref = cloudDocRef();
  if (!ref || cloudSaving) return;
  cloudSaving = true;
  cloudStatus.textContent = "クラウドへ自動保存中...";
  try {
    await ref.set(await cloudPayload());
    cloudStatus.textContent = `自動保存済み: ${new Date().toLocaleString("ja-JP")}`;
  } catch (error) {
    cloudStatus.textContent = error.message === "restore-key-required"
      ? "復元キーを設定すると、クラウドへ暗号化して自動保存します。"
      : "クラウド自動保存に失敗しました。Firestoreのルールや設定を確認してください。";
  } finally {
    cloudSaving = false;
  }
}

async function autoLoadCloudDataAfterLogin() {
  if (!cloudUser || cloudAutoLoadCheckedUid === cloudUser.uid) return;
  cloudAutoLoadCheckedUid = cloudUser.uid;
  await loadCloudData({ auto: true });
}

function hasLocalUserData() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length > 0 : Array.isArray(parsed?.entries) && parsed.entries.length > 0;
  } catch {
    return entries.length > 0;
  }
}

async function loadCloudData({ auto = false } = {}) {
  const ref = cloudDocRef();
  if (!ref) {
    cloudStatus.textContent = "先にGoogleログインしてください。";
    return;
  }
  cloudStatus.textContent = "クラウドから読み込み中...";
  try {
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      cloudStatus.textContent = "クラウド側に保存データがありません。復元キーを設定すると、この端末のデータを初回保存します。";
      if (getStoredCloudRestoreKey()) scheduleCloudAutoSave(120);
      else showCloudRestoreKey("create");
      return;
    }
    const shouldConfirm = auto ? hasLocalUserData() : entries.length > 0;
    if (shouldConfirm && !confirm("クラウドの保存データをこの端末に読み込みます。この端末の一覧は置き換わります。よろしいですか？")) {
      setCloudAutoSave(false);
      cloudStatus.textContent = "クラウド読み込みをキャンセルしました。自動保存はOFFにしました。";
      return;
    }
    await applyCloudSnapshot(snapshot, { auto });
  } catch {
    cloudStatus.textContent = "クラウド読み込みに失敗しました。Firestoreのルールや設定を確認してください。";
  }
}

async function applyCloudSnapshot(snapshot, { auto = false } = {}) {
  const data = snapshot.data();
  if (data.encryptedData && data.cloudKey) {
    cloudEncryptionConfig = data.cloudKey;
    const restoreKey = getStoredCloudRestoreKey();
    if (!restoreKey) {
      showCloudRestoreKey("unlock", snapshot);
      cloudStatus.textContent = "クラウドデータを開くには復元キーが必要です。";
      return;
    }
    try {
      const key = await deriveVaultKey(restoreKey, cloudEncryptionConfig.salt);
      await decryptPayload(key, cloudEncryptionConfig.verifier);
      const payload = await decryptPayload(key, data.encryptedData);
      if (!Array.isArray(payload.entries)) throw new Error("invalid");
      entries = payload.entries.map(normalizeEntry);
      vaultConfig = payload.vault || null;
      saveVaultConfig();
      save({ cloud: false });
      render();
      cloudStatus.textContent = "暗号化されたクラウドデータを読み込みました。";
      return;
    } catch {
      clearCloudRestoreKey();
      showCloudRestoreKey("unlock", snapshot);
      cloudStatus.textContent = "復元キーが違います。もう一度入力してください。";
      return;
    }
  }
  if (!Array.isArray(data.entries)) throw new Error("invalid");
  entries = data.entries.map(normalizeEntry);
  vaultConfig = data.vault || null;
  saveVaultConfig();
  save({ cloud: false });
  render();
  cloudStatus.textContent = "旧形式のクラウドデータを読み込みました。復元キーで暗号化し直します。";
  cloudEncryptionConfig = null;
  if (getStoredCloudRestoreKey()) scheduleCloudAutoSave(120);
  else showCloudRestoreKey("create");
}

function loadVaultConfig() {
  try {
    return JSON.parse(localStorage.getItem(vaultStorageKey)) || null;
  } catch {
    return null;
  }
}

function saveVaultConfig() {
  if (vaultConfig) localStorage.setItem(vaultStorageKey, JSON.stringify(vaultConfig));
  else localStorage.removeItem(vaultStorageKey);
}

function openSettings() {
  settingsStatus.textContent = "";
  vaultSettingsStatus.textContent = "";
  settingsDialog.showModal();
}

function buildPortableData() {
  return {
    app: "NEXTROUND",
    version: 1,
    exportedAt: new Date().toISOString(),
    entries,
    vault: vaultConfig
  };
}

function encodeSyncCode(payload) {
  return `NEXTROUND-SYNC:${bytesToBase64(textEncoder.encode(JSON.stringify(payload)))}`;
}

function decodeSyncCode(value) {
  const clean = value.trim().replace(/\s/g, "");
  const code = clean.replace(/^NEXTROUND-SYNC:/i, "");
  return JSON.parse(textDecoder.decode(base64ToBytes(code)));
}

function openSyncCodeDialog() {
  syncCodeStatus.textContent = "";
  syncCodeOutput.value = encodeSyncCode(buildPortableData());
  syncCodeDialog.showModal();
  setTimeout(() => syncCodeOutput.focus(), 0);
}

function openSyncImportDialog() {
  syncCodeInput.value = "";
  syncImportStatus.textContent = "";
  syncImportDialog.showModal();
  setTimeout(() => syncCodeInput.focus(), 0);
}

async function copySyncCode() {
  syncCodeStatus.textContent = "";
  try {
    await navigator.clipboard.writeText(syncCodeOutput.value);
    syncCodeStatus.textContent = "同期コードをコピーしました。別端末で貼り付けて読み込めます。";
  } catch {
    syncCodeOutput.select();
    document.execCommand("copy");
    syncCodeStatus.textContent = "コピーしました。別端末で貼り付けて読み込めます。";
  }
}

function applySyncCode() {
  syncImportStatus.textContent = "";
  try {
    const parsed = decodeSyncCode(syncCodeInput.value);
    const importedEntries = Array.isArray(parsed) ? parsed : parsed.entries;
    if (!Array.isArray(importedEntries)) throw new Error("invalid");
    if (entries.length && !confirm("この端末に入っている今の一覧は、同期コードの内容に入れ替わります。必要なら先にバックアップしてください。よろしいですか？")) {
      return;
    }
    entries = importedEntries.map(normalizeEntry);
    vaultConfig = parsed.vault || null;
    saveVaultConfig();
    save();
    render();
    syncImportDialog.close();
    settingsStatus.textContent = "同期コードを読み込みました。保護データを見るには、コピー元の保護パスワードが必要です。";
  } catch {
    syncImportStatus.textContent = "読み込めませんでした。NEXTROUNDで作成した同期コードを貼り付けてください。";
  }
}

function exportData() {
  const payload = buildPortableData();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nextround-save-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  settingsStatus.textContent = "保存データを作成しました。iCloud Driveなど自分だけの場所に保管してください。";
}

function importData() {
  const file = importFile.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedEntries = Array.isArray(parsed) ? parsed : parsed.entries;
      if (!Array.isArray(importedEntries)) throw new Error("invalid");
      if (entries.length && !confirm("今のデータを、選んだ保存データで置き換えます。よろしいですか？")) {
        importFile.value = "";
        return;
      }
      entries = importedEntries.map(normalizeEntry);
      vaultConfig = parsed.vault || null;
      saveVaultConfig();
      save();
      render();
      settingsStatus.textContent = "保存データを読み込みました。";
    } catch {
      settingsStatus.textContent = "読み込めませんでした。NEXTROUNDで保存したJSONファイルを選んでください。";
    } finally {
      importFile.value = "";
    }
  });
  reader.readAsText(file);
}

function normalizeEntry(entry) {
  const stage = normalizeStageName(entry.stage);
  return {
    id: entry.id || crypto.randomUUID(),
    company: entry.company || "",
    type: entry.type || "インターン",
    industry: normalizeIndustry(entry.industry),
    role: entry.role || "",
    stage: stages.includes(stage) ? stage : "応募予定",
    deadline: entry.deadline || "",
    nextDate: entry.nextDate || "",
    nextPlan: entry.nextPlan || "",
    internSchedule: entry.internSchedule || "",
    internScheduleMode: entry.internScheduleMode || "single",
    internSingleDate: entry.internSingleDate || "",
    internStartDate: entry.internStartDate || "",
    internEndDate: entry.internEndDate || "",
    memo: entry.memo || "",
    portalUrl: normalizePortalUrl(entry.portalUrl),
    flow: normalizeFlow(entry.flow, entry.stageHistory, stage),
    interviewCount: normalizeInterviewCount(entry),
    selectionTags: normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther),
    credentialVault: entry.credentialVault || null,
    esArchiveVault: entry.esArchiveVault || null,
    stageHistory: normalizeStageHistory(entry.stageHistory, stage)
  };
}

function normalizeStageName(stage) {
  return ({
    "ES落ち": "ES不合格",
    "Webテスト落ち": "Webテスト不合格",
    "GD落ち": "GD不合格",
    "面接落ち": "面接不合格"
  })[stage] || stage;
}

function normalizeIndustry(industry = "") {
  const value = String(industry || "").trim();
  if (!value || value === "未選択") return "未設定";
  return industryOptions.includes(value) ? value : "その他";
}

function normalizePortalUrl(value = "") {
  const url = String(value || "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function normalizeSelectionTags(tags = [], other = "") {
  const values = Array.isArray(tags) ? tags : tags ? [tags] : [];
  return [...new Set([...values, other].filter(Boolean))];
}

function normalizeInterviewCount(entry = {}) {
  const value = String(entry.interviewCount || "");
  if (["0", "1", "2", "3"].includes(value)) return value;
  if (["一次面接", "二次面接", "最終面接"].includes(normalizeStageName(entry.stage))) return "3";
  if (normalizeStageName(entry.stage) === "面接") return "1";
  if (entry.flow && entry.flow.interview === false) return "0";
  return entry.type === "本選考" ? "3" : "1";
}

function defaultFlow() {
  return { es: true, webTest: true, gd: true, interview: true };
}

function normalizeFlow(flow = {}, history = [], currentStage = "") {
  const normalized = { ...defaultFlow(), ...flow };
  const normalizedHistory = Array.isArray(history) ? history.map(normalizeStageName) : [];
  Object.entries(phaseStages).forEach(([key, values]) => {
    if (Object.prototype.hasOwnProperty.call(flow, key)) return;
    if (values.some(stage => normalizedHistory.includes(stage) || normalizeStageName(currentStage) === stage)) {
      normalized[key] = true;
    }
  });
  return normalized;
}

function getFlowFromForm() {
  return {
    es: form.elements.flowEs.checked,
    webTest: form.elements.flowWebTest.checked,
    gd: form.elements.flowGd.checked,
    interview: form.elements.flowInterview.checked
  };
}

function setFlowForm(entry = {}) {
  const flow = normalizeFlow(entry.flow, entry.stageHistory, entry.stage);
  form.elements.flowEs.checked = flow.es;
  form.elements.flowWebTest.checked = flow.webTest;
  form.elements.flowGd.checked = flow.gd;
  form.elements.flowInterview.checked = flow.interview;
  form.elements.interviewCount.value = normalizeInterviewCount(entry);
  updateInterviewCountState();
}

function getSelectionTagsFromForm() {
  const tags = [...form.querySelectorAll(".selection-tag:checked")].map(input => input.value);
  const other = form.elements.selectionTagOther.value.trim();
  if (tags.includes("その他") && other) tags.push(other);
  return [...new Set(tags.filter(tag => tag !== "その他" || !other))];
}

function setSelectionTagsForm(entry = {}) {
  const tags = normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther);
  form.querySelectorAll(".selection-tag").forEach(input => {
    input.checked = tags.includes(input.value) || (input.value === "その他" && tags.some(tag => !selectionTagOptions.includes(tag)));
  });
  const custom = tags.find(tag => !selectionTagOptions.includes(tag)) || "";
  form.elements.selectionTagOther.value = custom;
  updateSelectionTagOtherVisibility();
}

function updateSelectionTagOtherVisibility() {
  const otherChecked = Boolean(form.querySelector('.selection-tag[value="その他"]')?.checked);
  selectionTagOtherField.hidden = !otherChecked;
}

function updateInterviewCountState() {
  form.elements.interviewCount.disabled = !form.elements.flowInterview.checked;
  if (!form.elements.flowInterview.checked) form.elements.interviewCount.value = "0";
  if (form.elements.flowInterview.checked && form.elements.interviewCount.value === "0") {
    form.elements.interviewCount.value = form.elements.type.value === "本選考" ? "3" : "1";
  }
}

function hasSelectionTag(entry, tag) {
  return normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther).includes(tag);
}

function interviewStagesFor(entry) {
  if (!normalizeFlow(entry.flow, entry.stageHistory, entry.stage).interview) return [];
  const count = normalizeInterviewCount(entry);
  if (count === "0") return [];
  if (count === "1") return ["面接"];
  if (count === "2") return ["一次面接", "最終面接"];
  return ["一次面接", "二次面接", "最終面接"];
}

function activeStageSequence(entry) {
  const flow = normalizeFlow(entry.flow, entry.stageHistory, entry.stage);
  const skipWebTest = hasSelectionTag(entry, "ES+Webテスト同時提出");
  return [
    "気になる",
    "応募予定",
    ...(flow.es ? ["書類選考中", "ES提出済"] : []),
    ...(flow.webTest && !skipWebTest ? ["Webテスト"] : []),
    ...(flow.gd ? ["GD"] : []),
    ...interviewStagesFor(entry),
    "結果待ち"
  ];
}

function hasPhase(entry, phaseKey) {
  if (entry.flow && Object.prototype.hasOwnProperty.call(entry.flow, phaseKey)) {
    return Boolean(entry.flow[phaseKey]);
  }
  const flow = normalizeFlow(entry.flow, entry.stageHistory, entry.stage);
  if (flow[phaseKey]) return true;
  const history = Array.isArray(entry.stageHistory) ? entry.stageHistory.map(normalizeStageName) : [];
  return phaseStages[phaseKey].some(stage => history.includes(stage) || normalizeStageName(entry.stage) === stage);
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach(byte => binary += String.fromCharCode(byte));
  return btoa(binary);
}

function base64ToBytes(value) {
  return Uint8Array.from(atob(value), char => char.charCodeAt(0));
}

function randomBase64(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return bytesToBase64(bytes);
}

async function deriveVaultKey(password, salt) {
  if (!crypto.subtle) throw new Error("このブラウザでは保護保存を使えません。");
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: base64ToBytes(salt), iterations: 180000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function encryptPayload(key, payload) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(JSON.stringify(payload))
  );
  return { iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(encrypted)) };
}

async function decryptPayload(key, encrypted) {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(encrypted.iv) },
    key,
    base64ToBytes(encrypted.data)
  );
  return JSON.parse(textDecoder.decode(plain));
}

async function createVaultConfig(password) {
  const salt = randomBase64(16);
  const key = await deriveVaultKey(password, salt);
  const verifier = await encryptPayload(key, { app: "NEXTROUND", ok: true });
  return { version: 1, salt, verifier };
}

async function verifyVaultPassword(password) {
  if (!vaultConfig) return false;
  try {
    const key = await deriveVaultKey(password, vaultConfig.salt);
    const result = await decryptPayload(key, vaultConfig.verifier);
    return result?.ok === true;
  } catch {
    return false;
  }
}

async function requestVaultPassword({ title, message, create = false }) {
  vaultTitle.textContent = title;
  vaultMessage.textContent = message;
  vaultConfirmField.hidden = !create;
  vaultPassword.value = "";
  vaultConfirmPassword.value = "";
  vaultError.textContent = "";
  vaultDialog.showModal();
  setTimeout(() => vaultPassword.focus(), 0);
  return new Promise(resolve => {
    vaultResolver = resolve;
  });
}

function closeVaultRequest(value) {
  if (!vaultDialog.open) return;
  vaultDialog.close();
  const resolver = vaultResolver;
  vaultResolver = null;
  if (resolver) resolver(value);
}

function submitVaultPassword() {
  const password = vaultPassword.value;
  if (password.length < 4) {
    vaultError.textContent = "4文字以上で入力してください。";
    return;
  }
  if (!vaultConfirmField.hidden && password !== vaultConfirmPassword.value) {
    vaultError.textContent = "確認用の入力が一致していません。";
    return;
  }
  closeVaultRequest(password);
}

async function getVaultPasswordForSave() {
  if (!vaultConfig) {
    const password = await requestVaultPassword({
      title: "保護パスワードを設定",
      message: "マイページ情報とESアーカイブを守るパスワードです。忘れると復元できません。",
      create: true
    });
    if (!password) throw new Error("保護保存をキャンセルしました。");
    vaultConfig = await createVaultConfig(password);
    saveVaultConfig();
    rememberProtectedPassword(password);
    return password;
  }
  if (isProtectedUnlocked()) return protectedSession.password;
  const password = await requestVaultPassword({
    title: "保護パスワードを入力",
    message: "保護された情報を暗号化して保存します。",
    create: false
  });
  if (!password) throw new Error("保護保存をキャンセルしました。");
  if (!(await verifyVaultPassword(password))) throw new Error("保護パスワードが違います。");
  rememberProtectedPassword(password);
  return password;
}

async function getProtectedPassword(title, message) {
  if (isProtectedUnlocked()) return protectedSession.password;
  if (!vaultConfig) {
    const password = await requestVaultPassword({
      title: "保護パスワードを設定",
      message: "マイページ情報とESアーカイブを守るパスワードです。忘れると復元できません。",
      create: true
    });
    if (!password) return null;
    vaultConfig = await createVaultConfig(password);
    saveVaultConfig();
    rememberProtectedPassword(password);
    return password;
  }
  const password = await requestVaultPassword({ title, message, create: false });
  if (!password) return null;
  if (!(await verifyVaultPassword(password))) return "";
  rememberProtectedPassword(password);
  return password;
}

function isProtectedUnlocked() {
  return Boolean(protectedSession.password && Date.now() < protectedSession.until);
}

function rememberProtectedPassword(password) {
  protectedSession = { password, until: Date.now() + protectedUnlockMs };
  if (protectedLockTimer) clearTimeout(protectedLockTimer);
  protectedLockTimer = setTimeout(lockProtectedSession, protectedUnlockMs + 500);
  updateArchiveLockNote();
}

function lockProtectedSession() {
  protectedSession = { password: "", until: 0 };
  if (protectedLockTimer) clearTimeout(protectedLockTimer);
  protectedLockTimer = null;
  updateArchiveLockNote();
  if (esArchiveDialog.open) esArchiveError.textContent = "ロックしました。次に開く時は保護パスワードが必要です。";
}

function updateArchiveLockNote() {
  if (!esArchiveLockNote) return;
  if (!isProtectedUnlocked()) {
    esArchiveLockNote.textContent = "一度解除すると、30分間は再入力なしで開けます。";
    return;
  }
  const minutes = Math.max(1, Math.ceil((protectedSession.until - Date.now()) / 60000));
  esArchiveLockNote.textContent = `解除中です。約${minutes}分後に自動ロックされます。`;
}

async function openEsArchive(entry) {
  esArchiveTargetId = entry.id;
  esArchiveError.textContent = "";
  esArchiveTitle.textContent = `${entry.company} のESアーカイブ`;
  const password = await getProtectedPassword(
    "保護パスワード",
    "ESアーカイブを開きます。一度解除すると30分間は再入力なしで確認できます。"
  );
  if (password === null) return;
  if (password === "") {
    alert("保護パスワードが違います。");
    return;
  }
  try {
    esArchiveDraft = entry.esArchiveVault ? await decryptEsArchive(entry.esArchiveVault, password) : [];
  } catch {
    alert("ESアーカイブを読み取れませんでした。保護パスワードを確認してください。");
    return;
  }
  esArchiveDialog.showModal();
  renderEsArchiveItems(esArchiveDraft);
  updateArchiveLockNote();
}

function renderEsArchiveItems(items = []) {
  esArchiveItems.innerHTML = "";
  const values = items.length ? items : [emptyArchiveItem()];
  values.forEach(item => addEsArchiveItem(item));
}

function addEsArchiveItem(item = emptyArchiveItem()) {
  const index = esArchiveItems.children.length + 1;
  const section = document.createElement("section");
  section.className = "archive-item";
  const labelValue = item.label || "";
  const isKnownLabel = esArchiveLabels.includes(labelValue) && labelValue !== "その他";
  const selectedLabel = isKnownLabel ? labelValue : labelValue ? "その他" : "ガクチカ";
  const customLabel = isKnownLabel ? "" : labelValue === "その他" ? "" : labelValue;
  section.innerHTML = `
    <div class="archive-item-head">
      <span>設問 ${index}</span>
      <button class="archive-remove" type="button">削除</button>
    </div>
    <div class="form-grid">
      <label>ラベル
        <select class="archive-label">
          ${esArchiveLabels.map(label => `<option value="${escapeHtml(label)}" ${label === selectedLabel ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
        </select>
      </label>
      <label class="archive-custom-label" ${selectedLabel === "その他" ? "" : "hidden"}>その他のラベル
        <input class="archive-label-custom" value="${escapeHtml(customLabel)}" placeholder="例: 価値観 / キャリア観">
      </label>
      <label>提出日
        <input class="archive-date" type="date" value="${escapeHtml(item.submittedDate || "")}">
      </label>
    </div>
    <label>設問
      <textarea class="archive-question" placeholder="企業ごとの設問を自由に入力">${escapeHtml(item.question || "")}</textarea>
    </label>
    <label>提出した回答
      <textarea class="archive-answer" placeholder="提出したES本文を保存">${escapeHtml(item.answer || "")}</textarea>
      <span class="char-count">${countChars(item.answer || "")}文字</span>
    </label>
    <label>面接前メモ
      <textarea class="archive-memo" placeholder="深掘りされそうな点、文字数、補足など">${escapeHtml(item.memo || "")}</textarea>
    </label>
  `;
  section.querySelector(".archive-remove").addEventListener("click", () => {
    section.remove();
    refreshArchiveIndexes();
  });
  const labelSelect = section.querySelector(".archive-label");
  const customLabelField = section.querySelector(".archive-custom-label");
  labelSelect.addEventListener("change", () => {
    customLabelField.hidden = labelSelect.value !== "その他";
  });
  const answer = section.querySelector(".archive-answer");
  const counter = section.querySelector(".char-count");
  answer.addEventListener("input", () => {
    counter.textContent = `${countChars(answer.value)}文字`;
  });
  esArchiveItems.append(section);
  refreshArchiveIndexes();
}

function refreshArchiveIndexes() {
  [...esArchiveItems.querySelectorAll(".archive-item-head span")].forEach((label, index) => {
    label.textContent = `設問 ${index + 1}`;
  });
}

function readEsArchiveItems() {
  return [...esArchiveItems.querySelectorAll(".archive-item")]
    .map(section => ({
      id: crypto.randomUUID(),
      label: readArchiveLabel(section),
      submittedDate: section.querySelector(".archive-date").value,
      question: section.querySelector(".archive-question").value.trim(),
      answer: section.querySelector(".archive-answer").value.trim(),
      memo: section.querySelector(".archive-memo").value.trim()
    }))
    .filter(item => item.label || item.submittedDate || item.question || item.answer || item.memo);
}

function readArchiveLabel(section) {
  const selected = section.querySelector(".archive-label").value;
  if (selected !== "その他") return selected;
  return section.querySelector(".archive-label-custom").value.trim() || "その他";
}

async function saveEsArchive() {
  const entry = entries.find(item => item.id === esArchiveTargetId);
  if (!entry) return;
  esArchiveError.textContent = "";
  try {
    const items = readEsArchiveItems();
    let esArchiveVault = null;
    if (items.length) {
      const password = await getVaultPasswordForSave();
      const key = await deriveVaultKey(password, vaultConfig.salt);
      esArchiveVault = { version: 1, ...(await encryptPayload(key, items)) };
    }
    entries = entries.map(item => item.id === entry.id ? { ...item, esArchiveVault } : item);
    save();
    render();
    esArchiveError.textContent = items.length ? "ESアーカイブを保存しました。" : "ESアーカイブを空にしました。";
  } catch (error) {
    esArchiveError.textContent = error.message || "保存できませんでした。";
  }
}

async function decryptEsArchive(vault, password) {
  const key = await deriveVaultKey(password, vaultConfig.salt);
  const data = await decryptPayload(key, vault);
  return Array.isArray(data) ? data : [];
}

function emptyArchiveItem() {
  return { label: "", submittedDate: "", question: "", answer: "", memo: "" };
}

function countChars(value) {
  return [...String(value || "")].length;
}

async function changeVaultPassword() {
  vaultSettingsStatus.textContent = "";
  if (!vaultConfig) {
    vaultSettingsStatus.textContent = "まだ保護パスワードは設定されていません。ログイン情報やESアーカイブを保存するときに設定できます。";
    return;
  }
  const currentPassword = await requestVaultPassword({
    title: "現在の保護パスワード",
    message: "保存済みのログイン情報とESアーカイブを残したまま変更するため、現在の保護パスワードを入力してください。",
    create: false
  });
  if (!currentPassword) return;
  if (!(await verifyVaultPassword(currentPassword))) {
    vaultSettingsStatus.textContent = "現在の保護パスワードが違います。";
    return;
  }
  const oldConfig = vaultConfig;
  const oldKey = await deriveVaultKey(currentPassword, oldConfig.salt);
  let decryptedCredentials;
  let decryptedArchives;
  try {
    decryptedCredentials = await Promise.all(entries.map(entry => (
      entry.credentialVault ? decryptPayload(oldKey, entry.credentialVault) : Promise.resolve(null)
    )));
    decryptedArchives = await Promise.all(entries.map(entry => (
      entry.esArchiveVault ? decryptPayload(oldKey, entry.esArchiveVault) : Promise.resolve(null)
    )));
  } catch {
    vaultSettingsStatus.textContent = "保存済みの保護データを読み取れませんでした。忘れた場合の再設定を使ってください。";
    return;
  }
  const newPassword = await requestVaultPassword({
    title: "新しい保護パスワード",
    message: "保存済みのログイン情報とESアーカイブは残したまま、新しい保護パスワードに変更します。",
    create: true
  });
  if (!newPassword) return;
  const newConfig = await createVaultConfig(newPassword);
  const newKey = await deriveVaultKey(newPassword, newConfig.salt);
  entries = await Promise.all(entries.map(async (entry, index) => {
    const credential = decryptedCredentials[index];
    const archive = decryptedArchives[index];
    return {
      ...entry,
      credentialVault: credential ? { version: 1, ...(await encryptPayload(newKey, credential)) } : null,
      esArchiveVault: archive ? { version: 1, ...(await encryptPayload(newKey, archive)) } : null
    };
  }));
  vaultConfig = newConfig;
  saveVaultConfig();
  rememberProtectedPassword(newPassword);
  save();
  render();
  vaultSettingsStatus.textContent = "保護パスワードを変更しました。保存済みの保護データは残っています。";
}

function openForgotVaultDialog() {
  forgotVaultConfirm.checked = false;
  forgotVaultPassword.value = "";
  forgotVaultConfirmPassword.value = "";
  forgotVaultError.textContent = "";
  forgotVaultDialog.showModal();
  setTimeout(() => forgotVaultPassword.focus(), 0);
}

async function resetForgottenVaultPassword() {
  forgotVaultError.textContent = "";
  if (!forgotVaultConfirm.checked) {
    forgotVaultError.textContent = "確認チェックを入れてください。";
    return;
  }
  const password = forgotVaultPassword.value;
  if (password.length < 4) {
    forgotVaultError.textContent = "4文字以上で入力してください。";
    return;
  }
  if (password !== forgotVaultConfirmPassword.value) {
    forgotVaultError.textContent = "確認用の入力が一致していません。";
    return;
  }
  vaultConfig = await createVaultConfig(password);
  entries = entries.map(entry => ({ ...entry, portalUrl: "", credentialVault: null, esArchiveVault: null }));
  saveVaultConfig();
  rememberProtectedPassword(password);
  save();
  render();
  forgotVaultDialog.close();
  vaultSettingsStatus.textContent = "保護パスワードを再設定しました。必要なログイン情報やESアーカイブはもう一度入力してください。";
}

async function buildCredentialVault(data, existingEntry) {
  if (data.clearCredential === "1") return null;
  const credential = {
    id: (data.portalId || "").trim(),
    password: data.portalPassword || ""
  };
  if (!credential.id && !credential.password) {
    return existingEntry?.credentialVault || null;
  }
  const password = await getVaultPasswordForSave();
  const key = await deriveVaultKey(password, vaultConfig.salt);
  return { version: 1, ...(await encryptPayload(key, credential)) };
}

async function decryptCredential(vault, password) {
  const key = await deriveVaultKey(password, vaultConfig.salt);
  return decryptPayload(key, vault);
}

function normalizeStageHistory(history, currentStage) {
  const values = Array.isArray(history)
    ? history.map(normalizeStageName).filter(stage => stages.includes(stage))
    : [];
  const inferred = inferStageHistory(currentStage);
  return [...new Set([...inferred, ...values, currentStage].filter(stage => stages.includes(stage)))];
}

function addStageToHistory(history, stage) {
  return normalizeStageHistory([...(history || []), stage], stage);
}

function removeStageFromHistory(history, stage) {
  return (history || []).map(normalizeStageName).filter(item => item !== stage);
}

function inferStageHistory(stage) {
  if (!stage || !stages.includes(stage)) return [];
  if (winStages.has(stage)) return [...stages.slice(0, stages.indexOf("結果待ち") + 1), stage];
  if (doneStages.has(stage)) return [stage];
  return stages.slice(0, stages.indexOf(stage) + 1);
}

function openAnalytics() {
  renderAnalytics();
  analyticsDialog.showModal();
}

function renderAnalytics() {
  const stats = [
    ...analysisPhaseDefinitions.map(item => buildSimplePassRate(item)),
    buildInterviewPassRate()
  ];
  const industryStats = buildIndustryPassRates();
  analyticsContent.innerHTML = `
    <h3 class="analysis-section-title">フェーズ別</h3>
    ${stats.map(item => analysisCardMarkup(item, "対象")).join("")}
    <h3 class="analysis-section-title">業界別 通過率</h3>
    ${industryStats.length ? industryStats.map((item, index) => analysisCardMarkup({ ...item, color: industryColors[index % industryColors.length] }, "判定")).join("") : `
      <section class="analysis-card" style="--accent:#61f4de;">
        <div class="analysis-top">
          <strong>業界データなし</strong>
          <span class="analysis-rate">0%</span>
        </div>
        <div class="analysis-bar"><div class="analysis-fill" style="--rate:0%"></div></div>
        <div class="analysis-detail">企業の業界を入れると、ここに業界別の通過率が表示されます。</div>
      </section>
    `}
  `;
}

function analysisCardMarkup(item, totalLabel = "対象") {
  const rate = item.total ? Math.round((item.passed / item.total) * 100) : 0;
  const note = item.total < 3 ? "まだデータ少なめ" : "集計中";
  return `
    <section class="analysis-card" style="--accent:${item.color};">
      <div class="analysis-top">
        <strong>${escapeHtml(item.label)}</strong>
        <span class="analysis-rate">${rate}%</span>
      </div>
      <div class="analysis-bar"><div class="analysis-fill" style="--rate:${rate}%"></div></div>
      <div class="analysis-detail">通過 ${item.passed} / ${totalLabel} ${item.total} ・ ${note}</div>
    </section>
  `;
}

function openCalendar() {
  const today = new Date();
  selectedCalendarDate = localDateKey(today);
  calendarCursor = new Date(today.getFullYear(), today.getMonth(), 1);
  calendarDialog.showModal();
  renderCalendar();
}

function moveCalendarMonth(offset) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + offset, 1);
  selectedCalendarDate = localDateKey(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth(), 1));
  renderCalendar();
}

function renderCalendar() {
  if (!calendarDialog.open) return;
  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  const todayKey = localDateKey(new Date());
  const eventsByDate = groupCalendarEvents();
  const first = new Date(year, month, 1);
  const gridStart = new Date(year, month, 1 - first.getDay());
  calendarMonthLabel.textContent = `${year}年${month + 1}月`;
  calendarGrid.innerHTML = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    const key = localDateKey(date);
    const events = eventsByDate.get(key) || [];
    const dots = events.slice(0, 4).map(event => `<i class="calendar-dot" style="--dot:${event.color};"></i>`).join("");
    return `
      <button class="calendar-day${date.getMonth() === month ? "" : " outside"}${key === todayKey ? " today-mark" : ""}${key === selectedCalendarDate ? " selected" : ""}" type="button" data-date="${key}" aria-label="${formatLongDate(key)}">
        <span class="calendar-date-num">${date.getDate()}</span>
        <span class="calendar-dots">${dots}</span>
        ${events.length > 1 ? `<span class="calendar-count">${events.length}</span>` : ""}
      </button>
    `;
  }).join("");
  calendarGrid.querySelectorAll(".calendar-day").forEach(button => {
    button.addEventListener("click", () => {
      selectedCalendarDate = button.dataset.date;
      const selected = parseDateKey(selectedCalendarDate);
      if (selected.getMonth() !== calendarCursor.getMonth() || selected.getFullYear() !== calendarCursor.getFullYear()) {
        calendarCursor = new Date(selected.getFullYear(), selected.getMonth(), 1);
      }
      renderCalendar();
    });
  });
  renderSelectedCalendarEvents(eventsByDate.get(selectedCalendarDate) || []);
}

function renderSelectedCalendarEvents(events) {
  calendarSelectedLabel.textContent = formatLongDate(selectedCalendarDate);
  if (!events.length) {
    calendarEventList.innerHTML = `<p class="calendar-empty">この日の予定はありません。</p>`;
    return;
  }
  calendarEventList.innerHTML = events
    .sort((a, b) => a.priority - b.priority || a.company.localeCompare(b.company, "ja"))
    .map(event => `
      <button class="calendar-event" type="button" data-entry-id="${escapeHtml(event.entryId)}" style="--event:${event.color};">
        <span class="calendar-event-content">
          <span class="calendar-event-label">${escapeHtml(event.label)}</span>
          <span class="calendar-event-title">${escapeHtml(event.company)}</span>
          <span class="calendar-event-detail">${escapeHtml(event.detail)}</span>
        </span>
      </button>
    `).join("");
  calendarEventList.querySelectorAll("[data-entry-id]").forEach(button => {
    button.addEventListener("click", () => {
      const entry = entries.find(item => item.id === button.dataset.entryId);
      if (!entry) return;
      calendarDialog.close();
      openForm(entry);
    });
  });
}

function groupCalendarEvents() {
  const map = new Map();
  getCalendarEvents().forEach(event => {
    if (!map.has(event.date)) map.set(event.date, []);
    map.get(event.date).push(event);
  });
  return map;
}

function getCalendarEvents() {
  const result = [];
  entries.forEach(entry => {
    const done = doneStages.has(entry.stage);
    if (entry.deadline && !done) {
      const level = deadlineLevel(entry);
      result.push({
        entryId: entry.id,
        company: entry.company,
        date: entry.deadline,
        label: level === "critical" ? "締切 24時間以内" : level === "soon" ? "締切間近" : "締切",
        detail: `${entry.stage} ・ ${deadlineText(entry)}`,
        color: level === "critical" ? "#ff6678" : level === "soon" ? "#ffbd72" : "#ff6678",
        priority: level === "critical" ? 1 : 2
      });
    }
    if (entry.nextDate && !done) {
      result.push({
        entryId: entry.id,
        company: entry.company,
        date: entry.nextDate,
        label: nextCalendarLabel(entry),
        detail: `${entry.type} ・ ${entry.stage}`,
        color: "#61f4de",
        priority: 3
      });
    }
    if (entry.stage === "インターン合格") {
      internshipDateKeys(entry).forEach(date => {
        result.push({
          entryId: entry.id,
          company: entry.company,
          date,
          label: "インターン日程",
          detail: entry.internSchedule || `${formatDate(date)} 実施`,
          color: "#ffdf72",
          priority: 4
        });
      });
    }
  });
  return result.filter(event => isDateKey(event.date));
}

function nextCalendarLabel(entry) {
  if (entry.nextPlan) return entry.nextPlan;
  if (entry.stage === "GD") return "GD予定";
  if (entry.stage === "Webテスト") return "Webテスト予定";
  if (entry.stage.includes("面接")) return "面接予定";
  if (["書類選考中", "ES提出済"].includes(entry.stage)) return "書類/ES予定";
  return "次の予定";
}

function internshipDateKeys(entry) {
  if (entry.internScheduleMode === "range") {
    return dateKeysBetween(entry.internStartDate, entry.internEndDate);
  }
  if (isDateKey(entry.internSingleDate)) return [entry.internSingleDate];
  return [];
}

function dateKeysBetween(startValue, endValue) {
  if (!isDateKey(startValue) || !isDateKey(endValue)) return [];
  const start = parseDateKey(startValue);
  const end = parseDateKey(endValue);
  if (end < start) return [startValue];
  const keys = [];
  const cursor = new Date(start);
  while (cursor <= end && keys.length < 45) {
    keys.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function isDateKey(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "");
}

function localDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateKey(value) {
  return new Date(`${value}T00:00:00`);
}

function formatLongDate(value) {
  const date = parseDateKey(value);
  const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(date);
  return `${date.getMonth() + 1}/${date.getDate()}（${weekday}）`;
}

function buildSimplePassRate(definition) {
  let total = 0;
  let passed = 0;
  entries.forEach(entry => {
    const outcome = phaseOutcome(entry, definition);
    if (!outcome) return;
    total += 1;
    if (outcome.passed) passed += 1;
  });
  return { label: definition.label, total, passed, color: definition.color };
}

function phaseOutcome(entry, definition) {
  if (!hasPhase(entry, definition.key)) return null;
  const history = normalizeStageHistory(entry.stageHistory, entry.stage);
  const didFail = definition.failStages.includes(entry.stage);
  if (didFail) return { passed: false };
  const didPass = definition.passStages.some(stage => history.includes(stage)) || winStages.has(entry.stage);
  return didPass ? { passed: true } : null;
}

function buildInterviewPassRate() {
  const outcomes = entries.flatMap(interviewOutcomes);
  const total = outcomes.length;
  const passed = outcomes.filter(Boolean).length;
  return { label: "面接", total, passed, color: "#36d399" };
}

function interviewOutcomes(entry) {
  if (!hasPhase(entry, "interview")) return [];
  const interviewStages = interviewStagesFor(entry);
  if (!interviewStages.length) return [];
  const history = normalizeStageHistory(entry.stageHistory, entry.stage);
  if (entry.stage === "面接不合格") return [false];
  return interviewStages
    .filter(stage => history.includes(stage))
    .filter(stage => history.some(item => stages.indexOf(item) > stages.indexOf(stage)) || winStages.has(entry.stage))
    .map(() => true);
}

function buildIndustryPassRates() {
  const map = new Map();
  entries.forEach(entry => {
    const industry = normalizeIndustry(entry.industry);
    if (industry === "未設定") return;
    const outcomes = [
      ...analysisPhaseDefinitions.map(definition => phaseOutcome(entry, definition)).filter(Boolean).map(outcome => outcome.passed),
      ...interviewOutcomes(entry)
    ];
    if (!outcomes.length) return;
    if (!map.has(industry)) map.set(industry, { label: industry, total: 0, passed: 0 });
    const stat = map.get(industry);
    stat.total += outcomes.length;
    stat.passed += outcomes.filter(Boolean).length;
  });
  return [...map.values()].sort((a, b) => b.total - a.total || b.passed - a.passed || a.label.localeCompare(b.label, "ja"));
}

function nextDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysLeft(value) {
  if (!value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(value + "T00:00:00");
  return Math.round((target - today) / 86400000);
}

function formatDate(value) {
  if (!value) return "未設定";
  const date = new Date(value + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function formatScheduleDate(value) {
  if (!value) return "";
  const date = new Date(value + "T00:00:00");
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildScheduleFromForm(targetForm, prefix, fallback = "") {
  const mode = targetForm.elements[`${prefix}ScheduleMode`].value;
  if (mode === "single") {
    return formatScheduleDate(targetForm.elements[`${prefix}SingleDate`].value) || fallback;
  }
  const start = formatScheduleDate(targetForm.elements[`${prefix}StartDate`].value);
  const end = formatScheduleDate(targetForm.elements[`${prefix}EndDate`].value);
  if (start && end) return `${start}〜${end}`;
  return start || end || fallback;
}

function setScheduleForm(targetForm, prefix, entry = {}) {
  const mode = entry.internScheduleMode || "single";
  targetForm.elements[`${prefix}ScheduleMode`].value = mode;
  targetForm.elements[`${prefix}SingleDate`].value = entry.internSingleDate || "";
  targetForm.elements[`${prefix}StartDate`].value = entry.internStartDate || "";
  targetForm.elements[`${prefix}EndDate`].value = entry.internEndDate || "";
  updateScheduleMode(targetForm, prefix);
}

function updateScheduleMode(targetForm, prefix) {
  const mode = targetForm.elements[`${prefix}ScheduleMode`].value;
  document.querySelector(`#${prefix}SingleField`).hidden = mode !== "single";
  document.querySelector(`#${prefix}RangeFields`).hidden = mode !== "range";
}

function deadlineText(entry) {
  const left = daysLeft(entry.deadline);
  if (left === null) return "締切なし";
  if (left < 0) return `${Math.abs(left)}日超過`;
  if (left === 0) return "今日締切";
  return `あと${left}日`;
}

function deadlineLevel(entry) {
  const left = daysLeft(entry.deadline);
  if (left === null || left < 0 || doneStages.has(entry.stage)) return "";
  if (left <= 1) return "critical";
  if (left <= 7) return "soon";
  return "";
}

function isDeadlineNear(entry) {
  return Boolean(deadlineLevel(entry));
}

function deadlineClassName(entry) {
  const level = deadlineLevel(entry);
  return level ? `deadline-${level}` : "";
}

function deadlineMetaClass(entry) {
  const level = deadlineLevel(entry);
  if (level === "critical") return " urgent";
  if (level === "soon") return " soon";
  return "";
}

function countdownClass(entry) {
  const level = deadlineLevel(entry);
  if (level === "critical") return "danger";
  if (level === "soon") return "warning";
  return "";
}

function deadlineRank(entry) {
  const left = daysLeft(entry.deadline);
  if (isDeadlineNear(entry)) return -100 + left;
  if (left === null) return 9999;
  if (left < 0) return 9000 + Math.abs(left);
  return left;
}

function stageProgress(stage) {
  const index = Math.max(0, stages.indexOf(stage));
  return Math.round((index / (stages.length - 1)) * 100);
}

function filteredEntries() {
  const word = document.querySelector("#search").value.trim().toLowerCase();
  return entries
    .filter(entry => {
      if (activeFilter === "deadline") return daysLeft(entry.deadline) !== null;
      if (activeFilter === "all") return true;
      if (activeFilter === "面接") return entry.stage.includes("面接");
      if (activeFilter === "合格") return winStages.has(entry.stage);
      if (["書類選考中", "GD", "結果待ち"].includes(activeFilter)) return entry.stage === activeFilter;
      return entry.type === activeFilter;
    })
    .filter(entry => !word || [entry.company, entry.role, entry.industry, entry.stage, entry.memo, entry.internSchedule, entry.nextPlan, ...normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther)].join(" ").toLowerCase().includes(word))
    .sort((a, b) => {
      const rankDiff = deadlineRank(a) - deadlineRank(b);
      if (rankDiff !== 0) return rankDiff;
      return a.company.localeCompare(b.company, "ja");
    });
}

function render() {
  const visible = filteredEntries();
  cards.innerHTML = "";
  deadlineStrip.innerHTML = "";

  document.querySelector("#activeCount").textContent = entries.filter(entry => !doneStages.has(entry.stage)).length;
  document.querySelector("#soonCount").textContent = entries.filter(entry => {
    const left = daysLeft(entry.deadline);
    return left !== null && left <= 7 && left >= 0 && !doneStages.has(entry.stage);
  }).length;
  document.querySelector("#winCount").textContent = entries.filter(entry => winStages.has(entry.stage)).length;

  entries
    .filter(isDeadlineNear)
    .sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline))
    .slice(0, 3)
    .forEach(entry => {
      const row = document.createElement("article");
      row.className = `deadline-card ${deadlineClassName(entry)}`;
      row.innerHTML = `<b>${escapeHtml(entry.company)} / ${escapeHtml(entry.stage)}</b><span>${deadlineText(entry)}</span>`;
      deadlineStrip.append(row);
    });

  if (!visible.length) {
    cards.innerHTML = `<div class="empty">まだ表示できる選考がありません。下の追加ボタンから入れられます。</div>`;
    paintFilters();
    if (calendarDialog.open) renderCalendar();
    return;
  }

  visible.forEach(entry => cards.append(createCard(entry)));
  paintFilters();
  if (calendarDialog.open) renderCalendar();
}

function createCard(entry) {
  const card = document.createElement("article");
  card.className = `card${winStages.has(entry.stage) ? " win" : ""}${deadlineClassName(entry) ? ` ${deadlineClassName(entry)}` : ""}`;
  const progress = stageProgress(entry.stage);
  const stageColor = stageColors[entry.stage] || stageColors["応募予定"];
  const deadlineClass = deadlineMetaClass(entry);
  const primaryStage = getPrimaryStage(entry);
  const done = doneStages.has(entry.stage) || entry.stage === stages.at(-1);
  const resultMode = entry.stage === "結果待ち";
  const actionMode = done ? "done-mode" : resultMode ? "result-mode" : "";
  const industry = normalizeIndustry(entry.industry);
  const portalUrl = normalizePortalUrl(entry.portalUrl);
  card.style.setProperty("--stage-color", stageColor);
  card.innerHTML = `
    <div class="card-main">
      <div class="topline">
        <div class="company">
          <h2>${escapeHtml(entry.company)}</h2>
          <p>${escapeHtml(entry.role || "職種未設定")}</p>
        </div>
        <div class="entry-badges">
          <span class="type">${escapeHtml(entry.type)}</span>
          ${industry !== "未設定" ? `<span class="industry-pill">${escapeHtml(industry)}</span>` : ""}
        </div>
      </div>
      <div class="stage-row">
        <span class="status-pill">${escapeHtml(entry.stage)}</span>
        <div class="stage-label"><strong>${escapeHtml(statusHint(entry))}</strong><span>${progress}%</span></div>
        <div class="track"><div class="bar" style="width:${progress}%"></div></div>
      </div>
      ${selectionTagsMarkup(entry)}
      ${done ? "" : deadlineMetaMarkup(entry, deadlineClass)}
      ${entry.stage === "インターン合格" ? internshipScheduleMarkup(entry) : ""}
      <div class="meta-box"><span>メモ</span><b>${escapeHtml(entry.memo || "メモなし")}</b></div>
      <div class="protected-actions">
        <button class="archive-open" data-action="esArchive" type="button">ESアーカイブ${entry.esArchiveVault ? "を開く" : "を作成"}</button>
        ${portalUrl ? `<a class="portal-link" href="${escapeHtml(portalUrl)}" target="_blank" rel="noopener noreferrer">マイページを開く</a>` : ""}
        ${entry.credentialVault ? `<button class="secret-open" data-action="credential" type="button">マイページ情報を表示</button>` : ""}
      </div>
    </div>
    <div class="actions ${actionMode}">
      <button class="primary ${done ? "done" : ""}" data-action="advance" ${done ? "disabled" : ""}>${done ? "完了済み" : escapeHtml(resultMode ? "結果を入力" : primaryLabel(entry, primaryStage))}</button>
      ${done ? "" : resultMode ? "" : `<button class="quick" data-action="fail">${escapeHtml(failLabel(entry))}</button>`}
      <button class="icon-btn" data-action="edit" aria-label="編集">編集</button>
      <button class="icon-btn" data-action="back" aria-label="戻る">戻る</button>
    </div>
  `;
  card.querySelector('[data-action="advance"]').addEventListener("click", () => {
    if (resultMode) openResultDialog(entry);
    else advance(entry.id, 1);
  });
  const failButton = card.querySelector('[data-action="fail"]');
  if (failButton) failButton.addEventListener("click", () => setStage(entry.id, getFailStage(entry)));
  const credentialButton = card.querySelector('[data-action="credential"]');
  if (credentialButton) credentialButton.addEventListener("click", () => openCredentialDialog(entry));
  const archiveButton = card.querySelector('[data-action="esArchive"]');
  if (archiveButton) archiveButton.addEventListener("click", () => openEsArchive(entry));
  const backButton = card.querySelector('[data-action="back"]');
  if (backButton) backButton.addEventListener("click", () => advance(entry.id, -1));
  const editButton = card.querySelector('[data-action="edit"]');
  if (editButton) editButton.addEventListener("click", () => openForm(entry));
  return card;
}

function openCredentialDialog(entry) {
  credentialTargetId = entry.id;
  credentialTitle.textContent = `${entry.company} のマイページ情報`;
  credentialPassword.value = "";
  credentialError.textContent = "";
  credentialResult.hidden = true;
  document.querySelector("#credentialUrl").textContent = "";
  document.querySelector("#credentialId").textContent = "";
  document.querySelector("#credentialPass").textContent = "";
  credentialDialog.showModal();
  if (isProtectedUnlocked()) {
    setTimeout(unlockCredential, 0);
  } else {
    setTimeout(() => credentialPassword.focus(), 0);
  }
}

async function unlockCredential() {
  const entry = entries.find(item => item.id === credentialTargetId);
  if (!entry?.credentialVault) return;
  credentialError.textContent = "";
  try {
    if (!vaultConfig) throw new Error("保護設定が見つかりません。保存データを読み込んだ場合は、対応する保存ファイルが必要です。");
    const password = credentialPassword.value || (isProtectedUnlocked() ? protectedSession.password : "");
    const credential = await decryptCredential(entry.credentialVault, password);
    rememberProtectedPassword(password);
    const legacyUrl = normalizePortalUrl(credential.url);
    if (!entry.portalUrl && legacyUrl) {
      entries = entries.map(item => item.id === entry.id ? { ...item, portalUrl: legacyUrl } : item);
      save();
      render();
    }
    document.querySelector("#credentialUrl").textContent = entry.portalUrl || legacyUrl || "未設定";
    document.querySelector("#credentialId").textContent = credential.id || "未設定";
    document.querySelector("#credentialPass").textContent = credential.password || "未設定";
    credentialResult.hidden = false;
  } catch (error) {
    credentialResult.hidden = true;
    credentialError.textContent = error.message?.includes("保護設定") ? error.message : "保護パスワードが違います。";
  }
}

function deadlineMetaMarkup(entry, deadlineClass) {
  return `
    <div class="meta">
      <div class="meta-box${deadlineClass}"><span>締切</span><b>${formatDate(entry.deadline)}</b><em class="countdown ${countdownClass(entry)}">${deadlineText(entry)}</em></div>
      <div class="meta-box"><span>次の予定</span>${nextScheduleMarkup(entry)}</div>
    </div>
  `;
}

function nextScheduleMarkup(entry) {
  if (entry.nextDate) {
    return `<b>${formatDate(entry.nextDate)}</b>${entry.nextPlan ? `<em class="next-plan">${escapeHtml(entry.nextPlan)}</em>` : ""}`;
  }
  return `<b>${escapeHtml(entry.nextPlan || "未設定")}</b>`;
}

function internshipScheduleMarkup(entry) {
  return `<div class="meta-box schedule-box"><span>インターン日程</span><b>${escapeHtml(entry.internSchedule || "未設定（編集から追加）")}</b></div>`;
}

function selectionTagsMarkup(entry) {
  const tags = normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther);
  if (!tags.length) return "";
  return `<div class="tag-pills">${tags.map(tag => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join("")}</div>`;
}

function getPrimaryStage(entry) {
  if (doneStages.has(entry.stage)) return entry.stage;
  if (entry.stage === "結果待ち") return entry.type === "インターン" ? "インターン合格" : "内定";
  const sequence = activeStageSequence(entry);
  const currentIndex = sequence.indexOf(entry.stage);
  if (currentIndex >= 0) return sequence[Math.min(currentIndex + 1, sequence.length - 1)];
  const next = sequence.find(stage => stages.indexOf(stage) > stages.indexOf(entry.stage));
  return next || "結果待ち";
}

function getQuickStage(entry) {
  if (entry.stage === "結果待ち") return entry.type === "インターン" ? "インターン不合格" : "不採用";
  return getFailStage(entry);
}

function primaryLabel(entry, stage) {
  if (entry.stage === "結果待ち") return `結果: ${stage}`;
  return `次へ: ${stage}`;
}

function quickLabel(entry, stage) {
  if (entry.stage === "結果待ち") return `結果: ${stage}`;
  return failLabel(entry);
}

function getFailStage(entry) {
  if (["書類選考中", "ES提出済"].includes(entry.stage)) return "ES不合格";
  if (entry.stage === "Webテスト") return "Webテスト不合格";
  if (entry.stage === "GD") return "GD不合格";
  if (entry.stage.includes("面接")) return "面接不合格";
  return entry.type === "インターン" ? "インターン不合格" : "不採用";
}

function failLabel(entry) {
  return getFailStage(entry);
}

function statusHint(entry) {
  if (entry.stage === "結果待ち") return "返事が来たら結果入力";
  if (winStages.has(entry.stage)) return "おめでとう、通過";
  if (doneStages.has(entry.stage)) return "記録済み";
  return "次のステップへ";
}

function advance(id, direction) {
  entries = entries.map(entry => {
    if (entry.id !== id) return entry;
    const current = stages.indexOf(entry.stage);
    const next = direction > 0
      ? stages.indexOf(getPrimaryStage(entry))
      : stages.indexOf(getPreviousStage(entry));
    const nextStage = stages[next];
    const baseHistory = direction < 0
      ? removeStageFromHistory(entry.stageHistory, entry.stage)
      : entry.stageHistory;
    return { ...entry, stage: nextStage, stageHistory: addStageToHistory(baseHistory, nextStage) };
  });
  save();
  render();
}

function getPreviousStage(entry) {
  const map = {
    "ES不合格": "ES提出済",
    "Webテスト不合格": "Webテスト",
    "GD不合格": "GD",
    "インターン合格": "結果待ち",
    "インターン不合格": "結果待ち",
    "内定": "結果待ち",
    "不採用": "結果待ち",
    "辞退": "結果待ち"
  };
  if (entry.stage === "面接不合格") return lastInterviewStage(entry);
  if (map[entry.stage]) return map[entry.stage];
  const sequence = activeStageSequence(entry);
  const current = sequence.indexOf(entry.stage);
  if (current >= 0) return sequence[Math.max(0, current - 1)];
  return stages[Math.max(0, stages.indexOf(entry.stage) - 1)];
}

function lastInterviewStage(entry) {
  return interviewStagesFor(entry).at(-1) || "面接";
}

function setStage(id, stage, extras = {}) {
  entries = entries.map(entry => entry.id === id ? { ...entry, stage, stageHistory: addStageToHistory(entry.stageHistory, stage), ...extras } : entry);
  save();
  render();
}

function openResultDialog(entry) {
  resultTargetId = entry.id;
  resultForm.reset();
  resultTitle.textContent = `${entry.company} の結果`;
  resultScheduleField.hidden = entry.type !== "インターン";
  setScheduleForm(resultForm, "result", entry);
  document.querySelector("#passResultBtn").textContent = entry.type === "インターン" ? "インターン合格" : "内定";
  document.querySelector("#failResultBtn").textContent = entry.type === "インターン" ? "インターン不合格" : "不採用";
  resultDialog.showModal();
}

function applyResult(passed) {
  const entry = entries.find(item => item.id === resultTargetId);
  if (!entry) return;
  const stage = passed
    ? (entry.type === "インターン" ? "インターン合格" : "内定")
    : (entry.type === "インターン" ? "インターン不合格" : "不採用");
  const extras = {};
  if (stage === "インターン合格") {
    extras.internSchedule = buildScheduleFromForm(resultForm, "result", entry.internSchedule || "");
    extras.internScheduleMode = resultForm.elements.resultScheduleMode.value;
    extras.internSingleDate = resultForm.elements.resultSingleDate.value;
    extras.internStartDate = resultForm.elements.resultStartDate.value;
    extras.internEndDate = resultForm.elements.resultEndDate.value;
  }
  setStage(entry.id, stage, extras);
  resultDialog.close();
}

function openForm(entry) {
  editingId = entry?.id || null;
  document.querySelector("#formTitle").textContent = editingId ? "選考を編集" : "選考を追加";
  deleteBtn.hidden = !editingId;
  form.reset();
  form.elements.company.value = entry?.company || "";
  form.elements.type.value = entry?.type || "インターン";
  form.elements.stage.value = entry?.stage || "応募予定";
  form.elements.industry.value = normalizeIndustry(entry?.industry);
  form.elements.role.value = entry?.role || "";
  form.elements.deadline.value = entry?.deadline || "";
  form.elements.nextDate.value = entry?.nextDate || "";
  form.elements.nextPlan.value = entry?.nextPlan || "";
  setFlowForm(entry || {});
  setSelectionTagsForm(entry || {});
  setScheduleForm(form, "intern", entry || {});
  form.elements.memo.value = entry?.memo || "";
  form.elements.portalUrl.value = entry?.portalUrl || "";
  form.elements.portalId.value = "";
  form.elements.portalPassword.value = "";
  form.elements.clearCredential.checked = false;
  clearCredentialField.hidden = !(entry?.credentialVault || entry?.portalUrl);
  credentialFormNote.textContent = entry?.credentialVault || entry?.portalUrl
    ? "保存済みです。URLはカードから開けます。ID・パスワードを変更する時だけ新しく入力してください。"
    : "URLはカードから開けるように保存します。ID・パスワードは保護パスワードで暗号化します。";
  updateInternScheduleVisibility();
  dialog.showModal();
}

function updateInternScheduleVisibility() {
  internScheduleField.hidden = !(form.elements.type.value === "インターン" && form.elements.stage.value === "インターン合格");
}

function paintFilters() {
  [...chips.children].forEach(button => {
    const label = button.textContent;
    const filter = Object.entries(names).find(([, value]) => value === label)?.[0] || label;
    button.classList.toggle("active", filter === activeFilter);
  });
  syncNav();
}

function syncNav() {
  document.querySelectorAll(".nav-btn[data-filter]").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

render();
initCloudSync();
