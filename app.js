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
const internSeasonOptions = ["未設定", "サマー", "秋", "冬"];
const industryOptions = ["未設定", "IT・通信", "金融", "メーカー", "商社", "コンサル", "広告・メディア", "人材", "不動産・建設", "インフラ", "小売・サービス", "官公庁・団体", "医療・ヘルスケア", "教育", "その他"];
const doneStages = new Set(["ES不合格", "Webテスト不合格", "GD不合格", "面接不合格", "インターン合格", "インターン不合格", "内定", "辞退", "不採用"]);
const winStages = new Set(["インターン合格", "内定"]);
const failStages = new Set(["ES不合格", "Webテスト不合格", "GD不合格", "面接不合格", "インターン不合格", "不採用"]);
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
const baseStorageKey = "senkou-deck-v1";
const baseVaultStorageKey = "nextround-vault-v1";
const baseMigrationSnapshotKey = "nextround-migration-snapshot-v2";
const baseMigrationStateKey = "nextround-migration-state-v2";
const baseMigrationAckKey = "nextround-migration-ack-v2";
const baseFitStorageKey = "nextround-fit-v1";
const localDataOwnerKey = "nextround-local-owner-v1";
let storageKey = baseStorageKey;
let vaultStorageKey = baseVaultStorageKey;
let migrationSnapshotKey = baseMigrationSnapshotKey;
let migrationStateKey = baseMigrationStateKey;
let migrationAckKey = baseMigrationAckKey;
let activeLocalUid = "";
const appSchemaVersion = 5;
const analysisScopeKey = "nextround-analysis-scope-v1";
const cloudAutoSaveKey = "nextround-cloud-autosave-v1";
const cloudAutoSavePendingKey = "nextround-cloud-autosave-pending-v1";
const cloudRestoreKeyPrefix = "nextround-cloud-restore-key-v1:";
const maxPortableEntries = 2000;
const maxPortableFileBytes = 5 * 1024 * 1024;
const maxSyncCodeLength = 7 * 1024 * 1024;
const appBootTimestamp = new Date().toISOString();
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
const combinedDocumentTag = "ES+Webテスト同時提出";
const selectionTagOptions = [combinedDocumentTag, "動画選考", "AI面接", "適性検査", "ケース面接", "面談", "その他"];
const visibleSelectionTagOptions = selectionTagOptions.filter(tag => tag !== combinedDocumentTag);
const managedInterviewStages = ["面接", "一次面接", "二次面接", "最終面接"];
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
let timelineTargetId = null;
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
let flowBuilderSteps = [];
let flowBuilderDirty = false;
let scheduleCustomDates = { intern: [], result: [] };
let offerTargetId = null;
let analysisSelectionType = localStorage.getItem(analysisScopeKey) === "本選考" ? "本選考" : "インターン";
let analysisRateAnimationFrame = null;

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
const flowStepList = document.querySelector("#flowStepList");
const flowStepInput = document.querySelector("#flowStepInput");
const deleteBtn = document.querySelector("#deleteBtn");
const internScheduleField = document.querySelector("#internScheduleField");
const internSeasonField = document.querySelector("#internSeasonField");
const internScheduleLabel = document.querySelector("#internScheduleLabel");
const internScheduleNote = document.querySelector("#internScheduleNote");
const documentFlowControl = document.querySelector("#documentFlowControl");
const resultDialog = document.querySelector("#resultDialog");
const resultForm = document.querySelector("#resultForm");
const resultTitle = document.querySelector("#resultTitle");
const resultScheduleField = document.querySelector("#resultScheduleField");
const timelineDialog = document.querySelector("#timelineDialog");
const timelineTitle = document.querySelector("#timelineTitle");
const timelineSummary = document.querySelector("#timelineSummary");
const timelineList = document.querySelector("#timelineList");
const timelineNote = document.querySelector("#timelineNote");
const offerDialog = document.querySelector("#offerDialog");
const offerForm = document.querySelector("#offerForm");
const offerDialogTitle = document.querySelector("#offerDialogTitle");
const settingsDialog = document.querySelector("#settingsDialog");
const settingsStatus = document.querySelector("#settingsStatus");
const cloudDialog = document.querySelector("#cloudDialog");
const cloudBtn = document.querySelector("#cloudBtn");
const cloudStatus = document.querySelector("#cloudStatus");
const cloudLogoutBtn = document.querySelector("#cloudLogoutBtn");
const cloudEmail = document.querySelector("#cloudEmail");
const cloudPassword = document.querySelector("#cloudPassword");
const cloudEmailLoginBtn = document.querySelector("#cloudEmailLoginBtn");
const cloudEmailRegisterBtn = document.querySelector("#cloudEmailRegisterBtn");
const cloudGoogleLoginBtn = document.querySelector("#cloudGoogleLoginBtn");
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
const analysisTypeSwitch = document.querySelector("#analysisTypeSwitch");
const analysisScopeSummary = document.querySelector("#analysisScopeSummary");
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
}, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 1750);

const now = new Date();
calendarCursor = new Date(now.getFullYear(), now.getMonth(), 1);
selectedCalendarDate = localDateKey(now);
document.querySelector("#dateLabel").textContent = `${now.getMonth() + 1}/${now.getDate()}`;
document.querySelector("#weekdayLabel").textContent = new Intl.DateTimeFormat("ja-JP", { weekday: "short" }).format(now);
stages.forEach(stage => stageSelect.add(new Option(stage, stage)));
industryOptions.forEach(industry => industrySelect.add(new Option(industry, industry)));
selectionTagOptionsEl.innerHTML = visibleSelectionTagOptions.map(tag => `
  <label><input class="selection-tag" type="checkbox" value="${escapeHtml(tag)}"><span>${escapeHtml(tag)}</span></label>
`).join("");

const filters = ["all", "インターン", "本選考", "書類選考中", "GD", "結果待ち", "面接", "合格", "不合格"];
const names = { all: "すべて", 面接: "面接中", 合格: "合格/内定" };
filters.forEach(filter => {
  const button = document.createElement("button");
  button.className = "chip" + (filter === "不合格" ? " fail-filter" : "") + (filter === activeFilter ? " active" : "");
  button.textContent = names[filter] || filter;
  button.addEventListener("click", () => {
    activeFilter = filter;
    syncNav();
    render();
  });
  chips.append(button);
});

document.querySelector("#search").addEventListener("input", render);
document.querySelector("#sortOrder").addEventListener("change", render);
document.querySelector("#addBtn").addEventListener("click", () => addChoiceDialog.showModal());
document.querySelector("#closeAddChoiceDialog").addEventListener("click", () => addChoiceDialog.close());
document.querySelector("#singleAddBtn").addEventListener("click", () => {
  addChoiceDialog.close();
  openForm();
});
document.querySelector("#memoImportBtn").addEventListener("click", () => {
  addChoiceDialog.close();
  openImportDialog("memo");
});
document.querySelector("#notionImportBtn").addEventListener("click", () => {
  addChoiceDialog.close();
  openImportDialog("notion");
});
document.querySelector("#closeDialog").addEventListener("click", () => dialog.close());
document.querySelector("#closeImportDialog").addEventListener("click", () => importDialog.close());
document.querySelector("#parseImportBtn").addEventListener("click", parseImportText);
confirmImportBtn.addEventListener("click", confirmImportCandidates);
document.querySelector("#closeResultDialog").addEventListener("click", () => resultDialog.close());
document.querySelector("#passResultBtn").addEventListener("click", () => applyResult(true));
document.querySelector("#failResultBtn").addEventListener("click", () => applyResult(false));
document.querySelector("#closeTimelineDialog").addEventListener("click", () => timelineDialog.close());
document.querySelector("#closeOfferDialog").addEventListener("click", () => offerDialog.close());
offerForm.addEventListener("submit", saveOfferDetails);
document.querySelector("#settingsBtn").addEventListener("click", openSettings);
document.querySelector("#closeSettingsDialog").addEventListener("click", () => settingsDialog.close());
document.querySelector("#createSyncCodeBtn").addEventListener("click", openSyncCodeDialog);
document.querySelector("#readSyncCodeBtn").addEventListener("click", openSyncImportDialog);
document.querySelector("#closeSyncCodeDialog").addEventListener("click", () => syncCodeDialog.close());
document.querySelector("#closeSyncImportDialog").addEventListener("click", () => syncImportDialog.close());
document.querySelector("#copySyncCodeBtn").addEventListener("click", copySyncCode);
document.querySelector("#applySyncCodeBtn").addEventListener("click", applySyncCode);
document.querySelector("#cloudBtn").addEventListener("click", openCloudDialog);
document.querySelector("#closeCloudDialog").addEventListener("click", () => {
  cloudPassword.value = "";
  hideCloudRestoreKey();
  cloudDialog.close();
});
cloudLogoutBtn.addEventListener("click", cloudLogout);
cloudEmailLoginBtn.addEventListener("click", cloudEmailLogin);
cloudEmailRegisterBtn.addEventListener("click", cloudEmailRegister);
cloudGoogleLoginBtn.addEventListener("click", cloudGoogleLogin);
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
document.querySelector("#closeForgotVaultDialog").addEventListener("click", () => {
  forgotVaultPassword.value = "";
  forgotVaultConfirmPassword.value = "";
  forgotVaultDialog.close();
});
document.querySelector("#forgotVaultSubmitBtn").addEventListener("click", resetForgottenVaultPassword);
document.querySelector("#privacyBtn").addEventListener("click", () => privacyDialog.showModal());
document.querySelector("#closePrivacyDialog").addEventListener("click", () => privacyDialog.close());
document.querySelector("#analyticsBtn").addEventListener("click", openAnalytics);
document.querySelector("#closeAnalyticsDialog").addEventListener("click", () => analyticsDialog.close());
analysisTypeSwitch.querySelectorAll("[data-analysis-type]").forEach(button => {
  button.addEventListener("click", () => setAnalysisSelectionType(button.dataset.analysisType));
});
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
credentialDialog.addEventListener("close", clearCredentialPlaintext);
esArchiveDialog.addEventListener("close", clearEsArchivePlaintext);
window.addEventListener("pagehide", lockProtectedSession);
vaultDialog.addEventListener("cancel", event => {
  event.preventDefault();
  closeVaultRequest(null);
});
form.elements.type.addEventListener("change", updateInternScheduleVisibility);
form.elements.type.addEventListener("change", updateInternSeasonVisibility);
form.elements.type.addEventListener("change", () => {
  if (!editingId && !flowBuilderDirty) setFlowBuilder({ type: form.elements.type.value });
});
form.elements.stage.addEventListener("change", updateInternScheduleVisibility);
document.querySelector("#addFlowStepBtn").addEventListener("click", addFlowBuilderStep);
document.querySelector("#resetFlowBtn").addEventListener("click", () => {
  flowBuilderDirty = false;
  setFlowBuilder({ type: form.elements.type.value });
});
document.querySelectorAll("[data-interview-count]").forEach(button => {
  button.addEventListener("click", () => setInterviewCount(Number(button.dataset.interviewCount)));
});
flowStepInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    addFlowBuilderStep();
  }
});
selectionTagOptionsEl.addEventListener("change", updateSelectionTagOtherVisibility);
Array.from(form.elements.documentFlowMode).forEach(input => {
  input.addEventListener("change", updateDocumentFlowVisibility);
});
Array.from(form.elements.internScheduleMode).forEach(input => {
  input.addEventListener("change", () => updateScheduleMode(form, "intern"));
});
Array.from(resultForm.elements.resultScheduleMode).forEach(input => {
  input.addEventListener("change", () => updateScheduleMode(resultForm, "result"));
});
document.querySelector("#internAddCustomDateBtn").addEventListener("click", () => addCustomScheduleDate("intern"));
document.querySelector("#resultAddCustomDateBtn").addEventListener("click", () => addCustomScheduleDate("result"));
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
  const scheduleData = scheduleDataFromForm(form, "intern", existingEntry?.internSchedule || "");
  const entryId = editingId || crypto.randomUUID();
  const item = touchEntry({
    ...existingEntry,
    id: entryId,
    trackId: existingEntry?.trackId || entryId,
    company: data.company.trim(),
    type: data.type,
    internSeason: data.type === "インターン" ? normalizeInternSeason(data.internSeason) : "未設定",
    industry: normalizeIndustry(data.industry),
    role: data.role.trim(),
    stage: data.stage,
    deadline: data.deadline,
    nextDate: data.nextDate,
    nextPlan: data.nextPlan.trim(),
    ...scheduleData,
    internScheduleStatus: getInternScheduleStatus({
      ...existingEntry,
      type: data.type,
      stage: data.stage,
      ...scheduleData
    }),
    memo: data.memo.trim(),
    flow: getFlowFromForm(),
    flowSteps: normalizeFlowSteps(flowBuilderSteps, { type: data.type }),
    interviewCount: interviewCountFromSteps(flowBuilderSteps),
    selectionTags: getSelectionTagsFromForm(),
    declinedAfterWin: winStages.has(data.stage) && Boolean(existingEntry?.declinedAfterWin),
    portalUrl: data.clearCredential === "1" ? "" : normalizePortalUrl(data.portalUrl),
    credentialVault,
    esArchiveVault: existingEntry?.esArchiveVault || null,
    offerResponseDeadline: existingEntry?.offerResponseDeadline || "",
    offerDecision: normalizeOfferDecision(existingEntry?.offerDecision),
    offerRole: existingEntry?.offerRole || "",
    offerMemo: existingEntry?.offerMemo || "",
    stageHistory: addStageToHistory(existingEntry?.stageHistory, data.stage),
    stageTimeline: recordStageTransition(
      existingEntry?.stageTimeline,
      existingEntry?.stage || "",
      data.stage,
      existingEntry ? "edit" : "start"
    )
  });
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


