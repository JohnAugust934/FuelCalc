// app.js - Lógica Principal do FuelCalc
// Data da última refatoração: 01/06/2025 (Exemplo)

// "Modo Estrito" para ajudar a pegar erros comuns.
"use strict";

// ===== CONFIGURAÇÕES E CONSTANTES GLOBAIS =====
const CONFIG = {
  STORAGE_KEYS: {
    VEHICLES: "fuelCalc_vehicles_v1", // Adicionado prefixo e versão
    HISTORY: "fuelCalc_history_v1", // Adicionado prefixo e versão
    APP_SETTINGS: "fuelCalc_settings_v1", // Para futuras configurações
  },
  VALIDATION: {
    MIN_EFFICIENCY: 1, // km/L
    MAX_EFFICIENCY: 70, // km/L (considerando motos e GNV)
    MIN_KM: 0,
    MAX_KM: 9999999, // Aumentado limite de KM
    MIN_PRICE: 0.1, // R$
    MAX_PRICE: 25, // R$ (considerando flutuações)
    MAX_TRIP_DISTANCE: 5000, // km (viagens mais longas)
    MIN_VEHICLE_NAME_LENGTH: 2,
    MAX_VEHICLE_NAME_LENGTH: 40,
    MAX_UBER_GAIN: 20000, // R$
  },
  HISTORY_DISPLAY_COUNT: 3, // Quantidade inicial de itens no histórico
  HISTORY_LIMIT: 50, // Máximo de registros no histórico geral
  DEBOUNCE_DELAY: 350, // ms
  NOTIFICATION_TIMEOUT: 4000, // ms (4 segundos)
  CHART_MAX_DAYS: 30, // Mostrar dados dos últimos 30 dias no gráfico
};

// ===== UTILITÁRIOS GERAIS =====
class Utils {
  /**
   * Sanitiza uma string para prevenir XSS básico, convertendo HTML para texto.
   * @param {string} str - A string a ser sanitizada.
   * @returns {string} A string sanitizada.
   */
  static sanitizeHTML(str) {
    if (typeof str !== "string") return "";
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }

  /**
   * Valida se um valor é um número dentro de um intervalo.
   * @param {any} value - O valor a ser validado.
   * @param {number} min - O valor mínimo permitido.
   * @param {number} max - O valor máximo permitido.
   * @returns {boolean} True se válido, false caso contrário.
   */
  static validateNumber(value, min = -Infinity, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }

  /**
   * Converte vírgulas em pontos em uma string numérica.
   * @param {string|number} value - O valor a ser convertido.
   * @returns {string|number} O valor com pontos ou o valor original se não for string.
   */
  static convertCommaToPoint(value) {
    return typeof value === "string" ? value.replace(/,/g, ".") : value;
  }

  /**
   * Função Debounce: Atraso na execução de uma função até que um certo tempo tenha passado sem novas chamadas.
   * @param {Function} func - A função a ser "debounced".
   * @param {number} wait - O tempo de espera em milissegundos.
   * @returns {Function} A nova função "debounced".
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Formata um número como moeda brasileira (BRL).
   * @param {number} value - O valor numérico.
   * @returns {string} O valor formatado como R$ 0,00.
   */
  static formatCurrency(value) {
    if (isNaN(parseFloat(value))) return "R$ --";
    return parseFloat(value).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  /**
   * Formata uma data ISO para o formato local (dd/mm/aaaa hh:mm).
   * @param {string} isoDateString - A data em formato ISO.
   * @returns {string} A data formatada.
   */
  static formatLocalDate(isoDateString) {
    if (!isoDateString) return "--";
    try {
      return new Date(isoDateString).toLocaleString("pt-BR", {
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

// ===== GERENCIADOR DE NOTIFICAÇÕES E MODAIS =====
class UIManager {
  constructor() {
    // Cache de elementos do DOM para modais e notificações
    this.notificationArea = document.getElementById("notificationArea");

    this.detailsModalOverlay = document.getElementById("detailsModalOverlay");
    this.detailsModalContent = document.getElementById("detailsModalContent");
    this.closeDetailsModalBtn = document.getElementById("closeDetailsModalBtn");

    this.confirmModalOverlay = document.getElementById("confirmModalOverlay");
    this.confirmModalTitle = document.getElementById("confirmModalTitle");
    this.confirmModalMessage = document.getElementById("confirmModalMessage");
    this.confirmModalConfirmBtn = document.getElementById(
      "confirmModalConfirmBtn"
    );
    this.confirmModalCancelBtn = document.getElementById(
      "confirmModalCancelBtn"
    );

    this._bindModalEvents();
    this._resolveConfirm = null; // Para promessa de confirmação
  }

  /**
   * Vincula eventos básicos para fechar modais.
   * @private
   */
  _bindModalEvents() {
    if (this.closeDetailsModalBtn) {
      this.closeDetailsModalBtn.addEventListener("click", () =>
        this.hideDetailsModal()
      );
    }
    if (this.detailsModalOverlay) {
      this.detailsModalOverlay.addEventListener("click", (e) => {
        if (e.target === this.detailsModalOverlay) this.hideDetailsModal();
      });
    }

    if (this.confirmModalCancelBtn) {
      this.confirmModalCancelBtn.addEventListener("click", () =>
        this._handleConfirm(false)
      );
    }
    if (this.confirmModalConfirmBtn) {
      this.confirmModalConfirmBtn.addEventListener("click", () =>
        this._handleConfirm(true)
      );
    }
    if (this.confirmModalOverlay) {
      this.confirmModalOverlay.addEventListener("click", (e) => {
        if (e.target === this.confirmModalOverlay) this._handleConfirm(false); // Cancelar se clicar fora
      });
    }
  }

  /**
   * Mostra uma notificação (toast).
   * @param {string} message - A mensagem da notificação.
   * @param {'success'|'error'|'info'} type - O tipo de notificação.
   */
  showNotification(message, type = "info") {
    if (!this.notificationArea) return;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "assertive"); // Importante para leitores de tela

    const messageSpan = document.createElement("span");
    messageSpan.className = "notification-message";
    messageSpan.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;"; // 'x' para fechar
    closeBtn.className = "notification-close";
    closeBtn.setAttribute("aria-label", "Fechar notificação");
    closeBtn.addEventListener("click", () =>
      this._removeNotification(notification)
    );

    notification.appendChild(messageSpan);
    notification.appendChild(closeBtn);
    this.notificationArea.appendChild(notification);

    // Força reflow para a animação de entrada funcionar
    void notification.offsetWidth;
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";

    setTimeout(
      () => this._removeNotification(notification),
      CONFIG.NOTIFICATION_TIMEOUT
    );
  }

  /**
   * Remove uma notificação do DOM.
   * @param {HTMLElement} notification - O elemento da notificação a ser removido.
   * @private
   */
  _removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)"; // Animação de saída
      // Espera a transição CSS terminar antes de remover do DOM
      notification.addEventListener(
        "transitionend",
        () => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        },
        { once: true }
      );
      // Fallback caso a transição não dispare
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 350); // Duração da transição + pequeno buffer
    }
  }

