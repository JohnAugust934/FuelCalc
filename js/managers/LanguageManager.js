// js/managers/LanguageManager.js
// Responsável por gerir a internacionalização (i18n) da aplicação.

// Importa as configurações globais, incluindo o idioma padrão e as traduções.
import { CONFIG, translations } from "../config.js";
// StorageManager será importado quando AppManager o instanciar e passar como dependência.

export class LanguageManager {
  /**
   * Construtor da classe LanguageManager.
   * @param {StorageManager} storageManager - Instância do gestor de armazenamento para guardar/carregar preferências de idioma.
   */
  constructor(storageManager) {
    this.storageManager = storageManager;
    // Carrega a preferência de idioma guardada ou usa o idioma padrão.
    this.currentLanguage =
      this._loadLanguagePreference() || CONFIG.DEFAULT_LANGUAGE;
    // Armazena todas as traduções disponíveis.
    this.translationData = translations;
    // Vincula os eventos aos botões de troca de idioma na UI.
    this._bindLanguageButtons();
  }

  /**
   * Carrega a preferência de idioma do utilizador a partir do localStorage.
   * @returns {string|null} O código do idioma preferido (ex: 'pt-BR') ou null se não houver preferência guardada.
   * @private
   */
  _loadLanguagePreference() {
    const settings = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.APP_SETTINGS,
      {}
    );
    return settings.language;
  }

  /**
   * Guarda a preferência de idioma do utilizador no localStorage.
   * @param {string} lang - O código do idioma a ser guardado (ex: 'pt-BR').
   * @private
   */
  _saveLanguagePreference(lang) {
    const settings = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.APP_SETTINGS,
      {}
    );
    settings.language = lang;
    this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, settings);
  }

  /**
   * Vincula os listeners de evento de clique aos botões de seleção de idioma na página.
   * @private
   */
  _bindLanguageButtons() {
    // Seleciona todos os botões com a classe '.lang-button'.
    document.querySelectorAll(".lang-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        // Obtém o idioma do atributo 'data-lang' do botão clicado.
        const lang = e.currentTarget.dataset.lang;
        this.setLanguage(lang); // Define o novo idioma.
      });
    });
  }

  /**
   * Define o idioma atual da aplicação.
   * Atualiza a preferência guardada, aplica as traduções à página e atualiza a UI.
   * @param {string} lang - O código do idioma a ser definido (ex: 'pt-BR', 'en').
   */
  setLanguage(lang) {
    // Verifica se o idioma solicitado existe nas traduções disponíveis.
    if (this.translationData[lang]) {
      this.currentLanguage = lang;
      this._saveLanguagePreference(lang); // Guarda a nova preferência.
      this.applyTranslationsToPage(); // Aplica as traduções aos elementos da página.
      document.documentElement.lang = lang; // Atualiza o atributo 'lang' da tag <html>.

      // Atualiza o estado 'aria-pressed' dos botões de idioma para refletir a seleção atual.
      document.querySelectorAll(".lang-button").forEach((button) => {
        button.setAttribute("aria-pressed", button.dataset.lang === lang);
      });

      // Dispara um evento personalizado para notificar outros módulos sobre a mudança de idioma.
      document.dispatchEvent(
        new CustomEvent("languageChanged", { detail: { lang } })
      );
    } else {
      console.warn(`Idioma ${lang} não encontrado nas traduções.`);
    }
  }

  /**
   * Obtém a string traduzida para uma determinada chave e idioma.
   * Permite a substituição de placeholders na string traduzida.
   * @param {string} key - A chave da string de tradução.
   * @param {Object} [params={}] - Um objeto com parâmetros para substituir placeholders (ex: { name: "Utilizador" }).
   * @returns {string} A string traduzida, ou a própria chave se a tradução não for encontrada.
   */
  get(key, params = {}) {
    // Obtém o conjunto de traduções para o idioma atual ou para o idioma padrão como fallback.
    const langTranslations =
      this.translationData[this.currentLanguage] ||
      this.translationData[CONFIG.DEFAULT_LANGUAGE];
    // Obtém a string traduzida; se não existir, usa a própria chave como fallback.
    let translatedString = langTranslations[key] || key;

    // Substitui placeholders na string (ex: "{name}" pelos valores em params.name).
    for (const paramKey in params) {
      translatedString = translatedString.replace(
        new RegExp(`{${paramKey}}`, "g"),
        params[paramKey]
      );
    }
    return translatedString;
  }

  /**
   * Aplica as traduções a todos os elementos da página que possuem o atributo 'data-translate-key'
   * e outros atributos relacionados à tradução.
   */
  applyTranslationsToPage() {
    // Itera sobre todos os elementos com o atributo 'data-translate-key'.
    document
      .querySelectorAll(
        "[data-translate-key], [data-translate-key-placeholder], [data-translate-key-aria-label], [data-translate-key-title]"
      )
      .forEach((element) => {
        const mainKey = element.dataset.translateKey;
        const placeholderKey = element.dataset.translateKeyPlaceholder;
        const ariaLabelKey = element.dataset.translateKeyAriaLabel;
        const titleKey = element.dataset.translateKeyTitle;

        // Traduz o textContent principal se a chave existir
        if (mainKey) {
          element.textContent = this.get(mainKey);
        }
        // Traduz o placeholder se a chave existir
        if (
          placeholderKey &&
          (element.tagName === "INPUT" || element.tagName === "TEXTAREA")
        ) {
          element.placeholder = this.get(placeholderKey);
        }
        // Traduz o aria-label se a chave existir
        if (ariaLabelKey) {
          element.setAttribute("aria-label", this.get(ariaLabelKey));
        }
        // Traduz o title se a chave existir
        if (titleKey) {
          element.title = this.get(titleKey);
        }
      });

    // Traduz o título da página (tag <title> no <head>).
    const pageTitleElement = document.querySelector(
      "title[data-translate-key]"
    );
    if (pageTitleElement) {
      pageTitleElement.textContent = this.get(
        pageTitleElement.dataset.translateKey
      );
    }
  }
}
