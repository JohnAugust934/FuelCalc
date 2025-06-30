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
    },
    HISTORY_DISPLAY_COUNT: 3,
    HISTORY_LIMIT: 50,
    DEBOUNCE_DELAY: 150,
    NOTIFICATION_TIMEOUT: 4000,
    CHART_MAX_DAYS: 30,
    GOALS_STORAGE_KEY: `fuelCalc_goals_v1.0.0`, // Chave para metas
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
    vehicleEfficiencyGasolineInput: document.getElementById("vehicleEfficiencyGasoline"),
    vehicleEfficiencyAlcoholInput: document.getElementById("vehicleEfficiencyAlcohol"),
    fuelInputGroupContainer: document.getElementById("fuelInputGroupContainer"),
    efficiencyHelperBtnVehicleGasoline: document.getElementById("efficiencyHelperBtnVehicleGasoline"), // Novo
    efficiencyHelperBtnVehicleAlcohol: document.getElementById("efficiencyHelperBtnVehicleAlcohol"), // Novo
    cancelVehicleBtn: document.getElementById("cancelVehicleBtn"),
    fuelForm: document.getElementById("fuelForm"),
    tripFuelTypeGroup: document.getElementById("tripFuelTypeGroup"), // Novo para FuelCalculator
    tripFuelTypeSelect: document.getElementById("tripFuelTypeSelect"), // Novo para FuelCalculator
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
    exportHistoryCsvBtn: document.getElementById("exportHistoryCsvBtn"), // Novo
    statsSection: document.getElementById("statsSection"),
    totalKmStat: document.getElementById("totalKmStat"),
    totalGastoStat: document.getElementById("totalGastoStat"),
    exportStatsCsvBtn: document.getElementById("exportStatsCsvBtn"), // Novo
    mediaConsumoStat: document.getElementById("mediaConsumoStat"),
    chartCanvas: document.getElementById("fuelChartCanvas"),
    // Novos elementos do Helper de Eficiência
    efficiencyHelperBtnVehicle: document.getElementById( // Este ID não existe mais diretamente, foi substituído
      "efficiencyHelperBtnVehicle"
    ),
    // Os helpers de eficiência agora são específicos por combustível no formulário de veículo
    // efficiencyHelperBtnVehicleGasoline e efficiencyHelperBtnVehicleAlcohol já foram adicionados.
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

    // Elementos para Metas de Gastos
    goalSection: document.getElementById("goalSection"),
    goalForm: document.getElementById("goalForm"),
    goalAmountInput: document.getElementById("goalAmountInput"),
    setGoalBtn: document.getElementById("setGoalBtn"),
    deleteGoalBtn: document.getElementById("deleteGoalBtn"),
    currentGoalDisplay: document.getElementById("currentGoalDisplay"),
    goalProgressText: document.getElementById("goalProgressText"),
    goalProgressBar: document.getElementById("goalProgressBar"),
    goalProgressBarInner: document.getElementById("goalProgressBarInner"),
    goalProgressPercentage: document.getElementById("goalProgressPercentage"),

    // Elementos para Lembretes de Manutenção (Simplificado)
    vehicleNextOilChangeKmInput: document.getElementById("vehicleNextOilChangeKm"),
    maintenanceReminderSection: document.getElementById("maintenanceReminderSection"),
    oilChangeReminderCard: document.getElementById("oilChangeReminderCard"),
    oilChangeReminderText: document.getElementById("oilChangeReminderText"),
    noActiveMaintenanceReminder: document.getElementById("noActiveMaintenanceReminder"),

    // Elementos de Navegação e Telas
    mainContentWrapper: document.getElementById("mainContentWrapper"),
    bottomNav: document.querySelector(".bottom-nav"),
    navButtons: document.querySelectorAll(".nav-button"), // Usado no AppManager para binding inicial
    // As telas individuais são referenciadas pelo UIManager e não precisam estar no DOM global aqui,
    // pois o UIManager pode obtê-las por ID quando necessário.
    // screenHome: document.getElementById("screenHome"), // Removido do DOM global
    // screenVehicles: document.getElementById("screenVehicles"), // Removido do DOM global
    // screenReports: document.getElementById("screenReports"), // Removido do DOM global
    // screenSettings: document.getElementById("screenSettings"), // Removido do DOM global

    // Elementos específicos da tela de Configurações (já que o header foi simplificado)
    settingsLanguageSwitcher: document.querySelector("#screenSettings .language-switcher"),
    settingsThemeSwitcher: document.querySelector("#screenSettings .theme-switcher"),
    settingsHelpButton: document.querySelector("#screenSettings #helpButton"), // Precisa de ID único ou seletor mais específico se houver outros
    settingsAppFooter: document.querySelector("#screenSettings .app-footer"),
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

    static jsonToCsv(jsonData, fileName = "export.csv") {
      if (!jsonData || jsonData.length === 0) {
        console.warn("Nenhum dado fornecido para exportação CSV.");
        // Considerar mostrar uma notificação ao usuário aqui através do UIManager, se ele for acessível.
        return;
      }

      const keys = Object.keys(jsonData[0]);
      const csvRows = [keys.join(",")]; // Cabeçalho CSV

      jsonData.forEach(row => {
        const values = keys.map(key => {
          let cellValue = row[key] === null || row[key] === undefined ? "" : String(row[key]);
          // Escapar aspas duplas dentro dos valores
          cellValue = cellValue.replace(/"/g, '""');
          // Se o valor contiver vírgula, aspas duplas ou quebra de linha, envolvê-lo em aspas duplas
          if (/[",\n]/.test(cellValue)) {
            cellValue = `"${cellValue}"`;
          }
          return cellValue;
        });
        csvRows.push(values.join(","));
      });

      const csvString = csvRows.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        // Fallback para IE ou navegadores antigos (pode não funcionar bem com nomes de arquivo ou forçar download)
        // Considerar notificar o usuário que o download direto não é suportado.
        navigator.msSaveBlob(blob, fileName);
      }
    }
  }

  class LanguageManager {
    constructor(storageManager, dom) {
      this.storageManager = storageManager;
      this.dom = dom; // DOM global
      this.currentLanguage =
        this._loadLanguagePreference() || CONFIG.DEFAULT_LANGUAGE;
      this.translationData = translations;
    }
    init() {
      // Os botões de idioma agora estão apenas na tela de configurações.
      // O binding será feito pelo AppManager ou por um método específico chamado por ele.
      // Este init pode ser usado para definir o idioma inicial e aplicar traduções.
      this.setLanguage(this.currentLanguage, true); // true para forçar a tradução inicial
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
    // _bindLanguageButtons() agora é tratado pelo AppManager/_bindSettingsScreenEvents
    // para os botões específicos da tela de configurações.

    setLanguage(lang, isInitialCall = false) {
      if (this.translationData[lang]) {
        this.currentLanguage = lang;
        this._saveLanguagePreference(lang);
        this.applyTranslationsToPage();
        document.documentElement.lang = lang;

        // Atualiza botões de idioma na tela de configurações (se eles existirem)
        // Este é um ponto de acoplamento, mas necessário se o LanguageManager for responsável por isso.
        // Uma alternativa seria o AppManager ouvir 'languageChanged' e atualizar os botões.
        // Por enquanto, vamos deixar o AppManager cuidar disso no _bindSettingsScreenEvents e no listener de 'languageChanged'.

        // if (this.dom.settingsLanguageSwitcher) { // Verifica se o elemento existe
        //     const settingsLangButtons = this.dom.settingsLanguageSwitcher.querySelectorAll(".lang-button");
        //     settingsLangButtons.forEach((b) =>
        //         b.setAttribute("aria-pressed", b.dataset.lang === lang)
        //     );
        // }

        if (!isInitialCall) { // Evita dispatch duplo na inicialização
            document.dispatchEvent(
              new CustomEvent("languageChanged", { detail: { lang } })
            );
        }
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
      this.dom = dom; // DOM Global
      this.systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    }
    init() {
      // Os botões de tema agora estão apenas na tela de configurações.
      // O binding será feito pelo AppManager ou por um método específico.
      // Este init pode ser usado para aplicar o tema inicial e adicionar o listener do sistema.
      this.systemThemeQuery.addEventListener("change", () => this.applyTheme(true)); // true para indicar que é uma mudança de sistema
      this.systemThemeQuery.addEventListener("change", () => this.applyTheme(true)); // true para indicar que é uma mudança de sistema
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
      this.applyTheme(); // applyTheme agora pode lidar com a atualização dos botões via evento
    }
    applyTheme(isSystemChange = false) {
      const preference = this._getPreference();
      let effectiveTheme = preference;

      if (preference === "system") {
        effectiveTheme = this.systemThemeQuery.matches ? "dark" : "light";
      }

      this.dom.html.setAttribute("data-theme", effectiveTheme);

      // Atualiza os botões de tema na tela de configurações
      // O AppManager ouvirá 'themeChanged' e atualizará os botões.
      // if (this.dom.settingsThemeSwitcher) { // Verifica se o elemento existe
      //   const settingsThemeButtons = this.dom.settingsThemeSwitcher.querySelectorAll(".theme-button");
      //   settingsThemeButtons.forEach((button) => {
      //       button.classList.toggle(
      //           "active",
      //           button.dataset.themeToggle === preference
      //       );
      //   });
      // }

      // Dispara o evento apenas se não for uma mudança de tema do sistema que já vai ser ouvida
      // ou se for uma chamada direta a applyTheme (ex: no init).
      // A lógica de atualização dos botões na tela de settings será feita pelo AppManager ouvindo este evento.
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

    navigateTo(screenId) {
      const screens = [
        this.dom.appContainer.querySelector("#screenHome"),
        this.dom.appContainer.querySelector("#screenVehicles"),
        this.dom.appContainer.querySelector("#screenReports"),
        this.dom.appContainer.querySelector("#screenSettings")
      ];

      screens.forEach(screen => {
        if (screen) {
          screen.classList.remove("screen-active");
          screen.classList.add("screen-hidden");
        }
      });

      const targetScreen = this.dom.appContainer.querySelector(`#${screenId}`);
      if (targetScreen) {
        targetScreen.classList.remove("screen-hidden");
        targetScreen.classList.add("screen-active");

        // Atualiza o título da página (opcional, mas bom para UX)
        // const screenTitleElement = targetScreen.querySelector("h1[data-translate-key], h2[data-translate-key]");
        // if (screenTitleElement && screenTitleElement.dataset.translateKey) {
        //    document.title = `${this.langManager.get(screenTitleElement.dataset.translateKey)} - FuelCalc`;
        // } else {
        //    document.title = this.langManager.get("appTitle");
        // }

      } else {
        console.warn(`Screen with ID ${screenId} not found.`);
      }

      // Atualiza o botão ativo na navegação (DOM.navButtons é definido no AppManager)
       if (this.dom.navButtons) {
            this.dom.navButtons.forEach(button => {
                button.classList.toggle("active", button.dataset.screen === screenId);
            });
        }


      // Foca no título da nova tela para acessibilidade
      const activeScreenTitle = targetScreen ? targetScreen.querySelector('h1, h2, h3') : null;
      if (activeScreenTitle) {
        activeScreenTitle.setAttribute('tabindex', '-1');
        activeScreenTitle.focus();
         // Rola para o topo da nova tela, especialmente útil se as telas forem longas
        targetScreen.scrollTop = 0;
      }

      document.dispatchEvent(new CustomEvent("screenChanged", { detail: { screenId } }));
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

    /**
     * Valida um campo numérico.
     * @param {HTMLInputElement} inputEl - O elemento do input.
     * @param {string} fieldNameKey - Chave base para mensagens de erro (ex: "initialKm", "fuelPrice").
     * @param {object} rules - Regras de validação.
     * @param {number} [rules.min=-Infinity] - Valor mínimo.
     * @param {number} [rules.max=Infinity] - Valor máximo.
     * @param {boolean} [rules.integer=false] - Se deve ser um inteiro.
     * @param {boolean} [rules.allowEmpty=false] - Se um valor vazio é permitido.
     * @param {any} [rules.emptyValue=null] - Valor a retornar se vazio e permitido.
     * @param {number} [rules.maxDecimals] - Número máximo de casas decimais.
     * @returns {{value: number|null, isValid: boolean}}
     */
    _validateNumericField(inputEl, fieldNameKey, rules = {}) {
      const { min = -Infinity, max = Infinity, integer = false, allowEmpty = false, emptyValue = null, maxDecimals } = rules;
      const rawValue = String(inputEl.value).trim();

      if (allowEmpty && rawValue === "") {
        this.uiManager.clearInlineError(inputEl);
        return { value: emptyValue, isValid: true };
      }

      const valueStr = Utils.convertCommaToPoint(rawValue);
      if (maxDecimals !== undefined && valueStr.includes('.')) {
        const decimals = valueStr.split('.')[1];
        if (decimals && decimals.length > maxDecimals) {
          this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}MaxDecimalsError`, { max: maxDecimals }));
          return { value: null, isValid: false };
        }
      }

      const numValue = parseFloat(valueStr);

      if (isNaN(numValue)) {
        this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}NotANumberError`));
        return { value: null, isValid: false };
      }
      if (integer && !Number.isInteger(numValue)) {
        this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}NotIntegerError`));
        return { value: null, isValid: false };
      }
      // Permitir que o campo seja zero se min for zero (ex: kmUltimaRealizacao)
      if ((numValue < min && !(min === 0 && numValue === 0)) || numValue > max) {
        let errorParams = { min, max };
        if (fieldNameKey === "fuelPrice" || fieldNameKey === "tripGain" || fieldNameKey === "goalAmount") {
            errorParams = { min: min.toFixed(2), max: max.toFixed(2) };
        } else if (fieldNameKey === "vehicleEfficiency" || fieldNameKey === "tripEfficiency") {
            errorParams = { min: min.toFixed(1), max: max.toFixed(1) };
        } else if (fieldNameKey === "nextOilChangeKm") {
             errorParams = { min: min, max: max }; // Inteiros
        }
        this.uiManager.displayInlineError(inputEl, this.langManager.get(`${fieldNameKey}RangeError`, errorParams));
        return { value: null, isValid: false };
      }

      this.uiManager.clearInlineError(inputEl);
      return { value: numValue, isValid: true };
    }

    validateVehicle({ nameInput, fuelsData, type, form, nextOilChangeKmInput }) {
      this.uiManager.clearAllInlineErrors(form);
      let overallIsValid = true;
      const validatedFuels = [];
      let validatedNextOilChangeKm = null;

      // Validação do nome
      const nome = nameInput.value.trim();
      if (nome.length < CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH || nome.length > CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH) {
        this.uiManager.displayInlineError(
          nameInput,
          this.langManager.get("vehicleNameLengthError", {
            min: CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH,
            max: CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH,
          })
        );
        overallIsValid = false;
      }

      // Validação dos combustíveis
      if (!fuelsData || fuelsData.length === 0) {
        // Se o sistema exigir pelo menos um combustível, adicione erro aqui.
        // Por agora, vamos permitir veículos sem combustíveis, embora não seja prático.
        // Considerar um erro se nenhum combustível for fornecido e for obrigatório.
        // this.uiManager.showNotification("vehicleNoFuelsError", "error");
        // overallIsValid = false;
        // Para este exemplo, vamos exigir pelo menos um combustível.
        this.uiManager.showNotification("atLeastOneFuelError", "error");
        overallIsValid = false;

      } else {
        fuelsData.forEach((fuel, index) => {
          let fuelIsValid = true;
          const fuelName = fuel.name.trim();
          // Supondo que os inputs de eficiência dos combustíveis tenham um ID ou classe que permita selecioná-los
          // Para simplificar, vamos assumir que `fuel.efficiencyInput` é o elemento input HTML
          const efficiencyInput = fuel.efficiencyInput; // Este é um placeholder, precisará ser ajustado

          if (!fuelName) {
            // Poderia tentar encontrar o input do nome do combustível para mostrar o erro nele
            this.uiManager.showNotification("fuelNameRequiredError", "error", { index: index + 1 });
            fuelIsValid = false;
            overallIsValid = false;
          }

          const eficienciaStr = Utils.convertCommaToPoint(fuel.efficiency.trim());
          const eficienciaValue = parseFloat(eficienciaStr);

          if (!Utils.validateNumber(eficienciaValue, CONFIG.VALIDATION.MIN_EFFICIENCY, CONFIG.VALIDATION.MAX_EFFICIENCY)) {
            if (efficiencyInput) { // Se tivermos o input associado
              this.uiManager.displayInlineError(
                efficiencyInput,
                this.langManager.get("vehicleEfficiencyError", {
                  min: CONFIG.VALIDATION.MIN_EFFICIENCY,
                  max: CONFIG.VALIDATION.MAX_EFFICIENCY,
                })
              );
            } else { // Notificação genérica se o input não estiver acessível
              this.uiManager.showNotification("fuelEfficiencyError", "error", { name: fuelName || `Combustível ${index + 1}` });
            }
            fuelIsValid = false;
            overallIsValid = false;
          }

          if (fuelIsValid) {
            validatedFuels.push({ nome: fuelName, eficiencia: eficienciaValue });
          }
        });

        if (overallIsValid && validatedFuels.length === 0) {
            this.uiManager.showNotification("atLeastOneValidFuelError", "error");
            overallIsValid = false;
        }
      }

      // Validação do tipo
      if (!["carro", "moto"].includes(type)) {
        console.error("Tipo de veículo inválido fornecido:", type);
        overallIsValid = false;
      }

      // Validação do KM da próxima troca de óleo
      if (nextOilChangeKmInput && nextOilChangeKmInput.value.trim() !== "") {
        const oilChangeValidation = this._validateNumericField(
          nextOilChangeKmInput,
          "nextOilChangeKm",
          { min: 0, max: CONFIG.VALIDATION.MAX_KM, integer: true, allowEmpty: true, emptyValue: null }
        );
        if (!oilChangeValidation.isValid) {
          overallIsValid = false;
        } else {
          validatedNextOilChangeKm = oilChangeValidation.value;
        }
      }


      return {
        isValid: overallIsValid,
        data: overallIsValid ? { nome, combustiveis: validatedFuels, tipo: type, proximoKmTrocaOleo: validatedNextOilChangeKm } : null,
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
        if (this.dom.vehicleForm.style.display === 'block') {
            const submitButton = this.dom.vehicleForm.querySelector("button[type='submit']");
            const buttonTextKey = this.editingVehicleId ? "updateVehicleBtn" : "saveVehicleBtn";
            const translatedText = this.langManager.get(buttonTextKey);
            submitButton.textContent = translatedText;
            submitButton.dataset.originalText = translatedText;
            this._updateFuelFieldTranslations();
        }
      });
    }

    _updateFuelFieldTranslations() {
        // Certifique-se de que DOM.vehicleEfficiencyGasolineInput e DOM.vehicleEfficiencyAlcoholInput estão definidos
        // ou use document.getElementById dentro desta função se eles não estiverem sempre no DOM global.
        const fuelFields = [
            { input: this.dom.vehicleEfficiencyGasolineInput, nameKey: "fuelTypeGasoline", labelKeySuffix: "Gasoline" },
            { input: this.dom.vehicleEfficiencyAlcoholInput, nameKey: "fuelTypeAlcohol", labelKeySuffix: "Alcohol" }
        ];

        fuelFields.forEach(field => {
            if (field.input) {
                const group = field.input.closest('.fuel-input-group') || field.input.closest('.input-group');
                if (group) {
                    const label = group.querySelector('label');
                    const helperButton = group.querySelector('.input-helper-btn');

                    if (label) {
                        label.textContent = this.langManager.get("vehicleEfficiencyLabelForFuel", { fuel: this.langManager.get(field.nameKey) });
                    }
                    field.input.placeholder = this.langManager.get("vehicleEfficiencyPlaceholder");
                    if (helperButton) {
                        helperButton.textContent = this.langManager.get("efficiencyHelperLabel");
                        // Atualizar aria-label do helper se necessário
                         const ariaLabelKey = field.input.id === "vehicleEfficiencyGasoline" ? "efficiencyHelperLabelAriaGasoline" : "efficiencyHelperLabelAriaAlcohol";
                         helperButton.setAttribute("aria-label", this.langManager.get(ariaLabelKey, {fuel: this.langManager.get(field.nameKey)}));
                    }
                }
            }
        });
    }

    _handleVehicleListClick(event) {
      const target = event.target;
      const vehicleCard = target.closest(".vehicle-card");
      if (!vehicleCard) return;

      const vehicleId = vehicleCard.dataset.vehicleId;
      // Tenta pegar o nome de um atributo de dados para evitar problemas se o h4 for alterado
      const vehicleName = vehicleCard.dataset.vehicleName || vehicleCard.querySelector("h4")?.textContent || this.langManager.get("thisVehicle");


      const editButton = target.closest(".edit-button");
      const deleteButton = target.closest(".delete-button");

      if (editButton) {
        event.stopPropagation();
        this.showVehicleForm(vehicleId);
      } else if (deleteButton) {
        event.stopPropagation();
        this.uiManager
          .showConfirm(
            this.langManager.get("confirmDeleteVehicle", { name: Utils.sanitizeHTML(vehicleName) })
          )
          .then((confirmed) => {
            if (confirmed) this.deleteVehicle(vehicleId);
          });
      } else {
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
      // A responsabilidade de limpar/atualizar kmPorLitroInput agora é do FuelCalculator
      // com base no evento 'vehicleDeselected' ou 'vehicleSelected'.
      document.dispatchEvent(new CustomEvent("vehicleDeselected"));
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
      c.dataset.vehicleName = v.nome; // Guardar nome para confirmação de exclusão
      c.setAttribute("role", "button");
      c.setAttribute("tabindex", "0");
      const vs = Utils.sanitizeHTML(v.nome);

      let displayEfficiency = this.langManager.get("notApplicableAbbreviation");
      let hoverText = "";

      if (v.combustiveis && v.combustiveis.length > 0) {
        const primaryFuel = v.combustiveis[0];
        displayEfficiency = `${primaryFuel.eficiencia} km/L (${Utils.sanitizeHTML(primaryFuel.nome)})`;
        if (v.combustiveis.length > 1) {
          displayEfficiency += ` / ...`; // Indica que há mais
          hoverText = v.combustiveis.map(f => `${Utils.sanitizeHTML(f.nome)}: ${f.eficiencia} km/L`).join('\n');
        } else {
          hoverText = `${Utils.sanitizeHTML(primaryFuel.nome)}: ${primaryFuel.eficiencia} km/L`;
        }
      } else if (v.eficiencia) { // Fallback para estrutura antiga (deve ser removido após migração)
        displayEfficiency = `${v.eficiencia} km/L`;
        hoverText = displayEfficiency;
      }

      c.setAttribute(
        "aria-label",
        this.langManager.get("selectVehicleAriaLabel", {
          name: vs,
          efficiency: hoverText || displayEfficiency,
        })
      );
      if (hoverText) {
        c.title = hoverText;
      }

      if (this.currentVehicle && this.currentVehicle.id === v.id)
        c.classList.add("active");

      const title = document.createElement("h4");
      title.textContent = vs;

      const efficiencySpan = document.createElement("span");
      efficiencySpan.className = 'vehicle-card-efficiency';
      efficiencySpan.textContent = displayEfficiency;

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "card-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "action-button edit-button";
      editButton.setAttribute("aria-label", this.langManager.get("editVehicleAriaLabel", { name: vs }));
      editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "action-button delete-button";
      deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
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
        this.currentVehicle = v; // Agora v pode ter v.combustiveis
        this.dom.vehicleListContainer
          .querySelectorAll(".vehicle-card")
          .forEach((c) =>
            c.classList.toggle("active", c.dataset.vehicleId === id)
          );
        this.uiManager.showNotification("vehicleSelected", "info", {
          name: Utils.sanitizeHTML(v.nome),
        });
        document.dispatchEvent(new CustomEvent("vehicleSelected", { detail: { vehicle: v } }));
      }
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
          document.dispatchEvent(new CustomEvent("vehicleDeselected"));
        }
        this.loadAndRenderVehicles();
        // A lógica de placeholder do kmPorLitroInput é agora tratada pelo FuelCalculator
      }
    }

    resetState() {
      this.currentVehicle = null;
      this.editingVehicleId = null;
      // this.dom.kmPorLitroInput.value = ""; // Tratado por FuelCalculator
      // this.dom.kmPorLitroInput.placeholder = this.langManager.get("tripEfficiencyPlaceholder"); // Tratado por FuelCalculator
      document.dispatchEvent(new CustomEvent("vehicleDeselected"));
      this.selectVehicleType("carro"); // Isso já chama loadAndRenderVehicles
    }

    showVehicleForm(vehicleIdToEdit = null) {
      this.uiManager.clearAllInlineErrors(this.dom.vehicleForm);
      const submitButton = this.dom.vehicleForm.querySelector("button[type='submit']");
      let buttonTextKey = "saveVehicleBtn";

      // Limpar campos
      if (this.dom.vehicleEfficiencyGasolineInput) this.dom.vehicleEfficiencyGasolineInput.value = "";
      if (this.dom.vehicleEfficiencyAlcoholInput) this.dom.vehicleEfficiencyAlcoholInput.value = "";
      if (this.dom.vehicleNextOilChangeKmInput) this.dom.vehicleNextOilChangeKmInput.value = "";


      if (vehicleIdToEdit) {
        const vehicles = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []);
        const vehicle = vehicles.find(v => v.id === vehicleIdToEdit);
        if (vehicle) {
          this.editingVehicleId = vehicleIdToEdit;
          this.dom.vehicleTypeInput.value = vehicle.tipo;
          this.dom.vehicleNameInput.value = vehicle.nome;
          buttonTextKey = "updateVehicleBtn";

          if (vehicle.combustiveis) {
            vehicle.combustiveis.forEach(fuel => {
              const efficiencyStr = String(fuel.eficiencia).replace(".", ",");
              if (fuel.nome.toLowerCase() === 'gasolina' && this.dom.vehicleEfficiencyGasolineInput) {
                this.dom.vehicleEfficiencyGasolineInput.value = efficiencyStr;
              } else if (fuel.nome.toLowerCase() === 'álcool' && this.dom.vehicleEfficiencyAlcoholInput) {
                this.dom.vehicleEfficiencyAlcoholInput.value = efficiencyStr;
              }
            });
          }
          if (this.dom.vehicleNextOilChangeKmInput && vehicle.proximoKmTrocaOleo !== null && vehicle.proximoKmTrocaOleo !== undefined) {
            this.dom.vehicleNextOilChangeKmInput.value = vehicle.proximoKmTrocaOleo;
          }

        } else {
          this.editingVehicleId = null;
          this.dom.vehicleTypeInput.value = this.currentVehicleType;
          this.dom.vehicleNameInput.value = "";
        }
      } else {
        this.editingVehicleId = null;
        this.dom.vehicleTypeInput.value = this.currentVehicleType;
        this.dom.vehicleNameInput.value = "";
      }

      this._updateFuelFieldTranslations();
      // Se houver outros campos que precisam de atualização de tradução no form, chamar aqui

      const translatedText = this.langManager.get(buttonTextKey);
      submitButton.textContent = translatedText;
      submitButton.dataset.originalText = translatedText;

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
      submitButton.dataset.originalText = saveText;

      if (this.dom.vehicleEfficiencyGasolineInput) this.dom.vehicleEfficiencyGasolineInput.value = "";
      if (this.dom.vehicleEfficiencyAlcoholInput) this.dom.vehicleEfficiencyAlcoholInput.value = "";
      if (this.dom.vehicleNextOilChangeKmInput) this.dom.vehicleNextOilChangeKmInput.value = "";
    }

    saveVehicle() {
      const submitButton = this.dom.vehicleForm.querySelector("button[type='submit']");
      const originalButtonText = submitButton.innerHTML;
      this.uiManager.showButtonSpinner(submitButton, originalButtonText);

      setTimeout(() => {
        const fuelsData = [];
        if (this.dom.vehicleEfficiencyGasolineInput && this.dom.vehicleEfficiencyGasolineInput.value.trim() !== "") {
          fuelsData.push({
            name: "Gasolina",
            efficiency: this.dom.vehicleEfficiencyGasolineInput.value,
            efficiencyInput: this.dom.vehicleEfficiencyGasolineInput
          });
        }
        if (this.dom.vehicleEfficiencyAlcoholInput && this.dom.vehicleEfficiencyAlcoholInput.value.trim() !== "") {
          fuelsData.push({
            name: "Álcool",
            efficiency: this.dom.vehicleEfficiencyAlcoholInput.value,
            efficiencyInput: this.dom.vehicleEfficiencyAlcoholInput
          });
        }

        const validationInputs = {
          nameInput: this.dom.vehicleNameInput,
          fuelsData: fuelsData,
          type: this.dom.vehicleTypeInput.value,
          form: this.dom.vehicleForm,
          nextOilChangeKmInput: this.dom.vehicleNextOilChangeKmInput // Passar o input para validação
        };
        const validationResult = this.validator.validateVehicle(validationInputs);

        if (!validationResult.isValid) {
          this.uiManager.hideButtonSpinner(submitButton);
          submitButton.innerHTML = originalButtonText;
          return;
        }

        const { nome, combustiveis, tipo, proximoKmTrocaOleo } = validationResult.data;
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
              combustiveis,
              tipo: tipo,
              proximoKmTrocaOleo: proximoKmTrocaOleo, // Salvar o KM da troca de óleo
              updatedAt: new Date().toISOString(),
            };
            notificationKey = "vehicleUpdated";
          } else {
            this.editingVehicleId = null;
            this.uiManager.hideButtonSpinner(submitButton);
            submitButton.innerHTML = originalButtonText;
            return;
          }
        } else {
          const newVehicle = {
            id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            nome,
            combustiveis,
            tipo,
            proximoKmTrocaOleo: proximoKmTrocaOleo, // Salvar o KM da troca de óleo
            createdAt: new Date().toISOString(),
          };
          vehicles.push(newVehicle);
        }

        if (this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)) {
          this.uiManager.showNotification(notificationKey, "success", notificationParams);
          this.hideVehicleForm();
          this.loadAndRenderVehicles();

          const vehicleInQuestionId = this.editingVehicleId || newVehicle.id;
          const vehicleInQuestion = vehicles.find(v => v.id === vehicleInQuestionId);

          if (this.currentVehicle && this.currentVehicle.id === vehicleInQuestionId) {
             if (vehicleInQuestion) this.selectVehicle(vehicleInQuestion.id); // Reseleciona para atualizar dados, inclusive de manutenção
          } else if (!this.editingVehicleId) {
            if (vehicleInQuestion && vehicles.filter(vh => vh.tipo === this.currentVehicleType).length === 1) {
              this.selectVehicle(vehicleInQuestion.id);
            }
          }
          document.dispatchEvent(new CustomEvent("vehicleDataChanged", {detail: {vehicleId: vehicleInQuestionId}}));
          this.editingVehicleId = null;
        }
        this.uiManager.hideButtonSpinner(submitButton);
        if (this.dom.vehicleForm.style.display === 'block') {
            submitButton.innerHTML = this.editingVehicleId ? this.langManager.get("updateVehicleBtn") : this.langManager.get("saveVehicleBtn");
        }

      }, 50);
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
          document.dispatchEvent(new CustomEvent("vehicleDeselected"));
        }
        this.loadAndRenderVehicles();
        // A lógica de placeholder do kmPorLitroInput é agora tratada pelo FuelCalculator
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
      this.selectedTripFuelName = null; // Novo: rastreia o combustível selecionado para a viagem
      this._bindEvents();

      document.addEventListener("languageChanged", () => {
        this._updateResultCardCurrency();
        this._updateResetEfficiencyButtonText();
        // Repopular o select de combustível se estiver visível, para traduzir nomes
        if (this.currentVehicle && this.currentVehicle.combustiveis && this.currentVehicle.combustiveis.length > 0) {
            this._populateTripFuelSelect(this.currentVehicle.combustiveis);
        }
      });

      document.addEventListener("vehicleSelected", (e) => {
        if (e.detail && e.detail.vehicle) {
          const vehicle = e.detail.vehicle;
          this.currentVehicle = vehicle; // Armazena o veículo atual completo
          this.selectedVehicleCache = { nome: vehicle.nome, combustiveis: vehicle.combustiveis };

          if (vehicle.combustiveis && vehicle.combustiveis.length > 0) {
            if (vehicle.combustiveis.length > 1) { // Veículo Flex
              this.dom.tripFuelTypeGroup.style.display = "block";
              this._populateTripFuelSelect(vehicle.combustiveis);
              // Seleciona o primeiro combustível por padrão e atualiza a eficiência
              this.dom.tripFuelTypeSelect.value = vehicle.combustiveis[0].nome;
              this._updateEfficiencyFromSelectedTripFuel();
            } else { // Veículo com apenas um tipo de combustível
              this.dom.tripFuelTypeGroup.style.display = "none";
              this.dom.tripFuelTypeSelect.innerHTML = "";
              this.selectedTripFuelName = vehicle.combustiveis[0].nome;
              this.dom.kmPorLitroInput.value = String(vehicle.combustiveis[0].eficiencia).replace(".", ",");
            }
          } else { // Veículo sem dados de combustível (estrutura antiga ou erro)
            this.dom.tripFuelTypeGroup.style.display = "none";
            this.dom.tripFuelTypeSelect.innerHTML = "";
            this.selectedTripFuelName = null;
            // Tenta usar a 'eficiencia' legada se existir, senão limpa
            this.dom.kmPorLitroInput.value = vehicle.eficiencia ? String(vehicle.eficiencia).replace(".", ",") : "";
          }
          this.dom.kmPorLitroInput.classList.remove("manual-override");
          this.dom.resetEfficiencyBtn.style.display = "none";
          this._updateResetEfficiencyButtonText();
          this.uiManager.clearInlineError(this.dom.kmPorLitroInput);
        }
      });

      document.addEventListener("vehicleDeselected", () => {
        this.currentVehicle = null;
        this.selectedVehicleCache = null;
        this.selectedTripFuelName = null;
        this.dom.kmPorLitroInput.value = ""; // Limpa ao deselecionar
        this.dom.kmPorLitroInput.placeholder = this.langManager.get("tripEfficiencyPlaceholder");
        this.dom.kmPorLitroInput.classList.remove("manual-override");
        this.dom.resetEfficiencyBtn.style.display = "none";
        this.dom.tripFuelTypeGroup.style.display = "none";
        this.dom.tripFuelTypeSelect.innerHTML = "";
        this._updateResetEfficiencyButtonText();
      });
    }

    _populateTripFuelSelect(fuels) {
        this.dom.tripFuelTypeSelect.innerHTML = ""; // Limpa opções existentes
        fuels.forEach(fuel => {
            const option = document.createElement("option");
            option.value = fuel.nome;
            // Para tradução, idealmente os nomes dos combustíveis (Gasolina, Álcool) seriam chaves
            // ex: this.langManager.get(`fuelName${fuel.nome}`)
            // Por simplicidade, usando o nome direto por enquanto.
            option.textContent = Utils.sanitizeHTML(fuel.nome);
            this.dom.tripFuelTypeSelect.appendChild(option);
        });
    }

    _updateEfficiencyFromSelectedTripFuel() {
        if (!this.currentVehicle || !this.currentVehicle.combustiveis) return;

        const selectedFuelName = this.dom.tripFuelTypeSelect.value;
        const selectedFuelData = this.currentVehicle.combustiveis.find(f => f.nome === selectedFuelName);

        if (selectedFuelData) {
            this.selectedTripFuelName = selectedFuelData.nome;
            this.dom.kmPorLitroInput.value = String(selectedFuelData.eficiencia).replace(".", ",");
            this.dom.kmPorLitroInput.classList.remove("manual-override");
            this.dom.resetEfficiencyBtn.style.display = "none";
            this.uiManager.clearInlineError(this.dom.kmPorLitroInput);
            this._updateResetEfficiencyButtonText(); // Atualiza texto do botão de reset
        }
    }


    _updateResetEfficiencyButtonText() {
      if (this.dom.resetEfficiencyBtn) {
        let vehicleDisplayName = this.langManager.get("thisVehicle");
        if (this.currentVehicle && this.currentVehicle.nome) {
            vehicleDisplayName = `<strong>${Utils.sanitizeHTML(this.currentVehicle.nome)}</strong>`;
        }

        if (this.selectedTripFuelName && this.currentVehicle) {
            // Se um combustível específico está selecionado para a viagem
            this.dom.resetEfficiencyBtn.innerHTML = this.langManager.get("resetToSelectedFuelEfficiency", {
                fuelName: Utils.sanitizeHTML(this.selectedTripFuelName),
                vehicleName: vehicleDisplayName
            });
        } else if (this.currentVehicle && this.currentVehicle.combustiveis && this.currentVehicle.combustiveis.length > 0) {
            // Se um veículo está selecionado, mas nenhum combustível específico (ex: mono-combustível)
            const fuelName = this.currentVehicle.combustiveis[0].nome;
             this.dom.resetEfficiencyBtn.innerHTML = this.langManager.get("resetToSelectedFuelEfficiency", {
                fuelName: Utils.sanitizeHTML(fuelName),
                vehicleName: vehicleDisplayName
            });
        } else {
          this.dom.resetEfficiencyBtn.textContent = this.langManager.get("resetToVehicleEfficiencyShort");
        }
      }
    }

    _handleKmPorLitroInputChange() {
      const currentValueStr = Utils.convertCommaToPoint(this.dom.kmPorLitroInput.value);
      const currentValue = parseFloat(currentValueStr);

      let efficiencyToCompare = null;
      if (this.currentVehicle && this.currentVehicle.combustiveis) {
          const fuelNameToCompare = this.selectedTripFuelName || (this.currentVehicle.combustiveis[0] ? this.currentVehicle.combustiveis[0].nome : null);
          if (fuelNameToCompare) {
              const fuelData = this.currentVehicle.combustiveis.find(f => f.nome === fuelNameToCompare);
              if (fuelData) {
                  efficiencyToCompare = parseFloat(fuelData.eficiencia);
              }
          }
      }


      if (efficiencyToCompare !== null) {
        if (!isNaN(currentValue) && Math.abs(currentValue - efficiencyToCompare) > 0.001) {
          this.dom.kmPorLitroInput.classList.add("manual-override");
          this.dom.resetEfficiencyBtn.style.display = "block";
        } else if (isNaN(currentValue) || Math.abs(currentValue - efficiencyToCompare) <= 0.001) {
          this.dom.kmPorLitroInput.classList.remove("manual-override");
          this.dom.resetEfficiencyBtn.style.display = "none";
          if(!isNaN(currentValue)) {
            this.dom.kmPorLitroInput.value = String(efficiencyToCompare).replace(".",",");
          }
        }
      } else {
        this.dom.kmPorLitroInput.classList.remove("manual-override");
        this.dom.resetEfficiencyBtn.style.display = "none";
      }
    }

    _resetEfficiencyToVehicle() {
      if (this.currentVehicle && this.currentVehicle.combustiveis) {
        const fuelNameToReset = this.selectedTripFuelName || (this.currentVehicle.combustiveis[0] ? this.currentVehicle.combustiveis[0].nome : null);
        if (fuelNameToReset) {
            const fuelData = this.currentVehicle.combustiveis.find(f => f.nome === fuelNameToReset);
            if (fuelData) {
                this.dom.kmPorLitroInput.value = String(fuelData.eficiencia).replace(".", ",");
                this.dom.kmPorLitroInput.classList.remove("manual-override");
                this.dom.resetEfficiencyBtn.style.display = "none";
                this.uiManager.clearInlineError(this.dom.kmPorLitroInput);
                this.dom.kmPorLitroInput.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
            }
        }
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
      if (this.dom.tripFuelTypeSelect) { // Novo listener
        this.dom.tripFuelTypeSelect.addEventListener("change", () => this._updateEfficiencyFromSelectedTripFuel());
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
      const resultTitle = this.dom.resultCard.querySelector('#result-title');
      if (resultTitle) {
          resultTitle.focus();
      }
      this.dom.resultCard.scrollIntoView({ // Scroll ainda pode ser útil
        behavior: "smooth",
        block: "start",
      });

      this.uiManager.hideButtonSpinner(submitButton);
      submitButton.innerHTML = originalButtonText;

      let combustivelUtilizadoNome = null;
      if (this.currentVehicle && this.currentVehicle.combustiveis) {
          if (this.dom.tripFuelTypeGroup.style.display === "block" && this.dom.tripFuelTypeSelect.value) {
              combustivelUtilizadoNome = this.dom.tripFuelTypeSelect.value;
          } else if (this.currentVehicle.combustiveis.length === 1) {
              combustivelUtilizadoNome = this.currentVehicle.combustiveis[0].nome;
          }
      }
      // Se combustivelUtilizadoNome ainda for null, pode ser uma entrada manual sem veículo selecionado,
      // ou um veículo antigo sem a estrutura `combustiveis`.

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
        combustivelUtilizadoNome: combustivelUtilizadoNome
      });
      this._clearTripForm();
      document.dispatchEvent(new CustomEvent("tripCalculated"));
    }

    _saveTripToHistory(td) {
      const h = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        []
      );
      const cv = this.currentVehicle; // Usar this.currentVehicle em vez de this.vehicleManager.currentVehicle
      const nr = {
        id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        dataISO: new Date().toISOString(),
        tipoVeiculo: cv ? cv.tipo : this.vehicleManager.currentVehicleType, // Usa o tipo do veículo atual se disponível
        veiculoId: cv ? cv.id : null,
        veiculoNome: cv ? cv.nome : this.langManager.get("manualOrUnspecified"),
        kmInicial: td.kmInicial,
        kmFinal: td.kmFinal,
        distancia: td.distancia.toFixed(1),
        kmPorLitroUtilizado: td.kmPorLitro,
        litrosConsumidos: td.litrosConsumidos.toFixed(1),
        precoPorLitro: td.precoCombustivel,
        custoTotalCombustivel: td.custoTotal.toFixed(2),
        combustivelUtilizado: td.combustivelUtilizadoNome || this.langManager.get("notApplicableAbbreviation"), // Novo campo
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
      // kmPorLitroInput é limpo/atualizado pelos listeners de vehicleSelected/Deselected
      if (!this.currentVehicle) { // Limpa apenas se nenhum veículo estiver selecionado
          this.dom.kmPorLitroInput.value = "";
          this.dom.kmPorLitroInput.placeholder = this.langManager.get("tripEfficiencyPlaceholder");
      }
      this.dom.precoCombustivelInput.value = "";
      this.dom.ganhoUberInput.value = "";

      this.dom.tripFuelTypeGroup.style.display = "none";
      this.dom.tripFuelTypeSelect.innerHTML = "";
      this.selectedTripFuelName = null;
    }

    resetState() {
      this._clearTripForm(); // Já lida com o select de combustível
      this.dom.resultCard.style.display = "none";
      // Não precisa limpar kmPorLitroInput aqui explicitamente, _clearTripForm e os eventos de veículo cuidam disso.
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

      if (this.dom.exportHistoryCsvBtn) {
        this.dom.exportHistoryCsvBtn.addEventListener("click", () => this.exportHistoryToCsv());
      }
    }

    exportHistoryToCsv() {
      const historyData = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []);
      const filteredHistory = historyData.filter(
        (item) => item.tipoVeiculo === this.vehicleManager.currentVehicleType
      );

      if (filteredHistory.length === 0) {
        this.uiManager.showNotification("noHistoryToExport", "info");
        return;
      }

      // Mapear para um formato mais "legível" e selecionar/ordenar colunas
      const dataToExport = filteredHistory.map(r => ({
        [this.langManager.get("csvHeaderDate")]: Utils.formatLocalDate(r.dataISO, this.langManager.currentLanguage),
        [this.langManager.get("csvHeaderVehicleName")]: r.veiculoNome,
        [this.langManager.get("csvHeaderInitialKm")]: r.kmInicial,
        [this.langManager.get("csvHeaderFinalKm")]: r.kmFinal,
        [this.langManager.get("csvHeaderDistance")]: r.distancia,
        [this.langManager.get("csvHeaderFuelType")]: r.combustivelUtilizado || this.langManager.get("notApplicableAbbreviation"),
        [this.langManager.get("csvHeaderEfficiencyUsed")]: r.kmPorLitroUtilizado,
        [this.langManager.get("csvHeaderFuelConsumed")]: r.litrosConsumidos,
        [this.langManager.get("csvHeaderPricePerLiter")]: r.precoPorLitro, // Já está formatado como número, mas CSV pode querer sem R$
        [this.langManager.get("csvHeaderTotalFuelCost")]: r.custoTotalCombustivel,
        [this.langManager.get("csvHeaderGrossGain")]: r.ganhoBrutoInformado !== null ? r.ganhoBrutoInformado : "",
        [this.langManager.get("csvHeaderNetProfit")]: r.lucroLiquidoViagem !== null ? r.lucroLiquidoViagem : "",
      }));

      const vehicleTypeName = this.langManager.get(this.vehicleManager.currentVehicleType === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle");
      const fileName = `historico_viagens_${vehicleTypeName.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;

      try {
        Utils.jsonToCsv(dataToExport, fileName);
        this.uiManager.showNotification("exportCsvSuccess", "success", {fileName});
      } catch (e) {
        console.error("Erro ao exportar histórico para CSV:", e);
        this.uiManager.showNotification("exportCsvError", "error");
      }
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
      if (r.combustivelUtilizado && r.combustivelUtilizado !== this.langManager.get("notApplicableAbbreviation")) {
        summaryText += ` (${Utils.sanitizeHTML(r.combustivelUtilizado)})`;
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

      const fragment = document.createDocumentFragment();

      if (fh.length === 0) {
        this.dom.historySection.style.display = "none";
        this.dom.historyList.innerHTML = "";
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

      this.dom.historyList.innerHTML = "";
      this.dom.historyList.appendChild(fragment);

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
        { labelKey: "detailLabelVehicle", value: Utils.sanitizeHTML(r.veiculoNome) },
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
      ];

      if (r.combustivelUtilizado && r.combustivelUtilizado !== this.langManager.get("notApplicableAbbreviation")) {
        d.push({
            labelKey: "detailLabelFuelTypeUsed",
            value: Utils.sanitizeHTML(r.combustivelUtilizado)
        });
      }

      d.push(
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
        }
      );

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

      if (this.dom.exportStatsCsvBtn) {
        this.dom.exportStatsCsvBtn.addEventListener("click", () => this.exportStatisticsToCsv());
      }
    }

    exportStatisticsToCsv() {
      const vehicleTypeName = this.langManager.get(this.vehicleManager.currentVehicleType === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle");
      const fileName = `estatisticas_${vehicleTypeName.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;

      const summaryData = [
        {
          [this.langManager.get("csvHeaderStatistic")]: this.langManager.get("totalKmStatLabel"),
          [this.langManager.get("csvHeaderValue")]: this.dom.totalKmStat.textContent
        },
        {
          [this.langManager.get("csvHeaderStatistic")]: this.langManager.get("totalFuelCostStatLabel"),
          [this.langManager.get("csvHeaderValue")]: this.dom.totalGastoStat.textContent
        },
        {
          [this.langManager.get("csvHeaderStatistic")]: this.langManager.get("avgConsumptionStatLabel"),
          [this.langManager.get("csvHeaderValue")]: this.dom.mediaConsumoStat.textContent
        }
      ];

      // Opcional: Exportar dados do gráfico (gastos diários)
      // Isso exigiria que _prepareChartData retorne os dados de forma acessível
      // ou que recalculemos aqui. Para simplificar, vamos focar no sumário por agora.
      // Se this.chartInstance e this.chartInstance.config.data existirem, poderíamos extraí-los.

      try {
        Utils.jsonToCsv(summaryData, fileName);
        this.uiManager.showNotification("exportCsvSuccess", "success", {fileName});
      } catch (e) {
        console.error("Erro ao exportar estatísticas para CSV:", e);
        this.uiManager.showNotification("exportCsvError", "error");
      }
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

class GoalManager {
  constructor(storageManager, uiManager, languageManager, vehicleManager, dom) {
      this.storageManager = storageManager;
      this.uiManager = uiManager;
      this.langManager = languageManager;
      this.vehicleManager = vehicleManager;
      this.dom = dom; // Elementos DOM da seção de metas serão adicionados aqui
      this.currentGoals = this._loadGoals();

      // Elementos DOM esperados (a serem definidos na constante DOM global e adicionados ao HTML)
      // this.dom.goalSection = document.getElementById("goalSection");
      // this.dom.goalForm = document.getElementById("goalForm");
      // this.dom.goalAmountInput = document.getElementById("goalAmountInput");
      // this.dom.setGoalBtn = document.getElementById("setGoalBtn");
      // this.dom.deleteGoalBtn = document.getElementById("deleteGoalBtn");
      // this.dom.currentGoalDisplay = document.getElementById("currentGoalDisplay");
      // this.dom.goalProgressText = document.getElementById("goalProgressText");
      // this.dom.goalProgressBarInner = document.getElementById("goalProgressBarInner");
      // this.dom.goalProgressPercentage = document.getElementById("goalProgressPercentage");
  }

  init() {
      this._bindEvents();
      this.renderGoalUI();
      // Adicionar listeners para eventos que podem afetar o progresso da meta
      document.addEventListener("tripCalculated", () => this.renderGoalUI());
      document.addEventListener("historyCleared", () => this.renderGoalUI()); // Se o histórico for limpo
      document.addEventListener("vehicleTypeChanged", () => this.renderGoalUI());
      document.addEventListener("languageChanged", () => this.renderGoalUI(true)); // Force re-render com traduções
  }

  _bindEvents() {
      if (this.dom.setGoalBtn && this.dom.goalForm) {
          this.dom.goalForm.addEventListener("submit", (e) => {
              e.preventDefault();
              this.setSpendingCapGoal();
          });
      }
      if (this.dom.deleteGoalBtn) {
          this.dom.deleteGoalBtn.addEventListener("click", () => {
              this.deleteCurrentGoalConfirm();
          });
      }
  }

  _loadGoals() {
      // Estrutura: [{ vehicleType: "carro", monthYear: "2023-11", amount: 500, id: "goal_xxx" }]
      // Vamos simplificar para ter apenas UMA meta por tipo de veículo por mês.
      // Poderia ser um objeto: { "carro_2023-11": { amount: 500, id: "..." } }
      // Por enquanto, um array filtrável é mais simples.
      return this.storageManager.safeGetItem(CONFIG.GOALS_STORAGE_KEY, []);
  }

  _saveGoals() {
      this.storageManager.safeSetItem(CONFIG.GOALS_STORAGE_KEY, this.currentGoals);
  }

  getCurrentVehicleTypeAndMonth() {
      const vehicleType = this.vehicleManager.currentVehicleType;
      const now = new Date();
      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return { vehicleType, monthYear };
  }

  setSpendingCapGoal() {
      const { vehicleType, monthYear } = this.getCurrentVehicleTypeAndMonth();
      const amountStr = Utils.convertCommaToPoint(this.dom.goalAmountInput.value);
      const amount = parseFloat(amountStr);

      if (isNaN(amount) || amount <= 0) {
          this.uiManager.displayInlineError(this.dom.goalAmountInput, this.langManager.get("goalAmountErrorInvalid"));
          return;
      }
      this.uiManager.clearInlineError(this.dom.goalAmountInput);

      // Remove qualquer meta existente para este tipo de veículo e mês
      this.currentGoals = this.currentGoals.filter(
          goal => !(goal.vehicleType === vehicleType && goal.monthYear === monthYear)
      );

      const newGoal = {
          id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          vehicleType,
          monthYear,
          amount: parseFloat(amount.toFixed(2)), // Garante duas casas decimais
          type: "spendingCap", // Fixo por enquanto
          createdAt: new Date().toISOString(),
      };
      this.currentGoals.push(newGoal);
      this._saveGoals();
      this.dom.goalAmountInput.value = "";
      this.uiManager.showNotification("goalSetSuccess", "success", { amount: Utils.formatCurrency(newGoal.amount, this.langManager.currentLanguage)});
      this.renderGoalUI();
  }

  deleteCurrentGoalConfirm() {
      const { vehicleType, monthYear } = this.getCurrentVehicleTypeAndMonth();
      const currentGoal = this.currentGoals.find(
          g => g.vehicleType === vehicleType && g.monthYear === monthYear
      );

      if (currentGoal) {
          this.uiManager.showConfirm(this.langManager.get("confirmDeleteGoal"))
              .then(confirmed => {
                  if (confirmed) {
                      this.currentGoals = this.currentGoals.filter(g => g.id !== currentGoal.id);
                      this._saveGoals();
                      this.uiManager.showNotification("goalDeletedSuccess", "success");
                      this.renderGoalUI();
                  }
              });
      }
  }


  calculateProgress() {
      const { vehicleType, monthYear } = this.getCurrentVehicleTypeAndMonth();
      const currentGoal = this.currentGoals.find(
          g => g.vehicleType === vehicleType && g.monthYear === monthYear
      );

      if (!currentGoal) {
          return null; // Nenhuma meta definida para o contexto atual
      }

      const history = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []);
      const [year, month] = monthYear.split("-").map(Number);

      const totalSpentThisMonth = history
          .filter(item => {
              const itemDate = new Date(item.dataISO);
              return item.tipoVeiculo === vehicleType &&
                     itemDate.getFullYear() === year &&
                     (itemDate.getMonth() + 1) === month;
          })
          .reduce((sum, item) => sum + parseFloat(item.custoTotalCombustivel), 0);

      const percentage = Math.min((totalSpentThisMonth / currentGoal.amount) * 100, 100);

      return {
          goalAmount: currentGoal.amount,
          spentAmount: totalSpentThisMonth,
          percentage: percentage,
          isOverBudget: totalSpentThisMonth > currentGoal.amount,
      };
  }

  renderGoalUI(forceRetranslate = false) {
      if (!this.dom.goalSection) return; // Se a seção de metas não estiver no DOM, não faz nada

      const { vehicleType, monthYear } = this.getCurrentVehicleTypeAndMonth();
      const currentGoal = this.currentGoals.find(
          g => g.vehicleType === vehicleType && g.monthYear === monthYear
      );

      // Atualiza textos fixos do formulário se necessário (ex: ao mudar idioma)
      if (forceRetranslate) {
          if (this.dom.goalAmountInput) this.dom.goalAmountInput.placeholder = this.langManager.get("goalAmountPlaceholder");
          if (this.dom.setGoalBtn) {
            const text = this.langManager.get("setGoalBtn");
            this.dom.setGoalBtn.textContent = text;
            this.dom.setGoalBtn.dataset.originalText = text;
          }
      }


      if (currentGoal) {
          this.dom.goalForm.style.display = "none";
          this.dom.currentGoalDisplay.style.display = "block";
          this.dom.deleteGoalBtn.style.display = "inline-block";

          const progress = this.calculateProgress();
          const lang = this.langManager.currentLanguage;

          const goalAmountFormatted = Utils.formatCurrency(progress.goalAmount, lang);
          const spentAmountFormatted = Utils.formatCurrency(progress.spentAmount, lang);

          this.dom.goalProgressText.innerHTML = this.langManager.get("goalProgressText", {
              spent: spentAmountFormatted,
              total: goalAmountFormatted
          });

          this.dom.goalProgressBarInner.style.width = `${progress.percentage}%`;
          this.dom.goalProgressPercentage.textContent = `${progress.percentage.toFixed(0)}%`;

          this.dom.goalProgressBarInner.classList.toggle("overbudget", progress.isOverBudget);
          if (progress.isOverBudget) {
              this.dom.goalProgressText.innerHTML += ` <span class="danger-text">(${this.langManager.get("goalOverBudgetWarning")})</span>`;
          }

      } else {
          this.dom.goalForm.style.display = "block";
          this.dom.currentGoalDisplay.style.display = "none";
          this.dom.deleteGoalBtn.style.display = "none";
          if (this.dom.goalAmountInput) this.dom.goalAmountInput.value = ""; // Limpa input se não há meta
          this.uiManager.clearInlineError(this.dom.goalAmountInput);
      }
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
    this.goalManager = new GoalManager( // Instanciar GoalManager
        this.storageManager,
        this.uiManager,
        this.languageManager,
        this.vehicleManager,
        // this.historyManager, // HistoryManager não é necessário no construtor se buscamos direto do storage
        this.dom
    );
      this.qrInstance = null;
      this.qriousLoaded = false; // Flag para controlar o carregamento do QRious
      this.activeScreen = "screenHome"; // Tela inicial padrão
      this._init();
    }
    _init() {
      // this._displayAppInfo(); // Movido para _bindSettingsScreenEvents ou render da tela de Ajustes

      this.inputFormatter.initialize();

      // Managers que dependem de elementos DOM específicos de suas telas
      // serão inicializados ou terão seus bindings refeitos quando a tela for ativada
      // ou podemos fazer bindings mais genéricos se os elementos existirem sempre.

      this.inputFormatter.initialize(); // Formatação de inputs é global

      // Managers principais são instanciados
      this.vehicleManager = new VehicleManager(this.storageManager, this.uiManager, this.validator, this.languageManager, this.dom);
      this.fuelCalculator = new FuelCalculator(this.storageManager, this.uiManager, this.validator, this.vehicleManager, this.languageManager, this.dom);
      this.historyManager = new HistoryManager(this.storageManager, this.uiManager, this.vehicleManager, this.languageManager, this.dom);
      this.statisticsManager = new StatisticsManager(this.storageManager, this.uiManager, this.vehicleManager, this.languageManager, this.dom);
      this.goalManager = new GoalManager(this.storageManager, this.uiManager, this.languageManager, this.vehicleManager, this.dom);

      // LanguageManager e ThemeManager são inicializados primeiro para que as traduções e temas estejam disponíveis
      this.languageManager.init();
      this.themeManager.init();

      // Inicializa os módulos que dependem de elementos DOM
      this.inputFormatter.initialize(); // Formatação de inputs é global
      if (this.goalManager) {
        this.goalManager.init();
      }

      // Bind de eventos globais e específicos de telas
      this._bindGlobalAppEvents();
      this._bindHelperEvents();
      this._bindMaintenanceEvents();
      this._bindNavigationEvents();
      this._bindSettingsScreenEvents();

      // Renderização/atualização inicial de componentes que dependem de dados ou estado
      this.vehicleManager.selectVehicleType(this.vehicleManager.currentVehicleType);
      this.historyManager.renderHistory();
      this.statisticsManager.updateStatistics();

      this.uiManager.navigateTo(this.activeScreen);
      this._updateMaintenanceReminders();
      this._handleViewport();
      window.addEventListener(
        "resize",
        Utils.debounce(() => this._handleViewport(), CONFIG.DEBOUNCE_DELAY)
      );
      this._hideSplashScreen();
      this._registerServiceWorker();
    }

  _bindNavigationEvents() {
    if (this.dom.navButtons) {
      this.dom.navButtons.forEach(button => {
        button.addEventListener("click", () => {
          const screenId = button.dataset.screen;
          if (screenId) {
            this.activeScreen = screenId;
            this.uiManager.navigateTo(screenId);
          }
        });
      });
    }
  }

  _bindSettingsScreenEvents() {
    // Os botões de idioma e tema na tela de Ajustes já são os elementos que
    // LanguageManager e ThemeManager usam através do seletor global ".lang-button" e ".theme-button"
    // Portanto, o this.languageManager.init() e this.themeManager.init() no _init do AppManager
    // já devem cuidar de adicionar os listeners corretos a eles, desde que os seletores
    // em LanguageManager e ThemeManager sejam suficientemente gerais ou que passemos os elementos corretos.

    // No entanto, precisamos garantir que os estados (aria-pressed, active class) sejam atualizados
    // especificamente para OS BOTÕES DENTRO DA TELA DE AJUSTES quando o idioma/tema muda.
    // Os próprios managers já disparam eventos 'languageChanged' e 'themeChanged'.
    // Podemos ouvir esses eventos aqui para atualizar os botões da tela de Ajustes.

    document.addEventListener("languageChanged", () => {
        const settingsLangButtons = this.dom.settingsLanguageSwitcher ? this.dom.settingsLanguageSwitcher.querySelectorAll(".lang-button") : [];
        settingsLangButtons.forEach(btn => {
             btn.setAttribute("aria-pressed", btn.dataset.lang === this.languageManager.currentLanguage);
             // Atualiza o texto dentro do botão (ex: "Português", "Inglês") se eles tiverem spans com data-translate-key
             const textSpan = btn.querySelector("span[data-translate-key]");
             if (textSpan) {
                 textSpan.textContent = this.languageManager.get(textSpan.dataset.translateKey);
             }
        });
    });

    document.addEventListener("themeChanged", () => {
        const settingsThemeButtons = this.dom.settingsThemeSwitcher ? this.dom.settingsThemeSwitcher.querySelectorAll(".theme-button") : [];
        const currentThemePreference = this.themeManager._getPreference();
        settingsThemeButtons.forEach(btn => {
            btn.classList.toggle("active", btn.dataset.themeToggle === currentThemePreference);
             const textSpan = btn.querySelector("span[data-translate-key]");
             if (textSpan) { // Atualiza o texto se houver
                 textSpan.textContent = this.languageManager.get(textSpan.dataset.translateKey);
             }
        });
    });

    // Chamar _displayAppInfo aqui para garantir que o rodapé (agora na tela de ajustes) seja populado
    this._displayAppInfo();

    // Botão de Ajuda na tela de Ajustes
    // O ID "helpButton" agora é usado na tela de Ajustes.
    // O seletor em DOM.settingsHelpButton deve ser `document.querySelector("#screenSettings #helpButton")`
    // ou simplesmente `document.getElementById("helpButton")` se garantirmos que o ID é único para o botão de ajuda na tela de Ajustes.
    // Assumindo que `this.dom.settingsHelpButton` está correto:
    if (this.dom.settingsHelpButton) {
        this.dom.settingsHelpButton.addEventListener("click", () => this.uiManager.showHelpModal());
    } else {
        // Fallback se o seletor global ainda for usado e o botão de ajuda do header antigo não foi removido
        // Este fallback pode ser removido se o DOM.helpButton for retirado da constante DOM.
        if(this.dom.helpButton && this.dom.helpButton.closest("#screenSettings")){
             this.dom.helpButton.addEventListener("click", () => this.uiManager.showHelpModal());
        }
    }
  }

  _bindMaintenanceEvents() {
    document.addEventListener("vehicleSelected", () => this._updateMaintenanceReminders());
    document.addEventListener("tripCalculated", () => this._updateMaintenanceReminders());
    document.addEventListener("vehicleTypeChanged", () => this._updateMaintenanceReminders());
    document.addEventListener("vehicleDataChanged", () => this._updateMaintenanceReminders()); // Quando proximoKmTrocaOleo é salvo
    document.addEventListener("languageChanged", () => this._updateMaintenanceReminders(true));
    document.addEventListener("screenChanged", (e) => { // Atualiza lembretes ao mudar para tela Home
        if (e.detail.screenId === "screenHome") {
            this._updateMaintenanceReminders();
        }
    });
  }

  _updateMaintenanceReminders(forceRetranslate = false) {
    if (!this.dom.maintenanceReminderSection || !this.vehicleManager || !this.storageManager) {
        return;
    }

    const currentVehicle = this.vehicleManager.currentVehicle;
    this.dom.maintenanceReminderSection.style.display = "none";
    this.dom.oilChangeReminderCard.style.display = "none";
    this.dom.noActiveMaintenanceReminder.style.display = "block"; // Padrão é não ter lembretes

    if (forceRetranslate) {
        // Atualizar textos fixos da seção de lembretes, se houver, ao mudar idioma
        const titleEl = this.dom.maintenanceReminderSection.querySelector("h3");
        if(titleEl) titleEl.textContent = this.langManager.get("maintenanceReminderTitle");
        const cardTitleEl = this.dom.oilChangeReminderCard.querySelector("h4");
        if(cardTitleEl) cardTitleEl.textContent = this.langManager.get("oilChangeCardTitle");
        const noteEl = this.dom.oilChangeReminderCard.querySelector(".reminder-note");
        if(noteEl) noteEl.textContent = this.langManager.get("oilChangeReminderNote");
        if(this.dom.noActiveMaintenanceReminder) this.dom.noActiveMaintenanceReminder.textContent = this.langManager.get("noActiveMaintenanceReminder");
    }


    if (!currentVehicle || currentVehicle.proximoKmTrocaOleo === null || currentVehicle.proximoKmTrocaOleo === undefined || currentVehicle.proximoKmTrocaOleo <= 0) {
        return; // Sem veículo, sem meta de KM para troca de óleo, ou valor inválido
    }

    const history = this.storageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []);
    const vehicleHistory = history.filter(item => item.veiculoId === currentVehicle.id && item.kmFinal)
                                .sort((a,b) => new Date(b.dataISO) - new Date(a.dataISO)); // Ordena por mais recente

    if (vehicleHistory.length === 0) {
        return; // Sem histórico de KM para este veículo
    }

    const lastKmFinal = parseFloat(vehicleHistory[0].kmFinal);
    const nextOilChangeAtKm = parseFloat(currentVehicle.proximoKmTrocaOleo);
    const kmToOilChange = nextOilChangeAtKm - lastKmFinal;
    const warningThreshold = 1000; // Avisar 1000km antes

    this.dom.maintenanceReminderSection.style.display = "block";
    this.dom.noActiveMaintenanceReminder.style.display = "none"; // Esconde msg padrão
    this.dom.oilChangeReminderCard.style.display = "block";
    this.dom.oilChangeReminderCard.classList.remove("status-ok", "status-warning", "status-danger");


    if (kmToOilChange <= 0) {
        // Atrasado
        this.dom.oilChangeReminderText.textContent = this.langManager.get("oilChangeOverdue", {km: Math.abs(kmToOilChange).toFixed(0) });
        this.dom.oilChangeReminderCard.classList.add("status-danger");
    } else if (kmToOilChange <= warningThreshold) {
        // Próximo
        this.dom.oilChangeReminderText.textContent = this.langManager.get("oilChangeSoon", {km: kmToOilChange.toFixed(0) });
        this.dom.oilChangeReminderCard.classList.add("status-warning");
    } else {
        // OK
        this.dom.oilChangeReminderText.textContent = this.langManager.get("oilChangeOk", {km: kmToOilChange.toFixed(0) });
        this.dom.oilChangeReminderCard.classList.add("status-ok");
    }
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