  /**
   * Mostra o modal de detalhes.
   * @param {string} title - Título do modal.
   * @param {Array<{label: string, value: string}>} detailsArray - Array de objetos com label e valor.
   */
  showDetailsModal(title, detailsArray) {
    if (!this.detailsModalOverlay || !this.detailsModalContent) return;

    const modalTitleElement =
      this.detailsModalOverlay.querySelector("#detailsModalTitle");
    if (modalTitleElement) modalTitleElement.textContent = title;

    this.detailsModalContent.innerHTML = ""; // Limpa conteúdo anterior

    detailsArray.forEach((detail) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "modal-detail-item";

      const labelSpan = document.createElement("span");
      labelSpan.textContent = `${detail.label}:`;

      const valueStrong = document.createElement("strong");
      // Sanitiza o valor, pois pode vir de dados do utilizador (histórico)
      valueStrong.innerHTML = Utils.sanitizeHTML(String(detail.value));

      itemDiv.appendChild(labelSpan);
      itemDiv.appendChild(valueStrong);
      this.detailsModalContent.appendChild(itemDiv);
    });

    this.detailsModalOverlay.style.display = "flex";
    // Força reflow para a animação de entrada do modal
    void this.detailsModalOverlay.offsetWidth;
    this.detailsModalOverlay.classList.add("active");
    if (this.closeDetailsModalBtn) this.closeDetailsModalBtn.focus();
  }

  /**
   * Esconde o modal de detalhes.
   */
  hideDetailsModal() {
    if (!this.detailsModalOverlay) return;
    this.detailsModalOverlay.classList.remove("active");
    // Espera a transição CSS antes de esconder com display:none
    this.detailsModalOverlay.addEventListener(
      "transitionend",
      () => {
        if (!this.detailsModalOverlay.classList.contains("active")) {
          // Verifica se ainda deve estar escondido
          this.detailsModalOverlay.style.display = "none";
        }
      },
      { once: true }
    );
    setTimeout(() => {
      // Fallback
      if (!this.detailsModalOverlay.classList.contains("active")) {
        this.detailsModalOverlay.style.display = "none";
      }
    }, 350);
  }

  /**
   * Mostra um modal de confirmação.
   * @param {string} message - A mensagem de confirmação.
   * @param {string} [title="Confirmar Ação"] - O título do modal.
   * @returns {Promise<boolean>} Uma promessa que resolve para true se confirmado, false caso contrário.
   */
  showConfirm(message, title = "Confirmar Ação") {
    return new Promise((resolve) => {
      if (
        !this.confirmModalOverlay ||
        !this.confirmModalTitle ||
        !this.confirmModalMessage
      ) {
        // Fallback para o confirm nativo se o modal não estiver pronto
        console.warn(
          "Modal de confirmação não encontrado, usando confirm nativo."
        );
        resolve(window.confirm(message));
        return;
      }

      this.confirmModalTitle.textContent = title;
      this.confirmModalMessage.textContent = message;
      this._resolveConfirm = resolve; // Armazena a função resolve da promessa

      this.confirmModalOverlay.style.display = "flex";
      void this.confirmModalOverlay.offsetWidth; // Reflow
      this.confirmModalOverlay.classList.add("active");
      if (this.confirmModalConfirmBtn) this.confirmModalConfirmBtn.focus();
    });
  }

  /**
   * Manipula a resposta do modal de confirmação.
   * @param {boolean} confirmed - True se o utilizador confirmou, false caso contrário.
   * @private
   */
  _handleConfirm(confirmed) {
    if (!this.confirmModalOverlay) return;
    this.confirmModalOverlay.classList.remove("active");
    this.confirmModalOverlay.addEventListener(
      "transitionend",
      () => {
        if (!this.confirmModalOverlay.classList.contains("active")) {
          this.confirmModalOverlay.style.display = "none";
        }
      },
      { once: true }
    );
    setTimeout(() => {
      // Fallback
      if (!this.confirmModalOverlay.classList.contains("active")) {
        this.confirmModalOverlay.style.display = "none";
      }
    }, 350);

    if (this._resolveConfirm) {
      this._resolveConfirm(confirmed);
      this._resolveConfirm = null; // Limpa para a próxima chamada
    }
  }
}

// ===== GERENCIADOR DE ARMAZENAMENTO LOCAL (LocalStorage) =====
class StorageManager {
  constructor(uiManager) {
    this.uiManager = uiManager; // Para mostrar notificações de erro
  }