function openImportDialog(mode = "memo") {
  importCandidates = [];
  importText.value = "";
  importPreview.innerHTML = "";
  importStatus.textContent = "";
  confirmImportBtn.hidden = true;
  confirmImportBtn.textContent = "候補をまとめて追加";
  window.NEXTROUND_NOTION_IMPORT?.reset?.(mode);
  importDialog.showModal();
  if (mode === "memo") setTimeout(() => importText.focus(), 0);
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
  const internSeason = guessInternSeason(line);
  const documentFlowMode = guessDocumentFlowMode(line);
  const deadline = guessDeadline(line);
  const company = guessCompany(line);
  const role = guessRole(line);
  const industry = guessIndustry(line);
  const flow = inferImportFlow(line, stage);
  return {
    company,
    type,
    internSeason,
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
    documentFlowMode,
    selectionTags: documentFlowMode === "combined" ? [combinedDocumentTag] : []
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
      <div class="form-grid import-structure-grid">
        <label class="import-season-field">インターン時期
          <select class="import-season">${optionsHtml(internSeasonOptions, candidate.internSeason || "未設定")}</select>
        </label>
        <label>書類選考の形式
          <select class="import-document-mode">
            <option value="separate" ${candidate.documentFlowMode !== "combined" ? "selected" : ""}>ESの後にWebテスト</option>
            <option value="combined" ${candidate.documentFlowMode === "combined" ? "selected" : ""}>ES＋Webテスト同時</option>
          </select>
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
      <div class="form-grid">
        <label>次の予定日
          <input class="import-next-date" type="date" value="${escapeHtml(candidate.nextDate || "")}">
        </label>
        <label>次の予定内容
          <input class="import-next-plan" value="${escapeHtml(candidate.nextPlan || "")}" placeholder="空欄でもOK">
        </label>
      </div>
      ${candidate.portalUrl ? `<label>マイページURL
        <input class="import-portal-url" type="url" value="${escapeHtml(candidate.portalUrl)}">
      </label>` : `<input class="import-portal-url" type="hidden" value="">`}
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
  importPreview.querySelectorAll(".import-type").forEach(select => {
    const syncSeason = () => {
      const field = select.closest(".import-item").querySelector(".import-season-field");
      field.hidden = select.value !== "インターン";
    };
    select.addEventListener("change", syncSeason);
    syncSeason();
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
  const imported = candidates.map(candidate => {
    const id = crypto.randomUUID();
    return normalizeEntry(touchEntry({
    id,
    trackId: id,
    company: candidate.company,
    type: candidate.type,
    internSeason: candidate.type === "インターン" ? normalizeInternSeason(candidate.internSeason) : "未設定",
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
    internCustomDates: [],
    memo: candidate.memo,
    flow: candidate.flow,
    flowSteps: standardFlowSteps({ type: candidate.type, flow: candidate.flow, interviewCount: candidate.interviewCount }),
    interviewCount: candidate.interviewCount,
    selectionTags: candidate.selectionTags,
    credentialVault: null,
    esArchiveVault: null,
    offerResponseDeadline: "",
    offerDecision: "検討中",
    offerRole: "",
    offerMemo: "",
    stageHistory: buildImportStageHistory(candidate.stage, candidate.flow)
  }));
  });
  entries = [...imported, ...entries];
  save();
  render();
  importDialog.close();
}

function readImportCandidate(item) {
  return {
    company: item.querySelector(".import-company").value.trim(),
    type: item.querySelector(".import-type").value,
    internSeason: normalizeInternSeason(item.querySelector(".import-season").value),
    industry: normalizeIndustry(item.querySelector(".import-industry").value),
    role: item.querySelector(".import-role").value.trim(),
    stage: item.querySelector(".import-stage").value,
    deadline: item.querySelector(".import-deadline").value,
    nextDate: item.querySelector(".import-next-date").value,
    nextPlan: item.querySelector(".import-next-plan").value.trim(),
    portalUrl: normalizePortalUrl(item.querySelector(".import-portal-url").value),
    memo: item.querySelector(".import-memo").value.trim(),
    flow: {
      es: item.querySelector(".import-flow-es").checked,
      webTest: item.querySelector(".import-flow-webTest").checked,
      gd: item.querySelector(".import-flow-gd").checked,
      interview: item.querySelector(".import-flow-interview").checked
    },
    interviewCount: item.querySelector(".import-type").value === "本選考" ? "3" : "1",
    documentFlowMode: item.querySelector(".import-document-mode").value,
    selectionTags: item.querySelector(".import-document-mode").value === "combined"
      && item.querySelector(".import-flow-es").checked
      && item.querySelector(".import-flow-webTest").checked
      ? [combinedDocumentTag]
      : []
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

function normalizeInternSeason(value) {
  const text = String(value || "").trim();
  if (/summer|サマー|夏/i.test(text)) return "サマー";
  if (/autumn|fall|秋/i.test(text)) return "秋";
  if (/winter|冬/i.test(text)) return "冬";
  return internSeasonOptions.includes(text) ? text : "未設定";
}

function guessInternSeason(text) {
  return normalizeInternSeason(text);
}

function guessDocumentFlowMode(text) {
  return /(ES|書類|エントリーシート).{0,12}(Web|WEB|ウェブ|テスト).{0,8}(同時|一緒|セット|一括)|同時.{0,8}(ES|書類).{0,8}(Web|WEB|ウェブ|テスト)/i.test(String(text || ""))
    ? "combined"
    : "separate";
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
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : seed;
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.entries) ? parsed.entries : seed;
    return list.map(entry => normalizeEntry(entry));
  } catch {
    return seed.map(entry => normalizeEntry(entry));
  }
}

function save({ cloud = true } = {}) {
  ensureMigrationSnapshot();
  localStorage.setItem(storageKey, JSON.stringify(entries));
  if (cloud) scheduleCloudAutoSave();
}

function scopedLocalKey(base, uid) {
  return `${base}:${uid}`;
}

function activateLocalUser(uid) {
  if (!uid || activeLocalUid === uid) return;
  lockProtectedSession();
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = null;

  const owner = localStorage.getItem(localDataOwnerKey) || "";
  const scopedEntriesKey = scopedLocalKey(baseStorageKey, uid);
  const canAdoptLegacy = !owner || owner === uid;
  const legacyEntries = localStorage.getItem(baseStorageKey);
  if (!localStorage.getItem(scopedEntriesKey) && legacyEntries && canAdoptLegacy) {
    const legacyKeys = [
      baseStorageKey,
      baseVaultStorageKey,
      baseMigrationSnapshotKey,
      baseMigrationStateKey,
      baseMigrationAckKey,
      baseFitStorageKey
    ];
    legacyKeys.forEach(base => {
      const value = localStorage.getItem(base);
      if (value !== null) localStorage.setItem(scopedLocalKey(base, uid), value);
    });
    legacyKeys.forEach(base => localStorage.removeItem(base));
  }

  localStorage.setItem(localDataOwnerKey, uid);
  storageKey = scopedEntriesKey;
  vaultStorageKey = scopedLocalKey(baseVaultStorageKey, uid);
  migrationSnapshotKey = scopedLocalKey(baseMigrationSnapshotKey, uid);
  migrationStateKey = scopedLocalKey(baseMigrationStateKey, uid);
  migrationAckKey = scopedLocalKey(baseMigrationAckKey, uid);
  activeLocalUid = uid;
  entries = load();
  vaultConfig = loadVaultConfig();
  cloudEncryptionConfig = null;
  if (cards) render();
  window.dispatchEvent(new CustomEvent("nextround:local-user-changed", { detail: { uid } }));
}

function deactivateLocalUser() {
  if (!activeLocalUid) return;
  lockProtectedSession();
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = null;
  activeLocalUid = "";
  storageKey = baseStorageKey;
  vaultStorageKey = baseVaultStorageKey;
  migrationSnapshotKey = baseMigrationSnapshotKey;
  migrationStateKey = baseMigrationStateKey;
  migrationAckKey = baseMigrationAckKey;
  entries = [];
  vaultConfig = null;
  cloudEncryptionConfig = null;
  if (cards) render();
  window.dispatchEvent(new CustomEvent("nextround:local-user-changed", { detail: { uid: "" } }));
}

function isValidTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function touchEntry(entry, changes = {}) {
  const now = new Date().toISOString();
  const id = changes.id || entry.id || crypto.randomUUID();
  return {
    ...entry,
    ...changes,
    id,
    trackId: changes.trackId || entry.trackId || id,
    schemaVersion: appSchemaVersion,
    createdAt: isValidTimestamp(entry.createdAt) ? entry.createdAt : now,
    updatedAt: now
  };
}

function isUntouchedSeedEntries(list) {
  if (!Array.isArray(list) || list.length !== seed.length) return false;
  const signatures = new Set(seed.map(entry => `${entry.company}|${entry.role}|${entry.stage}|${entry.memo}`));
  return list.every(entry => signatures.has(`${entry.company}|${entry.role}|${normalizeStageName(entry.stage)}|${entry.memo}`)
    && !entry.portalUrl && !entry.credentialVault && !entry.esArchiveVault);
}

function hasMeaningfulEntries(list) {
  return Array.isArray(list) && list.length > 0 && !isUntouchedSeedEntries(list);
}

function ensureMigrationSnapshot() {
  if (localStorage.getItem(migrationSnapshotKey)) return true;
  const rawEntries = localStorage.getItem(storageKey);
  if (!rawEntries) return true;
  try {
    const parsed = JSON.parse(rawEntries);
    const list = Array.isArray(parsed) ? parsed : parsed?.entries;
    if (!hasMeaningfulEntries(list)) return true;
    const fitStorageKey = activeLocalUid ? scopedLocalKey(baseFitStorageKey, activeLocalUid) : baseFitStorageKey;
    localStorage.setItem(migrationSnapshotKey, JSON.stringify({
      version: 1,
      capturedAt: new Date().toISOString(),
      sourceSchemaVersion: Math.max(1, ...list.map(entry => Number(entry.schemaVersion) || 1)),
      recordIds: list.map(entry => entry.id).filter(Boolean),
      storage: {
        [storageKey]: rawEntries,
        [vaultStorageKey]: localStorage.getItem(vaultStorageKey),
        [fitStorageKey]: localStorage.getItem(fitStorageKey)
      }
    }));
    return true;
  } catch {
    return false;
  }
}

function rebuildMigrationSnapshot() {
  localStorage.removeItem(migrationSnapshotKey);
  localStorage.removeItem(migrationStateKey);
  localStorage.removeItem(migrationAckKey);
  ensureMigrationSnapshot();
}

function prepareLocalDataForRefresh() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed?.entries;
    if (!hasMeaningfulEntries(list)) return;
    const needsMigration = list.some(entry => Number(entry.schemaVersion) < appSchemaVersion
      || !isValidTimestamp(entry.createdAt) || !isValidTimestamp(entry.updatedAt) || !entry.trackId);
    if (!needsMigration || !ensureMigrationSnapshot()) return;
    entries = list.map(entry => normalizeEntry(entry));
    localStorage.setItem(storageKey, JSON.stringify(entries));
    localStorage.setItem(migrationStateKey, JSON.stringify({
      version: appSchemaVersion,
      migratedAt: new Date().toISOString(),
      entryCount: entries.length,
      recordIds: entries.map(entry => entry.id),
      snapshotKey: migrationSnapshotKey
    }));
  } catch {
    // 元データを変更せず、従来どおり起動する。
  }
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
    cloudAuth.languageCode = "ja";
    cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});
    cloudDb = firebase.firestore();
    cloudReady = true;
    cloudAuth.onAuthStateChanged(user => {
      handleCloudAuthUser(user);
    });
    cloudAuth.getRedirectResult?.().then(result => {
      if (result?.user) handleCloudAuthUser(result.user, { forceAutoLoad: true });
    }).catch(error => {
      localStorage.removeItem(cloudAutoSavePendingKey);
      cloudAuthNotice = cloudGoogleAuthErrorMessage(error);
      cloudEmailError.textContent = cloudAuthNotice;
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
    deactivateLocalUser();
    updateCloudUi();
    window.dispatchEvent(new CustomEvent("nextround:auth-changed", { detail: { signedIn: false } }));
    return;
  }
  activateLocalUser(user.uid);
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
  window.dispatchEvent(new CustomEvent("nextround:auth-changed", {
    detail: { signedIn: true, email: user.email || "", photoURL: user.photoURL || "" }
  }));
}

