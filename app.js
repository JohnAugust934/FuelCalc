// app.js - Lógica Principal do FuelCalc
// Versão: 1.7.1 (Com Helper de Eficiência)
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // ===== CONFIGURAÇÕES E CONSTANTES GLOBAIS =====
  const APP_VERSION = "1.7.0";
  const CONFIG = {
    APP_VERSION,
    STORAGE_KEYS: {
      VEHICLES: `fuelCalc_vehicles_v1.7`,
      HISTORY: `fuelCalc_history_v1.5`,
      APP_SETTINGS: `fuelCalc_settings_v1.7`,
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
    appVersionSpan: document.getElementById("appVersion"),
    currentYearSpan: document.getElementById("currentYear"),
    appContainer: document.getElementById("appContainer"),
    desktopNoticeOverlay: document.getElementById("desktop-notice-overlay"),
    qrCodeCanvas: document.getElementById("qrCodeCanvas"),
    pageUrlLink: document.getElementById("pageUrlLink"),
    helpButton: document.getElementById("helpButton"),
    exportBtn: document.getElementById("exportDataBtn"),
    importBtn: document.getElementById("importDataBtn"),
    importFileInput: document.getElementById("importFileInput"),
    clearAllDataBtn: document.getElementById("clearAllDataBtn"),
    langButtons: document.querySelectorAll(".lang-button"),
    themeButtons: document.querySelectorAll(".theme-button"),
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
    vehicleEfficiencyInput: document.getElementById("vehicleEfficiency"),
    cancelVehicleBtn: document.getElementById("cancelVehicleBtn"),
    fuelForm: document.getElementById("fuelForm"),
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
    statsSection: document.getElementById("statsSection"),
    totalKmStat: document.getElementById("totalKmStat"),
    totalGastoStat: document.getElementById("totalGastoStat"),
    mediaConsumoStat: document.getElementById("mediaConsumoStat"),
    chartCanvas: document.getElementById("fuelChartCanvas"),
    // Novos elementos do Helper de Eficiência
    efficiencyHelperBtnVehicle: document.getElementById(
      "efficiencyHelperBtnVehicle"
    ),
    efficiencyHelperBtnTrip: document.getElementById("efficiencyHelperBtnTrip"),
    efficiencyHelperModalOverlay: document.getElementById(
      "efficiencyHelperModalOverlay"
    ),
    closeEfficiencyHelperModalBtn: document.getElementById(
      "closeEfficiencyHelperModalBtn"
    ),
    helperKmDrivenInput: document.getElementById("helperKmDriven"),
    helperLitersFueledInput: document.getElementById("helperLitersFueled"),
    calculateEfficiencyHelperBtn: document.getElementById(
      "calculateEfficiencyHelperBtn"
    ),
    efficiencyHelperResult: document.getElementById("efficiencyHelperResult"),
    efficiencyResultValue: document.getElementById("efficiencyResultValue"),
    useEfficiencyValueBtn: document.getElementById("useEfficiencyValueBtn"),
  };

  // ===== INÍCIO DAS CLASSES DA APLICAÇÃO =====
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
        const l = () => {
          clearTimeout(t);
          func.apply(this, a);
        };
        clearTimeout(t);
        t = setTimeout(l, wait);
      };
    }
    static formatCurrency(v, l = CONFIG.DEFAULT_LANGUAGE) {
      const p = parseFloat(
        String(v)
          .replace(/[^\d,.-]/g, "")
          .replace(",", ".")
      );
      if (isNaN(p)) return l === "en" ? "$ --" : "R$ --";
      const c = l === "en" ? "USD" : "BRL";
      const o = l === "en" ? "en-US" : "pt-BR";
      try {
        return p.toLocaleString(o, {
          style: "currency",
          currency: c,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } catch (e) {
        return l === "en" ? "$ 0.00" : "R$ 0,00";
      }
    }
    static formatLocalDate(iso, l = CONFIG.DEFAULT_LANGUAGE) {
      if (!iso) return "--";
      const o = l === "en" ? "en-US" : "pt-BR";
      try {
        return new Date(iso).toLocaleString(o, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (e) {
        return "--";
      }
    }
  }

  class LanguageManager {
    constructor(storageManager, dom) {
      this.storageManager = storageManager;
      this.dom = dom;
      this.currentLanguage =
        this._loadLanguagePreference() || CONFIG.DEFAULT_LANGUAGE;
      this.translationData = translations;
    }
    init() {
      this._bindLanguageButtons();
      this.setLanguage(this.currentLanguage);
    }
    _loadLanguagePreference() {
      const s = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.APP_SETTINGS,
        {}
      );
      return s.language;
    }
    _saveLanguagePreference(lang) {
      const s = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.APP_SETTINGS,
        {}
      );
      s.language = lang;
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, s);
    }
    _bindLanguageButtons() {
      this.dom.langButtons.forEach((b) => {
        b.addEventListener("click", (e) =>
          this.setLanguage(e.currentTarget.dataset.lang)
        );
      });
    }
    setLanguage(lang) {
      if (this.translationData[lang]) {
        this.currentLanguage = lang;
        this._saveLanguagePreference(lang);
        this.applyTranslationsToPage();
        document.documentElement.lang = lang;
        this.dom.langButtons.forEach((b) =>
          b.setAttribute("aria-pressed", b.dataset.lang === lang)
        );
        document.dispatchEvent(
          new CustomEvent("languageChanged", { detail: { lang } })
        );
      }
    }
    get(key, params = {}) {
      const t =
        this.translationData[this.currentLanguage] ||
        this.translationData[CONFIG.DEFAULT_LANGUAGE];
      let s = t[key] || key;
      for (const p in params) {
        s = s.replace(new RegExp(`{${p}}`, "g"), params[p]);
      }
      return s;
    }
    applyTranslationsToPage() {
      document
        .querySelectorAll(
          "[data-translate-key], [data-translate-key-placeholder], [data-translate-key-aria-label], [data-translate-key-title]"
        )
        .forEach((el) => {
          const k = el.dataset.translateKey;
          const pk = el.dataset.translateKeyPlaceholder;
          const ak = el.dataset.translateKeyAriaLabel;
          const tk = el.dataset.translateKeyTitle;
          if (k && el.tagName === "BUTTON") {
            const icon = el.querySelector("svg");
            const textSpan = el.querySelector("span");
            if (textSpan) {
              textSpan.textContent = this.get(k);
            } else if (!icon) {
              el.textContent = this.get(k);
            }
          } else if (k) {
            el.textContent = this.get(k);
          }
          if (pk) el.placeholder = this.get(pk);
          if (ak) el.setAttribute("aria-label", this.get(ak));
          if (tk) el.title = this.get(tk);
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
      this.dom.themeButtons.forEach((button) => {
        button.addEventListener("click", () =>
          this.setTheme(button.dataset.themeToggle)
        );
      });
      this.systemThemeQuery.addEventListener("change", () => this.applyTheme());
      this.applyTheme();
    }
    _getPreference() {
      const settings = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.APP_SETTINGS,
        {}
      );
      return settings.theme || CONFIG.DEFAULT_THEME;
    }
    _savePreference(theme) {
      const settings = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.APP_SETTINGS,
        {}
      );
      settings.theme = theme;
      this.storageManager.safeSetItem(
        CONFIG.STORAGE_KEYS.APP_SETTINGS,
        settings
      );
    }
    setTheme(theme) {
      this._savePreference(theme);
      this.applyTheme();
    }
    applyTheme() {
      const preference = this._getPreference();
      let effectiveTheme = preference;
      if (preference === "system") {
        effectiveTheme = this.systemThemeQuery.matches ? "dark" : "light";
      }
      this.dom.html.setAttribute("data-theme", effectiveTheme);
      this.dom.themeButtons.forEach((button) => {
        button.classList.toggle(
          "active",
          button.dataset.themeToggle === preference
        );
      });
      document.dispatchEvent(new CustomEvent("themeChanged"));
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
      document.addEventListener("languageChanged", () =>
        this._retranslateOpenModals()
      );
    }
    _retranslateOpenModals() {
      const retranslate = (overlay, titleKey, titleId) => {
        if (overlay && overlay.classList.contains("active")) {
          const titleElement = overlay.querySelector(titleId);
          if (titleElement)
            titleElement.textContent = this.langManager.get(titleKey);
        }
      };
      retranslate(
        this.dom.detailsModalOverlay,
        "tripDetailsModalTitle",
        "#detailsModalTitle"
      );
      retranslate(
        this.dom.helpModalOverlay,
        "helpModalTitle",
        "#helpModalTitle"
      );
      retranslate(
        this.dom.efficiencyHelperModalOverlay,
        "efficiencyHelperModalTitle",
        "#efficiencyHelperModalTitle"
      );
      if (
        this.dom.confirmModalOverlay &&
        this.dom.confirmModalOverlay.classList.contains("active")
      ) {
        if (this.dom.confirmModalTitle)
          this.dom.confirmModalTitle.textContent = this.langManager.get(
            "confirmActionModalTitle"
          );
        if (this.dom.confirmModalCancelBtn)
          this.dom.confirmModalCancelBtn.textContent =
            this.langManager.get("cancelBtn");
        if (this.dom.confirmModalConfirmBtn)
          this.dom.confirmModalConfirmBtn.textContent =
            this.langManager.get("confirmBtn");
      }
    }
    _bindModalEvents() {
      const setupModal = (overlay, closeBtn) => {
        if (closeBtn)
          closeBtn.addEventListener("click", () => this._hideModal(overlay));
        if (overlay)
          overlay.addEventListener("click", (e) => {
            if (e.target === overlay) this._hideModal(overlay);
          });
      };
      setupModal(this.dom.detailsModalOverlay, this.dom.closeDetailsModalBtn);
      setupModal(this.dom.helpModalOverlay, this.dom.closeHelpModalBtn);
      setupModal(
        this.dom.efficiencyHelperModalOverlay,
        this.dom.closeEfficiencyHelperModalBtn
      );
      if (this.dom.confirmModalCancelBtn)
        this.dom.confirmModalCancelBtn.addEventListener("click", () =>
          this._handleConfirm(false)
        );
      if (this.dom.confirmModalConfirmBtn)
        this.dom.confirmModalConfirmBtn.addEventListener("click", () =>
          this._handleConfirm(true)
        );
      if (this.dom.confirmModalOverlay)
        this.dom.confirmModalOverlay.addEventListener("click", (e) => {
          if (e.target === this.dom.confirmModalOverlay)
            this._handleConfirm(false);
        });
    }
    _showModal(overlay) {
      if (!overlay) return;
      overlay.style.display = "flex";
      document.body.classList.add("modal-open");
      void overlay.offsetWidth;
      overlay.classList.add("active");
      const closeButton = overlay.querySelector(".modal-close-button");
      if (closeButton) closeButton.focus();
    }
    _hideModal(overlay) {
      if (!overlay || !overlay.classList.contains("active")) return;
      overlay.classList.remove("active");
      document.body.classList.remove("modal-open");
      const onTransitionEnd = () => {
        if (!overlay.classList.contains("active")) {
          overlay.style.display = "none";
        }
        overlay.removeEventListener("transitionend", onTransitionEnd);
      };
      overlay.addEventListener("transitionend", onTransitionEnd);
      setTimeout(() => {
        if (!overlay.classList.contains("active")) {
          overlay.style.display = "none";
        }
      }, 350);
    }
    showNotification(key, type = "info", params = {}, persistent = false) {
      if (!this.dom.notificationArea) return;
      const msg = this.langManager.get(key, params);
      const notificationElement = document.createElement("div");
      notificationElement.className = `notification ${type}`;
      notificationElement.setAttribute("role", "alert");
      notificationElement.setAttribute("aria-live", "assertive");

      const content = document.createElement("div");
      content.className = "notification-content";

      const messageSpan = document.createElement("span");
      messageSpan.className = "notification-message";
      messageSpan.textContent = msg;
      content.appendChild(messageSpan);
      notificationElement.appendChild(content);

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "&times;";
      closeButton.className = "notification-close";
      closeButton.setAttribute(
        "aria-label",
        this.langManager.get("closeModalAriaLabel")
      );
      closeButton.onclick = (e) => {
        e.stopPropagation();
        this._removeNotification(notificationElement);
      };
      notificationElement.appendChild(closeButton);

      this.dom.notificationArea.appendChild(notificationElement);

      requestAnimationFrame(() => {
        notificationElement.classList.add("visible");
      });

      if (!persistent) {
        const timeoutId = setTimeout(() => {
          this._removeNotification(notificationElement);
        }, CONFIG.NOTIFICATION_TIMEOUT);
        notificationElement.dataset.timeoutId = timeoutId;
      }

      return notificationElement;
    }
    showUpdateNotification(onUpdate) {
      const notificationElement = this.showNotification(
        "updateAvailable",
        "info",
        {},
        true
      );
      const contentDiv = notificationElement.querySelector(
        ".notification-content"
      );
      if (contentDiv) {
        const actions = document.createElement("div");
        actions.className = "notification-actions";
        const updateBtn = document.createElement("button");
        updateBtn.className = "btn update-btn";
        updateBtn.textContent = this.langManager.get("updateBtn");
        updateBtn.onclick = () => {
          onUpdate();
          this._removeNotification(notificationElement);
        };
        actions.appendChild(updateBtn);
        contentDiv.appendChild(actions);
      }
    }
    _removeNotification(n) {
      if (!n || !n.parentNode) return;
      if (n.dataset.timeoutId) {
        clearTimeout(Number(n.dataset.timeoutId));
      }
      n.classList.remove("visible");
      n.addEventListener(
        "transitionend",
        () => {
          if (n.parentNode) {
            n.parentNode.removeChild(n);
          }
        },
        { once: true }
      );
    }
    displayInlineError(field, message) {
      if (!field) return;
      field.classList.add("has-error");
      const errorContainer = field.nextElementSibling;
      if (
        errorContainer &&
        errorContainer.classList.contains("error-message")
      ) {
        errorContainer.textContent = message;
      }
    }
    clearInlineError(field) {
      if (!field) return;
      field.classList.remove("has-error");
      const errorContainer = field.nextElementSibling;
      if (
        errorContainer &&
        errorContainer.classList.contains("error-message")
      ) {
        errorContainer.textContent = "";
      }
    }
    clearAllInlineErrors(formElement) {
      if (!formElement) return;
      const fields = formElement.querySelectorAll("input.has-error");
      fields.forEach((field) => this.clearInlineError(field));
    }
    showDetailsModal(key, details) {
      if (!this.dom.detailsModalOverlay || !this.dom.detailsModalContent)
        return;
      const t =
        this.dom.detailsModalOverlay.querySelector("#detailsModalTitle");
      if (t) t.textContent = this.langManager.get(key);
      this.dom.detailsModalContent.innerHTML = "";
      details.forEach((d) => {
        const i = document.createElement("div");
        i.className = "modal-detail-item";
        const l = document.createElement("span");
        l.textContent = `${this.langManager.get(
          d.labelKey,
          d.labelParams || {}
        )}:`;
        const v = document.createElement("strong");
        const dv = d.isValueKey
          ? this.langManager.get(String(d.value))
          : String(d.value);
        v.innerHTML = Utils.sanitizeHTML(dv);
        i.appendChild(l);
        i.appendChild(v);
        this.dom.detailsModalContent.appendChild(i);
      });
      this._showModal(this.dom.detailsModalOverlay);
    }
    hideDetailsModal() {
      this._hideModal(this.dom.detailsModalOverlay);
    }
    showHelpModal() {
      this._showModal(this.dom.helpModalOverlay);
    }
    hideHelpModal() {
      this._hideModal(this.dom.helpModalOverlay);
    }

    // Funções para feedback de carregamento em botões
    showButtonSpinner(buttonElement, originalText = null) {
      if (!buttonElement) return;
      // Salva o texto original se não foi salvo ainda, ou se um novo foi fornecido
      if (originalText || !buttonElement.dataset.originalText) {
        buttonElement.dataset.originalText = originalText || buttonElement.innerHTML; // Salva innerHTML para manter ícones
      }
      buttonElement.classList.add("loading");
      buttonElement.disabled = true;
      // O CSS cuida de esconder o texto e mostrar o spinner
    }

    hideButtonSpinner(buttonElement) {
      if (!buttonElement) return;
      buttonElement.classList.remove("loading");
      buttonElement.disabled = false;
      // Não é necessário restaurar o texto aqui se o CSS esconde o conteúdo original
      // e o spinner é um pseudo-elemento. Se o spinner substituísse o conteúdo,
      // a restauração seria buttonElement.innerHTML = buttonElement.dataset.originalText;
    }

    showConfirm(key, titleKey = "confirmActionModalTitle", params = {}) {
      return new Promise((resolve) => {
        if (!this.dom.confirmModalOverlay) {
          resolve(window.confirm(this.langManager.get(key, params)));
          return;
        }
        this.dom.confirmModalTitle.textContent = this.langManager.get(titleKey);
        this.dom.confirmModalMessage.textContent = this.langManager.get(
          key,
          params
        );
        this._resolveConfirm = resolve;
        this._showModal(this.dom.confirmModalOverlay);
        if (this.dom.confirmModalConfirmBtn)
          this.dom.confirmModalConfirmBtn.focus();
      });
    }
    _handleConfirm(confirmed) {
      if (!this.dom.confirmModalOverlay) return;
      this._hideModal(this.dom.confirmModalOverlay);
      if (this._resolveConfirm) {
        this._resolveConfirm(confirmed);
        this._resolveConfirm = null;
      }
    }
    // Novos métodos para o Helper de Eficiência
    showEfficiencyHelperModal(targetInput) {
      if (!this.dom.efficiencyHelperModalOverlay) return;
      this._efficiencyTargetInput = targetInput;
      this._calculatedEfficiency = null;

      this.dom.helperKmDrivenInput.value = "";
      this.dom.helperLitersFueledInput.value = "";
      this.dom.efficiencyHelperResult.style.display = "none";
      this.clearInlineError(this.dom.helperKmDrivenInput);
      this.clearInlineError(this.dom.helperLitersFueledInput);

      this._showModal(this.dom.efficiencyHelperModalOverlay);
      this.dom.helperKmDrivenInput.focus();
    }
    hideEfficiencyHelperModal() {
      this._hideModal(this.dom.efficiencyHelperModalOverlay);
    }
  }

  // ... (Restante das classes sem alterações até AppManager) ...

  // (As classes StorageManager, Validator, InputFormatter, VehicleManager, FuelCalculator,
  // HistoryManager, StatisticsManager permanecem inalteradas. Cole-as aqui.)

  class StorageManager {
    constructor(uiManager) {
      this.uiManager = uiManager;
    }
    safeGetItem(key, defaultValue = {}) {
      try {
        if (!this._isStorageAvailable()) return defaultValue;
        const i = localStorage.getItem(key);
        if (i === null) {
          if (
            key === CONFIG.STORAGE_KEYS.VEHICLES ||
            key === CONFIG.STORAGE_KEYS.HISTORY
          ) {
            return [];
          }
          return defaultValue;
        }
        return JSON.parse(i);
      } catch (e) {
        console.error(`Erro ao carregar ${key}:`, e);
        if (this.uiManager)
          this.uiManager.showNotification("storageLoadError", "error", { key });
        if (this._isStorageAvailable()) localStorage.removeItem(key);
        return defaultValue;
      }
    }
    safeSetItem(key, value) {
      try {
        if (!this._isStorageAvailable()) {
          if (this.uiManager)
            this.uiManager.showNotification("storageUnavailableError", "error");
          return false;
        }
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error(`Erro ao salvar ${key}:`, e);
        const mk =
          e.name === "QuotaExceededError"
            ? "storageQuotaError"
            : "storageSaveError";
        if (this.uiManager)
          this.uiManager.showNotification(mk, "error", { key });
        return false;
      }
    }
    _isStorageAvailable() {
      let s;
      try {
        s = window.localStorage;
        const k = "__storage_test_fc__";
        s.setItem(k, k);
        s.removeItem(k);
        return true;
      } catch (e) {
        return (
          e instanceof DOMException &&
          (e.code === 22 ||
            e.code === 1014 ||
            e.name === "QuotaExceededError" ||
            e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
          s &&
          s.length !== 0
        );
      }
    }
    exportData() {
      const d = {
        app: "FuelCalc",
        version: CONFIG.APP_VERSION,
        exportDate: new Date().toISOString(),
        vehicles: this.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []),
        history: this.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []),
        settings: this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {}),
      };
      const b = new Blob([JSON.stringify(d, null, 2)], {
        type: "application/json",
      });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.download = `fuelcalc_backup_${CONFIG.APP_VERSION}_${
        new Date().toISOString().split("T")[0]
      }.json`;
      a.href = u;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(u);
      if (this.uiManager)
        this.uiManager.showNotification("exportSuccess", "success");
    }
    async importData(file) {
      if (!file || file.type !== "application/json") {
        if (this.uiManager)
          this.uiManager.showNotification("importErrorFile", "error");
        return false;
      }
      try {
        const fc = await file.text();
        const d = JSON.parse(fc);
        let i = false;
        if (typeof d !== "object" || d === null) {
          if (this.uiManager)
            this.uiManager.showNotification("importErrorFormat", "error");
          return false;
        }
        if (d.vehicles && Array.isArray(d.vehicles)) {
          if (this.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, d.vehicles))
            i = true;
        } else if (d.vehicles && this.uiManager)
          this.uiManager.showNotification(
            "importErrorVehiclesFormat",
            "warning"
          );
        if (d.history && Array.isArray(d.history)) {
          if (this.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, d.history))
            i = true;
        } else if (d.history && this.uiManager)
          this.uiManager.showNotification(
            "importErrorHistoryFormat",
            "warning"
          );
        if (d.settings && typeof d.settings === "object") {
          const cs = this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {});
          const ns = { ...cs, ...d.settings };
          if (this.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, ns)) i = true;
        }
        if (i) {
          if (this.uiManager)
            this.uiManager.showNotification("importSuccess", "success");
          return true;
        } else {
          if (this.uiManager)
            this.uiManager.showNotification("importNoValidData", "info");
          return false;
        }
      } catch (e) {
        console.error("Erro ao importar:", e);
        if (this.uiManager)
          this.uiManager.showNotification("importErrorProcessing", "error");
        return false;
      }
    }
    clearAllData() {
      let c = true;
      const k = Object.values(CONFIG.STORAGE_KEYS);
      if (!this._isStorageAvailable()) {
        if (this.uiManager)
          this.uiManager.showNotification("storageUnavailableError", "error");
        return false;
      }
      k.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Erro ao limpar ${key}:`, e);
          if (this.uiManager)
            this.uiManager.showNotification("storageSaveError", "error", {
              key,
            });
          c = false;
        }
      });
      return c;
    }
  }

  class Validator {
    constructor(uiManager, languageManager) {
      this.uiManager = uiManager;
      this.langManager = languageManager;
    }
    validateVehicle({ nameInput, efficiencyInput, type }) {
      this.uiManager.clearAllInlineErrors(nameInput.form);
      let isValid = true;
      const nome = nameInput.value.trim();
      const eficiencia = parseFloat(
        Utils.convertCommaToPoint(String(efficiencyInput.value))
      );
      if (
        nome.length < CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH ||
        nome.length > CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH
      ) {
        this.uiManager.displayInlineError(
          nameInput,
          this.langManager.get("vehicleNameLengthError", {
            min: CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH,
            max: CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH,
          })
        );
        isValid = false;
      }
      if (
        !Utils.validateNumber(
          eficiencia,
          CONFIG.VALIDATION.MIN_EFFICIENCY,
          CONFIG.VALIDATION.MAX_EFFICIENCY
        )
      ) {
        this.uiManager.displayInlineError(
          efficiencyInput,
          this.langManager.get("vehicleEfficiencyError", {
            min: CONFIG.VALIDATION.MIN_EFFICIENCY,
            max: CONFIG.VALIDATION.MAX_EFFICIENCY,
          })
        );
        isValid = false;
      }
      if (!["carro", "moto"].includes(type)) {
        console.error("Tipo de veículo inválido fornecido:", type);
        isValid = false;
      }
      return {
        isValid,
        data: isValid ? { nome, eficiencia, tipo: type } : null,
      };
    }
    validateTrip(inputs) {
      this.uiManager.clearAllInlineErrors(inputs.kmInicialInput.form);
      let isValid = true;
      const d = {};
      d.kmInicial = parseFloat(
        Utils.convertCommaToPoint(String(inputs.kmInicialInput.value))
      );
      if (
        !Utils.validateNumber(
          d.kmInicial,
          CONFIG.VALIDATION.MIN_KM,
          CONFIG.VALIDATION.MAX_KM
        )
      ) {
        this.uiManager.displayInlineError(
          inputs.kmInicialInput,
          this.langManager.get("initialKmError", {
            min: CONFIG.VALIDATION.MIN_KM,
            max: CONFIG.VALIDATION.MAX_KM,
          })
        );
        isValid = false;
      } else if (!Number.isInteger(d.kmInicial)) {
        this.uiManager.displayInlineError(
          inputs.kmInicialInput,
          this.langManager.get("initialKmNotIntegerError")
        );
        isValid = false;
      }
      d.kmFinal = parseFloat(
        Utils.convertCommaToPoint(String(inputs.kmFinalInput.value))
      );
      if (
        !isValid ||
        !Utils.validateNumber(
          d.kmFinal,
          d.kmInicial + 1,
          CONFIG.VALIDATION.MAX_KM
        )
      ) {
        if (isValid) {
          this.uiManager.displayInlineError(
            inputs.kmFinalInput,
            this.langManager.get("finalKmError", {
              max: CONFIG.VALIDATION.MAX_KM,
            })
          );
        }
        isValid = false;
      } else if (!Number.isInteger(d.kmFinal)) {
        this.uiManager.displayInlineError(
          inputs.kmFinalInput,
          this.langManager.get("finalKmNotIntegerError")
        );
        isValid = false;
      } else if (
        d.kmFinal - d.kmInicial >
        CONFIG.VALIDATION.MAX_TRIP_DISTANCE
      ) {
        this.uiManager.displayInlineError(
          inputs.kmFinalInput,
          this.langManager.get("maxTripDistanceError", {
            limit: CONFIG.VALIDATION.MAX_TRIP_DISTANCE,
          })
        );
        isValid = false;
      }
      d.kmPorLitro = parseFloat(
        Utils.convertCommaToPoint(String(inputs.kmPorLitroInput.value))
      );
      if (
        !Utils.validateNumber(
          d.kmPorLitro,
          CONFIG.VALIDATION.MIN_EFFICIENCY,
          CONFIG.VALIDATION.MAX_EFFICIENCY
        )
      ) {
        this.uiManager.displayInlineError(
          inputs.kmPorLitroInput,
          this.langManager.get("vehicleEfficiencyError", {
            min: CONFIG.VALIDATION.MIN_EFFICIENCY,
            max: CONFIG.VALIDATION.MAX_EFFICIENCY,
          })
        );
        isValid = false;
      }
      d.precoCombustivel = parseFloat(
        Utils.convertCommaToPoint(String(inputs.precoCombustivelInput.value))
      );
      if (
        !Utils.validateNumber(
          d.precoCombustivel,
          CONFIG.VALIDATION.MIN_PRICE,
          CONFIG.VALIDATION.MAX_PRICE
        )
      ) {
        this.uiManager.displayInlineError(
          inputs.precoCombustivelInput,
          this.langManager.get("fuelPriceError", {
            min: CONFIG.VALIDATION.MIN_PRICE.toFixed(2),
            max: CONFIG.VALIDATION.MAX_PRICE.toFixed(2),
          })
        );
        isValid = false;
      }
      const ganhoUberValue = inputs.ganhoUberInput.value;
      if (
        ganhoUberValue !== null &&
        ganhoUberValue !== undefined &&
        String(ganhoUberValue).trim() !== ""
      ) {
        d.ganhoUber = parseFloat(
          Utils.convertCommaToPoint(String(ganhoUberValue))
        );
        if (
          !Utils.validateNumber(d.ganhoUber, 0, CONFIG.VALIDATION.MAX_UBER_GAIN)
        ) {
          this.uiManager.displayInlineError(
            inputs.ganhoUberInput,
            this.langManager.get("tripGainError", {
              max: CONFIG.VALIDATION.MAX_UBER_GAIN.toFixed(2),
            })
          );
          isValid = false;
        }
      } else {
        d.ganhoUber = null;
      }
      return { isValid, data: isValid ? d : null };
    }
  }

  class InputFormatter {
    constructor() {
      this.decimalInputs = document.querySelectorAll(
        'input[inputmode="decimal"]'
      );
      this.integerInputs = document.querySelectorAll(
        'input[inputmode="numeric"]'
      );
    }
    initialize() {
      this.decimalInputs.forEach((i) => this._formatDecimal(i));
      this.integerInputs.forEach((i) => this._formatInteger(i));
    }
    _formatDecimal(el) {
      el.addEventListener("input", (e) => {
        let v = e.target.value;
        v = v.replace(/[^0-9.,]/g, "");
        v = v.replace(",", ".");
        const p = v.split(".");
        if (p.length > 2) v = p[0] + "." + p.slice(1).join("");
        if (e.target.value !== v) e.target.value = v;
      });
    }
    _formatInteger(el) {
      el.addEventListener("input", (e) => {
        let v = e.target.value;
        v = v.replace(/[^0-9]/g, "");
        if (e.target.value !== v) e.target.value = v;
      });
    }
  }

  class VehicleManager {
    constructor(sm, um, v, lm, dom) {
      this.storageManager = sm;
      this.uiManager = um;
      this.validator = v;
      this.langManager = lm;
      this.dom = dom;
      this.currentVehicle = null;
      this.currentVehicleType = "carro";
      this.editingVehicleId = null; // Novo estado para rastrear edição
      this._bindEvents();
      document.addEventListener("languageChanged", () => {
        this.loadAndRenderVehicles();
        // Se o formulário de veículo estiver visível quando o idioma mudar, atualiza o texto do botão
        if (this.dom.vehicleForm.style.display === 'block') {
            const submitButton = this.dom.vehicleForm.querySelector("button[type='submit']");
            const buttonTextKey = this.editingVehicleId ? "updateVehicleBtn" : "saveVehicleBtn";
            const translatedText = this.langManager.get(buttonTextKey);
            submitButton.textContent = translatedText;
            submitButton.dataset.originalText = translatedText; // Para consistência com o spinner
        }
      });
    }

    _handleVehicleListClick(event) {
      const target = event.target;
      const vehicleCard = target.closest(".vehicle-card");
      if (!vehicleCard) return;

      const vehicleId = vehicleCard.dataset.vehicleId;
      const vehicleName = vehicleCard.querySelector("h4").textContent;

      const editButton = target.closest(".edit-button");
      const deleteButton = target.closest(".delete-button");

      if (editButton) {
        event.stopPropagation();
        this.showVehicleForm(vehicleId);
      } else if (deleteButton) {
        event.stopPropagation();
        this.uiManager
          .showConfirm(
            this.langManager.get("confirmDeleteVehicle", { name: vehicleName })
          )
          .then((confirmed) => {
            if (confirmed) this.deleteVehicle(vehicleId);
          });
      } else {
        // Click no card em si (fora dos botões de ação)
        this.selectVehicle(vehicleId);
      }
    }

    _bindEvents() {
      this.dom.vehicleTypeButtons.forEach((b) =>
        b.addEventListener("click", (e) =>
          this.selectVehicleType(e.currentTarget.dataset.vehicleType)
        )
      );
      if (this.dom.addVehicleBtn)
        this.dom.addVehicleBtn.addEventListener("click", () =>
          this.showVehicleForm()
        );
      if (this.dom.vehicleForm)
        this.dom.vehicleForm.addEventListener("submit", (e) => {
          e.preventDefault();
          this.saveVehicle();
        });
      if (this.dom.cancelVehicleBtn)
        this.dom.cancelVehicleBtn.addEventListener("click", () =>
          this.hideVehicleForm()
        );
      if (this.dom.vehicleListContainer) {
        this.dom.vehicleListContainer.addEventListener(
          "click",
          this._handleVehicleListClick.bind(this)
        );
        this.dom.vehicleListContainer.addEventListener("keypress", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            const vehicleCard = e.target.closest(".vehicle-card");
            if (vehicleCard) {
              e.preventDefault();
              this._handleVehicleListClick(e);
            }
          }
        });
      }
    }
    selectVehicleType(type) {
      if (type !== "carro" && type !== "moto") return;
      this.currentVehicleType = type;
      this.dom.vehicleTypeButtons.forEach((b) => {
        b.classList.toggle("selected", b.dataset.vehicleType === type);
        b.setAttribute("aria-pressed", String(b.dataset.vehicleType === type));
      });
      this.currentVehicle = null;
      this.uiManager.clearInlineError(this.dom.kmPorLitroInput);
      this.dom.kmPorLitroInput.value = "";
      this.dom.kmPorLitroInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
      this.loadAndRenderVehicles();
      document.dispatchEvent(
        new CustomEvent("vehicleTypeChanged", { detail: { type } })
      );
    }
    loadAndRenderVehicles() {
      if (!this.dom.vehicleListContainer) return;
      const av = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.VEHICLES,
        []
      );
      const fv = av.filter((v) => v.tipo === this.currentVehicleType);
      this.dom.vehicleListContainer.innerHTML = "";
      if (fv.length === 0) {
        const vt = this.langManager.get(
          this.currentVehicleType === "carro"
            ? "vehicleTypeCar"
            : "vehicleTypeMotorcycle"
        );
        this.dom.vehicleListContainer.innerHTML = `<li class="empty-message">${this.langManager.get(
          "noVehiclesOfType",
          { type: vt.toLowerCase() }
        )}</li>`;
        return;
      }
      fv.forEach((v) =>
        this.dom.vehicleListContainer.appendChild(
          this._createVehicleCardElement(v)
        )
      );
    }
    _createVehicleCardElement(v) {
      const c = document.createElement("div");
      c.className = "vehicle-card";
      c.dataset.vehicleId = v.id;
      c.setAttribute("role", "button");
      c.setAttribute("tabindex", "0");
      const vs = Utils.sanitizeHTML(v.nome);
      c.setAttribute(
        "aria-label",
        this.langManager.get("selectVehicleAriaLabel", {
          name: vs,
          efficiency: v.eficiencia,
        })
      );
      if (this.currentVehicle && this.currentVehicle.id === v.id)
        c.classList.add("active");

      const title = document.createElement("h4");
      title.textContent = vs;

      const efficiencySpan = document.createElement("span");
      efficiencySpan.textContent = `${v.eficiencia} km/L`; // TODO: Adicionar unidade de medida da linguagem

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "card-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "action-button edit-button";
      editButton.setAttribute("aria-label", this.langManager.get("editVehicleAriaLabel", { name: vs }));
      // SVG para ícone de editar (lápis)
      editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "action-button delete-button";
      // SVG para ícone de excluir (lixeira)
      deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
      deleteButton.setAttribute("aria-label", this.langManager.get("deleteVehicleAriaLabel", { name: vs }));

      actionsDiv.appendChild(editButton);
      actionsDiv.appendChild(deleteButton);

      c.appendChild(title);
      c.appendChild(efficiencySpan);
      c.appendChild(actionsDiv);
      return c;
    }
    selectVehicle(id) {
      const av = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.VEHICLES,
        []
      );
      const v = av.find((v) => v.id === id);
      if (v) {
        this.currentVehicle = v;
        // this.dom.kmPorLitroInput.value = String(v.eficiencia).replace(".", ","); // Movido para o event listener em FuelCalculator
        // this.uiManager.clearInlineError(this.dom.kmPorLitroInput); // Também será tratado lá

        this.dom.vehicleListContainer
          .querySelectorAll(".vehicle-card")
          .forEach((c) =>
            c.classList.toggle("active", c.dataset.vehicleId === id)
          );
        this.uiManager.showNotification("vehicleSelected", "info", {
          name: Utils.sanitizeHTML(v.nome),
        });
        // Dispara um evento customizado para que FuelCalculator possa ouvir e atualizar seu estado
        document.dispatchEvent(new CustomEvent("vehicleSelected", { detail: { vehicle: v } }));
      }
    }

    // Modificar selectVehicleType e deleteVehicle para também limpar o estado de override se necessário
    selectVehicleType(type) {
      if (type !== "carro" && type !== "moto") return;
      this.currentVehicleType = type;
      this.dom.vehicleTypeButtons.forEach((b) => {
        b.classList.toggle("selected", b.dataset.vehicleType === type); // Classe 'selected' pode não existir, mas aria-pressed é mais importante
        b.setAttribute("aria-pressed", String(b.dataset.vehicleType === type));
      });
      this.currentVehicle = null; // Desseleciona veículo atual
      this.dom.kmPorLitroInput.value = ""; // Limpa o campo de eficiência
      this.uiManager.clearInlineError(this.dom.kmPorLitroInput);
      this.dom.kmPorLitroInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
      document.dispatchEvent(new CustomEvent("vehicleDeselected")); // Notifica que um veículo foi deselecionado
      this.loadAndRenderVehicles();
      document.dispatchEvent(
        new CustomEvent("vehicleTypeChanged", { detail: { type } })
      );
    }

    deleteVehicle(id) {
      let vArray = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []);
      const vehicleToDelete = vArray.find((vh) => vh.id === id);
      if (!vehicleToDelete) return;

      vArray = vArray.filter((vh) => vh.id !== id);
      if (this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vArray)) {
        this.uiManager.showNotification("vehicleDeleted", "success", {
          name: Utils.sanitizeHTML(vehicleToDelete.nome),
        });
        if (this.currentVehicle && this.currentVehicle.id === id) {
          this.currentVehicle = null;
          this.dom.kmPorLitroInput.value = "";
          document.dispatchEvent(new CustomEvent("vehicleDeselected"));
        }
        this.loadAndRenderVehicles();
        if (vArray.filter((vh) => vh.tipo === this.currentVehicleType).length === 0) {
          this.dom.kmPorLitroInput.placeholder = this.langManager.get(
            "tripEfficiencyPlaceholder"
          );
        }
      }
    }

    resetState() {
      this.currentVehicle = null;
      this.editingVehicleId = null;
      this.dom.kmPorLitroInput.value = "";
      this.dom.kmPorLitroInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
      document.dispatchEvent(new CustomEvent("vehicleDeselected"));
      this.selectVehicleType("carro"); // Isso já chama loadAndRenderVehicles
    }

    showVehicleForm(vehicleIdToEdit = null) {
      this.uiManager.clearAllInlineErrors(this.dom.vehicleForm);
      // const formTitleKey = vehicleIdToEdit ? "editVehicleTitle" : "addVehicleTitle";
      // Se você tiver um elemento de título dedicado para o formulário, descomente e use:
      // const formTitleEl = this.dom.vehicleForm.querySelector_(".form-title"); // Supondo que você adicione uma classe .form-title
      // if(formTitleEl) formTitleEl.textContent = this.langManager.get(formTitleKey);

      const submitButton = this.dom.vehicleForm.querySelector("button[type='submit']");
      let buttonTextKey = "saveVehicleBtn";

      if (vehicleIdToEdit) {
        const vehicles = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []);
        const vehicle = vehicles.find(v => v.id === vehicleIdToEdit);
        if (vehicle) {
          this.editingVehicleId = vehicleIdToEdit;
          this.dom.vehicleTypeInput.value = vehicle.tipo;
          this.dom.vehicleNameInput.value = vehicle.nome;
          this.dom.vehicleEfficiencyInput.value = String(vehicle.eficiencia).replace(".", ",");
          buttonTextKey = "updateVehicleBtn";
        } else {
          this.editingVehicleId = null;
          this.dom.vehicleTypeInput.value = this.currentVehicleType;
          this.dom.vehicleNameInput.value = "";
          this.dom.vehicleEfficiencyInput.value = "";
          // buttonTextKey já é "saveVehicleBtn"
        }
      } else {
        this.editingVehicleId = null;
        this.dom.vehicleTypeInput.value = this.currentVehicleType;
        this.dom.vehicleNameInput.value = "";
        this.dom.vehicleEfficiencyInput.value = "";
        // buttonTextKey já é "saveVehicleBtn"
      }

      const translatedText = this.langManager.get(buttonTextKey);
      submitButton.textContent = translatedText;
      submitButton.dataset.originalText = translatedText; // Atualiza para o spinner

      this.dom.vehicleForm.style.display = "block";
      this.dom.vehicleNameInput.focus();
      this.dom.vehicleForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    hideVehicleForm() {
      this.uiManager.clearAllInlineErrors(this.dom.vehicleForm);
      this.dom.vehicleForm.style.display = "none";
      this.editingVehicleId = null;
      const submitButton = this.dom.vehicleForm.querySelector("button[type='submit']");
      const saveText = this.langManager.get("saveVehicleBtn");
      submitButton.textContent = saveText;
      submitButton.dataset.originalText = saveText; // Atualiza para o spinner
    }

    saveVehicle() {
      const submitButton = this.dom.vehicleForm.querySelector("button[type='submit']");
      const originalButtonText = submitButton.innerHTML; // Salva o HTML interno para preservar ícones/SVG
      this.uiManager.showButtonSpinner(submitButton, originalButtonText);

      // Usar um pequeno timeout para permitir que o spinner renderize antes de operações síncronas pesadas
      setTimeout(() => {
        const validationInputs = {
          nameInput: this.dom.vehicleNameInput,
          efficiencyInput: this.dom.vehicleEfficiencyInput,
          type: this.dom.vehicleTypeInput.value,
        };
        const validationResult = this.validator.validateVehicle(validationInputs);

        if (!validationResult.isValid) {
          this.uiManager.hideButtonSpinner(submitButton);
          // Restaurar o texto original do botão, pois hideButtonSpinner pode não fazer isso se o CSS esconde o texto
          submitButton.innerHTML = originalButtonText;
          return;
        }

        const { nome, eficiencia, tipo } = validationResult.data;
        let vehicles = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []);
        let notificationKey = "vehicleSaved";
        let notificationParams = { name: nome };

        const existingVehicleByName = vehicles.find(
          (vh) => vh.nome.toLowerCase() === nome.toLowerCase() &&
            vh.tipo === tipo &&
            vh.id !== this.editingVehicleId
        );

        if (existingVehicleByName) {
          const vehicleTypeName = this.langManager.get(tipo === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle");
          this.uiManager.showNotification("vehicleExistsError", "error", {
            type: vehicleTypeName.toLowerCase(),
            name: nome,
          });
          this.uiManager.hideButtonSpinner(submitButton);
          submitButton.innerHTML = originalButtonText;
          return;
        }

        if (this.editingVehicleId) {
          const vehicleIndex = vehicles.findIndex(v => v.id === this.editingVehicleId);
          if (vehicleIndex > -1) {
            vehicles[vehicleIndex] = {
              ...vehicles[vehicleIndex],
              nome,
              eficiencia,
              updatedAt: new Date().toISOString(),
            };
            notificationKey = "vehicleUpdated";
          } else {
            this.editingVehicleId = null; // Erro: veículo de edição não encontrado
            this.uiManager.hideButtonSpinner(submitButton);
            submitButton.innerHTML = originalButtonText;
            // Poderia mostrar um erro aqui
            return; // Evita chamada recursiva problemática
          }
        } else {
          const newVehicle = {
            id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            nome,
            eficiencia,
            tipo,
            createdAt: new Date().toISOString(),
          };
          vehicles.push(newVehicle);
        }

        if (this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)) {
          this.uiManager.showNotification(notificationKey, "success", notificationParams);
          this.hideVehicleForm(); // Limpa o form e o estado de edição, também restaura o texto do botão
          this.loadAndRenderVehicles();

          if (this.editingVehicleId && this.currentVehicle && this.currentVehicle.id === this.editingVehicleId) {
            const updatedVehicle = vehicles.find(v => v.id === this.editingVehicleId);
            if (updatedVehicle) this.selectVehicle(updatedVehicle.id);
          } else if (!this.editingVehicleId) {
            const addedVehicle = vehicles.find(vh => vh.nome === nome && vh.tipo === tipo && !vh.updatedAt);
            if (addedVehicle && vehicles.filter(vh => vh.tipo === this.currentVehicleType).length === 1) {
              this.selectVehicle(addedVehicle.id);
            }
          }
          this.editingVehicleId = null;
        }
        this.uiManager.hideButtonSpinner(submitButton);
        // hideVehicleForm já deve ter restaurado o texto do botão ao seu estado padrão "Salvar Veículo"
        // Mas se o botão for atualizado (ex: para "Atualizar"), e a operação falhar antes de hideVehicleForm,
        // precisamos garantir que o texto correto seja restaurado.
        // A lógica em hideVehicleForm e showVehicleForm já lida com o texto do botão para "Salvar" vs "Atualizar".
        // Se a operação falha e o formulário não é escondido, o texto original (antes do spinner) deve ser restaurado.
        if (this.dom.vehicleForm.style.display === 'block') { // Se o form ainda estiver visível
            submitButton.innerHTML = this.editingVehicleId ? this.langManager.get("updateVehicleBtn") : this.langManager.get("saveVehicleBtn");
        }

      }, 50); // Timeout de 50ms para o spinner
    }
    deleteVehicle(id) {
      let v = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []);
      const vt = v.find((vh) => vh.id === id);
      if (!vt) return;
      v = v.filter((vh) => vh.id !== id);
      if (this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, v)) {
        this.uiManager.showNotification("vehicleDeleted", "success", {
          name: Utils.sanitizeHTML(vt.nome),
        });
        if (this.currentVehicle && this.currentVehicle.id === id) {
          this.currentVehicle = null;
          this.dom.kmPorLitroInput.value = "";
        }
        this.loadAndRenderVehicles();
        if (v.filter((vh) => vh.tipo === this.currentVehicleType).length === 0)
          this.dom.kmPorLitroInput.placeholder = this.langManager.get(
            "tripEfficiencyPlaceholder"
          );
      }
    }
    getCurrentVehicleName() {
      return this.currentVehicle ? this.currentVehicle.nome : null;
    }
    resetState() {
      this.currentVehicle = null;
      this.dom.kmPorLitroInput.value = "";
      this.dom.kmPorLitroInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
      this.selectVehicleType("carro");
    }
  }

  class FuelCalculator {
    constructor(sm, um, v, vm, lm, dom) {
      this.storageManager = sm;
      this.uiManager = um;
      this.validator = v;
      this.vehicleManager = vm;
      this.langManager = lm;
      this.dom = dom;
      this.selectedVehicleCache = null; // Cache para dados do veículo selecionado (nome, eficiência)
      this.dom.resetEfficiencyBtn = document.getElementById("resetEfficiencyBtn");
      this._bindEvents();

      document.addEventListener("languageChanged", () => {
        this._updateResultCardCurrency();
        this._updateResetEfficiencyButtonText();
      });

      // Ouvir evento de seleção de veículo disparado pelo VehicleManager
      document.addEventListener("vehicleSelected", (e) => {
        if (e.detail && e.detail.vehicle) {
          this.selectedVehicleCache = {
            nome: e.detail.vehicle.nome,
            eficiencia: parseFloat(e.detail.vehicle.eficiencia)
          };
          this.dom.kmPorLitroInput.value = String(this.selectedVehicleCache.eficiencia).replace(".", ",");
          this.dom.kmPorLitroInput.classList.remove("manual-override");
          this.dom.resetEfficiencyBtn.style.display = "none";
          this._updateResetEfficiencyButtonText();
          this.uiManager.clearInlineError(this.dom.kmPorLitroInput);
        }
      });

      // Ouvir se o veículo selecionado foi desmarcado (ex: excluído ou tipo de veículo mudou)
      document.addEventListener("vehicleDeselected", () => {
        this.selectedVehicleCache = null;
        // Não limpar o input kmPorLitro aqui, pois o usuário pode querer manter um valor manual.
        // Apenas garante que o botão de reset e o override sejam limpos.
        this.dom.kmPorLitroInput.classList.remove("manual-override");
        this.dom.resetEfficiencyBtn.style.display = "none";
        this._updateResetEfficiencyButtonText();
      });
    }

    _updateResetEfficiencyButtonText() {
      if (this.dom.resetEfficiencyBtn) {
        if (this.selectedVehicleCache && this.selectedVehicleCache.nome) {
          this.dom.resetEfficiencyBtn.innerHTML = this.langManager.get("resetToVehicleEfficiency", { vehicleName: `<strong>${Utils.sanitizeHTML(this.selectedVehicleCache.nome)}</strong>` });
        } else {
          this.dom.resetEfficiencyBtn.textContent = this.langManager.get("resetToVehicleEfficiencyShort");
        }
      }
    }

    _handleKmPorLitroInputChange() {
      const currentValueStr = Utils.convertCommaToPoint(this.dom.kmPorLitroInput.value);
      const currentValue = parseFloat(currentValueStr);

      if (this.selectedVehicleCache && this.selectedVehicleCache.eficiencia !== null) {
        // Verifica se o valor é número e diferente do cacheado (com tolerância para floats)
        if (!isNaN(currentValue) && Math.abs(currentValue - this.selectedVehicleCache.eficiencia) > 0.001) {
          this.dom.kmPorLitroInput.classList.add("manual-override");
          this.dom.resetEfficiencyBtn.style.display = "block";
        } else if (isNaN(currentValue) || Math.abs(currentValue - this.selectedVehicleCache.eficiencia) <= 0.001) {
          // Se igual ao do veículo ou não é um número válido (ex: apagado), remove o override.
          this.dom.kmPorLitroInput.classList.remove("manual-override");
          this.dom.resetEfficiencyBtn.style.display = "none";
          if(!isNaN(currentValue)) { // Se for um número válido igual, garante que esteja formatado corretamente
            this.dom.kmPorLitroInput.value = String(this.selectedVehicleCache.eficiencia).replace(".",",");
          }
        }
      } else {
        // Se não há veículo selecionado, não há override.
        this.dom.kmPorLitroInput.classList.remove("manual-override");
        this.dom.resetEfficiencyBtn.style.display = "none";
      }
    }

    _resetEfficiencyToVehicle() {
      if (this.selectedVehicleCache && this.selectedVehicleCache.eficiencia !== null) {
        this.dom.kmPorLitroInput.value = String(this.selectedVehicleCache.eficiencia).replace(".", ",");
        this.dom.kmPorLitroInput.classList.remove("manual-override");
        this.dom.resetEfficiencyBtn.style.display = "none";
        this.uiManager.clearInlineError(this.dom.kmPorLitroInput);
        this.dom.kmPorLitroInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
      }
    }

    _updateResultCardCurrency() {
      if (this.dom.resultCard.style.display === "block") {
        const custoText = this.dom.custoResult.textContent;
        const lucroText = this.dom.lucroResult.textContent;
        if (custoText !== this.langManager.get("currencyPlaceholder")) {
          const ct = custoText.replace(/[R$\sA-Z]/gi, "").replace(",", ".");
          if (!isNaN(parseFloat(ct)))
            this.dom.custoResult.textContent = Utils.formatCurrency(
              parseFloat(ct),
              this.langManager.currentLanguage
            );
        }
        if (
          lucroText !== this.langManager.get("currencyPlaceholder") &&
          lucroText !== "N/A"
        ) {
          const lt = lucroText.replace(/[R$\sA-Z]/gi, "").replace(",", ".");
          if (!isNaN(parseFloat(lt)))
            this.dom.lucroResult.textContent = Utils.formatCurrency(
              parseFloat(lt),
              this.langManager.currentLanguage
            );
        }
      }
    }
    _bindEvents() {
      if (this.dom.fuelForm) {
        this.dom.fuelForm.addEventListener("submit", (e) => {
          e.preventDefault();
          const submitButton = this.dom.fuelForm.querySelector("button[type='submit']");
          const originalButtonText = submitButton.innerHTML;
          this.uiManager.showButtonSpinner(submitButton, originalButtonText);
          setTimeout(() => {
            this.calculateAndDisplayTrip(submitButton, originalButtonText);
          }, 10);
        });
      }
      if (this.dom.kmPorLitroInput) {
        this.dom.kmPorLitroInput.addEventListener("input", () => this._handleKmPorLitroInputChange());
      }
      if (this.dom.resetEfficiencyBtn) {
        this.dom.resetEfficiencyBtn.addEventListener("click", () => this._resetEfficiencyToVehicle());
      }
      if (this.dom.kmInicialInput && this.dom.kmFinalInput) {
        this.dom.kmInicialInput.addEventListener("input", () => this._calculateAndDisplayLiveDistance());
        this.dom.kmFinalInput.addEventListener("input", () => this._calculateAndDisplayLiveDistance());
      }
    }

    _calculateAndDisplayLiveDistance() {
      const kmInicialVal = Utils.convertCommaToPoint(this.dom.kmInicialInput.value);
      const kmFinalVal = Utils.convertCommaToPoint(this.dom.kmFinalInput.value);

      const kmInicial = parseFloat(kmInicialVal);
      const kmFinal = parseFloat(kmFinalVal);

      const distanceInfoEl = document.getElementById("tripDistanceInfo");
      const distanceDisplayEl = document.getElementById("calculatedTripDistance");

      if (!distanceInfoEl || !distanceDisplayEl) {
        console.warn("Elementos de display de distância não encontrados no DOM.");
        return;
      }

      if (kmInicialVal === "" && kmFinalVal === "") {
        distanceInfoEl.style.display = "none";
        return;
      }

      distanceInfoEl.style.display = "block"; // Mostra o campo de info se houver qualquer input

      if (!isNaN(kmInicial) && !isNaN(kmFinal) && Number.isInteger(kmInicial) && Number.isInteger(kmFinal)) {
        if (kmFinal > kmInicial) {
          const distance = kmFinal - kmInicial;
          if (distance > CONFIG.VALIDATION.MAX_TRIP_DISTANCE) {
            distanceDisplayEl.textContent = this.langManager.get("maxTripDistanceErrorShort");
            distanceDisplayEl.style.color = 'var(--c-danger)';
          } else {
            distanceDisplayEl.textContent = `${distance} km`;
            distanceDisplayEl.style.color = ''; // Reset color
          }
        } else {
          // KM Final menor ou igual ao inicial (mas ambos são números inteiros)
          distanceDisplayEl.textContent = "-- km";
          distanceDisplayEl.style.color = 'var(--c-danger)'; // Indica um problema
        }
      } else {
        // Um ou ambos os campos não são números inteiros válidos
        distanceDisplayEl.textContent = "-- km";
        distanceDisplayEl.style.color = ''; // Reset color
      }
    }

    calculateAndDisplayTrip(submitButton, originalButtonText) {
      const validationInputs = {
        kmInicialInput: this.dom.kmInicialInput,
        kmFinalInput: this.dom.kmFinalInput,
        kmPorLitroInput: this.dom.kmPorLitroInput,
        precoCombustivelInput: this.dom.precoCombustivelInput,
        ganhoUberInput: this.dom.ganhoUberInput,
      };
      const vr = this.validator.validateTrip(validationInputs);
      if (!vr.isValid) {
        this.uiManager.hideButtonSpinner(submitButton);
        submitButton.innerHTML = originalButtonText; // Restaura texto em caso de falha de validação
        return;
      }
      const { kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber } =
        vr.data;
      const d = kmFinal - kmInicial;
      const lc = d / kmPorLitro;
      const ct = lc * precoCombustivel;
      const ll = ganhoUber !== null ? ganhoUber - ct : null;
      this.dom.distanciaResult.textContent = `${d.toFixed(1)} km`;
      this.dom.litrosResult.textContent = `${lc.toFixed(1)} L`;
      this.dom.custoResult.textContent = Utils.formatCurrency(
        ct,
        this.langManager.currentLanguage
      );
      const li = this.dom.lucroResult.closest(".result-item");
      if (ll !== null) {
        this.dom.lucroResult.textContent = Utils.formatCurrency(
          ll,
          this.langManager.currentLanguage
        );
        if (li) li.style.display = "";
      } else {
        this.dom.lucroResult.textContent = "N/A";
        if (li) li.style.display = "none";
      }
      this.dom.resultCard.style.display = "block";
      this.dom.resultCard.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      this.uiManager.hideButtonSpinner(submitButton);
      submitButton.innerHTML = originalButtonText; // Restaura o texto original após o cálculo

      this._saveTripToHistory({
        kmInicial,
        kmFinal,
        kmPorLitro,
        precoCombustivel,
        ganhoBrutoUber: ganhoUber,
        distancia: d,
        litrosConsumidos: lc,
        custoTotal: ct,
        lucroLiquido: ll,
      });
      this._clearTripForm();
      document.dispatchEvent(new CustomEvent("tripCalculated"));
    }
    _saveTripToHistory(td) {
      const h = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        []
      );
      const cv = this.vehicleManager.currentVehicle;
      const nr = {
        id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        dataISO: new Date().toISOString(),
        tipoVeiculo: this.vehicleManager.currentVehicleType,
        veiculoId: cv ? cv.id : null,
        veiculoNome: cv ? cv.nome : this.langManager.get("manualOrUnspecified"),
        kmInicial: td.kmInicial,
        kmFinal: td.kmFinal,
        distancia: td.distancia.toFixed(1),
        kmPorLitroUtilizado: td.kmPorLitro,
        litrosConsumidos: td.litrosConsumidos.toFixed(1),
        precoPorLitro: td.precoCombustivel,
        custoTotalCombustivel: td.custoTotal.toFixed(2),
        ganhoBrutoInformado:
          td.ganhoBrutoUber !== null ? td.ganhoBrutoUber.toFixed(2) : null,
        lucroLiquidoViagem:
          td.lucroLiquido !== null ? td.lucroLiquido.toFixed(2) : null,
      };
      h.unshift(nr);
      if (h.length > CONFIG.HISTORY_LIMIT) h.pop();
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, h);
    }
    _clearTripForm() {
      this.dom.kmInicialInput.value = "";
      this.dom.kmFinalInput.value = "";
      if (!this.vehicleManager.currentVehicle)
        this.dom.kmPorLitroInput.value = "";
      this.dom.precoCombustivelInput.value = "";
      this.dom.ganhoUberInput.value = "";
    }
    resetState() {
      this._clearTripForm();
      this.dom.resultCard.style.display = "none";
      if (!this.vehicleManager.currentVehicle)
        this.dom.kmPorLitroInput.value = "";
    }
  }

  class HistoryManager {
    constructor(sm, um, vm, lm, dom) {
      this.storageManager = sm;
      this.uiManager = um;
      this.vehicleManager = vm;
      this.langManager = lm;
      this.dom = dom;
      this.isFullHistoryVisible = false;
      this._bindEvents();
    }
    _handleHistoryListInteraction(event) {
      const listItem = event.target.closest("li[data-record-id]");
      if (listItem) {
        event.preventDefault();
        this._showRecordDetails(listItem.dataset.recordId);
      }
    }
    _bindEvents() {
      if (this.dom.seeMoreBtn)
        this.dom.seeMoreBtn.addEventListener("click", () =>
          this.toggleFullHistory(true)
        );
      if (this.dom.minimizeBtn)
        this.dom.minimizeBtn.addEventListener("click", () =>
          this.toggleFullHistory(false)
        );
      if (this.dom.clearHistoryBtn) {
        this.dom.clearHistoryBtn.addEventListener("click", async () => {
          const vt = this.langManager.get(
            this.vehicleManager.currentVehicleType === "carro"
              ? "vehicleTypeCar"
              : "vehicleTypeMotorcycle"
          );
          const c = await this.uiManager.showConfirm(
            this.langManager.get("confirmClearTypeHistory", {
              type: vt.toLowerCase(),
            })
          );
          if (c) this.clearHistoryForCurrentType();
        });
      }
      if (this.dom.historyList) {
        this.dom.historyList.addEventListener(
          "click",
          this._handleHistoryListInteraction.bind(this)
        );
        this.dom.historyList.addEventListener("keypress", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            this._handleHistoryListInteraction(e);
          }
        });
      }
      document.addEventListener("languageChanged", () => this.renderHistory());
      document.addEventListener("vehicleTypeChanged", () => {
        this.isFullHistoryVisible = false;
        this.renderHistory();
      });
      document.addEventListener("tripCalculated", () => this.renderHistory());
      document.addEventListener("allDataCleared", () => this.renderHistory());
    }
    toggleFullHistory(showFull) {
      this.isFullHistoryVisible = showFull;
      this.renderHistory();
    }
    renderHistory() {
      if (!this.dom.historyList || !this.dom.historySection) return;
      const ah = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        []
      );
      const fh = ah.filter(
        (i) => i.tipoVeiculo === this.vehicleManager.currentVehicleType
      );
      this.dom.historyList.innerHTML = "";
      if (fh.length === 0) {
        this.dom.historySection.style.display = "none";
        return;
      }
      this.dom.historySection.style.display = "block";
      const itr = this.isFullHistoryVisible
        ? fh
        : fh.slice(0, CONFIG.HISTORY_DISPLAY_COUNT);
      const vt = this.langManager.get(
        this.vehicleManager.currentVehicleType === "carro"
          ? "vehicleTypeCar"
          : "vehicleTypeMotorcycle"
      );
      if (itr.length === 0 && fh.length > 0)
        this.dom.historyList.innerHTML = `<li class="empty-message-list">${this.langManager.get(
          "noRecordsToDisplay"
        )}</li>`;
      else if (itr.length === 0)
        this.dom.historyList.innerHTML = `<li class="empty-message-list">${this.langManager.get(
          "noHistoryForType",
          { type: vt.toLowerCase() }
        )}</li>`;
      itr.forEach((r) =>
        this.dom.historyList.appendChild(this._createHistoryItemElement(r))
      );
      const tf = fh.length;
      if (this.dom.seeMoreBtn)
        this.dom.seeMoreBtn.style.display =
          tf > CONFIG.HISTORY_DISPLAY_COUNT && !this.isFullHistoryVisible
            ? "block"
            : "none";
      if (this.dom.minimizeBtn)
        this.dom.minimizeBtn.style.display =
          tf > CONFIG.HISTORY_DISPLAY_COUNT && this.isFullHistoryVisible
            ? "block"
            : "none";
    }
    _createHistoryItemElement(r) {
      const li = document.createElement("li");
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      const fd = Utils.formatLocalDate(
        r.dataISO,
        this.langManager.currentLanguage
      );
      li.setAttribute(
        "aria-label",
        this.langManager.get("tripDetailsAriaLabel", { date: fd })
      );
      li.dataset.recordId = r.id;

      // Usar textContent para segurança e performance em vez de innerHTML onde possível
      const dateSpan = document.createElement("span");
      dateSpan.textContent = fd;

      const summaryStrong = document.createElement("strong");
      let summaryText = `${this.langManager.get("costLabel")}: ${Utils.formatCurrency(
        parseFloat(r.custoTotalCombustivel),
        this.langManager.currentLanguage
      )}`;
      if (r.lucroLiquidoViagem !== null) {
        summaryText += ` / ${this.langManager.get(
          "profitLabel"
        )}: ${Utils.formatCurrency(
          parseFloat(r.lucroLiquidoViagem),
          this.langManager.currentLanguage
        )}`;
      }
      summaryStrong.textContent = summaryText;

      li.appendChild(dateSpan);
      li.appendChild(summaryStrong);
      return li;
    }

    renderHistory() {
      if (!this.dom.historyList || !this.dom.historySection) return;
      const ah = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        []
      );
      const fh = ah.filter(
        (i) => i.tipoVeiculo === this.vehicleManager.currentVehicleType
      );

      // Usar DocumentFragment para minimizar reflows/repaints
      const fragment = document.createDocumentFragment();

      if (fh.length === 0) {
        this.dom.historySection.style.display = "none";
        this.dom.historyList.innerHTML = ""; // Limpa a lista
        return;
      }
      this.dom.historySection.style.display = "block";
      const itr = this.isFullHistoryVisible
        ? fh
        : fh.slice(0, CONFIG.HISTORY_DISPLAY_COUNT);
      const vt = this.langManager.get(
        this.vehicleManager.currentVehicleType === "carro"
          ? "vehicleTypeCar"
          : "vehicleTypeMotorcycle"
      );

      if (itr.length === 0 && fh.length > 0) {
        const emptyMsgLi = document.createElement("li");
        emptyMsgLi.className = "empty-message-list";
        emptyMsgLi.textContent = this.langManager.get("noRecordsToDisplay");
        fragment.appendChild(emptyMsgLi);
      } else if (itr.length === 0) {
        const emptyMsgLi = document.createElement("li");
        emptyMsgLi.className = "empty-message-list";
        emptyMsgLi.textContent = this.langManager.get(
          "noHistoryForType",
          { type: vt.toLowerCase() }
        );
        fragment.appendChild(emptyMsgLi);
      } else {
        itr.forEach((r) =>
          fragment.appendChild(this._createHistoryItemElement(r))
        );
      }

      this.dom.historyList.innerHTML = ""; // Limpa a lista antes de adicionar novos itens
      this.dom.historyList.appendChild(fragment); // Adiciona todos os itens de uma vez

      const tf = fh.length;
      if (this.dom.seeMoreBtn)
        this.dom.seeMoreBtn.style.display =
          tf > CONFIG.HISTORY_DISPLAY_COUNT && !this.isFullHistoryVisible
            ? "block"
            : "none";
      if (this.dom.minimizeBtn)
        this.dom.minimizeBtn.style.display =
          tf > CONFIG.HISTORY_DISPLAY_COUNT && this.isFullHistoryVisible
            ? "block"
            : "none";
    }

    _showRecordDetails(id) {
      const ah = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        []
      );
      const r = ah.find((i) => i.id === id);
      if (!r) {
        this.uiManager.showNotification("recordNotFound", "error");
        return;
      }
      const cl = this.langManager.currentLanguage;
      const d = [
        {
          labelKey: "detailLabelDate",
          value: Utils.formatLocalDate(r.dataISO, cl),
        },
        { labelKey: "detailLabelVehicle", value: r.veiculoNome },
        {
          labelKey: "detailLabelType",
          value: this.langManager.get(
            r.tipoVeiculo === "carro"
              ? "vehicleTypeCar"
              : "vehicleTypeMotorcycle"
          ),
        },
        { labelKey: "detailLabelInitialKm", value: `${r.kmInicial} km` },
        { labelKey: "detailLabelFinalKm", value: `${r.kmFinal} km` },
        { labelKey: "detailLabelDistance", value: `${r.distancia} km` },
        {
          labelKey: "detailLabelEfficiencyUsed",
          value: `${r.kmPorLitroUtilizado} km/L`,
        },
        {
          labelKey: "detailLabelFuelConsumed",
          value: `${r.litrosConsumidos} L`,
        },
        {
          labelKey: "detailLabelPricePerLiter",
          value: Utils.formatCurrency(r.precoPorLitro, cl),
        },
        {
          labelKey: "detailLabelTotalFuelCost",
          value: Utils.formatCurrency(r.custoTotalCombustivel, cl),
        },
      ];
      if (r.ganhoBrutoInformado !== null) {
        d.push({
          labelKey: "detailLabelGrossGain",
          value: Utils.formatCurrency(r.ganhoBrutoInformado, cl),
        });
        d.push({
          labelKey: "detailLabelNetProfit",
          value: Utils.formatCurrency(r.lucroLiquidoViagem, cl),
        });
      }
      this.uiManager.showDetailsModal("tripDetailsModalTitle", d);
    }
    clearHistoryForCurrentType() {
      const ct = this.vehicleManager.currentVehicleType;
      let ah = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []);
      const rh = ah.filter((i) => i.tipoVeiculo !== ct);
      if (this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, rh)) {
        const vt = this.langManager.get(
          ct === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle"
        );
        this.uiManager.showNotification("historyClearedSuccess", "success", {
          type: vt.toLowerCase(),
        });
        this.isFullHistoryVisible = false;
        this.renderHistory();
        document.dispatchEvent(
          new CustomEvent("historyCleared", { detail: { type: ct } })
        );
      }
    }
    resetState() {
      this.isFullHistoryVisible = false;
      this.renderHistory();
    }
  }

  class StatisticsManager {
    constructor(sm, um, vm, lm, dom) {
      this.storageManager = sm;
      this.uiManager = um;
      this.vehicleManager = vm;
      this.langManager = lm;
      this.dom = dom;
      this.chartInstance = null;
      this.chartJsLoaded = false; // Flag para controlar o carregamento do Chart.js
      this.debouncedUpdate = Utils.debounce(
        () => this.updateStatistics(),
        CONFIG.DEBOUNCE_DELAY
      );
      this._bindEvents();
    }
    _bindEvents() {
      document.addEventListener("languageChanged", () =>
        this.debouncedUpdate()
      );
      document.addEventListener("vehicleTypeChanged", () =>
        this.debouncedUpdate()
      );
      document.addEventListener("tripCalculated", () => this.debouncedUpdate());
      document.addEventListener("historyCleared", () => this.debouncedUpdate());
      document.addEventListener("allDataCleared", () => this.debouncedUpdate());
      document.addEventListener("themeChanged", () => this.debouncedUpdate());
    }

    _loadChartLibraryIfNeeded() {
      return new Promise((resolve, reject) => {
        if (this.chartJsLoaded) {
          resolve();
          return;
        }
        if (typeof Chart !== "undefined") {
          this.chartJsLoaded = true;
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "libs/chart.min.js"; // Caminho local conforme estrutura do projeto
        script.onload = () => {
          this.chartJsLoaded = true;
          console.log("Chart.js carregado dinamicamente.");
          resolve();
        };
        script.onerror = () => {
          console.error("Falha ao carregar Chart.js.");
          reject();
        };
        document.body.appendChild(script);
      });
    }

    async updateStatistics() {
      if (!this.dom.statsSection) return;
      const ah = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        []
      );
      const fh = ah.filter(
        (i) => i.tipoVeiculo === this.vehicleManager.currentVehicleType
      );
      if (fh.length === 0) {
        this.dom.statsSection.style.display = "none";
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
        return;
      }
      this.dom.statsSection.style.display = "block";
      this._calculateAndDisplaySummary(fh);

      try {
        await this._loadChartLibraryIfNeeded();
        this._renderOrUpdateChart(fh);
      } catch (error) {
        this.uiManager.showNotification("genericError", "error", { message: "Falha ao carregar biblioteca de gráficos." });
        if(this.dom.chartCanvas) this.dom.chartCanvas.style.display = 'none'; // Esconde o canvas se a lib falhar
      }
    }

    _calculateAndDisplaySummary(hd) {
      const tk = hd.reduce((s, i) => s + parseFloat(i.distancia), 0);
      const tg = hd.reduce(
        (s, i) => s + parseFloat(i.custoTotalCombustivel),
        0
      );
      const tl = hd.reduce((s, i) => s + parseFloat(i.litrosConsumidos), 0);
      const mc = tl > 0 ? tk / tl : 0;
      this.dom.totalKmStat.textContent = `${tk.toFixed(1)} km`;
      this.dom.totalGastoStat.textContent = Utils.formatCurrency(
        tg,
        this.langManager.currentLanguage
      );
      this.dom.mediaConsumoStat.textContent = `${mc.toFixed(1)} km/L`;
    }
    _prepareChartData(hd) {
      const dc = {};
      const co = new Date();
      co.setDate(co.getDate() - CONFIG.CHART_MAX_DAYS);
      hd.forEach((i) => {
        const id = new Date(i.dataISO);
        if (id >= co) {
          const dk = id.toLocaleDateString(this.langManager.currentLanguage, {
            day: "2-digit",
            month: "2-digit",
          });
          dc[dk] = (dc[dk] || 0) + parseFloat(i.custoTotalCombustivel);
        }
      });
      const sd = Object.keys(dc).sort((a, b) => {
        const [da, ma] = a.split("/");
        const [db, mb] = b.split("/");
        return (
          new Date(new Date().getFullYear(), parseInt(ma) - 1, parseInt(da)) -
          new Date(new Date().getFullYear(), parseInt(mb) - 1, parseInt(db))
        );
      });
      return { labels: sd, data: sd.map((d) => dc[d].toFixed(2)) };
    }
    _renderOrUpdateChart(hd) {
      if (!this.dom.chartCanvas || typeof Chart === "undefined") return;
      const { labels, data } = this._prepareChartData(hd);
      const vt = this.langManager.get(
        this.vehicleManager.currentVehicleType === "carro"
          ? "vehicleTypeCar"
          : "vehicleTypeMotorcycle"
      );
      const cl = this.langManager.get("chartDailyExpenseLabel", { type: vt });
      const style = getComputedStyle(document.documentElement);
      const textColor = style.getPropertyValue("--c-text-primary").trim();
      const gridColor = style.getPropertyValue("--c-border").trim();
      const accentColor = style.getPropertyValue("--c-accent").trim();
      const accentBgColor = style.getPropertyValue("--c-accent-light").trim();
      const chartConfig = {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: cl,
              data: data,
              borderColor: accentColor,
              backgroundColor: accentBgColor,
              tension: 0.4,
              fill: true,
              pointBackgroundColor: accentColor,
              pointBorderColor: style
                .getPropertyValue("--c-bg-secondary")
                .trim(),
              pointRadius: 4,
              pointHoverRadius: 7,
              pointHoverBackgroundColor: style
                .getPropertyValue("--c-bg-secondary")
                .trim(),
              pointHoverBorderColor: accentColor,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { color: textColor, font: { size: 10 } },
              grid: { color: gridColor, drawBorder: false },
            },
            y: {
              ticks: {
                color: textColor,
                callback: (v) =>
                  Utils.formatCurrency(v, this.langManager.currentLanguage),
                font: { size: 10 },
              },
              grid: { color: gridColor, drawBorder: false },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: { labels: { color: textColor, font: { size: 12 } } },
            tooltip: {
              backgroundColor: style
                .getPropertyValue("--c-bg-secondary")
                .trim(),
              titleColor: textColor,
              bodyColor: textColor,
              borderColor: gridColor,
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (c) =>
                  `${c.dataset.label || ""}: ${Utils.formatCurrency(
                    c.parsed.y,
                    this.langManager.currentLanguage
                  )}`,
              },
            },
          },
          animation: { duration: 800, easing: "easeInOutQuart" },
        },
      };
      if (this.chartInstance) {
        this.chartInstance.data = chartConfig.data;
        this.chartInstance.options = chartConfig.options;
        this.chartInstance.update();
      } else {
        try {
          this.chartInstance = new Chart(
            this.dom.chartCanvas.getContext("2d"),
            chartConfig
          );
        } catch (e) {
          console.error("Erro ao criar Chart.js:", e);
          this.uiManager.showNotification("genericError", "error");
          this.chartInstance = null;
        }
      }
    }
    resetState() {
      this.updateStatistics();
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
      this.vehicleManager = new VehicleManager(
        this.storageManager,
        this.uiManager,
        this.validator,
        this.languageManager,
        this.dom
      );
      this.fuelCalculator = new FuelCalculator(
        this.storageManager,
        this.uiManager,
        this.validator,
        this.vehicleManager,
        this.languageManager,
        this.dom
      );
      this.historyManager = new HistoryManager(
        this.storageManager,
        this.uiManager,
        this.vehicleManager,
        this.languageManager,
        this.dom
      );
      this.statisticsManager = new StatisticsManager(
        this.storageManager,
        this.uiManager,
        this.vehicleManager,
        this.languageManager,
        this.dom
      );
      this.qrInstance = null;
      this.qriousLoaded = false; // Flag para controlar o carregamento do QRious
      this._init();
    }
    _init() {
      this._displayAppInfo();
      this.themeManager.init();
      this.languageManager.init();
      this.inputFormatter.initialize();
      this._bindGlobalAppEvents();
      this._bindHelperEvents();
      this._handleViewport();
      window.addEventListener(
        "resize",
        Utils.debounce(() => this._handleViewport(), CONFIG.DEBOUNCE_DELAY)
      );
      this._hideSplashScreen();
      this._registerServiceWorker();
    }
    _handleViewport() {
      const isDesktop = window.innerWidth > CONFIG.MAX_MOBILE_WIDTH;
      this.dom.body.classList.toggle("desktop-view", isDesktop);
      if (isDesktop) {
        this._loadQrCodeGeneratorIfNeeded().then(() => {
          this._setupDesktopNotice();
        });
      }
    }

    _loadQrCodeGeneratorIfNeeded() {
      return new Promise((resolve, reject) => {
        if (this.qriousLoaded) {
          resolve();
          return;
        }
        if (typeof QRious !== "undefined") {
          this.qriousLoaded = true;
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js";
        script.onload = () => {
          this.qriousLoaded = true;
          console.log("QRious carregado dinamicamente.");
          resolve();
        };
        script.onerror = () => {
          console.error("Falha ao carregar QRious.");
          if (this.dom.qrCodeCanvas) this.dom.qrCodeCanvas.style.display = "none";
          reject();
        };
        document.body.appendChild(script);
      });
    }

    _setupDesktopNotice() {
      this.languageManager.applyTranslationsToPage();
      const pageUrl = window.location.href;
      if (this.dom.pageUrlLink) {
        this.dom.pageUrlLink.href = pageUrl;
        this.dom.pageUrlLink.textContent = pageUrl;
      }

      if (this.dom.qrCodeCanvas && typeof QRious !== "undefined") {
        const fgColor = getComputedStyle(this.dom.html)
          .getPropertyValue("--c-text-primary")
          .trim();

        // Não é mais necessário forçar display: block aqui,
        // pois o CSS/comportamento padrão deve cuidar da centralização.
        // this.dom.qrCodeCanvas.style.display = 'block';

        if (!this.qrInstance) {
          this.qrInstance = new QRious({
            element: this.dom.qrCodeCanvas,
            value: pageUrl,
            size: 160,
            level: "H",
            backgroundAlpha: 0,
            foreground: fgColor,
          });
        } else {
          this.qrInstance.foreground = fgColor;
          this.qrInstance.value = pageUrl; // Atualiza o valor caso a URL mude (improvável, mas seguro)
        }
      } else {
        if (this.qriousLoaded) { // Se o script foi carregado mas QRious não está definido, é um problema
            console.warn("QRious foi carregado, mas a biblioteca não está definida globalmente ou o canvas não foi encontrado.");
        } else {
            console.warn("QRious ainda não carregado ou canvas não encontrado para _setupDesktopNotice.");
        }
        if (this.dom.qrCodeCanvas) this.dom.qrCodeCanvas.style.display = "none";
      }
    }

    _displayAppInfo() {
      if (this.dom.appVersionSpan)
        this.dom.appVersionSpan.textContent = CONFIG.APP_VERSION;
      if (this.dom.currentYearSpan)
        this.dom.currentYearSpan.textContent = new Date().getFullYear();
    }
    _registerServiceWorker() {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => {
            console.log("SW FuelCalc OK. Escopo:", reg.scope);
            reg.onupdatefound = () => {
              const installingWorker = reg.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    this.uiManager.showUpdateNotification(() => {
                      installingWorker.postMessage({ type: "SKIP_WAITING" });
                    });
                  }
                };
              }
            };
          })
          .catch((err) => console.error("Falha SW FuelCalc:", err));
        let refreshing;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            window.location.reload();
            refreshing = true;
          }
        });
      }
    }
    _bindGlobalAppEvents() {
      if (this.dom.exportBtn)
        this.dom.exportBtn.addEventListener("click", () =>
          this.storageManager.exportData()
        );
      if (this.dom.importBtn && this.dom.importFileInput) {
        this.dom.importBtn.addEventListener("click", () =>
          this.dom.importFileInput.click()
        );
        this.dom.importFileInput.addEventListener("change", async (e) => {
          const file = e.target.files[0];
          if (file) {
            const success = await this.storageManager.importData(file);
            if (success) {
              this.themeManager.applyTheme();
              const newLang =
                this.languageManager._loadLanguagePreference() ||
                CONFIG.DEFAULT_LANGUAGE;
              this.languageManager.setLanguage(newLang);
              this.vehicleManager.selectVehicleType(
                this.vehicleManager.currentVehicleType
              );
            }
            this.dom.importFileInput.value = "";
          }
        });
      }
      if (this.dom.clearAllDataBtn) {
        this.dom.clearAllDataBtn.addEventListener("click", async () => {
          const c1 = await this.uiManager.showConfirm(
            "confirmClearAllData",
            "clearAllDataBtn"
          );
          if (!c1) {
            this.uiManager.showNotification("clearAllDataCancelled", "info");
            return;
          }
          const c2 = await this.uiManager.showConfirm(
            "confirmFinalClearAllData",
            "clearAllDataBtn"
          );
          if (!c2) {
            this.uiManager.showNotification("clearAllDataCancelled", "info");
            return;
          }
          this._performClearAllData();
        });
      }
      if (this.dom.helpButton) {
        this.dom.helpButton.addEventListener("click", () =>
          this.uiManager.showHelpModal()
        );
      }
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.uiManager.hideDetailsModal();
          this.uiManager.hideHelpModal();
          this.uiManager.hideEfficiencyHelperModal();
          if (
            this.uiManager.confirmModalOverlay &&
            this.uiManager.confirmModalOverlay.classList.contains("active")
          )
            this.uiManager._handleConfirm(false);
        }
      });
    }
    _performClearAllData() {
      const success = this.storageManager.clearAllData();
      if (success) {
        this.vehicleManager.resetState();
        this.fuelCalculator.resetState();
        this.historyManager.resetState();
        this.statisticsManager.resetState();
        this.languageManager.setLanguage(CONFIG.DEFAULT_LANGUAGE);
        this.themeManager.setTheme(CONFIG.DEFAULT_THEME);
        document.dispatchEvent(new CustomEvent("allDataCleared"));
        this.uiManager.showNotification("allDataClearedSuccess", "success");
      }
    }
    _hideSplashScreen() {
      const s = document.getElementById("splash-screen");
      if (s) {
        setTimeout(() => {
          s.classList.add("hidden");
          s.addEventListener(
            "transitionend",
            () => {
              if (s.classList.contains("hidden")) {
                s.style.display = "none";
              }
            },
            { once: true }
          );
        }, 50);
      }
    }
    // Novos métodos para o Helper de Eficiência
    _bindHelperEvents() {
      if (this.dom.efficiencyHelperBtnVehicle) {
        this.dom.efficiencyHelperBtnVehicle.addEventListener("click", () => {
          this.uiManager.showEfficiencyHelperModal(
            this.dom.vehicleEfficiencyInput
          );
        });
      }
      if (this.dom.efficiencyHelperBtnTrip) {
        this.dom.efficiencyHelperBtnTrip.addEventListener("click", () => {
          this.uiManager.showEfficiencyHelperModal(this.dom.kmPorLitroInput);
        });
      }
      if (this.dom.calculateEfficiencyHelperBtn) {
        this.dom.calculateEfficiencyHelperBtn.addEventListener("click", () =>
          this._calculateEfficiencyHelper()
        );
      }
      if (this.dom.useEfficiencyValueBtn) {
        this.dom.useEfficiencyValueBtn.addEventListener("click", () =>
          this._useCalculatedEfficiency()
        );
      }
    }
    _calculateEfficiencyHelper() {
      this.uiManager.clearInlineError(this.dom.helperKmDrivenInput);
      this.uiManager.clearInlineError(this.dom.helperLitersFueledInput);

      const km = parseFloat(
        Utils.convertCommaToPoint(this.dom.helperKmDrivenInput.value)
      );
      const liters = parseFloat(
        Utils.convertCommaToPoint(this.dom.helperLitersFueledInput.value)
      );

      let isValid = true;
      if (isNaN(km) || km <= 0) {
        this.uiManager.displayInlineError(
          this.dom.helperKmDrivenInput,
          this.languageManager.get("helperInvalidInput")
        );
        isValid = false;
      }
      if (isNaN(liters) || liters <= 0) {
        this.uiManager.displayInlineError(
          this.dom.helperLitersFueledInput,
          this.languageManager.get("helperInvalidInput")
        );
        isValid = false;
      }

      if (!isValid) {
        this.dom.efficiencyHelperResult.style.display = "none";
        this.uiManager._calculatedEfficiency = null;
        return;
      }

      const efficiency = km / liters;
      this.uiManager._calculatedEfficiency = efficiency.toFixed(2);

      const lang = this.languageManager.currentLanguage;
      const formattedEfficiency =
        lang === "pt-BR"
          ? this.uiManager._calculatedEfficiency.replace(".", ",")
          : this.uiManager._calculatedEfficiency;

      this.dom.efficiencyResultValue.textContent = `${formattedEfficiency} ${
        lang === "en" ? "units" : "km/L"
      }`;
      this.dom.efficiencyHelperResult.style.display = "block";

      this.uiManager.showNotification("helperEfficiencyCalculated", "success", {
        efficiency: formattedEfficiency,
      });
    }
    _useCalculatedEfficiency() {
      if (
        this.uiManager._calculatedEfficiency &&
        this.uiManager._efficiencyTargetInput
      ) {
        const lang = this.languageManager.currentLanguage;
        const valueToInsert =
          lang === "pt-BR"
            ? this.uiManager._calculatedEfficiency.replace(".", ",")
            : this.uiManager._calculatedEfficiency;

        this.uiManager._efficiencyTargetInput.value = valueToInsert;
        this.uiManager._efficiencyTargetInput.dispatchEvent(new Event("input"));
        this.uiManager.hideEfficiencyHelperModal();
      }
    }
  }

  // Inicia a aplicação.
  try {
    new AppManager(DOM);
  } catch (e) {
    console.error("Erro fatal ao inicializar a aplicação:", e);
    const splash = document.getElementById("splash-screen");
    if (splash) {
      splash.innerHTML = `<div style="padding: 2rem; color: #ffcdd2;"><h1>Erro Crítico</h1><p>A aplicação não pôde ser iniciada. Por favor, tente recarregar a página ou limpar o cache do navegador.</p><p style="font-size: 0.8rem; margin-top: 1rem;">Erro: ${e.message}</p></div>`;
    }
  }
});