  /**
   * Obtém um item do localStorage de forma segura, com parse de JSON.
   * @param {string} key - A chave do item.
   * @param {any} [defaultValue=[]] - O valor padrão a ser retornado se a chave não existir ou houver erro.
   * @returns {any} O valor parseado ou o valor padrão.
   */
  safeGetItem(key, defaultValue = []) {
    try {
      if (!this._isStorageAvailable()) {
        console.warn("LocalStorage não está disponível. A usar valor padrão.");
        return defaultValue;
      }
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar ${key} do localStorage:`, error);
      this.uiManager.showNotification(
        `Erro ao carregar dados locais (${key}). Alguns dados podem ter sido perdidos.`,
        "error"
      );
      localStorage.removeItem(key); // Remove item corrompido
      return defaultValue;
    }
  }

  /**
   * Define um item no localStorage de forma segura, com stringify para JSON.
   * @param {string} key - A chave do item.
   * @param {any} value - O valor a ser armazenado.
   * @returns {boolean} True se salvo com sucesso, false caso contrário.
   */
  safeSetItem(key, value) {
    try {
      if (!this._isStorageAvailable()) {
        this.uiManager.showNotification(
          "Armazenamento local não disponível. Não foi possível guardar os dados.",
          "error"
        );
        return false;
      }
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Erro ao guardar ${key} no localStorage:`, error);
      let message = `Erro ao guardar dados (${key}).`;
      if (error.name === "QuotaExceededError") {
        message =
          "Espaço de armazenamento local cheio. Não foi possível guardar. Tente limpar o histórico ou exportar dados.";
      }
      this.uiManager.showNotification(message, "error");
      return false;
    }
  }

  /**
   * Verifica se o localStorage está disponível e funcional.
   * @returns {boolean} True se disponível, false caso contrário.
   * @private
   */
  _isStorageAvailable() {
    let storage;
    try {
      storage = window.localStorage;
      const testKey = "__storage_test__";
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      // Trata exceções comuns, incluindo QuotaExceededError
      return (
        e instanceof DOMException &&
        (e.code === 22 || // Todos exceto Firefox
          e.code === 1014 || // Firefox
          e.name === "QuotaExceededError" || // Todos
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") && // Firefox
        storage &&
        storage.length !== 0 // Verifica se há algo, mesmo com erro de quota
      );
    }
  }

  /**
   * Exporta os dados da aplicação (veículos e histórico) para um ficheiro JSON.
   */
  exportData() {
    const dataToExport = {
      app: "FuelCalc",
      version: "1.0", // Versão do formato do backup
      exportDate: new Date().toISOString(),
      vehicles: this.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []),
      history: this.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []),
      // Adicionar settings se houver:
      // settings: this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {}),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuelcalc_backup_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a); // Necessário para Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.uiManager.showNotification("Dados exportados com sucesso!", "success");
  }

  /**
   * Importa dados de um ficheiro JSON para a aplicação.
   * @param {File} file - O ficheiro JSON a ser importado.
   * @returns {Promise<boolean>} True se a importação (parcial ou total) foi bem-sucedida, false caso contrário.
   */
  async importData(file) {
    if (!file || file.type !== "application/json") {
      this.uiManager.showNotification(
        "Ficheiro inválido. Por favor, selecione um ficheiro .json.",
        "error"
      );
      return false;
    }

    try {
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);
      let vehiclesImported = false;
      let historyImported = false;

      // Validação básica do formato do ficheiro
      if (typeof data !== "object" || data === null) {
        this.uiManager.showNotification(
          "Formato de ficheiro de backup inválido.",
          "error"
        );
        return false;
      }

      if (data.vehicles && Array.isArray(data.vehicles)) {
        // TODO: Adicionar validação mais granular para cada veículo importado
        if (this.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, data.vehicles)) {
          vehiclesImported = true;
        }
      } else if (data.vehicles) {
        this.uiManager.showNotification(
          "Dados de veículos no ficheiro de backup estão mal formatados.",
          "warning"
        );
      }

      if (data.history && Array.isArray(data.history)) {
        // TODO: Adicionar validação mais granular para cada registo de histórico
        if (this.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, data.history)) {
          historyImported = true;
        }
      } else if (data.history) {
        this.uiManager.showNotification(
          "Dados de histórico no ficheiro de backup estão mal formatados.",
          "warning"
        );
      }

      if (vehiclesImported || historyImported) {
        this.uiManager.showNotification(
          "Dados importados com sucesso! A aplicação será atualizada.",
          "success"
        );
        return true; // Indica que algo foi importado
      } else {
        this.uiManager.showNotification(
          "Nenhum dado válido de veículos ou histórico encontrado no ficheiro.",
          "info"
        );
        return false;
      }
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      this.uiManager.showNotification(
        "Erro ao processar o ficheiro de backup. Verifique a consola para detalhes.",
        "error"
      );
      return false;
    }
  }

  /**
   * Limpa todos os dados da aplicação armazenados no localStorage.
   * @returns {boolean} True se todos os dados foram limpos com sucesso.
   */
  clearAllData() {
    let allCleared = true;
    const keysToClear = [
      CONFIG.STORAGE_KEYS.VEHICLES,
      CONFIG.STORAGE_KEYS.HISTORY,
      CONFIG.STORAGE_KEYS.APP_SETTINGS, // Se existirem configurações futuras
    ];

    if (!this._isStorageAvailable()) {
      this.uiManager.showNotification(
        "Armazenamento local não disponível. Não foi possível limpar os dados.",
        "error"
      );
      return false;
    }

    keysToClear.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Erro ao limpar a chave ${key} do localStorage:`, error);
        this.uiManager.showNotification(
          `Erro ao tentar limpar parte dos dados (${key}).`,
          "error"
        );
        allCleared = false;
      }
    });

    if (allCleared) {
      this.uiManager.showNotification(
        "Todos os dados da aplicação foram limpos com sucesso!",
        "success"
      );
    }
    return allCleared;
  }
}

// ===== VALIDADOR DE DADOS DA APLICAÇÃO =====
class Validator {
  constructor(uiManager) {
    this.uiManager = uiManager;
  }
  /**
   * Valida os dados de um veículo.
   * @param {string} nome - Nome do veículo.
   * @param {number|string} eficiencia - Eficiência do veículo.
   * @param {string} tipo - Tipo do veículo ('carro' ou 'moto').
   * @returns {{isValid: boolean, errors: string[], data: object|null}} Objeto com status da validação.
   */
  validateVehicle(nome, eficiencia, tipo) {
    const errors = [];
    const parsedEficiencia = parseFloat(
      Utils.convertCommaToPoint(String(eficiencia))
    );
    const trimmedNome = String(nome).trim();

    if (
      trimmedNome.length < CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH ||
      trimmedNome.length > CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH
    ) {
      errors.push(
        `Nome do veículo deve ter entre ${CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH} e ${CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH} caracteres.`
      );
    }
    if (
      !Utils.validateNumber(
        parsedEficiencia,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    ) {
      errors.push(
        `Eficiência deve ser um número entre ${CONFIG.VALIDATION.MIN_EFFICIENCY} e ${CONFIG.VALIDATION.MAX_EFFICIENCY} km/L.`
      );
    }
    if (!["carro", "moto"].includes(tipo)) {
      errors.push("Tipo de veículo inválido. Selecione 'Carro' ou 'Moto'.");
    }

    const isValid = errors.length === 0;
    if (!isValid && this.uiManager)
      this.uiManager.showNotification(errors.join("\n"), "error");

    return {
      isValid,
      errors,
      data: isValid
        ? { nome: trimmedNome, eficiencia: parsedEficiencia, tipo }
        : null,
    };
  }

  /**
   * Valida os dados de uma viagem.
   * @returns {{isValid: boolean, errors: string[], data: object|null}} Objeto com status da validação.
   */
  validateTrip(kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber) {
    const errors = [];
    const data = {}; // Para armazenar os valores parseados

    data.kmInicial = parseFloat(Utils.convertCommaToPoint(String(kmInicial)));
    if (
      !Utils.validateNumber(
        data.kmInicial,
        CONFIG.VALIDATION.MIN_KM,
        CONFIG.VALIDATION.MAX_KM
      )
    ) {
      errors.push(
        `KM Inicial inválido (entre ${CONFIG.VALIDATION.MIN_KM} e ${CONFIG.VALIDATION.MAX_KM}).`
      );
    }

    data.kmFinal = parseFloat(Utils.convertCommaToPoint(String(kmFinal)));
    if (
      !Utils.validateNumber(
        data.kmFinal,
        data.kmInicial + 0.01,
        CONFIG.VALIDATION.MAX_KM
      )
    ) {
      // KM final deve ser maior
      errors.push(
        `KM Final inválido (deve ser maior que KM Inicial e até ${CONFIG.VALIDATION.MAX_KM}).`
      );
    } else if (
      data.kmFinal - data.kmInicial >
      CONFIG.VALIDATION.MAX_TRIP_DISTANCE
    ) {
      errors.push(
        `Distância da viagem excede o limite de ${CONFIG.VALIDATION.MAX_TRIP_DISTANCE} km.`
      );
    }

    data.kmPorLitro = parseFloat(Utils.convertCommaToPoint(String(kmPorLitro)));
    if (
      !Utils.validateNumber(
        data.kmPorLitro,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    ) {
      errors.push(
        `Eficiência do veículo inválida (entre ${CONFIG.VALIDATION.MIN_EFFICIENCY} e ${CONFIG.VALIDATION.MAX_EFFICIENCY} km/L).`
      );
    }

    data.precoCombustivel = parseFloat(
      Utils.convertCommaToPoint(String(precoCombustivel))
    );
    if (
      !Utils.validateNumber(
        data.precoCombustivel,
        CONFIG.VALIDATION.MIN_PRICE,
        CONFIG.VALIDATION.MAX_PRICE
      )
    ) {
      errors.push(
        `Preço do combustível inválido (entre R$${CONFIG.VALIDATION.MIN_PRICE.toFixed(
          2
        )} e R$${CONFIG.VALIDATION.MAX_PRICE.toFixed(2)}).`
      );
    }

    if (
      ganhoUber !== null &&
      ganhoUber !== undefined &&
      String(ganhoUber).trim() !== ""
    ) {
      data.ganhoUber = parseFloat(Utils.convertCommaToPoint(String(ganhoUber)));
      if (
        !Utils.validateNumber(
          data.ganhoUber,
          0,
          CONFIG.VALIDATION.MAX_UBER_GAIN
        )
      ) {
        errors.push(
          `Ganho da viagem inválido (entre R$0 e R$${CONFIG.VALIDATION.MAX_UBER_GAIN.toFixed(
            2
          )}).`
        );
      }
    } else {
      data.ganhoUber = null; // Tratar como não informado
    }

    const isValid = errors.length === 0;
    if (!isValid && this.uiManager)
      this.uiManager.showNotification(errors.join("\n"), "error");

    return { isValid, errors, data: isValid ? data : null };
  }
}

// ===== GERENCIADOR DE VEÍCULOS =====
class VehicleManager {
  constructor(storageManager, uiManager, validator) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.validator = validator;

    this.currentVehicle = null; // Objeto do veículo atualmente selecionado
    this.currentVehicleType = "carro"; // 'carro' ou 'moto'

    // Cache de elementos do DOM
    this.dom = {
      vehicleTypeButtons: document.querySelectorAll("[data-vehicle-type]"),
      vehicleListContainer: document.getElementById("vehicleList"),
      addVehicleBtn: document.getElementById("addVehicleBtn"),
      vehicleForm: document.getElementById("vehicleForm"),
      vehicleTypeInput: document.getElementById("vehicleType"), // Hidden input no form
      vehicleNameInput: document.getElementById("vehicleName"),
      vehicleEfficiencyInput: document.getElementById("vehicleEfficiency"),
      saveVehicleBtn: document.getElementById("saveVehicleBtn"),
      cancelVehicleBtn: document.getElementById("cancelVehicleBtn"),
      // Input de eficiência no formulário principal de cálculo
      mainFormEfficiencyInput: document.getElementById("kmPorLitro"),
    };
    this._bindEvents();
  }

  _bindEvents() {
    this.dom.vehicleTypeButtons.forEach((button) => {
      button.addEventListener("click", (e) =>
        this.selectVehicleType(e.currentTarget.dataset.vehicleType)
      );
    });
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
  }

  /**
   * Seleciona o tipo de veículo (carro/moto) e atualiza a UI.
   * @param {'carro'|'moto'} type - O tipo de veículo.
   */
  selectVehicleType(type) {
    if (type !== "carro" && type !== "moto") return; // Validação básica
    this.currentVehicleType = type;

    // Atualiza visual dos botões de tipo
    this.dom.vehicleTypeButtons.forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.vehicleType === type);
      btn.setAttribute("aria-pressed", btn.dataset.vehicleType === type);
    });

    // Limpa seleção de veículo e campo de eficiência se o tipo mudar
    this.currentVehicle = null;
    if (this.dom.mainFormEfficiencyInput)
      this.dom.mainFormEfficiencyInput.value = "";

    this.loadAndRenderVehicles();

    // Notifica outros módulos da mudança de tipo (se necessário)
    document.dispatchEvent(
      new CustomEvent("vehicleTypeChanged", { detail: { type } })
    );
  }

  /**
   * Carrega veículos do localStorage e renderiza na UI.
   */
  loadAndRenderVehicles() {
    if (!this.dom.vehicleListContainer) return;
    const allVehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const filteredVehicles = allVehicles.filter(
      (v) => v.tipo === this.currentVehicleType
    );

    this.dom.vehicleListContainer.innerHTML = ""; // Limpa lista atual

    if (filteredVehicles.length === 0) {
      this.dom.vehicleListContainer.innerHTML = `<li class="empty-message">Nenhum ${this.currentVehicleType} registado.</li>`;
      return;
    }

    filteredVehicles.forEach((vehicle) => {
      const card = this._createVehicleCardElement(vehicle);
      this.dom.vehicleListContainer.appendChild(card);
    });
  }

  /**
   * Cria o elemento HTML para um card de veículo.
   * @param {object} vehicle - O objeto do veículo.
   * @returns {HTMLElement} O elemento do card.
   * @private
   */
  _createVehicleCardElement(vehicle) {
    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.dataset.vehicleId = vehicle.id;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute(
      "aria-label",
      `Selecionar veículo ${Utils.sanitizeHTML(vehicle.nome)}, ${
        vehicle.eficiencia
      } km/L`
    );

    if (this.currentVehicle && this.currentVehicle.id === vehicle.id) {
      card.classList.add("active");
    }

    const title = document.createElement("h4");
    title.textContent = Utils.sanitizeHTML(vehicle.nome);

    const efficiencySpan = document.createElement("span");
    efficiencySpan.textContent = `${vehicle.eficiencia} km/L`;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.innerHTML = "&times;"; // Ícone 'x'
    deleteBtn.setAttribute(
      "aria-label",
      `Excluir veículo ${Utils.sanitizeHTML(vehicle.nome)}`
    );
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation(); // Evita que o card seja selecionado ao clicar em excluir
      const confirmed = await this.uiManager.showConfirm(
        `Tem a certeza que deseja excluir o veículo "${Utils.sanitizeHTML(
          vehicle.nome
        )}"?`
      );
      if (confirmed) this.deleteVehicle(vehicle.id);
    });

    card.appendChild(title);
    card.appendChild(efficiencySpan);
    card.appendChild(deleteBtn);

    card.addEventListener("click", () => this.selectVehicle(vehicle.id));
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.selectVehicle(vehicle.id);
      }
    });
    return card;
  }

  /**
   * Seleciona um veículo específico.
   * @param {string} vehicleId - O ID do veículo a ser selecionado.
   */
  selectVehicle(vehicleId) {
    const allVehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const vehicle = allVehicles.find((v) => v.id === vehicleId);

    if (vehicle) {
      this.currentVehicle = vehicle;
      if (this.dom.mainFormEfficiencyInput) {
        this.dom.mainFormEfficiencyInput.value = vehicle.eficiencia;
      }
      // Atualiza a classe 'active' nos cards
      this.dom.vehicleListContainer
        .querySelectorAll(".vehicle-card")
        .forEach((cardEl) => {
          cardEl.classList.toggle(
            "active",
            cardEl.dataset.vehicleId === vehicleId
          );
        });
      this.uiManager.showNotification(
        `Veículo "${Utils.sanitizeHTML(vehicle.nome)}" selecionado.`,
        "info"
      );
    }
  }

  /**
   * Mostra o formulário para adicionar/editar veículo.
   */
  showVehicleForm() {
    if (!this.dom.vehicleForm || !this.dom.vehicleTypeInput) return;
    this.dom.vehicleTypeInput.value = this.currentVehicleType; // Define o tipo no input hidden
    this.dom.vehicleNameInput.value = "";
    this.dom.vehicleEfficiencyInput.value = "";
    this.dom.vehicleForm.style.display = "block";
    this.dom.vehicleNameInput.focus();
    // Opcional: rolar para o formulário
    this.dom.vehicleForm.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  /**
   * Esconde o formulário de veículo.
   */
  hideVehicleForm() {
    if (this.dom.vehicleForm) this.dom.vehicleForm.style.display = "none";
  }

  /**
   * Salva um novo veículo ou atualiza um existente.
   */
  saveVehicle() {
    const validationResult = this.validator.validateVehicle(
      this.dom.vehicleNameInput.value,
      this.dom.vehicleEfficiencyInput.value,
      this.dom.vehicleTypeInput.value // Pega o tipo do input hidden
    );

    if (!validationResult.isValid) return; // Notificação de erro já foi mostrada pelo validador

    const { nome, eficiencia, tipo } = validationResult.data;
    const newVehicle = {
      id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      nome, // Já sanitizado e trimado pelo validador
      eficiencia,
      tipo,
      createdAt: new Date().toISOString(),
    };

    const vehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    // Verifica se já existe um veículo com o mesmo nome e tipo
    const existingVehicle = vehicles.find(
      (v) => v.nome.toLowerCase() === nome.toLowerCase() && v.tipo === tipo
    );
    if (existingVehicle) {
      this.uiManager.showNotification(
        `Já existe um ${tipo} com o nome "${nome}".`,
        "error"
      );
      return;
    }

    vehicles.push(newVehicle);
    if (
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)
    ) {
      this.uiManager.showNotification(
        `Veículo "${nome}" guardado com sucesso!`,
        "success"
      );
      this.hideVehicleForm();
      this.loadAndRenderVehicles(); // Atualiza a lista
      // Se este é o primeiro veículo do tipo, seleciona-o automaticamente
      if (
        vehicles.filter((v) => v.tipo === this.currentVehicleType).length === 1
      ) {
        this.selectVehicle(newVehicle.id);
      }
    }
  }

  /**
   * Deleta um veículo.
   * @param {string} vehicleId - O ID do veículo a ser deletado.
   */
  deleteVehicle(vehicleId) {
    let vehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const vehicleToDelete = vehicles.find((v) => v.id === vehicleId);
    if (!vehicleToDelete) return;

    vehicles = vehicles.filter((v) => v.id !== vehicleId);
    if (
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)
    ) {
      this.uiManager.showNotification(
        `Veículo "${Utils.sanitizeHTML(vehicleToDelete.nome)}" excluído.`,
        "success"
      );
      if (this.currentVehicle && this.currentVehicle.id === vehicleId) {
        this.currentVehicle = null; // Desseleciona se era o veículo ativo
        if (this.dom.mainFormEfficiencyInput)
          this.dom.mainFormEfficiencyInput.value = "";
      }
      this.loadAndRenderVehicles(); // Atualiza a lista
      // Se não houver mais veículos, pode ser útil limpar o campo de eficiência principal
      if (
        vehicles.filter((v) => v.tipo === this.currentVehicleType).length ===
          0 &&
        this.dom.mainFormEfficiencyInput
      ) {
        this.dom.mainFormEfficiencyInput.placeholder =
          "Adicione um veículo ou informe";
      }
    }
  }

  /**
   * Obtém o nome do veículo atual, se selecionado.
   * @returns {string|null} Nome do veículo ou null.
   */
  getCurrentVehicleName() {
    return this.currentVehicle ? this.currentVehicle.nome : null;
  }

  /**
   * Reseta o estado do gestor de veículos (ex: após limpar todos os dados).
   */
  resetState() {
    this.currentVehicle = null;
    this.currentVehicleType = "carro"; // Volta para o tipo padrão
    if (this.dom.mainFormEfficiencyInput) {
      this.dom.mainFormEfficiencyInput.value = "";
      this.dom.mainFormEfficiencyInput.placeholder =
        "Selecione um veículo ou informe";
    }
    this.selectVehicleType("carro"); // Re-renderiza com o tipo padrão (lista vazia)
  }
}

