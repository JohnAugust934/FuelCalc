// app.js - Lógica Principal do FuelCalc
// Versão: 1.7.4
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // ===== CONFIGURAÇÕES E CONSTANTES GLOBAIS =====
  const APP_VERSION = "1.7.4";
  const CONFIG = {
    APP_VERSION,
    STORAGE_KEYS: {
      VEHICLES: `fuelCalc_vehicles_v1.7.4`,
      HISTORY: `fuelCalc_history_v1.7.4`,
      APP_SETTINGS: `fuelCalc_settings_v1.7.4`,
    },
    DEFAULT_LANGUAGE: "pt-BR",
    DEFAULT_THEME: "system",
    MAX_MOBILE_WIDTH: 450,
    VALIDATION: {
      MIN_EFFICIENCY: 1,
      MAX_EFFICIENCY: 70,
      MIN_KM: 0,
      MAX_KM: 999999,
      MIN_PRICE: 0.1,
      MAX_PRICE: 25,
      MAX_TRIP_DISTANCE: 5000,
      MIN_VEHICLE_NAME_LENGTH: 2,
      MAX_VEHICLE_NAME_LENGTH: 40,
      MAX_UBER_GAIN: 20000,
      MAX_GOAL_AMOUNT: 99999.99,
      MIN_GOAL_AMOUNT: 0.01,
    },
    HISTORY_DISPLAY_COUNT: 3,
    HISTORY_LIMIT: 50,
    DEBOUNCE_DELAY: 150,
    NOTIFICATION_TIMEOUT: 4000,
    CHART_MAX_DAYS: 30,
  };

  const DOM = {
    html: document.documentElement,
    body: document.body,
    appContainer: document.getElementById("appContainer"),
    desktopNoticeOverlay: document.getElementById("desktop-notice-overlay"),
    qrCodeCanvas: document.getElementById("qrCodeCanvas"),
    pageUrlLink: document.getElementById("pageUrlLink"),
    detailsModalOverlay: document.getElementById("detailsModalOverlay"),
    detailsModalContent: document.getElementById("detailsModalContent"),
    closeDetailsModalBtn: document.getElementById("closeDetailsModalBtn"),
    confirmModalOverlay: document.getElementById("confirmModalOverlay"),
    confirmModalTitle: document.getElementById("confirmModalTitle"),
    confirmModalMessage: document.getElementById("confirmModalMessage"),
    confirmModalConfirmBtn: document.getElementById("confirmModalConfirmBtn"),
    confirmModalCancelBtn: document.getElementById("confirmModalCancelBtn"),
    helpModalOverlay: document.getElementById("helpModalOverlay"),
    closeHelpModalBtn: document.getElementById("closeHelpModalBtn"),
    notificationArea: document.getElementById("notificationArea"),
    vehicleTypeButtons: document.querySelectorAll("[data-vehicle-type]"),
    vehicleListContainer: document.getElementById("vehicleList"),
    addVehicleBtn: document.getElementById("addVehicleBtn"),
    vehicleForm: document.getElementById("vehicleForm"),
    vehicleTypeInput: document.getElementById("vehicleType"),
    vehicleNameInput: document.getElementById("vehicleName"),
    vehicleEfficiencyGasolineInput: document.getElementById("vehicleEfficiencyGasoline"),
    vehicleEfficiencyAlcoholInput: document.getElementById("vehicleEfficiencyAlcohol"),
    fuelInputGroupContainer: document.getElementById("fuelInputGroupContainer"),
    efficiencyHelperBtnVehicleGasoline: document.getElementById("efficiencyHelperBtnVehicleGasoline"),
    efficiencyHelperBtnVehicleAlcohol: document.getElementById("efficiencyHelperBtnVehicleAlcohol"),
    cancelVehicleBtn: document.getElementById("cancelVehicleBtn"),
    fuelForm: document.getElementById("fuelForm"),
    tripFuelTypeGroup: document.getElementById("tripFuelTypeGroup"),
    tripFuelTypeSelect: document.getElementById("tripFuelTypeSelect"),
    kmInicialInput: document.getElementById("kmInicial"),
    kmFinalInput: document.getElementById("kmFinal"),
    kmPorLitroInput: document.getElementById("kmPorLitro"),
    precoCombustivelInput: document.getElementById("precoCombustivel"),
    ganhoUberInput: document.getElementById("ganhoUber"),
    resultCard: document.getElementById("resultCard"),
    distanciaResult: document.getElementById("distanciaResult"),
    litrosResult: document.getElementById("litrosResult"),
    custoResult: document.getElementById("custoResult"),
    lucroResult: document.getElementById("lucroResult"),
    historySection: document.getElementById("historySection"),
    historyList: document.getElementById("historyList"),
    seeMoreBtn: document.getElementById("seeMoreHistoryBtn"),
    minimizeBtn: document.getElementById("minimizeHistoryBtn"),
    clearHistoryBtn: document.getElementById("clearHistoryBtn"),
    exportHistoryCsvBtn: document.getElementById("exportHistoryCsvBtn"),
    statsSection: document.getElementById("statsSection"),
    totalKmStat: document.getElementById("totalKmStat"),
    totalGastoStat: document.getElementById("totalGastoStat"),
    exportStatsCsvBtn: document.getElementById("exportStatsCsvBtn"),
    mediaConsumoStat: document.getElementById("mediaConsumoStat"),
    chartCanvas: document.getElementById("fuelChartCanvas"),
    efficiencyHelperBtnTrip: document.getElementById("efficiencyHelperBtnTrip"),
    efficiencyHelperModalOverlay: document.getElementById("efficiencyHelperModalOverlay"),
    closeEfficiencyHelperModalBtn: document.getElementById("closeEfficiencyHelperModalBtn"),
    helperKmDrivenInput: document.getElementById("helperKmDriven"),
    helperLitersFueledInput: document.getElementById("helperLitersFueled"),
    calculateEfficiencyHelperBtn: document.getElementById("calculateEfficiencyHelperBtn"),
    efficiencyHelperResult: document.getElementById("efficiencyHelperResult"),
    efficiencyResultValue: document.getElementById("efficiencyResultValue"),
    useEfficiencyValueBtn: document.getElementById("useEfficiencyValueBtn"),
    vehicleNextOilChangeKmInput: document.getElementById("vehicleNextOilChangeKm"),
    maintenanceReminderSection: document.getElementById("maintenanceReminderSection"),
    oilChangeReminderCard: document.getElementById("oilChangeReminderCard"),
    oilChangeReminderText: document.getElementById("oilChangeReminderText"),
    noActiveMaintenanceReminder: document.getElementById("noActiveMaintenanceReminder"),
    mainContentWrapper: document.getElementById("mainContentWrapper"),
    bottomNav: document.querySelector(".bottom-nav"),
    navButtons: document.querySelectorAll(".nav-button"),
    settingsLanguageSwitcher: document.querySelector("#screenSettings .language-switcher"),
    settingsThemeSwitcher: document.querySelector("#screenSettings .theme-switcher"),
    settingsHelpButton: document.querySelector("#screenSettings #helpButton"),
    settingsAppFooter: document.querySelector("#screenSettings .app-footer"),
    selectedVehicleInfo: document.getElementById("selectedVehicleInfo"),
    homeVehicleSelect: document.getElementById("homeVehicleSelect"),
  };

  class Utils {
    static sanitizeHTML(str) {
      if (typeof str !== "string") return "";
      const t = document.createElement("div");
      t.textContent = str;
      return t.innerHTML;
    }
    static validateNumber(v, min = -Infinity, max = Infinity) {
      const n = parseFloat(v);
      return !isNaN(n) && n >= min && n <= max;
    }
    static convertCommaToPoint(v) {
      return typeof v === "string" ? v.replace(/,/g, ".") : v;
    }
    static debounce(func, wait) {
      let t;
      return function (...a) {
        const l = () => { clearTimeout(t); func.apply(this, a); };
        clearTimeout(t);
        t = setTimeout(l, wait);
      };
    }
    static formatCurrency(v, l = CONFIG.DEFAULT_LANGUAGE, useSymbol = true) { // Adicionado useSymbol
      const p = parseFloat(String(v).replace(/[^\d,.-]/g, "").replace(",", "."));
      if (isNaN(p)) return useSymbol ? (l === "en" ? "$ --" : "R$ --") : "--";
      const c = l === "en" ? "USD" : "BRL";
      const o = l === "en" ? "en-US" : "pt-BR";
      try {
        const formatted = p.toLocaleString(o, {
          style: useSymbol ? "currency" : "decimal", // Alterado aqui
          currency: c, // Ainda necessário para currency style
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return formatted;
      } catch (e) {
        return useSymbol ? (l === "en" ? "$ 0.00" : "R$ 0,00") : "0,00";
      }
    }
    static formatLocalDate(iso, l = CONFIG.DEFAULT_LANGUAGE) {
      if (!iso) return "--";
      const o = l === "en" ? "en-US" : "pt-BR";
      try {
        return new Date(iso).toLocaleString(o, {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
      } catch (e) { return "--"; }
    }
    static jsonToCsv(jsonData, fileName = "export.csv") {
      if (!jsonData || jsonData.length === 0) { return; }
      const keys = Object.keys(jsonData[0]);
      const csvRows = [keys.join(",")];
      jsonData.forEach(row => {
        const values = keys.map(key => {
          let cellValue = row[key] === null || row[key] === undefined ? "" : String(row[key]);
          cellValue = cellValue.replace(/"/g, '""');
          if (/[",\n]/.test(cellValue)) { cellValue = `"${cellValue}"`; }
          return cellValue;
        });
        csvRows.push(values.join(","));
      });
      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else { navigator.msSaveBlob(blob, fileName); }
    }
  }

  class LanguageManager {
    constructor(storageManager, dom) {
      this.storageManager = storageManager;
      this.dom = dom;
      this.currentLanguage = this._loadLanguagePreference() || CONFIG.DEFAULT_LANGUAGE;
      this.translationData = translations;
    }
    init() { this.setLanguage(this.currentLanguage, true); }
    _loadLanguagePreference() {
      const s = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {});
      return s.language;
    }
    _saveLanguagePreference(lang) {
      const s = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {});
      s.language = lang;
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, s);
    }
    setLanguage(lang, isInitialCall = false) {
      if (this.translationData[lang]) {
        this.currentLanguage = lang;
        this._saveLanguagePreference(lang);
        this.applyTranslationsToPage();
        document.documentElement.lang = lang;
        if (!isInitialCall) {
          document.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
        }
      }
    }
    get(key, params = {}) {
      const t = this.translationData[this.currentLanguage] || this.translationData[CONFIG.DEFAULT_LANGUAGE];
      let s = t[key] || key;
      for (const p in params) { s = s.replace(new RegExp(`{${p}}`, "g"), params[p]); }
      return s;
    }
    applyTranslationsToPage() {
      document.querySelectorAll("[data-translate-key], [data-translate-key-placeholder], [data-translate-key-aria-label], [data-translate-key-title]")
        .forEach((el) => {
          const k = el.dataset.translateKey;
          const pk = el.dataset.translateKeyPlaceholder;
          const ak = el.dataset.translateKeyAriaLabel;
          const tk = el.dataset.translateKeyTitle;
          const options = el.dataset.translateOptions ? JSON.parse(el.dataset.translateOptions) : {};
          if (k && el.tagName === "BUTTON") {
            const icon = el.querySelector("svg, img");
            const textSpan = el.querySelector("span:not(.nav-text)");
            if (textSpan && textSpan.dataset.translateKey === k) { textSpan.textContent = this.get(k, options); }
            else if (el.querySelector("span.nav-text") && el.querySelector("span.nav-text").dataset.translateKey === k) { el.querySelector("span.nav-text").textContent = this.get(k, options); }
            else if (!icon && !el.querySelector("span")) { el.textContent = this.get(k, options); }
            else if (el.dataset.translateKey === k && !textSpan && !el.querySelector("span.nav-text")) {
              let currentText = "";
              el.childNodes.forEach(node => { if (node.nodeType === Node.TEXT_NODE) { currentText += node.textContent.trim(); } });
              if (currentText || !icon) { el.innerHTML = (icon ? icon.outerHTML : "") + this.get(k, options); }
            }
          } else if (k) { el.textContent = this.get(k, options); }
          if (pk) el.placeholder = this.get(pk, options);
          if (ak) el.setAttribute("aria-label", this.get(ak, options));
          if (tk) el.title = this.get(tk, options);
        });
      const pte = document.querySelector("title[data-translate-key]");
      if (pte) pte.textContent = this.get(pte.dataset.translateKey);
    }
  }

  class ThemeManager {
    constructor(storageManager, dom) {
      this.storageManager = storageManager;
      this.dom = dom;
      this.systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    }
    init() {
      this.systemThemeQuery.addEventListener("change", () => this.applyTheme(true));
      this.applyTheme();
    }
    _getPreference() {
      const settings = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {});
      return settings.theme || CONFIG.DEFAULT_THEME;
    }
    _savePreference(theme) {
      const settings = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {});
      settings.theme = theme;
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, settings);
    }
    setTheme(theme) {
      this._savePreference(theme);
      this.applyTheme();
    }
    applyTheme(isSystemChange = false) {
      const preference = this._getPreference();
      let effectiveTheme = preference;
      if (preference === "system") { effectiveTheme = this.systemThemeQuery.matches ? "dark" : "light"; }
      this.dom.html.setAttribute("data-theme", effectiveTheme);
      document.dispatchEvent(new CustomEvent("themeChanged", {detail: {preference, effectiveTheme}}));
    }
  }

  class UIManager {
    constructor(languageManager, dom) {
      this.langManager = languageManager;
      this.dom = dom;
      this._resolveConfirm = null;
      this._efficiencyTargetInput = null;
      this._calculatedEfficiency = null;
      this._bindModalEvents();
      document.addEventListener("languageChanged", () => this._retranslateOpenModals());
    }
    _retranslateOpenModals() { /* ... (código existente) ... */ }
    _bindModalEvents() { /* ... (código existente) ... */ }
    _showModal(overlay) { /* ... (código existente) ... */ }
    _hideModal(overlay) { /* ... (código existente) ... */ }
    showNotification(key, type = "info", params = {}, persistent = false) { /* ... (código existente) ... */ }
    showUpdateNotification(onUpdate) { /* ... (código existente) ... */ }
    _removeNotification(n) { /* ... (código existente) ... */ }
    displayInlineError(field, message) { /* ... (código existente) ... */ }
    clearInlineError(field) { /* ... (código existente) ... */ }
    clearAllInlineErrors(formElement) { /* ... (código existente) ... */ }
    showDetailsModal(key, details) { /* ... (código existente) ... */ }
    hideDetailsModal() { this._hideModal(this.dom.detailsModalOverlay); }
    showHelpModal() { this._showModal(this.dom.helpModalOverlay); }
    hideHelpModal() { this._hideModal(this.dom.helpModalOverlay); }
    showButtonSpinner(buttonElement, originalText = null) { /* ... (código existente) ... */ }
    hideButtonSpinner(buttonElement) { /* ... (código existente) ... */ }
    showConfirm(key, titleKey = "confirmActionModalTitle", params = {}) { /* ... (código existente) ... */ }
    _handleConfirm(confirmed) { /* ... (código existente) ... */ }
    showEfficiencyHelperModal(targetInput) { /* ... (código existente) ... */ }
    hideEfficiencyHelperModal() { this._hideModal(this.dom.efficiencyHelperModalOverlay); }
    navigateTo(screenId) {
      const screens = [ "#screenHome", "#screenVehicles", "#screenReports", "#screenSettings" ];
      screens.forEach(sel => {
        const screen = this.dom.appContainer.querySelector(sel);
        if (screen) {
          screen.classList.remove("screen-active");
          screen.classList.add("screen-hidden");
        }
      });
      const targetScreen = this.dom.appContainer.querySelector(`#${screenId}`);
      if (targetScreen) {
        targetScreen.classList.remove("screen-hidden");
        targetScreen.classList.add("screen-active");
        const screenTitleElement = targetScreen.querySelector("h1[data-translate-key], h2[data-translate-key]");
        let pageTitleKey = "appTitle";
        if (screenTitleElement && screenTitleElement.dataset.translateKey) {
          pageTitleKey = screenTitleElement.dataset.translateKey + "ScreenTitle";
          if (!this.langManager.translationData[this.langManager.currentLanguage][pageTitleKey]) { pageTitleKey = screenTitleElement.dataset.translateKey; }
        } else { // Fallbacks baseados no screenId
            if (screenId === "screenHome") pageTitleKey = "homeScreenTitle";
            else if (screenId === "screenVehicles") pageTitleKey = "vehiclesScreenTitle";
            else if (screenId === "screenReports") pageTitleKey = "reportsTitle";
            else if (screenId === "screenSettings") pageTitleKey = "settingsScreenTitle";
        }
        document.title = `${this.langManager.get(pageTitleKey)} - FuelCalc`;
        const activeScreenHeaderTitle = targetScreen.querySelector('h1, h2, h3'); // Prefer h1, then h2, then h3
        if (activeScreenHeaderTitle) {
          activeScreenHeaderTitle.setAttribute('tabindex', '-1');
          activeScreenHeaderTitle.focus();
          targetScreen.scrollTop = 0;
        }
      } else { console.warn(`Screen with ID ${screenId} not found.`); }
      if (this.dom.navButtons) {
        this.dom.navButtons.forEach(button => {
          button.classList.toggle("active", button.dataset.screen === screenId);
        });
      }
      document.dispatchEvent(new CustomEvent("screenChanged", { detail: { screenId } }));
    }
  }

  class StorageManager {
    constructor(uiManager) { this.uiManager = uiManager; }
    safeGetItem(key, defaultValue = {}) { /* ... (código existente, mas remover GOALS_STORAGE_KEY se não for mais usado separadamente) ... */
        try {
        if (!this._isStorageAvailable()) return defaultValue;
        const i = localStorage.getItem(key);
        if (i === null) {
          if (key === CONFIG.STORAGE_KEYS.VEHICLES || key === CONFIG.STORAGE_KEYS.HISTORY) return [];
          return defaultValue;
        }
        return JSON.parse(i);
      } catch (e) {
        console.error(`Erro ao carregar ${key}:`, e);
        if (this.uiManager) this.uiManager.showNotification("storageLoadError", "error", { key });
        if (this._isStorageAvailable()) localStorage.removeItem(key);
        return defaultValue;
      }
    }
    safeSetItem(key, value) { /* ... (código existente) ... */ }
    _isStorageAvailable() { /* ... (código existente) ... */ }
    exportData() {
      const d = {
        app: "FuelCalc", version: CONFIG.APP_VERSION, exportDate: new Date().toISOString(),
        vehicles: this.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []),
        history: this.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []),
        settings: this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {}),
      };
      // Metas são parte dos veículos, não exportadas separadamente
      const b = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.download = `fuelcalc_backup_${CONFIG.APP_VERSION}_${new Date().toISOString().split("T")[0]}.json`;
      a.href = u; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(u);
      if (this.uiManager) this.uiManager.showNotification("exportSuccess", "success");
    }
    async importData(file) { /* ... (código existente, mas remover importação de CONFIG.GOALS_STORAGE_KEY) ... */
        if (!file || file.type !== "application/json") {
        if (this.uiManager) this.uiManager.showNotification("importErrorFile", "error");
        return false;
      }
      try {
        const fc = await file.text();
        const d = JSON.parse(fc);
        let i = false;
        if (typeof d !== "object" || d === null) {
          if (this.uiManager) this.uiManager.showNotification("importErrorFormat", "error");
          return false;
        }
        if (d.vehicles && Array.isArray(d.vehicles)) { // Veículos agora podem conter 'metaGastoMensal'
          if (this.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, d.vehicles)) i = true;
        } else if (d.vehicles && this.uiManager) this.uiManager.showNotification("importErrorVehiclesFormat", "warning");

        if (d.history && Array.isArray(d.history)) {
          if (this.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, d.history)) i = true;
        } else if (d.history && this.uiManager) this.uiManager.showNotification("importErrorHistoryFormat", "warning");

        if (d.settings && typeof d.settings === "object") {
          const cs = this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {});
          const ns = { ...cs, ...d.settings };
          if (this.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, ns)) i = true;
        }

        if (i) {
          if (this.uiManager) this.uiManager.showNotification("importSuccess", "success");
          return true;
        } else {
          if (this.uiManager) this.uiManager.showNotification("importNoValidData", "info");
          return false;
        }
      } catch (e) {
        console.error("Erro ao importar:", e);
        if (this.uiManager) this.uiManager.showNotification("importErrorProcessing", "error");
        return false;
      }
    }
    clearAllData() { /* ... (código existente, mas remover CONFIG.GOALS_STORAGE_KEY) ... */
        let c = true;
        const k = Object.values(CONFIG.STORAGE_KEYS); // GOALS_STORAGE_KEY não é mais uma chave separada
        if (!this._isStorageAvailable()) {
            if (this.uiManager) this.uiManager.showNotification("storageUnavailableError", "error");
            return false;
        }
        k.forEach((key) => {
            try { localStorage.removeItem(key); }
            catch (e) {
            console.error(`Erro ao limpar ${key}:`, e);
            if (this.uiManager) this.uiManager.showNotification("storageSaveError", "error", { key });
            c = false;
            }
        });
        return c;
    }
  }

  class Validator {
    constructor(uiManager, languageManager) { this.uiManager = uiManager; this.langManager = languageManager; }
    _validateNumericField(inputEl, fieldNameKey, rules = {}) {
      const { min = -Infinity, max = Infinity, integer = false, allowEmpty = false, emptyValue = null, maxDecimals } = rules;
      const rawValue = String(inputEl.value).trim();
      this.uiManager.clearInlineError(inputEl);
      if (allowEmpty && rawValue === "") { return { value: emptyValue, isValid: true }; }
      if (rawValue === "" && !allowEmpty) { this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}RequiredError`)); return { value: null, isValid: false };}
      const valueStr = Utils.convertCommaToPoint(rawValue);
      if (maxDecimals !== undefined && valueStr.includes('.')) {
        const decimals = valueStr.split('.')[1];
        if (decimals && decimals.length > maxDecimals) { this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}MaxDecimalsError`, { max: maxDecimals })); return { value: null, isValid: false }; }
      }
      const numValue = parseFloat(valueStr);
      if (isNaN(numValue)) { this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}NotANumberError`)); return { value: null, isValid: false }; }
      if (integer && !Number.isInteger(numValue)) { this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}NotIntegerError`)); return { value: null, isValid: false }; }
      if ((numValue < min && !(min === 0 && numValue === 0)) || numValue > max) {
        let errorParams = { min, max };
        if (fieldNameKey === "fuelPrice" || fieldNameKey === "tripGain" || fieldNameKey === "vehicleGoalAmount") {
            errorParams = { min: Utils.formatCurrency(min, this.langManager.currentLanguage, false), max: Utils.formatCurrency(max, this.langManager.currentLanguage, false) };
        } else if (fieldNameKey === "vehicleEfficiency" || fieldNameKey === "tripEfficiency") { errorParams = { min: min.toFixed(1), max: max.toFixed(1) }; }
        else if (fieldNameKey === "nextOilChangeKm") { errorParams = { min: min, max: max };  }
        this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}RangeError`, errorParams)); return { value: null, isValid: false };
      }
      return { value: numValue, isValid: true };
    }
    validateVehicle({ nameInput, fuelsData, type, form, nextOilChangeKmInput, goalAmountInput }) { /* ... (código existente com metaGastoMensal) ... */ }
    validateTrip(inputs) { /* ... (código existente) ... */ }
  }

  class InputFormatter { /* ... (código existente) ... */ }
  class VehicleManager { /* ... (código existente com metaGastoMensal em show/save) ... */ }
  class FuelCalculator { /* ... (código existente) ... */ }
  class HistoryManager { /* ... (código existente, ajustado para filtrar por vehicleId ou vehicleType) ... */ }
  class StatisticsManager { /* ... (código existente, ajustado para filtrar por vehicleId ou vehicleType e label do gráfico) ... */ }

  class GoalManager {
    constructor(storageManager, uiManager, languageManager, vehicleManager, dom) {
        this.storageManager = storageManager;
        this.uiManager = uiManager;
        this.langManager = languageManager;
        this.vehicleManager = vehicleManager;
        this.dom = dom;
    }
    init() {
        document.addEventListener("vehicleSelected", () => this.renderGoalProgressForSelectedVehicle());
        document.addEventListener("tripCalculated", () => this.renderGoalProgressForSelectedVehicle());
        document.addEventListener("vehicleDataChanged", () => this.renderGoalProgressForSelectedVehicle());
        document.addEventListener("languageChanged", () => this.renderGoalProgressForSelectedVehicle(true));
        document.addEventListener("screenChanged", (e) => {
            if (e.detail.screenId === "screenReports") { this.renderGoalProgressForSelectedVehicle(); }
            else {
                const goalProgressReportEl = document.getElementById("goalProgressReport");
                if(goalProgressReportEl) goalProgressReportEl.style.display = "none";
            }
        });
        document.addEventListener("reportViewChanged", () => this.renderGoalProgressForSelectedVehicle());
    }
    calculateProgressForVehicle(vehicle) {
        if (!vehicle || vehicle.metaGastoMensal === null || vehicle.metaGastoMensal === undefined || vehicle.metaGastoMensal <= 0) { return null; }
        const history = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []);
        const now = new Date(); const year = now.getFullYear(); const month = now.getMonth() + 1;
        const totalSpentThisMonth = history
            .filter(item => {
                const itemDate = new Date(item.dataISO);
                return item.veiculoId === vehicle.id && itemDate.getFullYear() === year && (itemDate.getMonth() + 1) === month;
            })
            .reduce((sum, item) => sum + parseFloat(item.custoTotalCombustivel), 0);
        const goalAmount = parseFloat(vehicle.metaGastoMensal);
        const percentage = goalAmount > 0 ? Math.min((totalSpentThisMonth / goalAmount) * 100, 1000) : 0;
        return { goalAmount, spentAmount: totalSpentThisMonth, percentage, isOverBudget: totalSpentThisMonth > goalAmount };
    }
    renderGoalProgressForSelectedVehicle(forceRetranslate = false) {
        const goalProgressReportEl = document.getElementById("goalProgressReport");
        const goalProgressTextEl = document.getElementById("goalProgressTextReport");
        const goalProgressBarInnerEl = document.getElementById("goalProgressBarInnerReport");
        const goalProgressPercentageEl = document.getElementById("goalProgressPercentageReport");
        const goalTitleEl = goalProgressReportEl ? goalProgressReportEl.querySelector("h4[data-translate-key='goalProgressTitle']") : null;
        if (!goalProgressReportEl || !goalProgressTextEl || !goalProgressBarInnerEl || !goalProgressPercentageEl || !goalTitleEl) { return; }
        if (forceRetranslate) { goalTitleEl.textContent = this.langManager.get("goalProgressTitle"); }
        const currentVehicle = this.vehicleManager.currentVehicle;
        const reportVehicleSelect = document.getElementById('reportVehicleSelect');
        if (document.getElementById("screenReports").classList.contains("screen-active") && currentVehicle && reportVehicleSelect && reportVehicleSelect.value === currentVehicle.id) {
            const progress = this.calculateProgressForVehicle(currentVehicle);
            if (progress && progress.goalAmount > 0) {
                goalProgressReportEl.style.display = "block";
                const lang = this.langManager.currentLanguage;
                const goalAmountFormatted = Utils.formatCurrency(progress.goalAmount, lang);
                const spentAmountFormatted = Utils.formatCurrency(progress.spentAmount, lang);
                goalProgressTextEl.innerHTML = this.langManager.get("goalProgressText", { spent: spentAmountFormatted, total: goalAmountFormatted });
                goalProgressBarInnerEl.style.width = `${Math.min(progress.percentage, 100)}%`;
                goalProgressPercentageEl.textContent = `${progress.percentage.toFixed(0)}%`;
                goalProgressBarInnerEl.classList.toggle("overbudget", progress.isOverBudget);
                if (progress.isOverBudget) { goalProgressTextEl.innerHTML += ` <span class="danger-text">(${this.langManager.get("goalOverBudgetWarning")})</span>`; }
            } else { goalProgressReportEl.style.display = "none"; }
        } else { goalProgressReportEl.style.display = "none"; }
    }
  }

  class AppManager {
    constructor(dom) {
      this.dom = dom;
      this.uiManager = new UIManager(null, this.dom);
      this.storageManager = new StorageManager(this.uiManager);
      this.languageManager = new LanguageManager(this.storageManager, this.dom);
      this.themeManager = new ThemeManager(this.storageManager, this.dom);
      this.uiManager.langManager = this.languageManager;
      this.validator = new Validator(this.uiManager, this.languageManager);
      this.inputFormatter = new InputFormatter();
      this.qrInstance = null; this.qriousLoaded = false;
      this.activeScreen = "screenHome";
      this._init();
    }
    _init() {
      this.languageManager.init();
      this.themeManager.init();
      this.inputFormatter.initialize();
      this.vehicleManager = new VehicleManager(this.storageManager, this.uiManager, this.validator, this.languageManager, this.dom);
      this.fuelCalculator = new FuelCalculator(this.storageManager, this.uiManager, this.validator, this.vehicleManager, this.languageManager, this.dom);
      this.historyManager = new HistoryManager(this.storageManager, this.uiManager, this.vehicleManager, this.languageManager, this.dom);
      this.statisticsManager = new StatisticsManager(this.storageManager, this.uiManager, this.vehicleManager, this.languageManager, this.dom);
      this.goalManager = new GoalManager(this.storageManager, this.uiManager, this.languageManager, this.vehicleManager, this.dom);
      if (this.goalManager) { this.goalManager.init(); }
      this._bindGlobalAppEvents();
      this._bindHelperEvents();
      this._bindMaintenanceEvents();
      this._bindNavigationEvents();
      this._bindSettingsScreenEvents();
      this._bindVehicleSelectors();
      this.vehicleManager.selectVehicleType(this.vehicleManager.currentVehicleType);
      this.historyManager.renderHistory();
      this.statisticsManager.updateStatistics();
      this.uiManager.navigateTo(this.activeScreen);
      this._updateMaintenanceReminders();
      this._handleViewport();
      window.addEventListener("resize", Utils.debounce(() => this._handleViewport(), CONFIG.DEBOUNCE_DELAY));
      this._hideSplashScreen();
      this._registerServiceWorker();
    }
    _populateVehicleSelectors(selectElement) { /* ... (código existente) ... */ }
    _bindVehicleSelectors() { /* ... (código existente) ... */ }
    _bindMaintenanceEvents() { /* ... (código existente) ... */ }
    _updateMaintenanceReminders(forceRetranslate = false) { /* ... (código existente) ... */ }
    _handleViewport() { /* ... (código existente) ... */ }
    _loadQrCodeGeneratorIfNeeded() { /* ... (código existente) ... */ }
    _setupDesktopNotice() { /* ... (código existente) ... */ }
    _displayAppInfo() { /* ... (código existente, buscando elementos do footer em settingsAppFooter) ... */ }
    _registerServiceWorker() { /* ... (código existente) ... */ }
    _bindGlobalAppEvents() { /* ... (código existente, com seletores para botões em settings) ... */ }
    _performClearAllData() { /* ... (código existente) ... */ }
    _hideSplashScreen() { /* ... (código existente) ... */ }
    _bindHelperEvents() { /* ... (código existente) ... */ }
    _calculateEfficiencyHelper() { /* ... (código existente) ... */ }
    _useCalculatedEfficiency() { /* ... (código existente) ... */ }
    _bindNavigationEvents() { /* ... (código existente) ... */ }
    _bindSettingsScreenEvents() { /* ... (código existente) ... */ }
  }

  try { new AppManager(DOM); }
  catch (e) {
    console.error("Erro fatal ao inicializar a aplicação:", e);
    const splash = document.getElementById("splash-screen");
    if (splash) { splash.innerHTML = `<div style="padding: 2rem; color: #ffcdd2;"><h1>Erro Crítico</h1><p>A aplicação não pôde ser iniciada. Por favor, tente recarregar a página ou limpar o cache do navegador.</p><p style="font-size: 0.8rem; margin-top: 1rem;">Erro: ${e.message}</p></div>`; }
  }
});
