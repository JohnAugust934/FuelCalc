// js/managers/AppManager.js
// Responsável por orquestrar todos os módulos da aplicação,
// inicializar o estado da aplicação e gerir eventos globais.

// Importa as configurações globais, incluindo a versão da aplicação.
import { CONFIG } from "../config.js";

// Importa todas as classes de gestores.
import { LanguageManager } from "./LanguageManager.js";
import { UIManager } from "./UIManager.js";
import { StorageManager } from "./StorageManager.js";
import { Validator } from "../validator.js";
import { VehicleManager } from "./VehicleManager.js";
import { FuelCalculator } from "./FuelCalculator.js";
import { HistoryManager } from "./HistoryManager.js";
import { StatisticsManager } from "./StatisticsManager.js";

export class AppManager {
  /**
   * Construtor da classe AppManager.
   * Instancia todos os gestores e inicializa a aplicação.
   */
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
    };

    this._init();
  }

  /**
   * Inicializa os componentes principais da aplicação.
   * @private
   */
  _init() {
    this._displayAppVersion();
    this.languageManager.setLanguage(this.languageManager.currentLanguage);

    this._registerServiceWorker();
    this._bindGlobalAppEvents();
    this._hideSplashScreen(); // Chamada para esconder a splash screen
  }

  /**
   * Exibe a versão atual da aplicação no elemento DOM correspondente.
   * @private
   */
  _displayAppVersion() {
    if (this.dom.appVersionSpan) {
      this.dom.appVersionSpan.textContent = CONFIG.APP_VERSION;
    }
  }

  /**
   * Regista o Service Worker para funcionalidades PWA (offline, cache).
   * @private
   */
  _registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((registration) =>
            console.log(
              "Service Worker FuelCalc registado com sucesso. Escopo:",
              registration.scope
            )
          )
          .catch((error) =>
            console.error("Falha no registo do Service Worker FuelCalc:", error)
          );
      });
    }
  }

  /**
   * Vincula listeners a eventos globais da aplicação.
   * @private
   */
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

  /**
   * Executa a limpeza de todos os dados da aplicação.
   * @private
   */
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
      // A notificação de erro já deve ter sido mostrada pelo StorageManager.
    }
  }

  /**
   * Esconde a tela de carregamento (splash screen) após a inicialização da aplicação.
   * Adiciona um pequeno atraso antes de aplicar a classe 'hidden' para garantir
   * que a transição CSS seja acionada corretamente.
   * @private
   */
  _hideSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
      console.log("[AppManager] Tentando esconder a splash screen."); // Para depuração

      // Adiciona um pequeno atraso para garantir que o browser esteja pronto para a transição.
      // 50ms é geralmente suficiente.
      setTimeout(() => {
        splashScreen.classList.add("hidden");
        console.log("[AppManager] Classe 'hidden' adicionada à splash screen.");

        // O CSS já tem uma transição para 'visibility' que esconde o elemento
        // após a transição de 'opacity'.
        // Opcional: remover o elemento do DOM após a transição se desejar.
        splashScreen.addEventListener(
          "transitionend",
          (event) => {
            // Verifica se a transição que terminou foi a de opacidade.
            if (
              event.propertyName === "opacity" &&
              splashScreen.classList.contains("hidden")
            ) {
              console.log("[AppManager] Transição da splash screen terminada.");
              // Se quiser remover completamente o elemento do DOM:
              // splashScreen.remove();
              // Por agora, a classe 'hidden' com 'visibility: hidden' é suficiente.
            }
          },
          { once: true }
        ); // O listener é removido após a primeira execução.

        // Fallback: se o evento 'transitionend' não disparar por algum motivo
        // (ex: transições desabilitadas no browser), garante que o elemento
        // não fique "preso" visualmente, embora a classe 'hidden' já deva cuidar disso.
        // Este timeout deve ser maior que a duração total da transição CSS.
        // A transição de opacidade é 0.5s com delay de 0.5s (total 1s), visibility muda em 1s.
        setTimeout(() => {
          if (splashScreen.classList.contains("hidden")) {
            console.log(
              "[AppManager] Fallback: Splash screen deveria estar escondida pelo CSS agora."
            );
            // Se splashScreen.remove() fosse usado, poderia ser chamado aqui como último recurso.
          }
        }, 1200); // Um pouco mais que a duração da transição (1s).
      }, 50); // Atraso de 50ms antes de adicionar a classe 'hidden'.
    } else {
      console.warn("[AppManager] Elemento da splash screen não encontrado.");
    }
  }
}