// ===== CALCULADORA DE COMBUSTÍVEL =====
class FuelCalculator {
  constructor(storageManager, uiManager, validator, vehicleManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.validator = validator;
    this.vehicleManager = vehicleManager; // Para obter tipo e ID do veículo atual

    this.dom = {
      form: document.getElementById("fuelForm"),
      kmInicialInput: document.getElementById("kmInicial"),
      kmFinalInput: document.getElementById("kmFinal"),
      kmPorLitroInput: document.getElementById("kmPorLitro"), // Eficiência no form principal
      precoCombustivelInput: document.getElementById("precoCombustivel"),
      ganhoUberInput: document.getElementById("ganhoUber"),
      // Elementos do card de resultado
      resultCard: document.getElementById("resultCard"),
      distanciaResult: document.getElementById("distanciaResult"),
      litrosResult: document.getElementById("litrosResult"),
      custoResult: document.getElementById("custoResult"),
      lucroResult: document.getElementById("lucroResult"),
    };
    this._bindEvents();
  }

  _bindEvents() {
    if (this.dom.form) {
      this.dom.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.calculateAndDisplayTrip();
      });
    }
  }

  /**
   * Calcula os gastos da viagem e exibe os resultados.
   */
  calculateAndDisplayTrip() {
    const validationResult = this.validator.validateTrip(
      this.dom.kmInicialInput.value,
      this.dom.kmFinalInput.value,
      this.dom.kmPorLitroInput.value,
      this.dom.precoCombustivelInput.value,
      this.dom.ganhoUberInput.value
    );

    if (!validationResult.isValid) return; // Erros já mostrados pelo validador

    const { kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber } =
      validationResult.data;

    const distancia = kmFinal - kmInicial;
    const litrosConsumidos = distancia / kmPorLitro;
    const custoTotal = litrosConsumidos * precoCombustivel;
    const lucroLiquido = ganhoUber !== null ? ganhoUber - custoTotal : null;

    // Exibe os resultados
    if (this.dom.distanciaResult)
      this.dom.distanciaResult.textContent = `${distancia.toFixed(1)} km`;
    if (this.dom.litrosResult)
      this.dom.litrosResult.textContent = `${litrosConsumidos.toFixed(1)} L`;
    if (this.dom.custoResult)
      this.dom.custoResult.textContent = Utils.formatCurrency(custoTotal);

    if (this.dom.lucroResult) {
      const lucroItem = this.dom.lucroResult.closest(".result-item"); // Encontra o elemento pai '.result-item'
      if (lucroLiquido !== null) {
        this.dom.lucroResult.textContent = Utils.formatCurrency(lucroLiquido);
        if (lucroItem) lucroItem.style.display = ""; // Mostra o item do lucro
      } else {
        this.dom.lucroResult.textContent = "N/A";
        if (lucroItem) lucroItem.style.display = "none"; // Esconde se não houver ganho
      }
    }
    if (this.dom.resultCard) this.dom.resultCard.style.display = "block";

    // Salva no histórico
    this._saveTripToHistory({
      kmInicial,
      kmFinal,
      kmPorLitro,
      precoCombustivel,
      ganhoBrutoUber: ganhoUber,
      distancia,
      litrosConsumidos,
      custoTotal,
      lucroLiquido,
    });

    this._clearTripForm();

    // Notifica outros módulos para atualização (ex: histórico, estatísticas)
    document.dispatchEvent(new CustomEvent("tripCalculated"));
  }

  /**
   * Salva os dados da viagem no histórico.
   * @param {object} tripData - Dados calculados da viagem.
   * @private
   */
  _saveTripToHistory(tripData) {
    const history = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const currentVehicle = this.vehicleManager.currentVehicle;

    const newRecord = {
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      dataISO: new Date().toISOString(),
      tipoVeiculo: this.vehicleManager.currentVehicleType,
      veiculoId: currentVehicle ? currentVehicle.id : null,
      veiculoNome: currentVehicle
        ? currentVehicle.nome
        : "Manual/Não especificado",
      kmInicial: tripData.kmInicial,
      kmFinal: tripData.kmFinal,
      distancia: tripData.distancia.toFixed(1),
      kmPorLitroUtilizado: tripData.kmPorLitro, // Eficiência usada no cálculo
      litrosConsumidos: tripData.litrosConsumidos.toFixed(1),
      precoPorLitro: tripData.precoCombustivel,
      custoTotalCombustivel: tripData.custoTotal.toFixed(2),
      ganhoBrutoInformado:
        tripData.ganhoBrutoUber !== null
          ? tripData.ganhoBrutoUber.toFixed(2)
          : null,
      lucroLiquidoViagem:
        tripData.lucroLiquido !== null
          ? tripData.lucroLiquido.toFixed(2)
          : null,
    };

    history.unshift(newRecord); // Adiciona no início
    if (history.length > CONFIG.HISTORY_LIMIT) {
      history.pop(); // Remove o mais antigo se o limite for excedido
    }
    this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, history);
  }

  /**
   * Limpa os campos do formulário de cálculo de viagem.
   * @private
   */
  _clearTripForm() {
    if (this.dom.form) {
      this.dom.kmInicialInput.value = "";
      this.dom.kmFinalInput.value = "";
      // Não limpar kmPorLitro se um veículo estiver selecionado
      if (!this.vehicleManager.currentVehicle) {
        this.dom.kmPorLitroInput.value = "";
      }
      this.dom.precoCombustivelInput.value = "";
      this.dom.ganhoUberInput.value = "";
      this.dom.kmInicialInput.focus();
    }
  }
  /**
   * Reseta o estado da calculadora (ex: após limpar todos os dados).
   */
  resetState() {
    this._clearTripForm();
    if (this.dom.resultCard) {
      this.dom.resultCard.style.display = "none"; // Esconde o card de resultado
    }
    // Garante que o campo de eficiência seja limpo se não houver veículo
    if (this.dom.kmPorLitroInput && !this.vehicleManager.currentVehicle) {
      this.dom.kmPorLitroInput.value = "";
    }
  }
}

