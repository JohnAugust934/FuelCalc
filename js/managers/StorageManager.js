// js/managers/StorageManager.js
// Responsável por interagir com o localStorage para persistir e carregar dados da aplicação.

// Importa as configurações globais, que incluem as chaves do localStorage e o idioma padrão.
import { CONFIG, translations } from "../config.js";
// UIManager será injetado no construtor para exibir notificações em caso de erro.

export class StorageManager {
  /**
   * Construtor da classe StorageManager.
   * @param {UIManager} uiManager - Instância do gestor da UI para exibir notificações.
   */
  constructor(uiManager) {
    this.uiManager = uiManager;
  }

  /**
   * Obtém um item do localStorage de forma segura, fazendo o parse de JSON.
   * Se a chave não existir ou ocorrer um erro durante o parse, retorna um valor padrão.
   * Notifica o utilizador em caso de erro ao carregar dados.
   * @param {string} key - A chave do item a ser recuperado do localStorage.
   * @param {any} [defaultValue=[]] - O valor padrão a ser retornado em caso de falha.
   * @returns {any} O valor recuperado e parseado, ou o valor padrão.
   */
  safeGetItem(key, defaultValue = []) {
    try {
      // Verifica se o localStorage está disponível e funcional.
      if (!this._isStorageAvailable()) {
        // Não mostra notificação aqui, pois pode ser chamado frequentemente na inicialização.
        // O UIManager pode não estar pronto, ou pode poluir a UI.
        console.warn(
          "LocalStorage não está disponível. A utilizar valor padrão para a chave:",
          key
        );
        return defaultValue;
      }
      const item = localStorage.getItem(key);
      // Se o item existir, faz o parse. Caso contrário, retorna o valor padrão.
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
      // Notifica o utilizador sobre o erro, usando o UIManager se disponível.
      if (this.uiManager) {
        this.uiManager.showNotification("storageLoadError", "error", { key });
      }
      // Em caso de erro de parse (item corrompido), remove o item inválido.
      if (this._isStorageAvailable()) {
        localStorage.removeItem(key);
      }
      return defaultValue;
    }
  }