function updateCloudUi() {
  if (!cloudReady) {
    setCloudButtons(false);
    return;
  }
  const signedIn = Boolean(cloudUser);
  cloudStatus.textContent = signedIn
    ? `ログイン中: ${cloudUser.email || "メールアカウント"} / 自動保存${cloudAutoSaveEnabled ? "ON" : "OFF"}`
    : cloudAuthNotice || "未ログイン";
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

function validateNewCloudPassword(password) {
  if (/\s/.test(password)) return "パスワードに空白は使えません。";
  if (password.length < 8) return "パスワードは8文字以上で設定してください。";
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "パスワードには英字と数字を両方入れてください。";
  }
  return "";
}

function validateNewProtectionSecret(value, label) {
  const length = [...String(value || "")].length;
  if (length < 12) return `${label}は12文字以上で設定してください。`;
  if (length > 128) return `${label}は128文字以内で設定してください。`;
  if (new Set([...value]).size < 6) return `${label}は同じ文字だけにせず、6種類以上の文字を組み合わせてください。`;
  return "";
}

function validateNewRestoreKey(value) {
  const length = [...String(value || "")].length;
  if (length < 14) return "復元キーは14文字以上で設定してください。";
  if (length > 128) return "復元キーは128文字以内で設定してください。";
  if (new Set([...value]).size < 6) return "復元キーは6種類以上の文字を組み合わせてください。";
  return "";
}

function setCloudAuthBusy(isBusy) {
  cloudEmailLoginBtn.disabled = isBusy;
  cloudEmailRegisterBtn.disabled = isBusy;
  cloudGoogleLoginBtn.disabled = isBusy;
  cloudPasswordResetBtn.disabled = isBusy;
  const refreshGoogleLoginBtn = document.querySelector("#refreshGoogleLogin");
  if (refreshGoogleLoginBtn) refreshGoogleLoginBtn.disabled = isBusy;
}

async function finishCloudAuth(user) {
  cloudUser = user;
  activateLocalUser(user.uid);
  cloudAuthNotice = "";
  cloudEmailError.textContent = "";
  setCloudAutoSave(true);
  await autoLoadCloudDataAfterLogin();
  updateCloudUi();
  window.dispatchEvent(new CustomEvent("nextround:auth-changed", {
    detail: { signedIn: true, email: user.email || "", photoURL: user.photoURL || "" }
  }));
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
  setCloudAuthBusy(true);
  cloudEmailError.textContent = "";
  cloudStatus.textContent = "メールでログイン中...";
  try {
    await cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL);
    const result = await cloudAuth.signInWithEmailAndPassword(email, password);
    await finishCloudAuth(result.user);
  } catch (error) {
    cloudEmailError.textContent = cloudEmailAuthErrorMessage(error);
    cloudAuthNotice = cloudEmailError.textContent;
    updateCloudUi();
  } finally {
    cloudPassword.value = "";
    setCloudAuthBusy(false);
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
  const passwordError = validateNewCloudPassword(password);
  if (passwordError) {
    cloudEmailError.textContent = passwordError;
    return;
  }
  setCloudAuthBusy(true);
  cloudEmailError.textContent = "";
  cloudStatus.textContent = "アカウント作成中...";
  try {
    cloudAuth.languageCode = "ja";
    await cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL);
    const result = await cloudAuth.createUserWithEmailAndPassword(email, password);
    await finishCloudAuth(result.user);
  } catch (error) {
    cloudEmailError.textContent = cloudEmailAuthErrorMessage(error);
    cloudAuthNotice = cloudEmailError.textContent;
    updateCloudUi();
  } finally {
    cloudPassword.value = "";
    setCloudAuthBusy(false);
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
  setCloudAuthBusy(true);
  cloudEmailError.textContent = "";
  try {
    cloudAuth.languageCode = "ja";
    await cloudAuth.sendPasswordResetEmail(email);
    cloudEmailError.textContent = "パスワード再設定メールを送信しました。メールを確認してください。";
  } catch (error) {
    cloudEmailError.textContent = cloudEmailAuthErrorMessage(error);
  } finally {
    setCloudAuthBusy(false);
  }
}

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