// ===== GERENCIADOR DE HISTÓRICO DE VIAGENS =====
class HistoryManager {
  constructor(storageManager, uiManager, vehicleManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.vehicleManager = vehicleManager; // Para filtrar por tipo de veículo

    this.isFullHistoryVisible = false;

    this.dom = {
      historySection: document.getElementById("historySection"),
      historyList: document.getElementById("historyList"),
      seeMoreBtn: document.getElementById("seeMoreHistoryBtn"),
      minimizeBtn: document.getElementById("minimizeHistoryBtn"),
      clearHistoryBtn: document.getElementById("clearHistoryBtn"),
    };
    this._bindEvents();
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
        const confirmed = await this.uiManager.showConfirm(
          `Tem a certeza que deseja limpar TODO o histórico de viagens para ${this.vehicleManager.currentVehicleType}s? Esta ação não pode ser desfeita.`
        );
        if (confirmed) this.clearHistoryForCurrentType();
      });
    }
    // Ouvir evento de mudança de tipo de veículo para atualizar o histórico
    document.addEventListener("vehicleTypeChanged", () => this.renderHistory());
    // Ouvir evento de nova viagem calculada
    document.addEventListener("tripCalculated", () => this.renderHistory());
    // Ouvir evento de limpeza geral de dados
    document.addEventListener("allDataCleared", () => this.renderHistory());
  }

  /**
   * Alterna a visualização do histórico completo ou resumido.
   * @param {boolean} showFull - True para mostrar completo, false para resumido.
   */
  toggleFullHistory(showFull) {
    this.isFullHistoryVisible = showFull;
    this.renderHistory();
  }

  /**
   * Renderiza a lista de histórico na UI.
   */
  renderHistory() {
    if (!this.dom.historyList || !this.dom.historySection) return;

    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const filteredHistory = allHistory.filter(
      (item) => item.tipoVeiculo === this.vehicleManager.currentVehicleType
    );

    this.dom.historyList.innerHTML = ""; // Limpa

    if (filteredHistory.length === 0) {
      this.dom.historySection.style.display = "none";
      return;
    }

    this.dom.historySection.style.display = "block";
    const itemsToRender = this.isFullHistoryVisible
      ? filteredHistory
      : filteredHistory.slice(0, CONFIG.HISTORY_DISPLAY_COUNT);

    if (itemsToRender.length === 0 && filteredHistory.length > 0) {
      this.dom.historyList.innerHTML = `<li class="empty-message-list">Nenhum registo para exibir (verifique 'Ver Mais').</li>`;
    } else if (itemsToRender.length === 0) {
      this.dom.historyList.innerHTML = `<li class="empty-message-list">Nenhum histórico para ${this.vehicleManager.currentVehicleType}s.</li>`;
    }

    itemsToRender.forEach((record) => {
      this.dom.historyList.appendChild(this._createHistoryItemElement(record));
    });

    // Controla visibilidade dos botões "Ver Mais" / "Minimizar"
    const totalFiltered = filteredHistory.length;
    if (this.dom.seeMoreBtn) {
      this.dom.seeMoreBtn.style.display =
        totalFiltered > CONFIG.HISTORY_DISPLAY_COUNT &&
        !this.isFullHistoryVisible
          ? "block"
          : "none";
    }
    if (this.dom.minimizeBtn) {
      this.dom.minimizeBtn.style.display =
        totalFiltered > CONFIG.HISTORY_DISPLAY_COUNT &&
        this.isFullHistoryVisible
          ? "block"
          : "none";
    }
  }

  /**
   * Cria o elemento HTML para um item do histórico.
   * @param {object} record - O registo do histórico.
   * @returns {HTMLElement} O elemento <li> do item.
   * @private
   */
  _createHistoryItemElement(record) {
    const li = document.createElement("li");
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    li.setAttribute(
      "aria-label",
      `Detalhes da viagem de ${Utils.formatLocalDate(record.dataISO)}`
    );
    li.dataset.recordId = record.id;

    const dateSpan = document.createElement("span");
    dateSpan.textContent = Utils.formatLocalDate(record.dataISO);

    const costStrong = document.createElement("strong");
    costStrong.textContent = `Custo: ${Utils.formatCurrency(
      parseFloat(record.custoTotalCombustivel)
    )}`;
    if (record.lucroLiquidoViagem !== null) {
      costStrong.textContent += ` / Lucro: ${Utils.formatCurrency(
        parseFloat(record.lucroLiquidoViagem)
      )}`;
    }

    li.appendChild(dateSpan);
    li.appendChild(costStrong);

    li.addEventListener("click", () => this._showRecordDetails(record.id));
    li.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._showRecordDetails(record.id);
      }
    });
    return li;
  }

  /**
   * Mostra os detalhes de um registo específico do histórico em um modal.
   * @param {string} recordId - O ID do registo.
   * @private
   */
  _showRecordDetails(recordId) {
    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const record = allHistory.find((item) => item.id === recordId);
    if (!record) {
      this.uiManager.showNotification("Registo não encontrado.", "error");
      return;
    }

    const details = [
      { label: "Data/Hora", value: Utils.formatLocalDate(record.dataISO) },
      { label: "Veículo", value: record.veiculoNome },
      { label: "Tipo", value: record.tipoVeiculo },
      { label: "KM Inicial", value: `${record.kmInicial} km` },
      { label: "KM Final", value: `${record.kmFinal} km` },
      { label: "Distância", value: `${record.distancia} km` },
      {
        label: "Eficiência (no cálculo)",
        value: `${record.kmPorLitroUtilizado} km/L`,
      },
      { label: "Combustível Consumido", value: `${record.litrosConsumidos} L` },
      {
        label: "Preço por Litro (na data)",
        value: Utils.formatCurrency(record.precoPorLitro),
      },
      {
        label: "Custo Total Combustível",
        value: Utils.formatCurrency(record.custoTotalCombustivel),
      },
    ];
    if (record.ganhoBrutoInformado !== null) {
      details.push({
        label: "Ganho Bruto Informado",
        value: Utils.formatCurrency(record.ganhoBrutoInformado),
      });
      details.push({
        label: "Lucro Líquido Estimado",
        value: Utils.formatCurrency(record.lucroLiquidoViagem),
      });
    }
    this.uiManager.showDetailsModal("Detalhes da Viagem", details);
  }

  /**
   * Limpa o histórico de viagens para o tipo de veículo atualmente selecionado.
   */
  clearHistoryForCurrentType() {
    const currentType = this.vehicleManager.currentVehicleType;
    let allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    // Mantém apenas os registos que NÃO são do tipo atual
    const remainingHistory = allHistory.filter(
      (item) => item.tipoVeiculo !== currentType
    );

    if (
      this.storageManager.safeSetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        remainingHistory
      )
    ) {
      this.uiManager.showNotification(
        `Histórico de ${currentType}s limpo com sucesso!`,
        "success"
      );
      this.isFullHistoryVisible = false; // Reseta a visualização
      this.renderHistory(); // Atualiza a UI
      document.dispatchEvent(
        new CustomEvent("historyCleared", { detail: { type: currentType } })
      );
    }
  }
  /**
   * Reseta o estado do gestor de histórico (ex: após limpar todos os dados).
   */
  resetState() {
    this.isFullHistoryVisible = false;
    this.renderHistory(); // Isso mostrará a seção de histórico como vazia
  }
}

