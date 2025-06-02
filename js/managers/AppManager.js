// js/managers/AppManager.js
// Responsável por orquestrar todos os módulos da aplicação,
// inicializar o estado da aplicação e gerir eventos globais.

import { CONFIG } from "../config.js";
import { LanguageManager } from "./LanguageManager.js";
import { UIManager } from "./UIManager.js";
import { StorageManager } from "./StorageManager.js";
import { Validator } from "../validator.js";
import { VehicleManager } from "./VehicleManager.js";
import { FuelCalculator } from "./FuelCalculator.js";
import { HistoryManager } from "./HistoryManager.js";
import { StatisticsManager } from "./StatisticsManager.js";
// Qrious será carregado via CDN, então estará disponível globalmente como `QRious`.

export class AppManager {
  constructor() {
    this.storageManager = new StorageManager(null);
    this.languageManager = new LanguageManager(this.storageManager);
    this.uiManager = new UIManager(this.languageManager);
    this.storageManager.uiManager = this.uiManager;

    this.validator = new Validator(this.uiManager, this.languageManager);
    this.vehicleManager = new VehicleManager(
      this.storageManager,
      this.uiManager,
      this.validator,
      this.languageManager
    );
    this.fuelCalculator = new FuelCalculator(
      this.storageManager,
      this.uiManager,
      this.validator,
      this.vehicleManager,
      this.languageManager
    );
    this.historyManager = new HistoryManager(
      this.storageManager,
      this.uiManager,
      this.vehicleManager,
      this.languageManager
    );
    this.statisticsManager = new StatisticsManager(
      this.storageManager,
      this.uiManager,
      this.vehicleManager,
      this.languageManager
    );

    this.dom = {
      appVersionSpan: document.getElementById("appVersion"),
      appContainer: document.getElementById("appContainer"),
      desktopNoticeOverlay: document.getElementById("desktop-notice-overlay"),
      qrCodeCanvas: document.getElementById("qrCodeCanvas"),
      pageUrlLink: document.getElementById("pageUrlLink"),
    };

    this._init();
  }

  _init() {
    this._displayAppVersion();
    this.languageManager.setLanguage(this.languageManager.currentLanguage);

    if (this._isDesktop()) {
      this._setupDesktopNotice();
    } else {
      if (this.dom.appContainer)
        this.dom.appContainer.classList.remove("app-content-hidden");
      if (this.dom.desktopNoticeOverlay)
        this.dom.desktopNoticeOverlay.style.display = "none";

      this._registerServiceWorker();
      this._bindGlobalAppEvents();
      this._hideSplashScreen();
    }
  }

  _isDesktop() {
    const minWidthForDesktop = 1024;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      )
    ) {
      return false;
    }
    return window.innerWidth >= minWidthForDesktop;
  }

  _setupDesktopNotice() {
    if (this.dom.appContainer)
      this.dom.appContainer.classList.add("app-content-hidden");
    if (this.dom.desktopNoticeOverlay) {
      this.dom.desktopNoticeOverlay.style.display = "flex";

      this.languageManager.applyTranslationsToPage();

      const pageUrl = "https://johnaugust934.github.io/FuelCalc/";

      if (this.dom.pageUrlLink) {
        this.dom.pageUrlLink.href = pageUrl;
        this.dom.pageUrlLink.textContent = pageUrl;
      }

      if (this.dom.qrCodeCanvas && typeof QRious !== "undefined") {
        new QRious({
          element: this.dom.qrCodeCanvas,
          value: pageUrl,
          size: 200, // Este será o tamanho do canvas
          level: "H",
          // background: null, // Define o fundo do canvas como transparente
          backgroundAlpha: 0, // Alternativa para fundo transparente
          foreground: "black", // Cor do QR code
          // padding: 0, // Padding interno da biblioteca QRious
        });
      } else {
        console.warn(
          "Elemento canvas para QR Code não encontrado ou biblioteca QRious não carregada."
        );
        if (this.dom.qrCodeCanvas) this.dom.qrCodeCanvas.style.display = "none";
      }
    }
    this._hideSplashScreen();
  }

  _displayAppVersion() {
    if (this.dom.appVersionSpan)
      this.dom.appVersionSpan.textContent = CONFIG.APP_VERSION;
  }

  _registerServiceWorker() {
    if ("serviceWorker" in navigator && !this._isDesktop()) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((registration) =>
            console.log("SW FuelCalc registado. Escopo:", registration.scope)
          )
          .catch((error) => console.error("Falha SW FuelCalc:", error));
      });
    }
  }

  _bindGlobalAppEvents() {
    const exportBtn = document.getElementById("exportDataBtn");
    if (exportBtn)
      exportBtn.addEventListener("click", () =>
        this.storageManager.exportData()
      );

    const importBtn = document.getElementById("importDataBtn");
    const importFileInput = document.getElementById("importFileInput");
    if (importBtn && importFileInput) {
      importBtn.addEventListener("click", () => importFileInput.click());
      importFileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          const success = await this.storageManager.importData(file);
          if (success) {
            const newLang =
              this.languageManager._loadLanguagePreference() ||
              CONFIG.DEFAULT_LANGUAGE;
            this.languageManager.setLanguage(newLang);
            this.vehicleManager.selectVehicleType(
              this.vehicleManager.currentVehicleType
            );
          }
          importFileInput.value = "";
        }
      });
    }

    const clearAllDataBtn = document.getElementById("clearAllDataBtn");
    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener("click", async () => {
        const confirmedStep1 = await this.uiManager.showConfirm(
          "confirmClearAllData",
          "clearAllDataBtn"
        );
        if (!confirmedStep1) {
          this.uiManager.showNotification("clearAllDataCancelled", "info");
          return;
        }
        const confirmedStep2 = await this.uiManager.showConfirm(
          "confirmFinalClearAllData",
          "clearAllDataBtn"
        );
        if (confirmedStep2) {
          this._performClearAllData();
        } else {
          this.uiManager.showNotification("clearAllDataCancelled", "info");
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.uiManager.hideDetailsModal();
        if (
          this.uiManager.confirmModalOverlay &&
          this.uiManager.confirmModalOverlay.classList.contains("active")
        ) {
          this.uiManager._handleConfirm(false);
        }
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
      document.dispatchEvent(new CustomEvent("allDataCleared"));
      this.uiManager.showNotification("allDataClearedSuccess", "success");
    } else {
      // Notificação de erro já tratada pelo StorageManager
    }
  }

  _hideSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
      setTimeout(() => {
        splashScreen.classList.add("hidden");
        splashScreen.addEventListener(
          "transitionend",
          (event) => {
            if (
              event.propertyName === "opacity" &&
              splashScreen.classList.contains("hidden")
            ) {
              // Opcional: splashScreen.remove();
            }
          },
          { once: true }
        );
        setTimeout(() => {
          if (splashScreen.classList.contains("hidden")) {
            // Fallback
          }
        }, 1200);
      }, 50);
    } else {
      console.warn("[AppManager] Elemento da splash screen não encontrado.");
    }
  }
}