  /**
   * Define um item no localStorage de forma segura, convertendo o valor para JSON.
   * Notifica o utilizador em caso de erro ao guardar dados (ex: quota excedida).
   * @param {string} key - A chave do item a ser guardado no localStorage.
   * @param {any} value - O valor a ser guardado (será convertido para JSON).
   * @returns {boolean} Retorna `true` se o item foi guardado com sucesso, `false` caso contrário.
   */
  safeSetItem(key, value) {
    try {
      if (!this._isStorageAvailable()) {
        if (this.uiManager)
          this.uiManager.showNotification("storageUnavailableError", "error");
        return false;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Erro ao guardar ${key} no localStorage:`, error);
      // Determina a chave da mensagem de erro com base no tipo de erro.
      const messageKey =
        error.name === "QuotaExceededError"
          ? "storageQuotaError"
          : "storageSaveError";
      if (this.uiManager)
        this.uiManager.showNotification(messageKey, "error", { key });
      return false;
    }
  }

  /**
   * Verifica se o localStorage está disponível e funcional no navegador.
   * @returns {boolean} Retorna `true` se o localStorage estiver disponível, `false` caso contrário.
   * @private
   */
  _isStorageAvailable() {
    let storage;
    try {
      storage = window.localStorage;
      const testKey = "__storage_test_fuelcalc__"; // Chave de teste específica da aplicação
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      // Trata exceções comuns, incluindo QuotaExceededError e outras restrições de segurança/privacidade.
      return (
        e instanceof DOMException &&
        // Códigos de erro comuns para quota excedida ou indisponibilidade.
        (e.code === 22 || // Todos os navegadores exceto Firefox
          e.code === 1014 || // Firefox
          e.name === "QuotaExceededError" || // Padrão W3C
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") && // Firefox específico
        // Verifica se, apesar do erro de quota, o objeto de storage existe e tem algum comprimento.
        storage &&
        storage.length !== 0
      );
    }
  }

  /**
   * Exporta os dados da aplicação (veículos, histórico, configurações) para um ficheiro JSON.
   * O ficheiro é descarregado automaticamente pelo navegador.
   */
  exportData() {
    const dataToExport = {
      app: "FuelCalc",
      version: CONFIG.APP_VERSION, // Inclui a versão da aplicação no backup
      exportDate: new Date().toISOString(), // Data da exportação
      vehicles: this.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []),
      history: this.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []),
      settings: this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {
        language: CONFIG.DEFAULT_LANGUAGE,
      }),
    };

    // Cria um Blob com os dados JSON.
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    // Cria uma URL temporária para o Blob.
    const url = URL.createObjectURL(blob);
    // Cria um link <a> invisível para acionar o download.
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuelcalc_backup_${CONFIG.APP_VERSION}_${
      new Date().toISOString().split("T")[0]
    }.json`; // Nome do ficheiro
    document.body.appendChild(a); // Adiciona o link ao DOM (necessário para Firefox).
    a.click(); // Simula o clique no link para iniciar o download.
    document.body.removeChild(a); // Remove o link do DOM.
    URL.revokeObjectURL(url); // Liberta a URL do Blob.

    if (this.uiManager)
      this.uiManager.showNotification("exportSuccess", "success");
  }

  /**
   * Importa dados de um ficheiro JSON para a aplicação.
   * Valida o tipo de ficheiro e a estrutura básica dos dados.
   * @param {File} file - O ficheiro JSON selecionado pelo utilizador.
   * @returns {Promise<boolean>} Retorna uma promessa que resolve para `true` se a importação
   * (parcial ou total) for bem-sucedida, `false` caso contrário.
   */
  async importData(file) {
    if (!file || file.type !== "application/json") {
      if (this.uiManager)
        this.uiManager.showNotification("importErrorFile", "error");
      return false;
    }

    try {
      const fileContent = await file.text(); // Lê o conteúdo do ficheiro como texto.
      const data = JSON.parse(fileContent); // Faz o parse do JSON.
      let itemsImported = false; // Flag para verificar se algo foi realmente importado.

      // Validação básica do formato do ficheiro.
      if (typeof data !== "object" || data === null) {
        if (this.uiManager)
          this.uiManager.showNotification("importErrorFormat", "error");
        return false;
      }

      // Importa dados de veículos se existirem e forem um array.
      if (data.vehicles && Array.isArray(data.vehicles)) {
        // TODO: Adicionar validação mais granular para cada veículo importado (estrutura, tipos de dados).
        if (this.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, data.vehicles)) {
          itemsImported = true;
        }
      } else if (data.vehicles && this.uiManager) {
        // Se 'vehicles' existe mas não é um array.
        this.uiManager.showNotification("importErrorVehiclesFormat", "warning");
      }

      // Importa dados de histórico se existirem e forem um array.
      if (data.history && Array.isArray(data.history)) {
        // TODO: Adicionar validação mais granular para cada registo de histórico.
        if (this.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, data.history)) {
          itemsImported = true;
        }
      } else if (data.history && this.uiManager) {
        // Se 'history' existe mas não é um array.
        this.uiManager.showNotification("importErrorHistoryFormat", "warning");
      }

      // Importa configurações da aplicação, incluindo o idioma.
      if (data.settings && typeof data.settings === "object") {
        const currentSettings = this.safeGetItem(
          CONFIG.STORAGE_KEYS.APP_SETTINGS,
          {}
        );
        const newSettings = { ...currentSettings, ...data.settings }; // Mescla com configurações existentes

        // Valida e define o idioma importado.
        if (data.settings.language && translations[data.settings.language]) {
          newSettings.language = data.settings.language;
        } else if (data.settings.language) {
          console.warn(
            `Idioma "${data.settings.language}" do ficheiro de importação não é suportado. A manter idioma atual ou padrão.`
          );
          // Mantém o idioma atual ou o padrão se o importado não for válido.
          newSettings.language =
            currentSettings.language || CONFIG.DEFAULT_LANGUAGE;
        }

        if (this.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, newSettings)) {
          itemsImported = true; // Considera que as configurações foram um item importado.
        }
      }

      if (itemsImported) {
        if (this.uiManager)
          this.uiManager.showNotification("importSuccess", "success");
        return true; // Indica que a importação foi (pelo menos parcialmente) bem-sucedida.
      } else {
        if (this.uiManager)
          this.uiManager.showNotification("importNoValidData", "info");
        return false; // Nenhum dado válido foi encontrado ou importado.
      }
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      if (this.uiManager)
        this.uiManager.showNotification("importErrorProcessing", "error");
      return false; // Falha ao processar o ficheiro.
    }
  }

  /**
   * Limpa todos os dados da aplicação armazenados no localStorage que são geridos por esta aplicação.
   * Itera sobre as chaves definidas em `CONFIG.STORAGE_KEYS`.
   * @returns {boolean} Retorna `true` se todos os dados foram limpos com sucesso (ou se não havia nada para limpar).
   * Retorna `false` se o armazenamento não estiver disponível ou se ocorrer um erro ao remover alguma chave.
   */
  clearAllData() {
    let allClearedSuccessfully = true;
    // Obtém todas as chaves de storage que a aplicação usa.
    const keysToClear = Object.values(CONFIG.STORAGE_KEYS);

    if (!this._isStorageAvailable()) {
      if (this.uiManager)
        this.uiManager.showNotification("storageUnavailableError", "error");
      return false;
    }

    keysToClear.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Erro ao limpar a chave ${key} do localStorage:`, error);
        // Notifica sobre a falha em limpar uma chave específica.
        if (this.uiManager)
          this.uiManager.showNotification("storageSaveError", "error", { key }); // Reutiliza chave de erro de "guardar"
        allClearedSuccessfully = false; // Marca que a limpeza total não foi 100%
      }
    });

    // A notificação de sucesso/falha geral será tratada pelo AppManager.
    return allClearedSuccessfully;
  }
}