// ===== GERENCIADOR DE ESTATÍSTICAS =====
class StatisticsManager {
  constructor(storageManager, uiManager, vehicleManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.vehicleManager = vehicleManager;

    this.chartInstance = null;
    this.debouncedUpdate = Utils.debounce(
      () => this.updateStatistics(),
      CONFIG.DEBOUNCE_DELAY
    );

    this.dom = {
      statsSection: document.getElementById("statsSection"),
      totalKmStat: document.getElementById("totalKmStat"),
      totalGastoStat: document.getElementById("totalGastoStat"),
      mediaConsumoStat: document.getElementById("mediaConsumoStat"),
      chartCanvas: document.getElementById("fuelChartCanvas"),
    };
    this._bindEvents();
  }

  _bindEvents() {
    // Ouve eventos que indicam necessidade de atualizar estatísticas
    document.addEventListener("vehicleTypeChanged", () =>
      this.debouncedUpdate()
    );
    document.addEventListener("tripCalculated", () => this.debouncedUpdate());
    document.addEventListener("historyCleared", () => this.debouncedUpdate());
    document.addEventListener("allDataCleared", () => this.debouncedUpdate());
  }

  /**
   * Atualiza e renderiza as estatísticas e o gráfico.
   */
  updateStatistics() {
    if (!this.dom.statsSection) return;

    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const filteredHistory = allHistory.filter(
      (item) => item.tipoVeiculo === this.vehicleManager.currentVehicleType
    );

    if (filteredHistory.length === 0) {
      this.dom.statsSection.style.display = "none";
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
      return;
    }

    this.dom.statsSection.style.display = "block";
    this._calculateAndDisplaySummary(filteredHistory);
    this._renderOrUpdateChart(filteredHistory);
  }