async function cloudGoogleLogin() {
  if (!cloudReady || !cloudAuth) {
    cloudEmailError.textContent = "Firebaseの準備ができていません。少し待ってから試してください。";
    return false;
  }
  if (cloudUser) {
    setCloudAutoSave(true);
    await autoLoadCloudDataAfterLogin();
    return true;
  }

  setCloudAuthBusy(true);
  cloudEmailError.textContent = "";
  cloudStatus.textContent = "Googleログインを開いています...";
  localStorage.setItem(cloudAutoSavePendingKey, "1");
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    await cloudAuth.setPersistence?.(firebase.auth.Auth.Persistence.LOCAL);
    const result = await cloudAuth.signInWithPopup(provider);
    if (result?.user) await finishCloudAuth(result.user);
    return Boolean(result?.user);
  } catch (error) {
    const canUseRedirect = !isStandaloneApp()
      && ["auth/popup-blocked", "auth/operation-not-supported-in-this-environment"].includes(error.code);
    if (canUseRedirect) {
      try {
        cloudStatus.textContent = "Google認証ページへ移動しています...";
        await cloudAuth.signInWithRedirect(provider);
        return false;
      } catch (redirectError) {
        error = redirectError;
      }
    }
    localStorage.removeItem(cloudAutoSavePendingKey);
    cloudEmailError.textContent = cloudGoogleAuthErrorMessage(error);
    cloudAuthNotice = cloudEmailError.textContent;
    updateCloudUi();
    return false;
  } finally {
    setCloudAuthBusy(false);
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
    ? "14文字以上の復元キーでクラウドデータを暗号化します。別端末で開く時に必要です。忘れるとクラウドの中身は復元できません。"
    : "このクラウドデータは暗号化されています。設定した復元キーを入力してください。";
  setTimeout(() => {
    if (!cloudDialog.open && !document.querySelector("dialog[open]")) cloudDialog.showModal();
    cloudRestoreKey.focus();
  }, 0);
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
  const creationError = cloudRestoreMode === "create" ? validateNewRestoreKey(value) : "";
  if (creationError) {
    cloudRestoreError.textContent = creationError;
    return;
  }
  if (cloudRestoreMode !== "create" && value.length < 4) {
    cloudRestoreError.textContent = "復元キーを入力してください。";
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

function cloudEmailAuthErrorMessage(error = {}) {
  const code = error.code || "unknown";
  const messages = {
    "auth/email-already-in-use": "このメールアドレスはすでに登録されています。メールでログインしてください。",
    "auth/invalid-email": "メールアドレスの形式を確認してください。",
    "auth/missing-password": "パスワードを入力してください。",
    "auth/weak-password": "パスワードは8文字以上で、英字と数字を含めてください。",
    "auth/user-not-found": "このメールアドレスのアカウントが見つかりません。新規登録してください。",
    "auth/wrong-password": "パスワードが違います。",
    "auth/invalid-credential": "メールアドレスまたはパスワードが違います。",
    "auth/operation-not-allowed": "メールログインがFirebase側で有効になっていません。Authentication > Sign-in methodでメール/パスワードを有効にしてください。",
    "auth/too-many-requests": "試行回数が多すぎます。少し時間を置いてから試してください。",
    "auth/network-request-failed": "通信に失敗しました。ネット接続を確認してください。"
  };
  return messages[code] || `ログインできませんでした。エラー: ${code}`;
}

function cloudGoogleAuthErrorMessage(error = {}) {
  const code = error.code || "unknown";
  const messages = {
    "auth/operation-not-allowed": "GoogleログインがFirebase側で有効になっていません。Authenticationのログイン方法でGoogleを有効にしてください。",
    "auth/unauthorized-domain": "この公開URLがFirebaseの承認済みドメインに登録されていません。",
    "auth/operation-not-supported-in-this-environment": isStandaloneApp()
      ? "ホーム画面版ではGoogle認証を開けませんでした。この端末のデータを引き継ぐ場合はメールで登録してください。Googleを使う場合はSafariの通常タブで公開URLを開いてください。"
      : "この開き方ではGoogle認証に対応していません。Safariの通常タブで公開URLを開いてください。",
    "auth/popup-blocked": "Googleのログイン画面がブロックされました。Safariの設定を確認して、もう一度試してください。",
    "auth/popup-closed-by-user": "Googleログインをキャンセルしました。",
    "auth/cancelled-popup-request": "Googleログインが中断されました。もう一度試してください。",
    "auth/network-request-failed": "通信に失敗しました。ネット接続を確認してください。"
  };
  return messages[code] || `Googleログインを完了できませんでした。エラー: ${code}`;
}

async function cloudLogout() {
  lockProtectedSession();
  if (!cloudAuth) return;
  await window.nextroundNotifications?.disableBeforeLogout?.();
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
  const key = await deriveVaultKey(restoreKey, cloudEncryptionConfig);
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
    schemaVersion: appSchemaVersion,
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
    const payload = await cloudPayload();
    await ref.set(payload);
    const verification = await ref.get();
    if (!verification.exists || verification.data()?.encryptedData?.data !== payload.encryptedData.data) {
      throw new Error("cloud-verification-failed");
    }
    let previousMigrationState = {};
    try {
      previousMigrationState = JSON.parse(localStorage.getItem(migrationStateKey) || "{}") || {};
    } catch {
      previousMigrationState = {};
    }
    if (localStorage.getItem(migrationSnapshotKey)) {
      localStorage.setItem(migrationStateKey, JSON.stringify({
        version: appSchemaVersion,
        migratedAt: previousMigrationState.migratedAt || new Date().toISOString(),
        verifiedAt: new Date().toISOString(),
        entryCount: entries.length,
        recordIds: entries.map(entry => entry.id),
        snapshotKey: migrationSnapshotKey
      }));
    }
    cloudStatus.textContent = `自動保存・確認済み: ${entries.length}件 / ${new Date().toLocaleString("ja-JP")}`;
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
    const list = Array.isArray(parsed) ? parsed : parsed?.entries;
    return hasMeaningfulEntries(list);
  } catch {
    return hasMeaningfulEntries(entries);
  }
}

async function loadCloudData({ auto = false } = {}) {
  const ref = cloudDocRef();
  if (!ref) {
    cloudStatus.textContent = "先にログインしてください。";
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
    const shouldConfirm = auto ? hasLocalUserData() : hasMeaningfulEntries(entries);
    if (shouldConfirm && !confirm("クラウドの保存データと、この端末のデータを統合します。同じ選考は新しい更新を優先し、元データの退避も残します。よろしいですか？")) {
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
    cloudEncryptionConfig = normalizeVaultConfig(data.cloudKey);
    if (!cloudEncryptionConfig) throw new Error("invalid");
    const restoreKey = getStoredCloudRestoreKey();
    if (!restoreKey) {
      showCloudRestoreKey("unlock", snapshot);
      cloudStatus.textContent = "クラウドデータを開くには復元キーが必要です。";
      return;
    }
    try {
      const key = await deriveVaultKey(restoreKey, cloudEncryptionConfig);
      await decryptPayload(key, cloudEncryptionConfig.verifier);
      const payload = await decryptPayload(key, data.encryptedData);
      if (!Array.isArray(payload.entries)) throw new Error("invalid");
      mergeCloudPayload(payload, data.savedAt);
      if (cloudEncryptionConfig.version < 2) {
        cloudEncryptionConfig = await createVaultConfig(restoreKey);
      }
      save({ cloud: false });
      render();
      cloudStatus.textContent = "暗号化されたクラウドデータと端末データを統合しました。";
      scheduleCloudAutoSave(150);
      return;
    } catch (error) {
      if (error.message === "vault-conflict") {
        cloudStatus.textContent = "端末とクラウドで保護パスワードの設定が異なるため、自動統合を止めました。端末のデータは変更されていません。";
        return;
      }
      clearCloudRestoreKey();
      showCloudRestoreKey("unlock", snapshot);
      cloudStatus.textContent = "復元キーが違います。もう一度入力してください。";
      return;
    }
  }
  if (!Array.isArray(data.entries)) throw new Error("invalid");
  mergeCloudPayload({ entries: data.entries, vault: data.vault || null }, data.savedAt);
  save({ cloud: false });
  render();
  cloudStatus.textContent = "旧形式のクラウドデータを読み込みました。復元キーで暗号化し直します。";
  cloudEncryptionConfig = null;
  if (getStoredCloudRestoreKey()) scheduleCloudAutoSave(120);
  else showCloudRestoreKey("create");
}

function sameVaultConfig(first, second) {
  if (!first && !second) return true;
  if (!first || !second) return false;
  return first.salt === second.salt
    && first.verifier?.iv === second.verifier?.iv
    && first.verifier?.data === second.verifier?.data;
}

function mergeEntryCollections(localEntries, remoteEntries, remoteFallbackTimestamp = appBootTimestamp) {
  const local = localEntries.map(entry => normalizeEntry(entry));
  const remote = remoteEntries.map(entry => normalizeEntry(entry, remoteFallbackTimestamp));
  const merged = new Map(local.map(entry => [entry.id, entry]));
  remote.forEach(remoteEntry => {
    const localEntry = merged.get(remoteEntry.id);
    if (!localEntry || Date.parse(remoteEntry.updatedAt) > Date.parse(localEntry.updatedAt)) {
      merged.set(remoteEntry.id, remoteEntry);
    }
  });
  return [...merged.values()].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

function mergeCloudPayload(payload, savedAt) {
  const remoteEntries = validatePortableEntries(payload.entries);
  const remoteVault = normalizeVaultConfig(payload.vault);
  if (payload.vault && !remoteVault) throw new Error("invalid");
  const localEntries = hasMeaningfulEntries(entries) ? entries : [];
  const hasLocal = hasMeaningfulEntries(localEntries);
  const hasRemote = hasMeaningfulEntries(remoteEntries);
  if (hasLocal && hasRemote && vaultConfig && remoteVault && !sameVaultConfig(vaultConfig, remoteVault)) {
    throw new Error("vault-conflict");
  }
  ensureMigrationSnapshot();
  entries = mergeEntryCollections(localEntries, remoteEntries, savedAt || appBootTimestamp);
  vaultConfig = vaultConfig || remoteVault || null;
  saveVaultConfig();
}

function loadVaultConfig() {
  try {
    return normalizeVaultConfig(JSON.parse(localStorage.getItem(vaultStorageKey))) || null;
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
    version: 3,
    schemaVersion: appSchemaVersion,
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
  if (!clean || clean.length > maxSyncCodeLength) throw new Error("invalid");
  const code = clean.replace(/^NEXTROUND-SYNC:/i, "");
  return JSON.parse(textDecoder.decode(base64ToBytes(code)));
}

function validatePortableEntries(value) {
  if (!Array.isArray(value) || value.length > maxPortableEntries || !value.every(isPlainRecord)) throw new Error("invalid");
  return value;
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
    const importedEntries = validatePortableEntries(Array.isArray(parsed) ? parsed : parsed.entries);
    if (entries.length && !confirm("この端末に入っている今の一覧は、同期コードの内容に入れ替わります。必要なら先にバックアップしてください。よろしいですか？")) {
      return;
    }
    ensureMigrationSnapshot();
    entries = importedEntries.map(entry => normalizeEntry(entry, parsed.exportedAt || appBootTimestamp));
    vaultConfig = normalizeVaultConfig(parsed.vault);
    if (parsed.vault && !vaultConfig) throw new Error("invalid");
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
  if (file.size > maxPortableFileBytes) {
    settingsStatus.textContent = "保存データが大きすぎます。5MB以内のNEXTROUND保存データを選んでください。";
    importFile.value = "";
    return;
  }
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedEntries = validatePortableEntries(Array.isArray(parsed) ? parsed : parsed.entries);
      if (entries.length && !confirm("今のデータを、選んだ保存データで置き換えます。よろしいですか？")) {
        importFile.value = "";
        return;
      }
      ensureMigrationSnapshot();
      entries = importedEntries.map(entry => normalizeEntry(entry, parsed.exportedAt || appBootTimestamp));
      vaultConfig = normalizeVaultConfig(parsed.vault);
      if (parsed.vault && !vaultConfig) throw new Error("invalid");
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

function normalizeEntry(entry = {}, fallbackTimestamp = appBootTimestamp) {
  entry = isPlainRecord(entry) ? entry : {};
  fallbackTimestamp = isValidTimestamp(fallbackTimestamp) ? fallbackTimestamp : appBootTimestamp;
  const rawStage = normalizeStageName(entry.stage);
  const flowSteps = normalizeFlowSteps(entry.flowSteps, { ...entry, stage: rawStage });
  const stage = stages.includes(rawStage) || flowSteps.includes(rawStage) ? rawStage : "応募予定";
  const offerDecision = normalizeOfferDecision(entry.offerDecision || (entry.declinedAfterWin ? "辞退" : "検討中"));
  const normalizedFlow = Array.isArray(entry.flowSteps) ? flowFromSteps(flowSteps) : normalizeFlow(entry.flow, entry.stageHistory, stage);
  const id = safeIdentifier(entry.id) || crypto.randomUUID();
  const createdAt = isValidTimestamp(entry.createdAt)
    ? entry.createdAt
    : (isValidTimestamp(entry.updatedAt) ? entry.updatedAt : fallbackTimestamp);
  const updatedAt = isValidTimestamp(entry.updatedAt) ? entry.updatedAt : createdAt;
  return {
    id,
    trackId: safeIdentifier(entry.trackId) || id,
    schemaVersion: appSchemaVersion,
    createdAt,
    updatedAt,
    company: safeText(entry.company, 160),
    type: entryTypes.includes(entry.type) ? entry.type : "インターン",
    internSeason: entry.type === "インターン" ? normalizeInternSeason(entry.internSeason) : "未設定",
    industry: normalizeIndustry(entry.industry),
    role: safeText(entry.role, 160),
    stage,
    deadline: isDateKey(entry.deadline) ? entry.deadline : "",
    nextDate: isDateKey(entry.nextDate) ? entry.nextDate : "",
    nextPlan: safeText(entry.nextPlan, 160),
    internSchedule: safeText(entry.internSchedule, 300),
    internScheduleMode: ["single", "range", "custom"].includes(entry.internScheduleMode) ? entry.internScheduleMode : "single",
    internSingleDate: isDateKey(entry.internSingleDate) ? entry.internSingleDate : "",
    internStartDate: isDateKey(entry.internStartDate) ? entry.internStartDate : "",
    internEndDate: isDateKey(entry.internEndDate) ? entry.internEndDate : "",
    internCustomDates: normalizeCustomDates(entry.internCustomDates),
    internScheduleStatus: getInternScheduleStatus({ ...entry, stage }),
    declinedAfterWin: winStages.has(stage) && (Boolean(entry.declinedAfterWin) || offerDecision === "辞退"),
    memo: safeText(entry.memo, 20000),
    portalUrl: normalizePortalUrl(entry.portalUrl),
    flow: normalizedFlow,
    flowSteps,
    interviewCount: Array.isArray(entry.flowSteps) ? interviewCountFromSteps(flowSteps) : normalizeInterviewCount(entry),
    selectionTags: normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther),
    selectionTagOther: safeText(entry.selectionTagOther, 40),
    credentialVault: normalizeEncryptedVault(entry.credentialVault),
    esArchiveVault: normalizeEncryptedVault(entry.esArchiveVault),
    offerResponseDeadline: isDateKey(entry.offerResponseDeadline) ? entry.offerResponseDeadline : "",
    offerDecision,
    offerRole: String(entry.offerRole || "").slice(0, 80),
    offerMemo: safeText(entry.offerMemo, 10000),
    stageHistory: normalizeStageHistory(entry.stageHistory, stage),
    stageTimeline: normalizeStageTimeline(entry.stageTimeline, stage, updatedAt)
  };
}

function isPlainRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function safeText(value, maxLength) {
  return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function safeIdentifier(value) {
  const id = safeText(value, 128);
  return /^[A-Za-z0-9_-]+$/.test(id) ? id : "";
}

function normalizeEncryptedVault(value) {
  if (!isPlainRecord(value) || value.version !== 1) return null;
  const cipher = normalizeCipher(value, maxPortableFileBytes);
  return cipher ? { version: 1, ...cipher } : null;
}

function normalizeCipher(value, maxDataLength) {
  if (!isPlainRecord(value)) return null;
  const iv = safeText(value.iv, 64);
  const data = safeText(value.data, maxDataLength);
  const base64 = /^[A-Za-z0-9+/]+=*$/;
  return iv && data && base64.test(iv) && base64.test(data) ? { iv, data } : null;
}

function normalizeVaultConfig(value) {
  if (!isPlainRecord(value) || ![1, 2].includes(value.version)) return null;
  const salt = safeText(value.salt, 128);
  const verifier = normalizeCipher(value.verifier, 2048);
  if (!salt || !/^[A-Za-z0-9+/]+=*$/.test(salt) || !verifier) return null;
  if (value.version === 1) return { version: 1, salt, verifier };
  if (!Number.isInteger(value.iterations) || value.iterations < 300000 || value.iterations > 2000000) return null;
  return { version: 2, salt, iterations: value.iterations, verifier };
}

function normalizeStageName(stage) {
  const value = safeText(stage, 60);
  return ({
    "ES落ち": "ES不合格",
    "Webテスト落ち": "Webテスト不合格",
    "GD落ち": "GD不合格",
    "面接落ち": "面接不合格"
  })[value] || value;
}

function normalizeIndustry(industry = "") {
  const value = String(industry || "").trim();
  if (!value || value === "未選択") return "未設定";
  return industryOptions.includes(value) ? value : "その他";
}

function normalizePortalUrl(value = "") {
  const url = safeText(value, 2048).trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href : "";
  } catch {
    return "";
  }
}

function portalHostname(value = "") {
  try {
    return new URL(value).hostname.slice(0, 120);
  } catch {
    return "";
  }
}

function normalizeSelectionTags(tags = [], other = "") {
  const values = Array.isArray(tags) ? tags : tags ? [tags] : [];
  return [...new Set([...values, other].map(value => safeText(value, 40).trim()).filter(Boolean))].slice(0, 12);
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
  flow = isPlainRecord(flow) ? flow : {};
  const normalized = { ...defaultFlow(), ...flow };
  const normalizedHistory = Array.isArray(history) ? history.map(normalizeStageName) : [];
  Object.entries(phaseStages).forEach(([key, values]) => {
    if (Object.prototype.hasOwnProperty.call(flow, key)) return;
    if (values.some(stage => normalizedHistory.includes(stage) || normalizeStageName(currentStage) === stage)) {
      normalized[key] = true;
    }
  });
  return {
    es: Boolean(normalized.es),
    webTest: Boolean(normalized.webTest),
    gd: Boolean(normalized.gd),
    interview: Boolean(normalized.interview)
  };
}

function normalizeFlowStepLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 30);
}

function standardFlowSteps(entry = {}) {
  const flow = normalizeFlow(entry.flow, entry.stageHistory, entry.stage);
  const count = normalizeInterviewCount(entry);
  const interviews = !flow.interview || count === "0"
    ? []
    : count === "1" ? ["面接"]
      : count === "2" ? ["一次面接", "最終面接"]
        : ["一次面接", "二次面接", "最終面接"];
  return [
    "気になる",
    "応募予定",
    ...(flow.es ? ["書類選考中", "ES提出済"] : []),
    ...(flow.webTest ? ["Webテスト"] : []),
    ...(flow.gd ? ["GD"] : []),
    ...interviews,
    "結果待ち"
  ];
}

function normalizeFlowSteps(value, entry = {}) {
  const blocked = new Set([...failStages, ...winStages, "辞退", "不採用"]);
  const supplied = Array.isArray(value)
    ? value.slice(0, 40).map(normalizeFlowStepLabel).filter(step => step && !blocked.has(step))
    : [];
  const base = supplied.length ? supplied : standardFlowSteps(entry);
  const current = normalizeFlowStepLabel(entry.stage);
  const steps = [...new Set(base)].filter(step => step !== "結果待ち");
  if (current && !stages.includes(current) && !steps.includes(current)) {
    steps.push(current);
  }
  steps.push("結果待ち");
  return steps;
}

function flowFromSteps(steps = []) {
  const text = steps.join(" ");
  return {
    es: /(ES|エントリーシート|書類)/i.test(text),
    webTest: /(Web|WEB|ウェブ|SPI|玉手箱|適性検査|テスト)/i.test(text),
    gd: /(GD|グループディスカッション)/i.test(text),
    interview: /(面接|面談)/i.test(text)
  };
}

function getFlowFromForm() {
  return flowFromSteps(flowBuilderSteps);
}

function interviewCountFromSteps(steps = []) {
  const count = steps.filter(step => /(面接|面談)/.test(step)).length;
  return String(Math.min(3, count));
}

function setFlowBuilder(entry = {}) {
  flowBuilderSteps = normalizeFlowSteps(entry.flowSteps, entry);
  renderFlowBuilder(entry.stage || stageSelect.value || "応募予定");
}

function renderFlowBuilder(preferredStage = stageSelect.value) {
  flowStepList.innerHTML = flowBuilderSteps.map((step, index) => `
    <div class="flow-step" data-flow-index="${index}">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <input type="text" maxlength="30" value="${escapeHtml(step)}" aria-label="${index + 1}番目の選考フェーズ" ${step === "結果待ち" ? "readonly" : ""}>
      <div class="flow-step-actions">
        <button type="button" data-flow-action="up" aria-label="上へ移動" title="上へ移動" ${index === 0 || step === "結果待ち" ? "disabled" : ""}>↑</button>
        <button type="button" data-flow-action="down" aria-label="下へ移動" title="下へ移動" ${index === flowBuilderSteps.length - 1 || flowBuilderSteps[index + 1] === "結果待ち" ? "disabled" : ""}>↓</button>
        <button type="button" data-flow-action="remove" aria-label="削除" title="削除" ${step === "結果待ち" ? "disabled" : ""}>×</button>
      </div>
    </div>
  `).join("");
  flowStepList.querySelectorAll(".flow-step").forEach(row => {
    const index = Number(row.dataset.flowIndex);
    const input = row.querySelector("input");
    input.addEventListener("change", () => {
      const previous = flowBuilderSteps[index];
      const next = normalizeFlowStepLabel(input.value);
      const blocked = new Set([...failStages, ...winStages, "辞退", "不採用"]);
      if (!next || blocked.has(next) || flowBuilderSteps.some((step, stepIndex) => step === next && stepIndex !== index)) {
        input.value = previous;
        return;
      }
      flowBuilderSteps[index] = next;
      flowBuilderDirty = true;
      renderFlowBuilder(preferredStage === previous ? next : preferredStage);
    });
    row.querySelectorAll("[data-flow-action]").forEach(button => {
      button.addEventListener("click", () => changeFlowBuilderStep(index, button.dataset.flowAction));
    });
  });
  paintInterviewCountControl();
  syncStageOptions(preferredStage);
  updateDocumentFlowVisibility();
}

function managedInterviewCount() {
  return Math.min(3, flowBuilderSteps.filter(step => managedInterviewStages.includes(step)).length);
}

function paintInterviewCountControl() {
  const count = managedInterviewCount();
  document.querySelectorAll("[data-interview-count]").forEach(button => {
    button.classList.toggle("active", Number(button.dataset.interviewCount) === count);
  });
}

function setInterviewCount(count) {
  const safeCount = Math.max(0, Math.min(3, Number(count) || 0));
  const interviewSteps = safeCount === 1
    ? ["面接"]
    : safeCount === 2 ? ["一次面接", "最終面接"]
      : safeCount === 3 ? ["一次面接", "二次面接", "最終面接"]
        : [];
  const previousStage = stageSelect.value;
  const previousWasManaged = managedInterviewStages.includes(previousStage);
  const currentSteps = flowBuilderSteps.filter(step => step !== "結果待ち");
  const firstInterviewIndex = currentSteps.findIndex(step => managedInterviewStages.includes(step));
  const remaining = currentSteps.filter(step => !managedInterviewStages.includes(step));
  const insertAt = firstInterviewIndex >= 0 ? Math.min(firstInterviewIndex, remaining.length) : remaining.length;
  remaining.splice(insertAt, 0, ...interviewSteps);
  flowBuilderSteps = [...remaining, "結果待ち"];
  let preferredStage = previousStage;
  if (previousWasManaged) {
    if (!interviewSteps.length) preferredStage = "結果待ち";
    else if (previousStage === "最終面接") preferredStage = interviewSteps.at(-1);
    else if (previousStage === "二次面接") preferredStage = interviewSteps.length >= 3 ? interviewSteps[1] : interviewSteps[0];
    else preferredStage = interviewSteps[0];
  }
  flowBuilderDirty = true;
  renderFlowBuilder(preferredStage);
}

function addFlowBuilderStep() {
  const step = normalizeFlowStepLabel(flowStepInput.value);
  const blocked = new Set([...failStages, ...winStages, "辞退", "不採用", "結果待ち"]);
  if (!step || blocked.has(step) || flowBuilderSteps.includes(step)) {
    flowStepInput.focus();
    return;
  }
  const resultIndex = flowBuilderSteps.indexOf("結果待ち");
  flowBuilderSteps.splice(resultIndex >= 0 ? resultIndex : flowBuilderSteps.length, 0, step);
  flowStepInput.value = "";
  flowBuilderDirty = true;
  renderFlowBuilder();
}

function changeFlowBuilderStep(index, action) {
  if (action === "remove") {
    if (flowBuilderSteps[index] === "結果待ち") return;
    flowBuilderSteps.splice(index, 1);
  }
  if (action === "up" && index > 0) {
    [flowBuilderSteps[index - 1], flowBuilderSteps[index]] = [flowBuilderSteps[index], flowBuilderSteps[index - 1]];
  }
  if (action === "down" && index < flowBuilderSteps.length - 1) {
    [flowBuilderSteps[index + 1], flowBuilderSteps[index]] = [flowBuilderSteps[index], flowBuilderSteps[index + 1]];
  }
  flowBuilderDirty = true;
  renderFlowBuilder();
}

function syncStageOptions(preferredStage = stageSelect.value) {
  const terminalOptions = ["ES不合格", "Webテスト不合格", "GD不合格", "面接不合格", "インターン合格", "インターン不合格", "内定", "辞退", "不採用"];
  const options = [...new Set([...flowBuilderSteps, ...terminalOptions])];
  const selected = options.includes(preferredStage) ? preferredStage : (flowBuilderSteps[0] || "応募予定");
  stageSelect.replaceChildren(...options.map(stage => new Option(stage, stage)));
  stageSelect.value = selected;
  updateInternScheduleVisibility();
}

function getSelectionTagsFromForm() {
  const tags = [...form.querySelectorAll(".selection-tag:checked")].map(input => input.value);
  const flow = flowFromSteps(flowBuilderSteps);
  if (form.elements.documentFlowMode.value === "combined" && flow.es && flow.webTest) {
    tags.push(combinedDocumentTag);
  }
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
  form.elements.documentFlowMode.value = tags.includes(combinedDocumentTag) ? "combined" : "separate";
  updateSelectionTagOtherVisibility();
  updateDocumentFlowVisibility();
}

function updateDocumentFlowVisibility() {
  const flow = flowFromSteps(flowBuilderSteps);
  documentFlowControl.hidden = !(flow.es && flow.webTest);
  documentFlowControl.classList.toggle("combined", form.elements.documentFlowMode.value === "combined");
}

function updateSelectionTagOtherVisibility() {
  const otherChecked = Boolean(form.querySelector('.selection-tag[value="その他"]')?.checked);
  selectionTagOtherField.hidden = !otherChecked;
}

function hasSelectionTag(entry, tag) {
  return normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther).includes(tag);
}

function interviewStagesFor(entry) {
  return normalizeFlowSteps(entry.flowSteps, entry).filter(step => /(面接|面談)/.test(step));
}

function activeStageSequence(entry) {
  const steps = normalizeFlowSteps(entry.flowSteps, entry);
  return hasSelectionTag(entry, combinedDocumentTag)
    ? steps.filter(step => step !== "Webテスト")
    : steps;
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

async function deriveVaultKey(password, configOrSalt) {
  if (!crypto.subtle) throw new Error("このブラウザでは保護保存を使えません。");
  const config = typeof configOrSalt === "string"
    ? { version: 1, salt: configOrSalt }
    : (configOrSalt || {});
  const iterations = Number.isInteger(config.iterations)
    ? Math.min(2000000, Math.max(180000, config.iterations))
    : 180000;
  const baseKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: base64ToBytes(config.salt), iterations, hash: "SHA-256" },
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
  const config = { version: 2, salt, iterations: 600000 };
  const key = await deriveVaultKey(password, config);
  const verifier = await encryptPayload(key, { app: "NEXTROUND", ok: true });
  return { ...config, verifier };
}

async function verifyVaultPassword(password) {
  if (!vaultConfig) return false;
  try {
    const key = await deriveVaultKey(password, vaultConfig);
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
  vaultPassword.value = "";
  vaultConfirmPassword.value = "";
  if (resolver) resolver(value);
}

function submitVaultPassword() {
  const password = vaultPassword.value;
  const creationError = !vaultConfirmField.hidden ? validateNewProtectionSecret(password, "保護パスワード") : "";
  if (creationError) {
    vaultError.textContent = creationError;
    return;
  }
  if (vaultConfirmField.hidden && password.length < 4) {
    vaultError.textContent = "保護パスワードを入力してください。";
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
  clearCredentialPlaintext();
  clearEsArchivePlaintext();
  if (credentialDialog.open) credentialDialog.close();
  if (esArchiveDialog.open) esArchiveDialog.close();
  updateArchiveLockNote();
}

function clearCredentialPlaintext() {
  credentialPassword.value = "";
  credentialError.textContent = "";
  credentialResult.hidden = true;
  document.querySelector("#credentialUrl").textContent = "";
  document.querySelector("#credentialId").textContent = "";
  document.querySelector("#credentialPass").textContent = "";
  credentialTargetId = null;
}

function clearEsArchivePlaintext() {
  esArchiveDraft = [];
  esArchiveItems.replaceChildren();
  esArchiveError.textContent = "";
  esArchiveTargetId = null;
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
      const key = await deriveVaultKey(password, vaultConfig);
      esArchiveVault = { version: 1, ...(await encryptPayload(key, items)) };
    }
    entries = entries.map(item => item.id === entry.id ? touchEntry(item, { esArchiveVault }) : item);
    save();
    render();
    esArchiveError.textContent = items.length ? "ESアーカイブを保存しました。" : "ESアーカイブを空にしました。";
  } catch (error) {
    esArchiveError.textContent = error.message || "保存できませんでした。";
  }
}

async function decryptEsArchive(vault, password) {
  const key = await deriveVaultKey(password, vaultConfig);
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
  const oldKey = await deriveVaultKey(currentPassword, oldConfig);
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
  const newKey = await deriveVaultKey(newPassword, newConfig);
  entries = await Promise.all(entries.map(async (entry, index) => {
    const credential = decryptedCredentials[index];
    const archive = decryptedArchives[index];
    return touchEntry(entry, {
      credentialVault: credential ? { version: 1, ...(await encryptPayload(newKey, credential)) } : null,
      esArchiveVault: archive ? { version: 1, ...(await encryptPayload(newKey, archive)) } : null
    });
  }));
  vaultConfig = newConfig;
  saveVaultConfig();
  rememberProtectedPassword(newPassword);
  save();
  rebuildMigrationSnapshot();
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
  const creationError = validateNewProtectionSecret(password, "新しい保護パスワード");
  if (creationError) {
    forgotVaultError.textContent = creationError;
    return;
  }
  if (password !== forgotVaultConfirmPassword.value) {
    forgotVaultError.textContent = "確認用の入力が一致していません。";
    return;
  }
  vaultConfig = await createVaultConfig(password);
  entries = entries.map(entry => touchEntry(entry, { portalUrl: "", credentialVault: null, esArchiveVault: null }));
  saveVaultConfig();
  rememberProtectedPassword(password);
  save();
  rebuildMigrationSnapshot();
  render();
  forgotVaultDialog.close();
  forgotVaultPassword.value = "";
  forgotVaultConfirmPassword.value = "";
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
  const key = await deriveVaultKey(password, vaultConfig);
  return { version: 1, ...(await encryptPayload(key, credential)) };
}

async function decryptCredential(vault, password) {
  const key = await deriveVaultKey(password, vaultConfig);
  return decryptPayload(key, vault);
}

function normalizeStageHistory(history, currentStage) {
  const values = Array.isArray(history)
    ? history.slice(0, 80).map(normalizeStageName).map(normalizeFlowStepLabel).filter(Boolean)
    : [];
  const inferred = values.length ? [] : inferStageHistory(currentStage);
  return [...new Set([...inferred, ...values, normalizeFlowStepLabel(currentStage)].filter(Boolean))];
}

function addStageToHistory(history, stage) {
  return normalizeStageHistory([...(history || []), stage], stage);
}

function removeStageFromHistory(history, stage) {
  return (history || []).map(normalizeStageName).filter(item => item !== stage);
}

function normalizeStageTimeline(timeline, currentStage, fallbackTimestamp = appBootTimestamp) {
  const fallback = isValidTimestamp(fallbackTimestamp) ? fallbackTimestamp : appBootTimestamp;
  const allowedActions = new Set(["start", "advance", "fail", "result", "edit", "back"]);
  const normalized = (Array.isArray(timeline) ? timeline.slice(-200) : [])
    .map(event => {
      const stage = normalizeFlowStepLabel(normalizeStageName(event?.stage || event?.toStage || ""));
      const fromStage = normalizeFlowStepLabel(normalizeStageName(event?.fromStage || event?.from || ""));
      if (!stage) return null;
      return {
        stage,
        fromStage,
        at: isValidTimestamp(event?.at) ? event.at : fallback,
        action: allowedActions.has(event?.action) ? event.action : "advance"
      };
    })
    .filter(Boolean);
  if (normalized.length) return normalized;
  const stage = normalizeFlowStepLabel(normalizeStageName(currentStage || "応募予定")) || "応募予定";
  return [{ stage, fromStage: "", at: fallback, action: "start" }];
}

function recordStageTransition(timeline, fromStage, toStage, action = "advance", at = new Date().toISOString()) {
  const normalizedTo = normalizeFlowStepLabel(normalizeStageName(toStage || "応募予定")) || "応募予定";
  const normalizedFrom = normalizeFlowStepLabel(normalizeStageName(fromStage || ""));
  if (!normalizedFrom) {
    return [{ stage: normalizedTo, fromStage: "", at, action: "start" }];
  }
  const history = normalizeStageTimeline(timeline, normalizedFrom, at);
  if (normalizedFrom === normalizedTo) return history;
  return [...history, { stage: normalizedTo, fromStage: normalizedFrom, at, action }];
}

function rewindStageTimeline(timeline, currentStage, previousStage) {
  const now = new Date().toISOString();
  const current = normalizeFlowStepLabel(normalizeStageName(currentStage));
  const previous = normalizeFlowStepLabel(normalizeStageName(previousStage));
  const history = normalizeStageTimeline(timeline, current, now);
  if (history.length > 1 && history.at(-1)?.stage === current) {
    const rewound = history.slice(0, -1);
    if (rewound.at(-1)?.stage === previous) return rewound;
  }
  return [...history, { stage: previous, fromStage: current, at: now, action: "back" }];
}

function inferStageHistory(stage) {
  if (!stage || !stages.includes(stage)) return stage ? [stage] : [];
  if (winStages.has(stage)) return [...stages.slice(0, stages.indexOf("結果待ち") + 1), stage];
  if (doneStages.has(stage)) return [stage];
  return stages.slice(0, stages.indexOf(stage) + 1);
}

function openAnalytics() {
  renderAnalytics();
  analyticsDialog.showModal();
}

function setAnalysisSelectionType(type) {
  if (!["インターン", "本選考"].includes(type)) return;
  analysisSelectionType = type;
  localStorage.setItem(analysisScopeKey, type);
  renderAnalytics();
}

function renderAnalytics() {
  const scopedEntries = entries.filter(entry => entry.type === analysisSelectionType);
  const scopeLabel = analysisSelectionType === "インターン" ? "インターン選考" : "本選考";
  const industryResultLabel = analysisSelectionType === "インターン" ? "合格" : "内定";
  analysisTypeSwitch.dataset.activeIndex = analysisSelectionType === "本選考" ? "1" : "0";
  analysisTypeSwitch.querySelectorAll("[data-analysis-type]").forEach(button => {
    const active = button.dataset.analysisType === analysisSelectionType;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  analysisScopeSummary.textContent = `${scopeLabel}として登録した${scopedEntries.length}件を集計`;
  const stats = [
    ...analysisPhaseDefinitions.map(item => buildSimplePassRate(item, scopedEntries)),
    buildInterviewPassRate(scopedEntries)
  ];
  const industryStats = buildIndustryPassRates(scopedEntries);
  const overview = buildAnalysisOverview(scopedEntries);
  const funnelStats = buildAnalysisFunnel(scopedEntries);
  analyticsContent.innerHTML = `
    ${analysisOverviewMarkup(overview, industryResultLabel)}
    ${analysisFunnelMarkup(funnelStats, scopeLabel)}
    <h3 class="analysis-section-title">${scopeLabel}・フェーズ別</h3>
    ${stats.map(item => analysisCardMarkup(item, "対象")).join("")}
    <h3 class="analysis-section-title">${scopeLabel}・業界別 ${industryResultLabel}率</h3>
    ${industryStats.length ? industryStats.map((item, index) => analysisCardMarkup({ ...item, color: industryColors[index % industryColors.length] }, "判定", industryResultLabel)).join("") : `
      <section class="analysis-card" style="--accent:#61f4de;">
        <div class="analysis-top">
          <strong>業界データなし</strong>
          <span class="analysis-rate" data-rate="0">0%</span>
        </div>
        <div class="analysis-bar"><div class="analysis-fill" style="--rate:0%"></div></div>
        <div class="analysis-detail">${scopeLabel}の企業に業界と最終結果を入れると、ここに${industryResultLabel}率が表示されます。</div>
      </section>
    `}
  `;
  animateAnalysisRates();
}

function buildAnalysisOverview(sourceEntries) {
  const startedEntries = sourceEntries.filter(hasStartedSelection);
  const decidedEntries = sourceEntries.filter(entry => winStages.has(entry.stage) || failStages.has(entry.stage));
  const successCount = decidedEntries.filter(entry => winStages.has(entry.stage)).length;
  const successRate = decidedEntries.length ? Math.round((successCount / decidedEntries.length) * 100) : 0;
  const bestIndustry = buildIndustryPassRates(sourceEntries)
    .sort((first, second) => {
      const firstRate = first.total ? first.passed / first.total : 0;
      const secondRate = second.total ? second.passed / second.total : 0;
      return secondRate - firstRate || second.total - first.total || first.label.localeCompare(second.label, "ja");
    })[0] || null;
  return {
    started: startedEntries.length,
    successCount,
    successRate,
    decisionTotal: decidedEntries.length,
    bestIndustry
  };
}

function hasStartedSelection(entry) {
  return !["気になる", "応募予定"].includes(normalizeStageName(entry.stage));
}

function buildAnalysisFunnel(sourceEntries) {
  const startedEntries = sourceEntries.filter(hasStartedSelection);
  const phasePassCount = definition => startedEntries.filter(entry => phaseOutcome(entry, definition)?.passed).length;
  const interviewPassCount = startedEntries.filter(entry => interviewOutcomes(entry).some(Boolean)).length;
  const successCount = startedEntries.filter(entry => winStages.has(entry.stage)).length;
  const total = startedEntries.length;
  const [esDefinition, webDefinition, gdDefinition] = analysisPhaseDefinitions;
  return [
    { label: "応募・選考開始", count: total },
    { label: "ES通過", count: phasePassCount(esDefinition) },
    { label: "Webテスト通過", count: phasePassCount(webDefinition) },
    { label: "GD通過", count: phasePassCount(gdDefinition) },
    { label: "面接通過", count: interviewPassCount },
    { label: analysisSelectionType === "インターン" ? "インターン合格" : "内定", count: successCount }
  ].map(item => ({ ...item, rate: total ? Math.min(100, Math.round((item.count / total) * 100)) : 0 }));
}

function analysisOverviewMarkup(overview, resultLabel) {
  const bestIndustry = overview.bestIndustry;
  const bestIndustryDetail = bestIndustry ? `${bestIndustry.passed}/${bestIndustry.total} ${resultLabel}` : "最終結果の登録後に表示";
  return `
    <section class="analysis-overview" aria-label="選考サマリー">
      <div class="analysis-overview-item"><small>応募数</small><strong>${overview.started}<em>社</em></strong><span>選考開始済み</span></div>
      <div class="analysis-overview-item"><small>${resultLabel}数</small><strong>${overview.successCount}<em>社</em></strong><span>最終結果</span></div>
      <div class="analysis-overview-item"><small>${resultLabel}率</small><strong>${overview.successRate}<em>%</em></strong><span>${overview.successCount}/${overview.decisionTotal} 判定</span></div>
      <div class="analysis-overview-item industry"><small>好成績業界</small><strong>${escapeHtml(bestIndustry?.label || "データなし")}</strong><span>${escapeHtml(bestIndustryDetail)}</span></div>
    </section>
  `;
}

function analysisFunnelMarkup(items, scopeLabel) {
  return `
    <section class="analysis-funnel" aria-label="${scopeLabel}の選考ファネル">
      <div class="analysis-funnel-head"><div><small>SELECTION FUNNEL</small><h3>選考ファネル</h3></div><span>通過した企業数</span></div>
      <div class="analysis-funnel-list">
        ${items.map((item, index) => `
          <div class="analysis-funnel-row" style="--funnel-rate:${item.rate}%;--funnel-delay:${index * 70}ms;">
            <span class="analysis-funnel-label">${escapeHtml(item.label)}</span>
            <span class="analysis-funnel-track"><i></i></span>
            <strong class="analysis-funnel-count"><b>${item.count}</b><em>社</em></strong>
          </div>
        `).join("")}
      </div>
      <p>企業ごとに存在するフェーズだけを集計しています。</p>
    </section>
  `;
}

function animateAnalysisRates() {
  if (analysisRateAnimationFrame !== null) cancelAnimationFrame(analysisRateAnimationFrame);
  const labels = [...analyticsContent.querySelectorAll(".analysis-rate[data-rate]")];
  if (!labels.length) return;
  const reducedMotion = Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  if (reducedMotion) {
    labels.forEach(label => { label.textContent = `${label.dataset.rate}%`; });
    analysisRateAnimationFrame = null;
    return;
  }
  const startedAt = performance.now();
  const duration = 620;
  const draw = now => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    labels.forEach(label => {
      const target = Number(label.dataset.rate) || 0;
      label.textContent = `${Math.round(target * eased)}%`;
    });
    if (progress < 1) analysisRateAnimationFrame = requestAnimationFrame(draw);
    else analysisRateAnimationFrame = null;
  };
  analysisRateAnimationFrame = requestAnimationFrame(draw);
}

function analysisCardMarkup(item, totalLabel = "対象", passedLabel = "通過") {
  const rate = item.total ? Math.round((item.passed / item.total) * 100) : 0;
  const note = item.total < 3 ? "まだデータ少なめ" : "集計中";
  return `
    <section class="analysis-card" style="--accent:${item.color};">
      <div class="analysis-top">
        <strong>${escapeHtml(item.label)}</strong>
        <span class="analysis-rate" data-rate="${rate}">0%</span>
      </div>
      <div class="analysis-bar"><div class="analysis-fill" style="--rate:${rate}%"></div></div>
      <div class="analysis-detail">${passedLabel} ${item.passed} / ${totalLabel} ${item.total} ・ ${note}</div>
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
    if (entry.stage === "内定" && entry.offerResponseDeadline && normalizeOfferDecision(entry.offerDecision) !== "辞退") {
      result.push({
        entryId: entry.id,
        company: entry.company,
        date: entry.offerResponseDeadline,
        label: "内定回答期限",
        detail: `${normalizeOfferDecision(entry.offerDecision)} ・ ${offerDeadlineText(entry)}`,
        color: "#d6ae56",
        priority: 2
      });
    }
    const scheduleStatus = getInternScheduleStatus(entry);
    if (scheduleStatus === "confirmed" || scheduleStatus === "tentative") {
      internshipDateKeys(entry).forEach(date => {
        const confirmed = scheduleStatus === "confirmed";
        result.push({
          entryId: entry.id,
          company: entry.company,
          date,
          label: confirmed ? "インターン確定日程" : "インターン候補日程",
          detail: confirmed
            ? (entry.internSchedule || `${formatDate(date)} 実施`)
            : `${entry.internSchedule || formatDate(date)} ・ 合格で確定`,
          color: confirmed ? "#ffdf72" : "#7ad7ff",
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
  if (entry.internScheduleMode === "custom") {
    return normalizeCustomDates(entry.internCustomDates);
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

function buildSimplePassRate(definition, sourceEntries = entries) {
  let total = 0;
  let passed = 0;
  sourceEntries.forEach(entry => {
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
  const sequence = activeStageSequence(entry);
  const phaseIndexes = sequence
    .map((stage, index) => phaseStepMatches(definition.key, stage) ? index : -1)
    .filter(index => index >= 0);
  const lastPhaseIndex = phaseIndexes.at(-1) ?? -1;
  const passedCustomPhase = lastPhaseIndex >= 0 && history.some(stage => sequence.indexOf(stage) > lastPhaseIndex);
  const didPass = definition.passStages.some(stage => history.includes(stage)) || passedCustomPhase || winStages.has(entry.stage);
  return didPass ? { passed: true } : null;
}

function phaseStepMatches(key, stage) {
  if (key === "es") return /(ES|エントリーシート|書類)/i.test(stage);
  if (key === "webTest") return /(Web|WEB|ウェブ|SPI|玉手箱|適性検査|テスト)/i.test(stage);
  if (key === "gd") return /(GD|グループディスカッション)/i.test(stage);
  if (key === "interview") return /(面接|面談)/.test(stage);
  return false;
}

function buildInterviewPassRate(sourceEntries = entries) {
  const outcomes = sourceEntries.flatMap(interviewOutcomes);
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
  const sequence = activeStageSequence(entry);
  return interviewStages
    .filter(stage => history.includes(stage))
    .filter(stage => history.some(item => sequence.indexOf(item) > sequence.indexOf(stage)) || winStages.has(entry.stage))
    .map(() => true);
}

function buildIndustryPassRates(sourceEntries = entries) {
  const map = new Map();
  sourceEntries.forEach(entry => {
    const industry = normalizeIndustry(entry.industry);
    if (industry === "未設定") return;
    const passed = winStages.has(entry.stage);
    const failed = failStages.has(entry.stage);
    if (!passed && !failed) return;
    if (!map.has(industry)) map.set(industry, { label: industry, total: 0, passed: 0 });
    const stat = map.get(industry);
    stat.total += 1;
    if (passed) stat.passed += 1;
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
  if (mode === "custom") {
    const dates = normalizeCustomDates(scheduleCustomDates[prefix]);
    return dates.length ? dates.map(formatScheduleDate).join("・") : fallback;
  }
  const start = formatScheduleDate(targetForm.elements[`${prefix}StartDate`].value);
  const end = formatScheduleDate(targetForm.elements[`${prefix}EndDate`].value);
  if (start && end) return `${start}〜${end}`;
  return start || end || fallback;
}

function scheduleDataFromForm(targetForm, prefix, fallback = "") {
  return {
    internSchedule: buildScheduleFromForm(targetForm, prefix, fallback),
    internScheduleMode: targetForm.elements[`${prefix}ScheduleMode`].value,
    internSingleDate: targetForm.elements[`${prefix}SingleDate`].value || "",
    internStartDate: targetForm.elements[`${prefix}StartDate`].value || "",
    internEndDate: targetForm.elements[`${prefix}EndDate`].value || "",
    internCustomDates: normalizeCustomDates(scheduleCustomDates[prefix])
  };
}

function normalizeCustomDates(values = []) {
  const dates = Array.isArray(values) ? values : [];
  return [...new Set(dates.slice(0, 366).filter(isDateKey))].sort();
}

function getInternScheduleStatus(entry = {}) {
  if (entry.type !== "インターン") return "";
  if (isPostWinDeclined(entry)) return "declined";
  if (entry.stage === "インターン合格") return "confirmed";
  if (failStages.has(entry.stage)) return "cancelled";
  return internshipDateKeys(entry).length ? "tentative" : "";
}

function isPostWinDeclined(entry = {}) {
  return winStages.has(entry.stage) && Boolean(entry.declinedAfterWin);
}

function setScheduleForm(targetForm, prefix, entry = {}) {
  const mode = ["single", "range", "custom"].includes(entry.internScheduleMode) ? entry.internScheduleMode : "single";
  targetForm.elements[`${prefix}ScheduleMode`].value = mode;
  targetForm.elements[`${prefix}SingleDate`].value = entry.internSingleDate || "";
  targetForm.elements[`${prefix}StartDate`].value = entry.internStartDate || "";
  targetForm.elements[`${prefix}EndDate`].value = entry.internEndDate || "";
  scheduleCustomDates[prefix] = normalizeCustomDates(entry.internCustomDates);
  renderCustomScheduleDates(prefix);
  updateScheduleMode(targetForm, prefix);
}

function updateScheduleMode(targetForm, prefix) {
  const mode = targetForm.elements[`${prefix}ScheduleMode`].value;
  document.querySelector(`#${prefix}SingleField`).hidden = mode !== "single";
  document.querySelector(`#${prefix}RangeFields`).hidden = mode !== "range";
  document.querySelector(`#${prefix}CustomFields`).hidden = mode !== "custom";
}

function addCustomScheduleDate(prefix) {
  const picker = document.querySelector(`#${prefix}CustomDatePicker`);
  if (!isDateKey(picker.value)) {
    picker.focus();
    return;
  }
  scheduleCustomDates[prefix] = normalizeCustomDates([...scheduleCustomDates[prefix], picker.value]);
  picker.value = "";
  renderCustomScheduleDates(prefix);
}

function renderCustomScheduleDates(prefix) {
  const container = document.querySelector(`#${prefix}CustomDateList`);
  const dates = normalizeCustomDates(scheduleCustomDates[prefix]);
  container.innerHTML = dates.length
    ? dates.map(date => `<span class="custom-date-chip"><b>${escapeHtml(formatLongDate(date))}</b><button type="button" data-custom-date="${escapeHtml(date)}" aria-label="${escapeHtml(formatLongDate(date))}を削除">×</button></span>`).join("")
    : `<p>まだ日程が追加されていません。</p>`;
  container.querySelectorAll("[data-custom-date]").forEach(button => {
    button.addEventListener("click", () => {
      scheduleCustomDates[prefix] = dates.filter(date => date !== button.dataset.customDate);
      renderCustomScheduleDates(prefix);
    });
  });
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

function stageProgress(entry) {
  if (doneStages.has(entry.stage)) return 100;
  const sequence = activeStageSequence(entry);
  const index = sequence.indexOf(entry.stage);
  if (index < 0) return 0;
  return Math.round((index / Math.max(1, sequence.length - 1)) * 100);
}

function filteredEntries() {
  const word = document.querySelector("#search").value.trim().toLowerCase();
  const sortOrder = document.querySelector("#sortOrder").value;
  return entries
    .filter(entry => {
      if (activeFilter === "deadline") return daysLeft(entry.deadline) !== null;
      if (activeFilter === "all") return true;
      if (activeFilter === "面接") return /(面接|面談)/.test(entry.stage);
      if (activeFilter === "合格") return winStages.has(entry.stage);
      if (activeFilter === "不合格") return failStages.has(entry.stage);
      if (activeFilter === "書類選考中") return /(ES|エントリーシート|書類)/i.test(entry.stage);
      if (activeFilter === "GD") return /(GD|グループディスカッション)/i.test(entry.stage);
      if (activeFilter === "結果待ち") return entry.stage === "結果待ち";
      return entry.type === activeFilter;
    })
    .filter(entry => !word || [entry.company, entry.role, entry.industry, entry.internSeason, entry.stage, entry.memo, entry.internSchedule, entry.nextPlan, entry.offerRole, entry.offerMemo, ...normalizeFlowSteps(entry.flowSteps, entry), ...normalizeSelectionTags(entry.selectionTags, entry.selectionTagOther)].join(" ").toLowerCase().includes(word))
    .sort((a, b) => {
      if (sortOrder === "updated") return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      if (sortOrder === "company") return a.company.localeCompare(b.company, "ja");
      if (sortOrder === "nextDate") {
        const first = a.nextDate ? parseDateKey(a.nextDate).getTime() : Number.MAX_SAFE_INTEGER;
        const second = b.nextDate ? parseDateKey(b.nextDate).getTime() : Number.MAX_SAFE_INTEGER;
        if (first !== second) return first - second;
      }
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
  renderOffers();
  window.dispatchEvent(new CustomEvent("nextround:data-changed", { detail: { count: entries.length } }));

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
    cards.innerHTML = `<div class="empty">まだ表示できる選考がありません。上の追加ボタンから入れられます。</div>`;
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
  const postWinDeclined = isPostWinDeclined(entry);
  card.className = `card${winStages.has(entry.stage) ? " win" : ""}${postWinDeclined ? " post-win-declined" : ""}${deadlineClassName(entry) ? ` ${deadlineClassName(entry)}` : ""}`;
  const progress = stageProgress(entry);
  const stageColor = stageColors[entry.stage] || stageColors["応募予定"];
  const deadlineClass = deadlineMetaClass(entry);
  const primaryStage = getPrimaryStage(entry);
  const done = doneStages.has(entry.stage) || entry.stage === stages.at(-1);
  const resultMode = entry.stage === "結果待ち";
  const actionMode = done ? "done-mode" : resultMode ? "result-mode" : "";
  const industry = normalizeIndustry(entry.industry);
  const portalUrl = normalizePortalUrl(entry.portalUrl);
  const internScheduleStatus = getInternScheduleStatus(entry);
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
          ${entry.type === "インターン" && normalizeInternSeason(entry.internSeason) !== "未設定" ? `<span class="season-pill">${escapeHtml(normalizeInternSeason(entry.internSeason))}</span>` : ""}
          ${industry !== "未設定" ? `<span class="industry-pill">${escapeHtml(industry)}</span>` : ""}
        </div>
      </div>
      <button class="stage-row" data-action="timeline" type="button" aria-label="${escapeHtml(entry.company)}の選考タイムラインを表示">
        <span class="status-pill">${escapeHtml(entry.stage)}</span>
        <div class="stage-label"><strong>${escapeHtml(statusHint(entry))}</strong><span>${progress}% · 履歴 ›</span></div>
        <div class="track"><div class="bar" style="width:${progress}%"></div></div>
      </button>
      ${postWinDeclined ? `<div class="post-win-declined-badge">${escapeHtml(entry.type === "インターン" ? "合格後辞退" : "内定辞退")}<span>分析では合格として集計</span></div>` : ""}
      ${selectionTagsMarkup(entry)}
      ${["tentative", "confirmed", "declined"].includes(internScheduleStatus) ? internshipScheduleMarkup(entry, internScheduleStatus) : ""}
      ${done ? "" : deadlineMetaMarkup(entry, deadlineClass)}
      ${entry.stage === "内定" ? offerCardSummaryMarkup(entry) : winStages.has(entry.stage) ? `<button class="post-win-decline-btn${postWinDeclined ? " active" : ""}" data-action="togglePostWinDecline" type="button">${escapeHtml(postWinDeclined ? "辞退の記録を取り消す" : "合格後辞退として記録")}</button>` : ""}
      <div class="meta-box memo-box"><span>メモ</span><b>${escapeHtml(entry.memo || "メモなし")}</b></div>
      <div class="protected-actions">
        <button class="archive-open" data-action="esArchive" type="button">ESアーカイブ${entry.esArchiveVault ? "を開く" : "を作成"}</button>
        ${portalUrl ? `<a class="portal-link" href="${escapeHtml(portalUrl)}" target="_blank" rel="noopener noreferrer">マイページを開く · ${escapeHtml(portalHostname(portalUrl))}</a>` : ""}
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
  const postWinDeclineButton = card.querySelector('[data-action="togglePostWinDecline"]');
  if (postWinDeclineButton) postWinDeclineButton.addEventListener("click", () => togglePostWinDecline(entry.id));
  const offerButton = card.querySelector('[data-action="manageOffer"]');
  if (offerButton) offerButton.addEventListener("click", () => openOfferDialog(entry));
  const timelineButton = card.querySelector('[data-action="timeline"]');
  if (timelineButton) timelineButton.addEventListener("click", () => openTimeline(entry));
  return card;
}

function openTimeline(entry) {
  timelineTargetId = entry.id;
  const timeline = normalizeStageTimeline(entry.stageTimeline, entry.stage, entry.updatedAt);
  timelineTitle.textContent = `${entry.company} の選考履歴`;
  timelineSummary.innerHTML = `
    <div><small>CURRENT STAGE</small><strong>${escapeHtml(entry.stage)}</strong></div>
    <div><small>RECORDED</small><strong>${timeline.length}件</strong></div>
  `;
  timelineList.innerHTML = timeline.map((event, index) => {
    const tone = timelineEventTone(event);
    const current = index === timeline.length - 1 ? " current" : "";
    const detail = event.fromStage
      ? `${escapeHtml(event.fromStage)} → ${escapeHtml(event.stage)}`
      : "この状態から記録を開始";
    return `
      <li class="timeline-item ${tone}${current}">
        <time datetime="${escapeHtml(event.at)}">${escapeHtml(formatTimelineTimestamp(event.at))}</time>
        <i aria-hidden="true"></i>
        <div><strong>${escapeHtml(timelineEventLabel(event))}</strong><span>${detail}</span></div>
      </li>
    `;
  }).join("");
  timelineNote.textContent = "操作した日時を自動で記録します。導入前のデータは、現在のステータスを開始地点として扱います。";
  timelineDialog.showModal();
}

function timelineEventTone(event) {
  if (winStages.has(event.stage)) return "win";
  if (failStages.has(event.stage)) return "fail";
  if (event.stage === "結果待ち") return "waiting";
  if (event.action === "back" || event.action === "edit" || event.action === "start") return "neutral";
  return "pass";
}

function timelineEventLabel(event) {
  if (event.action === "start") return `${event.stage}から履歴を開始`;
  if (event.action === "back") return `${event.stage}へ戻す`;
  if (event.action === "edit") return `編集で${event.stage}に変更`;
  if (failStages.has(event.stage) || winStages.has(event.stage)) return event.stage;
  if (event.stage === "結果待ち") return `${timelinePhaseLabel(event.fromStage)}完了・結果待ち`;
  const passed = timelinePassedLabel(event.fromStage, event.stage);
  return passed ? `${passed}通過` : `${event.stage}へ進行`;
}

function timelinePassedLabel(fromStage, toStage) {
  const from = String(fromStage || "");
  const to = String(toStage || "");
  if (/(ES|エントリーシート|書類)/i.test(from) && !/(ES|エントリーシート|書類)/i.test(to)) return "ES";
  if (/(Web|WEB|ウェブ|SPI|玉手箱|適性検査|テスト)/i.test(from) && !/(Web|WEB|ウェブ|SPI|玉手箱|適性検査|テスト)/i.test(to)) return "Webテスト";
  if (/(GD|グループディスカッション)/i.test(from) && !/(GD|グループディスカッション)/i.test(to)) return "GD";
  if (/(面接|面談)/.test(from) && from !== to) return from;
  return "";
}

function timelinePhaseLabel(stage) {
  if (/(ES|エントリーシート|書類)/i.test(stage || "")) return "ES";
  if (/(Web|WEB|ウェブ|SPI|玉手箱|適性検査|テスト)/i.test(stage || "")) return "Webテスト";
  if (/(GD|グループディスカッション)/i.test(stage || "")) return "GD";
  if (/(面接|面談)/.test(stage || "")) return stage;
  return stage || "選考";
}

function formatTimelineTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
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
      entries = entries.map(item => item.id === entry.id ? touchEntry(item, { portalUrl: legacyUrl }) : item);
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

function internshipScheduleMarkup(entry, status = getInternScheduleStatus(entry)) {
  const tentative = status === "tentative";
  const declined = status === "declined";
  const label = tentative ? "インターン候補日程" : declined ? "辞退したインターン日程" : "インターン確定日程";
  const note = tentative
    ? '<em class="schedule-state">合格で確定</em>'
    : declined
      ? '<em class="schedule-state declined">カレンダーから除外</em>'
      : "";
  return `<div class="meta-box schedule-box${tentative ? " tentative" : ""}${declined ? " declined" : ""}"><span>${label}</span><b>${escapeHtml(entry.internSchedule || "未設定（編集から追加）")}</b>${note}</div>`;
}

function normalizeOfferDecision(value) {
  return ["検討中", "承諾", "辞退"].includes(value) ? value : "検討中";
}

function offerDeadlineText(entry) {
  if (!entry.offerResponseDeadline) return "回答期限未設定";
  const left = daysLeft(entry.offerResponseDeadline);
  if (left < 0) return `${Math.abs(left)}日超過`;
  if (left === 0) return "今日が回答期限";
  return `回答まであと${left}日`;
}

function offerCardSummaryMarkup(entry) {
  const decision = normalizeOfferDecision(entry.offerDecision);
  return `
    <button class="offer-inline ${decision === "承諾" ? "accepted" : decision === "辞退" ? "declined" : ""}" data-action="manageOffer" type="button">
      <span><small>OFFER STATUS</small><strong>${escapeHtml(decision)}</strong></span>
      <em>${escapeHtml(offerDeadlineText(entry))}</em>
      <b>管理する ›</b>
    </button>
  `;
}

function renderOffers() {
  const overview = document.querySelector("#offerOverview");
  const list = document.querySelector("#offerList");
  if (!overview || !list) return;
  const offers = entries.filter(entry => entry.stage === "内定");
  const activeOffers = offers.filter(entry => normalizeOfferDecision(entry.offerDecision) !== "辞退");
  const accepted = offers.filter(entry => normalizeOfferDecision(entry.offerDecision) === "承諾").length;
  const urgent = activeOffers.filter(entry => {
    const left = daysLeft(entry.offerResponseDeadline);
    return left !== null && left >= 0 && left <= 7;
  }).length;
  overview.innerHTML = `
    <div class="offer-title"><small>OFFER CONTROL</small><h2>内定管理</h2><p>回答期限と判断状況を、選考一覧とは別に整理します。</p></div>
    <div class="offer-metrics">
      <div><span>保有内定</span><strong>${activeOffers.length}</strong></div>
      <div><span>承諾</span><strong>${accepted}</strong></div>
      <div class="${urgent ? "urgent" : ""}"><span>7日以内</span><strong>${urgent}</strong></div>
    </div>
  `;
  const sorted = [...offers].sort((first, second) => {
    const firstDate = first.offerResponseDeadline || "9999-12-31";
    const secondDate = second.offerResponseDeadline || "9999-12-31";
    return firstDate.localeCompare(secondDate) || first.company.localeCompare(second.company, "ja");
  });
  list.innerHTML = sorted.length ? sorted.map(entry => {
    const decision = normalizeOfferDecision(entry.offerDecision);
    const offerDays = daysLeft(entry.offerResponseDeadline);
    const deadlineLevel = offerDays !== null && offerDays <= 7 ? " urgent" : "";
    return `
      <article class="offer-item ${decision === "承諾" ? "accepted" : decision === "辞退" ? "declined" : ""}">
        <div class="offer-item-top">
          <div><small>${escapeHtml(entry.industry || "業界未設定")}</small><h3>${escapeHtml(entry.company)}</h3><p>${escapeHtml(entry.offerRole || entry.role || "職種・配属未設定")}</p></div>
          <span>${escapeHtml(decision)}</span>
        </div>
        <div class="offer-item-deadline${deadlineLevel}"><small>回答期限</small><strong>${escapeHtml(entry.offerResponseDeadline ? formatLongDate(entry.offerResponseDeadline) : "未設定")}</strong><em>${escapeHtml(offerDeadlineText(entry))}</em></div>
        ${entry.offerMemo ? `<p class="offer-item-memo">${escapeHtml(entry.offerMemo)}</p>` : ""}
        <button type="button" data-offer-entry="${escapeHtml(entry.id)}">内定情報を編集</button>
      </article>
    `;
  }).join("") : `<div class="offer-empty"><strong>内定はまだ登録されていません</strong><p>本選考を「内定」にすると、ここへ自動で追加されます。</p></div>`;
  list.querySelectorAll("[data-offer-entry]").forEach(button => {
    button.addEventListener("click", () => {
      const entry = entries.find(item => item.id === button.dataset.offerEntry);
      if (entry) openOfferDialog(entry);
    });
  });
}

function openOfferDialog(entry) {
  if (!entry || entry.stage !== "内定") return;
  offerTargetId = entry.id;
  offerDialogTitle.textContent = `${entry.company} の内定管理`;
  offerForm.elements.offerResponseDeadline.value = entry.offerResponseDeadline || "";
  offerForm.elements.offerDecision.value = normalizeOfferDecision(entry.offerDecision);
  offerForm.elements.offerRole.value = entry.offerRole || entry.role || "";
  offerForm.elements.offerMemo.value = entry.offerMemo || "";
  offerDialog.showModal();
}

function saveOfferDetails(event) {
  event.preventDefault();
  const entry = entries.find(item => item.id === offerTargetId);
  if (!entry) return;
  const data = Object.fromEntries(new FormData(offerForm).entries());
  const decision = normalizeOfferDecision(data.offerDecision);
  entries = entries.map(item => item.id === entry.id ? touchEntry(item, {
    offerResponseDeadline: isDateKey(data.offerResponseDeadline) ? data.offerResponseDeadline : "",
    offerDecision: decision,
    offerRole: String(data.offerRole || "").trim().slice(0, 80),
    offerMemo: String(data.offerMemo || "").trim(),
    declinedAfterWin: decision === "辞退"
  }) : item);
  save();
  offerDialog.close();
  render();
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
  return sequence[0] || "結果待ち";
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
  if (/(ES|エントリーシート|書類)/i.test(entry.stage)) return "ES不合格";
  if (/(Web|WEB|ウェブ|SPI|玉手箱|適性検査|テスト)/i.test(entry.stage)) return "Webテスト不合格";
  if (/(GD|グループディスカッション)/i.test(entry.stage)) return "GD不合格";
  if (/(面接|面談)/.test(entry.stage)) return "面接不合格";
  return entry.type === "インターン" ? "インターン不合格" : "不採用";
}

function failLabel(entry) {
  return getFailStage(entry);
}

function statusHint(entry) {
  if (entry.stage === "結果待ち") return "返事が来たら結果入力";
  if (isPostWinDeclined(entry)) return entry.type === "インターン" ? "合格後辞退として記録済み" : "内定辞退として記録済み";
  if (winStages.has(entry.stage)) return "おめでとう、通過";
  if (doneStages.has(entry.stage)) return "記録済み";
  return "次のステップへ";
}

function advance(id, direction) {
  entries = entries.map(entry => {
    if (entry.id !== id) return entry;
    const nextStage = direction > 0 ? getPrimaryStage(entry) : getPreviousStage(entry);
    const baseHistory = direction < 0
      ? removeStageFromHistory(entry.stageHistory, entry.stage)
      : entry.stageHistory;
    const stageTimeline = direction < 0
      ? rewindStageTimeline(entry.stageTimeline, entry.stage, nextStage)
      : recordStageTransition(entry.stageTimeline, entry.stage, nextStage, "advance");
    const nextEntry = {
      ...entry,
      stage: nextStage,
      declinedAfterWin: winStages.has(nextStage) && Boolean(entry.declinedAfterWin),
      stageHistory: addStageToHistory(baseHistory, nextStage),
      stageTimeline
    };
    return touchEntry(nextEntry, { internScheduleStatus: getInternScheduleStatus(nextEntry) });
  });
  save();
  render();
}

function getPreviousStage(entry) {
  if (doneStages.has(entry.stage)) {
    const recordedPrevious = normalizeStageHistory(entry.stageHistory, entry.stage)
      .filter(stage => stage !== entry.stage && !doneStages.has(stage))
      .at(-1);
    if (recordedPrevious) return recordedPrevious;
  }
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
  return sequence[0] || "応募予定";
}

function lastInterviewStage(entry) {
  return interviewStagesFor(entry).at(-1) || "面接";
}

function setStage(id, stage, extras = {}) {
  entries = entries.map(entry => {
    if (entry.id !== id) return entry;
    const timelineAction = failStages.has(stage) ? "fail" : winStages.has(stage) ? "result" : "advance";
    const nextEntry = {
      ...entry,
      stage,
      declinedAfterWin: winStages.has(stage) && Boolean(entry.declinedAfterWin),
      stageHistory: addStageToHistory(entry.stageHistory, stage),
      stageTimeline: recordStageTransition(entry.stageTimeline, entry.stage, stage, timelineAction),
      ...extras
    };
    return touchEntry(nextEntry, { internScheduleStatus: getInternScheduleStatus(nextEntry) });
  });
  save();
  render();
}

function togglePostWinDecline(id) {
  const entry = entries.find(item => item.id === id);
  if (!entry || !winStages.has(entry.stage)) return;
  const willDecline = !isPostWinDeclined(entry);
  if (willDecline) {
    const label = entry.type === "インターン" ? "合格後辞退" : "内定辞退";
    const confirmed = confirm(`${entry.company}を「${label}」として記録しますか？\n\n合格・内定の記録は残り、分析でも合格として集計されます。`);
    if (!confirmed) return;
  }
  entries = entries.map(item => item.id === id ? touchEntry(item, {
    declinedAfterWin: willDecline,
    offerDecision: item.stage === "内定" ? (willDecline ? "辞退" : "検討中") : item.offerDecision
  }) : item);
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
  const extras = {
    declinedAfterWin: false,
    offerDecision: stage === "内定" ? "検討中" : entry.offerDecision
  };
  if (stage === "インターン合格") {
    Object.assign(extras, scheduleDataFromForm(resultForm, "result", entry.internSchedule || ""));
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
  form.elements.internSeason.value = normalizeInternSeason(entry?.internSeason);
  form.elements.industry.value = normalizeIndustry(entry?.industry);
  form.elements.role.value = entry?.role || "";
  form.elements.deadline.value = entry?.deadline || "";
  form.elements.nextDate.value = entry?.nextDate || "";
  form.elements.nextPlan.value = entry?.nextPlan || "";
  flowBuilderDirty = false;
  setFlowBuilder(entry || { type: form.elements.type.value });
  syncStageOptions(entry?.stage || "応募予定");
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
  updateInternSeasonVisibility();
  dialog.showModal();
}

function updateInternSeasonVisibility() {
  internSeasonField.hidden = form.elements.type.value !== "インターン";
}

function updateInternScheduleVisibility() {
  const isIntern = form.elements.type.value === "インターン";
  const isFailed = failStages.has(form.elements.stage.value);
  const confirmed = form.elements.stage.value === "インターン合格";
  internScheduleField.hidden = !isIntern || isFailed;
  internScheduleLabel.textContent = confirmed ? "インターン確定日程" : "インターン候補日程";
  internScheduleNote.textContent = confirmed
    ? "合格後に日程が分かった場合も、ここから登録・変更できます。"
    : "選考中は候補としてカレンダーに表示し、合格すると自動で確定します。";
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

async function readLimitedResponseJson(response, maximumBytes = 1_000_000) {
  const contentLength = Number(response.headers.get("Content-Length") || 0);
  if (contentLength > maximumBytes || !response.body) throw new Error("response-too-large");
  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maximumBytes) {
      await reader.cancel();
      throw new Error("response-too-large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(received);
  let offset = 0;
  chunks.forEach(chunk => {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  });
  return JSON.parse(textDecoder.decode(bytes));
}

prepareLocalDataForRefresh();
render();
initCloudSync();