  /**
   * Calcula e exibe as estatísticas resumidas.
   * @param {Array<object>} historyData - Dados do histórico filtrados.
   * @private
   */
  _calculateAndDisplaySummary(historyData) {
    const totalKm = historyData.reduce(
      (sum, item) => sum + parseFloat(item.distancia),
      0
    );
    const totalGasto = historyData.reduce(
      (sum, item) => sum + parseFloat(item.custoTotalCombustivel),
      0
    );
    const totalLitros = historyData.reduce(
      (sum, item) => sum + parseFloat(item.litrosConsumidos),
      0
    );
    const mediaConsumo = totalLitros > 0 ? totalKm / totalLitros : 0;

    if (this.dom.totalKmStat)
      this.dom.totalKmStat.textContent = `${totalKm.toFixed(1)} km`;
    if (this.dom.totalGastoStat)
      this.dom.totalGastoStat.textContent = Utils.formatCurrency(totalGasto);
    if (this.dom.mediaConsumoStat)
      this.dom.mediaConsumoStat.textContent = `${mediaConsumo.toFixed(1)} km/L`;
  }

  /**
   * Prepara os dados para o gráfico de gastos diários.
   * @param {Array<object>} historyData - Dados do histórico filtrados.
   * @returns {{labels: string[], data: string[]}} Dados para o gráfico.
   * @private
   */
  _prepareChartData(historyData) {
    const dailyCosts = {};
    // Considerar apenas os últimos X dias para o gráfico
    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - CONFIG.CHART_MAX_DAYS);

    historyData.forEach((item) => {
      const itemDate = new Date(item.dataISO);
      if (itemDate >= cutOffDate) {
        const dateKey = itemDate.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        });
        dailyCosts[dateKey] =
          (dailyCosts[dateKey] || 0) + parseFloat(item.custoTotalCombustivel);
      }
    });

    // Ordenar as chaves (datas) para o gráfico
    const sortedDates = Object.keys(dailyCosts).sort((a, b) => {
      const [dayA, monthA] = a.split("/");
      const [dayB, monthB] = b.split("/");
      // Assume mesmo ano para simplificar, ou adicione ano à chave se necessário
      // Para ordenação correta entre meses diferentes, é melhor converter para objeto Date
      const dateA = new Date(
        new Date().getFullYear(),
        parseInt(monthA) - 1,
        parseInt(dayA)
      );
      const dateB = new Date(
        new Date().getFullYear(),
        parseInt(monthB) - 1,
        parseInt(dayB)
      );
      return dateA - dateB;
    });

    return {
      labels: sortedDates,
      data: sortedDates.map((date) => dailyCosts[date].toFixed(2)),
    };
  }

  /**
   * Renderiza ou atualiza o gráfico de estatísticas.
   * @param {Array<object>} historyData - Dados do histórico filtrados.
   * @private
   */
  _renderOrUpdateChart(historyData) {
    if (!this.dom.chartCanvas || typeof Chart === "undefined") {
      return;
    }

    const { labels, data } = this._prepareChartData(historyData);
    const vehicleTypeLabel =
      this.vehicleManager.currentVehicleType.charAt(0).toUpperCase() +
      this.vehicleManager.currentVehicleType.slice(1);

    // Cores para o tema escuro
    const textColor = "#e0e0e0"; // --uber-text-primary
    const gridColor = "#444444"; // --uber-gray-light
    const uberGreen = "#00c165"; // --uber-green
    const uberGreenTransparent = "rgba(0, 193, 101, 0.2)"; // Para área de preenchimento

    const chartConfig = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: `Gasto Diário (${vehicleTypeLabel}) (R$)`,
            data: data,
            borderColor: uberGreen,
            backgroundColor: uberGreenTransparent,
            tension: 0.3, // Linha mais suave
            fill: true,
            pointBackgroundColor: uberGreen,
            pointBorderColor: "#fff", // Borda branca nos pontos para destaque
            pointRadius: 4, // Tamanho dos pontos
            pointHoverRadius: 7, // Tamanho dos pontos no hover
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: uberGreen,
            borderWidth: 2, // Linha um pouco mais grossa
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 10 } }, // Tamanho da fonte dos ticks
            grid: { color: gridColor, drawBorder: false }, // Remove borda do eixo X
          },
          y: {
            ticks: {
              color: textColor,
              callback: (value) => Utils.formatCurrency(value),
              font: { size: 10 },
            },
            grid: { color: gridColor, drawBorder: false }, // Remove borda do eixo Y
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            labels: { color: textColor, font: { size: 12 } }, // Tamanho da fonte da legenda
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)", // Fundo escuro para tooltip
            titleColor: uberGreen, // Cor do título do tooltip
            bodyColor: textColor, // Cor do corpo do tooltip
            borderColor: uberGreen, // Borda do tooltip
            borderWidth: 1,
            padding: 10, // Padding interno
            cornerRadius: 4, // Bordas arredondadas
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += Utils.formatCurrency(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        animation: {
          duration: 800, // Duração da animação
          easing: "easeInOutQuart", // Efeito de suavização
        },
      },
    };

    if (this.chartInstance) {
      // Atualiza gráfico existente
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.data.datasets[0].label = `Gasto Diário (${vehicleTypeLabel}) (R$)`;
      this.chartInstance.update();
    } else {
      // Cria novo gráfico
      try {
        const ctx = this.dom.chartCanvas.getContext("2d");
        this.chartInstance = new Chart(ctx, chartConfig);
      } catch (error) {
        console.error(
          "Erro ao criar/atualizar gráfico de estatísticas:",
          error
        );
        this.uiManager.showNotification(
          "Erro ao exibir gráfico de estatísticas.",
          "error"
        );
        this.chartInstance = null;
      }
    }
  }
  /**
   * Reseta o estado do gestor de estatísticas (ex: após limpar todos os dados).
   */
  resetState() {
    this.updateStatistics(); // Isso irá esconder a seção se não houver dados
  }
}

// ===== GERENCIADOR PRINCIPAL DA APLICAÇÃO (AppManager) =====
class AppManager {
  constructor() {
    // Instanciação dos gerenciadores
    this.uiManager = new UIManager();
    this.storageManager = new StorageManager(this.uiManager);
    this.validator = new Validator(this.uiManager);
    this.vehicleManager = new VehicleManager(
      this.storageManager,
      this.uiManager,
      this.validator
    );
    this.fuelCalculator = new FuelCalculator(
      this.storageManager,
      this.uiManager,
      this.validator,
      this.vehicleManager
    );
    this.historyManager = new HistoryManager(
      this.storageManager,
      this.uiManager,
      this.vehicleManager
    );
    this.statisticsManager = new StatisticsManager(
      this.storageManager,
      this.uiManager,
      this.vehicleManager
    );

    this._init();
  }

  /**
   * Inicializa a aplicação.
   * @private
   */
  _init() {
    this._registerServiceWorker();
    this._bindGlobalAppEvents();
    this._initializeAppState();
    this._hideSplashScreen();
  }

  /**
   * Registra o Service Worker.
   * @private
   */
  _registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js") // Caminho relativo ao index.html
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
   * Vincula eventos globais da aplicação (ex: import/export, limpar tudo).
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
            // Força a atualização completa da UI após importação
            this.vehicleManager.selectVehicleType(
              this.vehicleManager.currentVehicleType
            ); // Re-seleciona o tipo atual para forçar recarga
            // Os eventos 'vehicleTypeChanged' já devem acionar historyManager e statisticsManager
            // Mas para garantir, podemos chamar explicitamente:
            this.historyManager.renderHistory();
            this.statisticsManager.updateStatistics();
          }
          importFileInput.value = ""; // Limpa o input para permitir reimportar o mesmo ficheiro
        }
      });
    }

    // Botão para Limpar Todos os Dados
    const clearAllDataBtn = document.getElementById("clearAllDataBtn");
    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener("click", async () => {
        const confirmed = await this.uiManager.showConfirm(
          "TEM A CERTEZA ABSOLUTA?\n\nEsta ação apagará TODOS os veículos, TODO o histórico e quaisquer outras configurações guardadas.\n\nEsta ação é IRREVERSÍVEL!",
          "⚠️ ATENÇÃO: Limpar Todos os Dados ⚠️"
        );
        if (confirmed) {
          const doubleConfirmed = await this.uiManager.showConfirm(
            "CONFIRMAÇÃO FINAL:\n\nRealmente deseja apagar todos os dados? Não haverá como os recuperar.",
            "⚠️ Confirmação Final ⚠️"
          );
          if (doubleConfirmed) {
            this._performClearAllData();
          } else {
            this.uiManager.showNotification(
              "Ação de limpeza total cancelada.",
              "info"
            );
          }
        } else {
          this.uiManager.showNotification(
            "Ação de limpeza total cancelada.",
            "info"
          );
        }
      });
    }

    // Fechar modais com a tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.uiManager.hideDetailsModal();
        if (
          this.uiManager.confirmModalOverlay &&
          this.uiManager.confirmModalOverlay.classList.contains("active")
        ) {
          this.uiManager._handleConfirm(false); // Chama o handler de cancelamento do confirm modal
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
      // Reseta o estado de cada gestor para refletir os dados vazios
      this.vehicleManager.resetState(); // Irá chamar selectVehicleType("carro") e limpar a UI
      this.fuelCalculator.resetState();
      this.historyManager.resetState(); // Já renderiza a lista vazia
      this.statisticsManager.resetState(); // Já esconde a seção se não houver dados

      // Dispara um evento global para que qualquer outro módulo possa reagir, se necessário
      document.dispatchEvent(new CustomEvent("allDataCleared"));
      this.uiManager.showNotification(
        "Todos os dados da aplicação foram apagados com sucesso.",
        "success"
      );
      // Poderia recarregar a página para um reset "mais forte", mas resetar os estados deve ser suficiente
      // window.location.reload();
    } else {
      this.uiManager.showNotification(
        "Ocorreu um erro ao tentar limpar todos os dados.",
        "error"
      );
    }
  }

  /**
   * Define o estado inicial da aplicação (ex: tipo de veículo padrão).
   * @private
   */
  _initializeAppState() {
    // Define 'carro' como tipo de veículo padrão e carrega dados relacionados.
    // Isso já vai disparar a renderização de veículos, histórico e estatísticas.
    this.vehicleManager.selectVehicleType("carro");
  }

  /**
   * Esconde a tela de carregamento (splash screen).
   * @private
   */
  _hideSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
      // Adiciona a classe 'hidden' que tem a transição CSS
      splashScreen.classList.add("hidden");
      splashScreen.addEventListener(
        "transitionend",
        () => {
          if (splashScreen.classList.contains("hidden")) {
            // splashScreen.remove(); // Opcional: remover completamente
          }
        },
        { once: true }
      );
    }
  }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
// Garante que o DOM esteja pronto antes de instanciar o AppManager.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new AppManager());
} else {
  new AppManager(); // DOM já carregado
}
