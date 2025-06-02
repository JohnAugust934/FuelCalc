// app.js - Lógica Principal do FuelCalc
// Versão: 1.5.1
"use strict";

// ===== CONFIGURAÇÕES E CONSTANTES GLOBAIS =====
const APP_VERSION = "1.5.1"; // VERSÃO ATUAL DA APLICAÇÃO

const CONFIG = {
  APP_VERSION,
  STORAGE_KEYS: {
    VEHICLES: "fuelCalc_vehicles_v1.5",
    HISTORY: "fuelCalc_history_v1.5",
    APP_SETTINGS: "fuelCalc_settings_v1.5",
  },
  DEFAULT_LANGUAGE: "pt-BR",
  VALIDATION: {
    MIN_EFFICIENCY: 1,
    MAX_EFFICIENCY: 70,
    MIN_KM: 0,
    MAX_KM: 9999999,
    MIN_PRICE: 0.1,
    MAX_PRICE: 25,
    MAX_TRIP_DISTANCE: 5000,
    MIN_VEHICLE_NAME_LENGTH: 2,
    MAX_VEHICLE_NAME_LENGTH: 40,
    MAX_UBER_GAIN: 20000,
  },
  HISTORY_DISPLAY_COUNT: 3,
  HISTORY_LIMIT: 50,
  DEBOUNCE_DELAY: 350,
  NOTIFICATION_TIMEOUT: 4000,
  CHART_MAX_DAYS: 30,
};

// ===== TRADUÇÕES (i18n) =====
const translations = {
  "pt-BR": {
    appTitle: "FuelCalc: Calculadora de Combustível",
    appDescriptionMeta:
      "Calculadora PWA de gastos com combustível, com estatísticas e gerenciamento de veículos.",
    appName: "FuelCalc",
    splashLoading: "Carregando sua calculadora...",
    appSubtitle: "Sua calculadora de combustível inteligente",
    manageVehiclesTitle: "Gerenciar Veículos",
    vehicleTypeCar: "Carro",
    vehicleTypeMotorcycle: "Moto",
    addVehicleBtn: "+ Adicionar Veículo",
    vehicleNameLabel: "Nome do Veículo:",
    vehicleNamePlaceholder: "Ex: Onix 1.0",
    vehicleEfficiencyLabel: "Eficiência (km/L):",
    vehicleEfficiencyPlaceholder: "Ex: 12.5",
    saveVehicleBtn: "Salvar Veículo",
    cancelBtn: "Cancelar",
    confirmBtn: "Confirmar",
    calculateTripTitle: "Calcular Gastos da Viagem",
    tripEfficiencyLabel: "Eficiência do Veículo (km/L):",
    tripEfficiencyPlaceholder: "Selecione um veículo ou informe",
    initialKmLabel: "KM Inicial:",
    initialKmPlaceholder: "Ex: 15000.0",
    finalKmLabel: "KM Final:",
    finalKmPlaceholder: "Ex: 15120.5",
    fuelPriceLabel: "Preço por Litro (R$):",
    fuelPricePlaceholder: "Ex: 5.89",
    tripGrossGainLabel: "Ganho Bruto da Viagem (R$, opcional):",
    tripGrossGainPlaceholder: "Ex: 75.50",
    calculateTripBtn: "Calcular Gastos",
    calculationResultTitle: "Resultado do Cálculo",
    distanceTraveledLabel: "Distância Percorrida:",
    fuelConsumedLabel: "Combustível Consumido:",
    totalFuelCostLabel: "Custo Total do Combustível:",
    netProfitLabel: "Lucro Líquido da Viagem:",
    tripHistoryTitle: "Histórico de Viagens",
    seeMoreBtn: "Ver Mais",
    minimizeBtn: "Minimizar",
    clearTypeHistoryBtn: "Limpar Histórico deste Tipo de Veículo",
    currentVehicleStatsTitle: "Estatísticas do Tipo de Veículo Atual",
    totalKmStatLabel: "Total de KM Rodados:",
    totalFuelCostStatLabel: "Total Gasto com Combustível:",
    avgConsumptionStatLabel: "Média de Consumo Geral:",
    fuelChartAriaLabel: "Gráfico de gastos diários com combustível",
    backupRestoreTitle: "Backup e Restauração de Dados",
    exportDataBtn: "📤 Exportar Dados",
    importDataBtn: "📥 Importar Dados",
    backupInfoText:
      "Exporte seus dados para um arquivo de backup ou importe de um arquivo salvo anteriormente.",
    clearAllDataBtn: "⚠️ Limpar Todos os Dados da Aplicação",
    clearAllDataWarning:
      "Atenção: Esta ação é irreversível e apagará todos os veículos e históricos.",
    allRightsReserved: "Todos os direitos reservados.",
    developedWithLove: "Desenvolvido com ❤️",
    versionLabel: "Versão:",
    tripDetailsModalTitle: "Detalhes da Viagem",
    confirmActionModalTitle: "Confirmar Ação",
    areYouSure: "Você tem certeza?",
    closeModalAriaLabel: "Fechar Detalhes",

    vehicleSelected: 'Veículo "{name}" selecionado.',
    vehicleSaved: 'Veículo "{name}" salvo com sucesso!',
    vehicleDeleted: 'Veículo "{name}" excluído.',
    vehicleExistsError: 'Já existe um {type} com o nome "{name}".',
    noVehiclesOfType: "Nenhum {type} cadastrado.",
    confirmDeleteVehicle: 'Tem certeza que deseja excluir o veículo "{name}"?',
    confirmClearTypeHistory:
      "Tem certeza que deseja limpar TODO o histórico de viagens para {type}s? Esta ação não pode ser desfeita.",
    confirmClearAllData:
      "TEM CERTEZA ABSOLUTA?\n\nEsta ação apagará TODOS os veículos, TODO o histórico e quaisquer outras configurações guardadas.\n\nEsta ação é IRREVERSÍVEL!",
    confirmFinalClearAllData:
      "CONFIRMAÇÃO FINAL:\n\nRealmente deseja apagar todos os dados? Não haverá como os recuperar.",
    clearAllDataCancelled: "Ação de limpeza total cancelada.",
    historyClearedSuccess: "Histórico de {type}s limpo com sucesso!",
    allDataClearedSuccess:
      "Todos os dados da aplicação foram apagados com sucesso!",
    allDataClearError: "Ocorreu um erro ao tentar limpar todos os dados.",
    importSuccess: "Dados importados com sucesso! A aplicação será atualizada.",
    importErrorFile: "Arquivo inválido. Por favor, selecione um arquivo .json.",
    importErrorFormat: "Formato de arquivo de backup inválido.",
    importErrorVehiclesFormat:
      "Dados de veículos no arquivo de backup estão mal formatados.",
    importErrorHistoryFormat:
      "Dados de histórico no arquivo de backup estão mal formatados.",
    importErrorProcessing:
      "Erro ao processar o arquivo de backup. Verifique o console para detalhes.",
    importNoValidData:
      "Nenhum dado válido de veículos ou histórico encontrado no arquivo.",
    exportSuccess: "Dados exportados com sucesso!",
    storageUnavailableError:
      "Armazenamento local não disponível. Não foi possível salvar os dados.",
    storageQuotaError:
      "Espaço de armazenamento local cheio. Não foi possível salvar. Tente limpar o histórico ou exportar dados.",
    storageSaveError: "Erro ao salvar dados ({key}).",
    storageLoadError:
      "Erro ao carregar dados locais ({key}). Alguns dados podem ter sido perdidos.",
    recordNotFound: "Registro não encontrado.",
    genericError: "Ocorreu um erro. Tente novamente.",
    chartDailyExpenseLabel: "Gasto Diário ({type}) (R$)",
    noHistoryForType: "Nenhum histórico para {type}s.",
    noRecordsToDisplay: "Nenhum registro para exibir (verifique 'Ver Mais').",
    manualOrUnspecified: "Manual/Não especificado",
    costLabel: "Custo",
    profitLabel: "Lucro",
    selectVehicleAriaLabel: "Selecionar veículo {name}, {efficiency} km/L",
    deleteVehicleAriaLabel: "Excluir veículo {name}",
    tripDetailsAriaLabel: "Detalhes da viagem de {date}",
    detailLabelDate: "Data/Hora",
    detailLabelVehicle: "Veículo",
    detailLabelType: "Tipo",
    detailLabelInitialKm: "KM Inicial",
    detailLabelFinalKm: "KM Final",
    detailLabelDistance: "Distância",
    detailLabelEfficiencyUsed: "Eficiência (no cálculo)",
    detailLabelFuelConsumed: "Combustível Consumido",
    detailLabelPricePerLiter: "Preço por Litro (na data)",
    detailLabelTotalFuelCost: "Custo Total Combustível",
    detailLabelGrossGain: "Ganho Bruto Informado",
    detailLabelNetProfit: "Lucro Líquido Estimado",
    vehicleNameLengthError:
      "Nome do veículo deve ter entre {min} e {max} caracteres.",
    vehicleEfficiencyError:
      "Eficiência deve ser um número entre {min} e {max} km/L.",
    invalidVehicleTypeError:
      "Tipo de veículo inválido. Selecione 'Carro' ou 'Moto'.",
    initialKmError: "KM Inicial inválido (entre {min} e {max}).",
    finalKmError:
      "KM Final inválido (deve ser maior que KM Inicial e até {max}).",
    maxTripDistanceError: "Distância da viagem excede o limite de {limit} km.",
    fuelPriceError: "Preço do combustível inválido (entre R${min} e R${max}).",
    tripGainError: "Ganho da viagem inválido (entre R$0 e R${max}).",
  },
  en: {
    appTitle: "FuelCalc: Fuel Calculator",
    appDescriptionMeta:
      "PWA fuel expense calculator with statistics and vehicle management.",
    appName: "FuelCalc",
    splashLoading: "Loading your calculator...",
    appSubtitle: "Your smart fuel calculator",
    manageVehiclesTitle: "Manage Vehicles",
    vehicleTypeCar: "Car",
    vehicleTypeMotorcycle: "Motorcycle",
    addVehicleBtn: "+ Add Vehicle",
    vehicleNameLabel: "Vehicle Name:",
    vehicleNamePlaceholder: "Ex: Civic 1.8",
    vehicleEfficiencyLabel: "Efficiency (km/L):",
    vehicleEfficiencyPlaceholder: "Ex: 12.5",
    saveVehicleBtn: "Save Vehicle",
    cancelBtn: "Cancel",
    confirmBtn: "Confirm",
    calculateTripTitle: "Calculate Trip Expenses",
    tripEfficiencyLabel: "Vehicle Efficiency (km/L):",
    tripEfficiencyPlaceholder: "Select a vehicle or enter manually",
    initialKmLabel: "Initial KM:",
    initialKmPlaceholder: "Ex: 15000.0",
    finalKmLabel: "Final KM:",
    finalKmPlaceholder: "Ex: 15120.5",
    fuelPriceLabel: "Price per Liter ($):",
    fuelPricePlaceholder: "Ex: 1.50",
    tripGrossGainLabel: "Gross Trip Earnings ($, optional):",
    tripGrossGainPlaceholder: "Ex: 75.50",
    calculateTripBtn: "Calculate Expenses",
    calculationResultTitle: "Calculation Result",
    distanceTraveledLabel: "Distance Traveled:",
    fuelConsumedLabel: "Fuel Consumed:",
    totalFuelCostLabel: "Total Fuel Cost:",
    netProfitLabel: "Net Trip Profit:",
    tripHistoryTitle: "Trip History",
    seeMoreBtn: "See More",
    minimizeBtn: "Minimize",
    clearTypeHistoryBtn: "Clear History for this Vehicle Type",
    currentVehicleStatsTitle: "Current Vehicle Type Statistics",
    totalKmStatLabel: "Total KM Driven:",
    totalFuelCostStatLabel: "Total Spent on Fuel:",
    avgConsumptionStatLabel: "Overall Average Consumption:",
    fuelChartAriaLabel: "Chart of daily fuel expenses",
    backupRestoreTitle: "Data Backup and Restore",
    exportDataBtn: "📤 Export Data",
    importDataBtn: "📥 Import Data",
    backupInfoText:
      "Export your data to a backup file or import from a previously saved file.",
    clearAllDataBtn: "⚠️ Clear All Application Data",
    clearAllDataWarning:
      "Warning: This action is irreversible and will delete all vehicles and histories.",
    allRightsReserved: "All rights reserved.",
    developedWithLove: "Developed with ❤️",
    versionLabel: "Version:",
    tripDetailsModalTitle: "Trip Details",
    confirmActionModalTitle: "Confirm Action",
    areYouSure: "Are you sure?",
    closeModalAriaLabel: "Close Details",

    vehicleSelected: 'Vehicle "{name}" selected.',
    vehicleSaved: 'Vehicle "{name}" saved successfully!',
    vehicleDeleted: 'Vehicle "{name}" deleted.',
    vehicleExistsError: 'A {type} with the name "{name}" already exists.',
    noVehiclesOfType: "No {type}s registered.",
    confirmDeleteVehicle:
      'Are you sure you want to delete the vehicle "{name}"?',
    confirmClearTypeHistory:
      "Are you sure you want to clear ALL trip history for {type}s? This action cannot be undone.",
    confirmClearAllData:
      "ARE YOU ABSOLUTELY SURE?\n\nThis action will delete ALL vehicles, ALL history, and any other saved settings.\n\nThis action is IRREVERSIBLE!",
    confirmFinalClearAllData:
      "FINAL CONFIRMATION:\n\nDo you really want to delete all data? There will be no way to recover it.",
    clearAllDataCancelled: "Full data clearing action cancelled.",
    historyClearedSuccess: "History for {type}s cleared successfully!",
    allDataClearedSuccess:
      "All application data has been cleared successfully!",
    allDataClearError: "An error occurred while trying to clear all data.",
    importSuccess: "Data imported successfully! The application will update.",
    importErrorFile: "Invalid file. Please select a .json file.",
    importErrorFormat: "Invalid backup file format.",
    importErrorVehiclesFormat: "Vehicle data in the backup file is malformed.",
    importErrorHistoryFormat: "History data in the backup file is malformed.",
    importErrorProcessing:
      "Error processing the backup file. Check console for details.",
    importNoValidData: "No valid vehicle or history data found in the file.",
    exportSuccess: "Data exported successfully!",
    storageUnavailableError:
      "Local storage is unavailable. Data could not be saved.",
    storageQuotaError:
      "Local storage space is full. Could not save. Try clearing history or exporting data.",
    storageSaveError: "Error saving data ({key}).",
    storageLoadError:
      "Error loading local data ({key}). Some data may have been lost.",
    recordNotFound: "Record not found.",
    genericError: "An error occurred. Please try again.",
    chartDailyExpenseLabel: "Daily Expense ({type}) ($)",
    noHistoryForType: "No history for {type}s.",
    noRecordsToDisplay: "No records to display (check 'See More').",
    manualOrUnspecified: "Manual/Unspecified",
    costLabel: "Cost",
    profitLabel: "Profit",
    selectVehicleAriaLabel: "Select vehicle {name}, {efficiency} km/L",
    deleteVehicleAriaLabel: "Delete vehicle {name}",
    tripDetailsAriaLabel: "Trip details from {date}",
    detailLabelDate: "Date/Time",
    detailLabelVehicle: "Vehicle",
    detailLabelType: "Type",
    detailLabelInitialKm: "Initial KM",
    detailLabelFinalKm: "Final KM",
    detailLabelDistance: "Distance",
    detailLabelEfficiencyUsed: "Efficiency (at calculation)",
    detailLabelFuelConsumed: "Fuel Consumed",
    detailLabelPricePerLiter: "Price per Liter (at date)",
    detailLabelTotalFuelCost: "Total Fuel Cost",
    detailLabelGrossGain: "Gross Earnings Reported",
    detailLabelNetProfit: "Estimated Net Profit",
    vehicleNameLengthError:
      "Vehicle name must be between {min} and {max} characters.",
    vehicleEfficiencyError:
      "Efficiency must be a number between {min} and {max} km/L.",
    invalidVehicleTypeError:
      "Invalid vehicle type. Select 'Car' or 'Motorcycle'.",
    initialKmError: "Initial KM invalid (between {min} and {max}).",
    finalKmError:
      "Final KM invalid (must be greater than Initial KM and up to {max}).",
    maxTripDistanceError: "Trip distance exceeds the limit of {limit} km.",
    fuelPriceError: "Fuel price invalid (between ${min} and ${max}).", // Ajustar símbolo de moeda se necessário
    tripGainError: "Trip earnings invalid (between $0 and ${max}).", // Ajustar símbolo de moeda
  },
};

// ===== UTILITÁRIOS GERAIS =====
class Utils {
  static sanitizeHTML(str) {
    if (typeof str !== "string") return "";
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
  }
  static validateNumber(value, min = -Infinity, max = Infinity) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  }
  static convertCommaToPoint(value) {
    return typeof value === "string" ? value.replace(/,/g, ".") : value;
  }
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
  static formatCurrency(value, lang = CONFIG.DEFAULT_LANGUAGE) {
    if (value === null || value === undefined || isNaN(parseFloat(value))) {
      return lang === "en" ? "$ --" : "R$ --";
    }
    const currency = lang === "en" ? "USD" : "BRL";
    const locale = lang === "en" ? "en-US" : "pt-BR";
    return parseFloat(value).toLocaleString(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  static formatLocalDate(isoDateString, lang = CONFIG.DEFAULT_LANGUAGE) {
    if (!isoDateString) return "--";
    const locale = lang === "en" ? "en-US" : "pt-BR";
    try {
      return new Date(isoDateString).toLocaleString(locale, {
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

// ===== GERENCIADOR DE IDIOMA (i18n) =====
class LanguageManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.currentLanguage =
      this._loadLanguagePreference() || CONFIG.DEFAULT_LANGUAGE;
    this.translationData = translations;
    this._bindLanguageButtons();
  }

  _loadLanguagePreference() {
    const settings = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.APP_SETTINGS,
      {}
    );
    return settings.language;
  }

  _saveLanguagePreference(lang) {
    const settings = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.APP_SETTINGS,
      {}
    );
    settings.language = lang;
    this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, settings);
  }

  _bindLanguageButtons() {
    document.querySelectorAll(".lang-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        const lang = e.currentTarget.dataset.lang;
        this.setLanguage(lang);
      });
    });
  }

  setLanguage(lang) {
    if (this.translationData[lang]) {
      this.currentLanguage = lang;
      this._saveLanguagePreference(lang);
      this.applyTranslationsToPage(); // Renomeado para clareza
      document.documentElement.lang = lang;
      document.querySelectorAll(".lang-button").forEach((button) => {
        button.setAttribute("aria-pressed", button.dataset.lang === lang);
      });
      document.dispatchEvent(
        new CustomEvent("languageChanged", { detail: { lang } })
      );
    } else {
      console.warn(`Idioma ${lang} não encontrado nas traduções.`);
    }
  }

  get(key, params = {}) {
    const langTranslations =
      this.translationData[this.currentLanguage] ||
      this.translationData[CONFIG.DEFAULT_LANGUAGE];
    let translatedString = langTranslations[key] || key; // Retorna a chave se não encontrar
    for (const paramKey in params) {
      translatedString = translatedString.replace(
        new RegExp(`{${paramKey}}`, "g"),
        params[paramKey]
      );
    }
    return translatedString;
  }

  applyTranslationsToPage() {
    // Renomeado
    document.querySelectorAll("[data-translate-key]").forEach((element) => {
      const key = element.dataset.translateKey;
      const translation = this.get(key);

      if (element.hasAttribute("data-translate-key-placeholder")) {
        element.placeholder = this.get(element.dataset.translateKeyPlaceholder);
      } else if (element.hasAttribute("data-translate-key-aria-label")) {
        element.setAttribute(
          "aria-label",
          this.get(element.dataset.translateKeyAriaLabel)
        );
      } else if (element.hasAttribute("data-translate-key-title")) {
        // Para o atributo title
        element.title = this.get(element.dataset.translateKeyTitle);
      } else {
        element.textContent = translation;
      }
    });
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

// ===== GERENCIADOR DE NOTIFICAÇÕES E MODAIS =====
class UIManager {
  constructor(languageManager) {
    this.langManager = languageManager;
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
    this._resolveConfirm = null;
    document.addEventListener("languageChanged", () =>
      this._retranslateOpenModals()
    );
  }

  _retranslateOpenModals() {
    if (
      this.detailsModalOverlay &&
      this.detailsModalOverlay.classList.contains("active")
    ) {
      const titleElement =
        this.detailsModalOverlay.querySelector("#detailsModalTitle");
      if (titleElement)
        titleElement.textContent = this.langManager.get(
          "tripDetailsModalTitle"
        );
      // Re-renderizar o conteúdo do modal de detalhes é mais complexo aqui.
      // A solução ideal é o HistoryManager reabrir o modal com os dados já traduzidos se o idioma mudar.
      // Ou, o UIManager poderia armazenar os dados brutos do último modal de detalhes e re-renderizá-lo.
      // Por agora, apenas o título e botões são atualizados.
    }
    if (
      this.confirmModalOverlay &&
      this.confirmModalOverlay.classList.contains("active")
    ) {
      if (this.confirmModalTitle)
        this.confirmModalTitle.textContent = this.langManager.get(
          "confirmActionModalTitle"
        );
      // A mensagem do confirmModalMessage é dinâmica, não re-traduzimos aqui.
      if (this.confirmModalCancelBtn)
        this.confirmModalCancelBtn.textContent =
          this.langManager.get("cancelBtn");
      if (this.confirmModalConfirmBtn)
        this.confirmModalConfirmBtn.textContent =
          this.langManager.get("confirmBtn");
    }
  }

  _bindModalEvents() {
    if (this.closeDetailsModalBtn)
      this.closeDetailsModalBtn.addEventListener("click", () =>
        this.hideDetailsModal()
      );
    if (this.detailsModalOverlay)
      this.detailsModalOverlay.addEventListener("click", (e) => {
        if (e.target === this.detailsModalOverlay) this.hideDetailsModal();
      });
    if (this.confirmModalCancelBtn)
      this.confirmModalCancelBtn.addEventListener("click", () =>
        this._handleConfirm(false)
      );
    if (this.confirmModalConfirmBtn)
      this.confirmModalConfirmBtn.addEventListener("click", () =>
        this._handleConfirm(true)
      );
    if (this.confirmModalOverlay)
      this.confirmModalOverlay.addEventListener("click", (e) => {
        if (e.target === this.confirmModalOverlay) this._handleConfirm(false);
      });
  }

  showNotification(messageKey, type = "info", params = {}) {
    if (!this.notificationArea) return;
    const message = this.langManager.get(messageKey, params);
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "assertive");
    const messageSpan = document.createElement("span");
    messageSpan.className = "notification-message";
    messageSpan.textContent = message;
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.className = "notification-close";
    closeBtn.setAttribute(
      "aria-label",
      this.langManager.get("closeModalAriaLabel")
    );
    closeBtn.addEventListener("click", () =>
      this._removeNotification(notification)
    );
    notification.appendChild(messageSpan);
    notification.appendChild(closeBtn);
    this.notificationArea.appendChild(notification);
    void notification.offsetWidth;
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
    setTimeout(
      () => this._removeNotification(notification),
      CONFIG.NOTIFICATION_TIMEOUT
    );
  }

  _removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      notification.addEventListener(
        "transitionend",
        () => {
          if (notification.parentNode)
            notification.parentNode.removeChild(notification);
        },
        { once: true }
      );
      setTimeout(() => {
        if (notification.parentNode)
          notification.parentNode.removeChild(notification);
      }, 350);
    }
  }

  showDetailsModal(titleKey, detailsArray) {
    if (!this.detailsModalOverlay || !this.detailsModalContent) return;
    const modalTitleElement =
      this.detailsModalOverlay.querySelector("#detailsModalTitle");
    if (modalTitleElement)
      modalTitleElement.textContent = this.langManager.get(titleKey);
    this.detailsModalContent.innerHTML = "";
    detailsArray.forEach((detail) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "modal-detail-item";
      const labelSpan = document.createElement("span");
      labelSpan.textContent = `${this.langManager.get(
        detail.labelKey,
        detail.labelParams || {}
      )}:`; // Usa detail.labelKey
      const valueStrong = document.createElement("strong");
      // Se o valor também for uma chave de tradução (ex: "N/A"), traduza-o. Caso contrário, use como está.
      valueStrong.innerHTML = detail.isValueKey
        ? this.langManager.get(detail.value)
        : Utils.sanitizeHTML(String(detail.value));
      itemDiv.appendChild(labelSpan);
      itemDiv.appendChild(valueStrong);
      this.detailsModalContent.appendChild(itemDiv);
    });
    this.detailsModalOverlay.style.display = "flex";
    document.body.classList.add("modal-open"); // Impede scroll do body
    void this.detailsModalOverlay.offsetWidth;
    this.detailsModalOverlay.classList.add("active");
    if (this.closeDetailsModalBtn) this.closeDetailsModalBtn.focus();
  }

  hideDetailsModal() {
    if (!this.detailsModalOverlay) return;
    this.detailsModalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open"); // Permite scroll do body
    this.detailsModalOverlay.addEventListener(
      "transitionend",
      () => {
        if (!this.detailsModalOverlay.classList.contains("active"))
          this.detailsModalOverlay.style.display = "none";
      },
      { once: true }
    );
    setTimeout(() => {
      if (!this.detailsModalOverlay.classList.contains("active"))
        this.detailsModalOverlay.style.display = "none";
    }, 350);
  }

  showConfirm(messageKey, titleKey = "confirmActionModalTitle", params = {}) {
    return new Promise((resolve) => {
      if (
        !this.confirmModalOverlay ||
        !this.confirmModalTitle ||
        !this.confirmModalMessage
      ) {
        resolve(window.confirm(this.langManager.get(messageKey, params)));
        return;
      }
      this.confirmModalTitle.textContent = this.langManager.get(titleKey);
      this.confirmModalMessage.textContent = this.langManager.get(
        messageKey,
        params
      );
      this._resolveConfirm = resolve;
      this.confirmModalOverlay.style.display = "flex";
      document.body.classList.add("modal-open"); // Impede scroll
      void this.confirmModalOverlay.offsetWidth;
      this.confirmModalOverlay.classList.add("active");
      if (this.confirmModalConfirmBtn) this.confirmModalConfirmBtn.focus();
    });
  }

  _handleConfirm(confirmed) {
    if (!this.confirmModalOverlay) return;
    this.confirmModalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open"); // Permite scroll
    this.confirmModalOverlay.addEventListener(
      "transitionend",
      () => {
        if (!this.confirmModalOverlay.classList.contains("active"))
          this.confirmModalOverlay.style.display = "none";
      },
      { once: true }
    );
    setTimeout(() => {
      if (!this.confirmModalOverlay.classList.contains("active"))
        this.confirmModalOverlay.style.display = "none";
    }, 350);
    if (this._resolveConfirm) {
      this._resolveConfirm(confirmed);
      this._resolveConfirm = null;
    }
  }
}

// ===== GERENCIADOR DE ARMAZENAMENTO LOCAL (LocalStorage) =====
class StorageManager {
  constructor(uiManager) {
    this.uiManager = uiManager;
  }
  safeGetItem(key, defaultValue = []) {
    try {
      if (!this._isStorageAvailable()) return defaultValue;
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      if (this.uiManager)
        this.uiManager.showNotification("storageLoadError", "error", { key });
      localStorage.removeItem(key);
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
    } catch (error) {
      console.error(`Erro ao guardar ${key}:`, error);
      const messageKey =
        error.name === "QuotaExceededError"
          ? "storageQuotaError"
          : "storageSaveError";
      if (this.uiManager)
        this.uiManager.showNotification(messageKey, "error", { key });
      return false;
    }
  }
  _isStorageAvailable() {
    let storage;
    try {
      storage = window.localStorage;
      const t = "__storage_test__";
      storage.setItem(t, t);
      storage.removeItem(t);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        (e.code === 22 ||
          e.code === 1014 ||
          e.name === "QuotaExceededError" ||
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        storage &&
        storage.length !== 0
      );
    }
  }
  exportData() {
    const dataToExport = {
      app: "FuelCalc",
      version: CONFIG.APP_VERSION,
      exportDate: new Date().toISOString(),
      vehicles: this.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES, []),
      history: this.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY, []),
      settings: this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {
        language: CONFIG.DEFAULT_LANGUAGE,
      }),
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fuelcalc_backup_${CONFIG.APP_VERSION}_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);
      let itemsImported = false;
      if (typeof data !== "object" || data === null) {
        if (this.uiManager)
          this.uiManager.showNotification("importErrorFormat", "error");
        return false;
      }
      if (data.vehicles && Array.isArray(data.vehicles)) {
        if (this.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, data.vehicles))
          itemsImported = true;
      } else if (data.vehicles && this.uiManager)
        this.uiManager.showNotification("importErrorVehiclesFormat", "warning");
      if (data.history && Array.isArray(data.history)) {
        if (this.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, data.history))
          itemsImported = true;
      } else if (data.history && this.uiManager)
        this.uiManager.showNotification("importErrorHistoryFormat", "warning");
      if (data.settings && data.settings.language) {
        const langToSet = translations[data.settings.language]
          ? data.settings.language
          : CONFIG.DEFAULT_LANGUAGE;
        const currentSettings = this.safeGetItem(
          CONFIG.STORAGE_KEYS.APP_SETTINGS,
          {}
        );
        currentSettings.language = langToSet;
        this.safeSetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, currentSettings);
        itemsImported = true;
      }
      if (itemsImported) {
        if (this.uiManager)
          this.uiManager.showNotification("importSuccess", "success");
        return true;
      } else {
        if (this.uiManager)
          this.uiManager.showNotification("importNoValidData", "info");
        return false;
      }
    } catch (error) {
      console.error("Erro ao importar:", error);
      if (this.uiManager)
        this.uiManager.showNotification("importErrorProcessing", "error");
      return false;
    }
  }
  clearAllData() {
    let allCleared = true;
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
        console.error(`Erro ao limpar ${key}:`, error);
        if (this.uiManager)
          this.uiManager.showNotification("storageSaveError", "error", { key });
        allCleared = false;
      }
    });
    return allCleared;
  }
}

// ===== VALIDADOR DE DADOS DA APLICAÇÃO =====
class Validator {
  constructor(uiManager, languageManager) {
    this.uiManager = uiManager;
    this.langManager = languageManager;
  }
  validateVehicle(nome, eficiencia, tipo) {
    const errors = [];
    const parsedEficiencia = parseFloat(
      Utils.convertCommaToPoint(String(eficiencia))
    );
    const trimmedNome = String(nome).trim();
    if (
      trimmedNome.length < CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH ||
      trimmedNome.length > CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH
    )
      errors.push(
        this.langManager.get("vehicleNameLengthError", {
          min: CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH,
          max: CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH,
        })
      );
    if (
      !Utils.validateNumber(
        parsedEficiencia,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    )
      errors.push(
        this.langManager.get("vehicleEfficiencyError", {
          min: CONFIG.VALIDATION.MIN_EFFICIENCY,
          max: CONFIG.VALIDATION.MAX_EFFICIENCY,
        })
      );
    if (!["carro", "moto"].includes(tipo))
      errors.push(this.langManager.get("invalidVehicleTypeError"));
    const isValid = errors.length === 0;
    if (!isValid) this.uiManager.showNotification(errors.join("\n"), "error");
    return {
      isValid,
      errors,
      data: isValid
        ? { nome: trimmedNome, eficiencia: parsedEficiencia, tipo }
        : null,
    };
  }
  validateTrip(kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber) {
    const errors = [];
    const data = {};
    data.kmInicial = parseFloat(Utils.convertCommaToPoint(String(kmInicial)));
    if (
      !Utils.validateNumber(
        data.kmInicial,
        CONFIG.VALIDATION.MIN_KM,
        CONFIG.VALIDATION.MAX_KM
      )
    )
      errors.push(
        this.langManager.get("initialKmError", {
          min: CONFIG.VALIDATION.MIN_KM,
          max: CONFIG.VALIDATION.MAX_KM,
        })
      );
    data.kmFinal = parseFloat(Utils.convertCommaToPoint(String(kmFinal)));
    if (
      !Utils.validateNumber(
        data.kmFinal,
        data.kmInicial + 0.01,
        CONFIG.VALIDATION.MAX_KM
      )
    )
      errors.push(
        this.langManager.get("finalKmError", { max: CONFIG.VALIDATION.MAX_KM })
      );
    else if (
      data.kmFinal - data.kmInicial >
      CONFIG.VALIDATION.MAX_TRIP_DISTANCE
    )
      errors.push(
        this.langManager.get("maxTripDistanceError", {
          limit: CONFIG.VALIDATION.MAX_TRIP_DISTANCE,
        })
      );
    data.kmPorLitro = parseFloat(Utils.convertCommaToPoint(String(kmPorLitro)));
    if (
      !Utils.validateNumber(
        data.kmPorLitro,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    )
      errors.push(
        this.langManager.get("vehicleEfficiencyError", {
          min: CONFIG.VALIDATION.MIN_EFFICIENCY,
          max: CONFIG.VALIDATION.MAX_EFFICIENCY,
        })
      );
    data.precoCombustivel = parseFloat(
      Utils.convertCommaToPoint(String(precoCombustivel))
    );
    if (
      !Utils.validateNumber(
        data.precoCombustivel,
        CONFIG.VALIDATION.MIN_PRICE,
        CONFIG.VALIDATION.MAX_PRICE
      )
    )
      errors.push(
        this.langManager.get("fuelPriceError", {
          min: CONFIG.VALIDATION.MIN_PRICE.toFixed(2),
          max: CONFIG.VALIDATION.MAX_PRICE.toFixed(2),
        })
      );
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
      )
        errors.push(
          this.langManager.get("tripGainError", {
            max: CONFIG.VALIDATION.MAX_UBER_GAIN.toFixed(2),
          })
        );
    } else {
      data.ganhoUber = null;
    }
    const isValid = errors.length === 0;
    if (!isValid) this.uiManager.showNotification(errors.join("\n"), "error");
    return { isValid, errors, data: isValid ? data : null };
  }
}

// ===== GERENCIADOR DE VEÍCULOS =====
class VehicleManager {
  constructor(storageManager, uiManager, validator, languageManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.validator = validator;
    this.langManager = languageManager;
    this.currentVehicle = null;
    this.currentVehicleType = "carro";
    this.dom = {
      vehicleTypeButtons: document.querySelectorAll("[data-vehicle-type]"),
      vehicleListContainer: document.getElementById("vehicleList"),
      addVehicleBtn: document.getElementById("addVehicleBtn"),
      vehicleForm: document.getElementById("vehicleForm"),
      vehicleTypeInput: document.getElementById("vehicleType"),
      vehicleNameInput: document.getElementById("vehicleName"),
      vehicleEfficiencyInput: document.getElementById("vehicleEfficiency"),
      saveVehicleBtn: document.getElementById("saveVehicleBtn"),
      cancelVehicleBtn: document.getElementById("cancelVehicleBtn"),
      mainFormEfficiencyInput: document.getElementById("kmPorLitro"),
    };
    this._bindEvents();
    document.addEventListener("languageChanged", () =>
      this.loadAndRenderVehicles()
    );
  }
  _bindEvents() {
    this.dom.vehicleTypeButtons.forEach((button) =>
      button.addEventListener("click", (e) =>
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
  }
  selectVehicleType(type) {
    if (type !== "carro" && type !== "moto") return;
    this.currentVehicleType = type;
    this.dom.vehicleTypeButtons.forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.vehicleType === type);
      btn.setAttribute("aria-pressed", btn.dataset.vehicleType === type);
    });
    this.currentVehicle = null;
    if (this.dom.mainFormEfficiencyInput)
      this.dom.mainFormEfficiencyInput.value = "";
    this.loadAndRenderVehicles();
    document.dispatchEvent(
      new CustomEvent("vehicleTypeChanged", { detail: { type } })
    );
  }
  loadAndRenderVehicles() {
    if (!this.dom.vehicleListContainer) return;
    const allVehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const filteredVehicles = allVehicles.filter(
      (v) => v.tipo === this.currentVehicleType
    );
    this.dom.vehicleListContainer.innerHTML = "";
    if (filteredVehicles.length === 0) {
      this.dom.vehicleListContainer.innerHTML = `<li class="empty-message">${this.langManager.get(
        "noVehiclesOfType",
        {
          type: this.langManager
            .get(
              this.currentVehicleType === "carro"
                ? "vehicleTypeCar"
                : "vehicleTypeMotorcycle"
            )
            .toLowerCase(),
        }
      )}</li>`;
      return;
    }
    filteredVehicles.forEach((vehicle) =>
      this.dom.vehicleListContainer.appendChild(
        this._createVehicleCardElement(vehicle)
      )
    );
  }
  _createVehicleCardElement(vehicle) {
    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.dataset.vehicleId = vehicle.id;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    const vehicleNameSanitized = Utils.sanitizeHTML(vehicle.nome);
    card.setAttribute(
      "aria-label",
      this.langManager.get("selectVehicleAriaLabel", {
        name: vehicleNameSanitized,
        efficiency: vehicle.eficiencia,
      })
    );
    if (this.currentVehicle && this.currentVehicle.id === vehicle.id)
      card.classList.add("active");
    const title = document.createElement("h4");
    title.textContent = vehicleNameSanitized;
    const efficiencySpan = document.createElement("span");
    efficiencySpan.textContent = `${vehicle.eficiencia} km/L`;
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.innerHTML = "&times;";
    deleteBtn.setAttribute(
      "aria-label",
      this.langManager.get("deleteVehicleAriaLabel", {
        name: vehicleNameSanitized,
      })
    );
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const c = await this.uiManager.showConfirm(
        this.langManager.get("confirmDeleteVehicle", {
          name: vehicleNameSanitized,
        })
      );
      if (c) this.deleteVehicle(vehicle.id);
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
  selectVehicle(vehicleId) {
    const allVehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const vehicle = allVehicles.find((v) => v.id === vehicleId);
    if (vehicle) {
      this.currentVehicle = vehicle;
      if (this.dom.mainFormEfficiencyInput)
        this.dom.mainFormEfficiencyInput.value = vehicle.eficiencia;
      this.dom.vehicleListContainer
        .querySelectorAll(".vehicle-card")
        .forEach((c) =>
          c.classList.toggle("active", c.dataset.vehicleId === vehicleId)
        );
      this.uiManager.showNotification("vehicleSelected", "info", {
        name: Utils.sanitizeHTML(vehicle.nome),
      });
    }
  }
  showVehicleForm() {
    if (!this.dom.vehicleForm || !this.dom.vehicleTypeInput) return;
    this.dom.vehicleTypeInput.value = this.currentVehicleType;
    this.dom.vehicleNameInput.value = "";
    this.dom.vehicleEfficiencyInput.value = "";
    this.dom.vehicleForm.style.display = "block";
    this.dom.vehicleNameInput.focus();
    this.dom.vehicleForm.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
  hideVehicleForm() {
    if (this.dom.vehicleForm) this.dom.vehicleForm.style.display = "none";
  }
  saveVehicle() {
    const validationResult = this.validator.validateVehicle(
      this.dom.vehicleNameInput.value,
      this.dom.vehicleEfficiencyInput.value,
      this.dom.vehicleTypeInput.value
    );
    if (!validationResult.isValid) return;
    const { nome, eficiencia, tipo } = validationResult.data;
    const newVehicle = {
      id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      nome,
      eficiencia,
      tipo,
      createdAt: new Date().toISOString(),
    };
    const vehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const existingVehicle = vehicles.find(
      (v) => v.nome.toLowerCase() === nome.toLowerCase() && v.tipo === tipo
    );
    if (existingVehicle) {
      this.uiManager.showNotification("vehicleExistsError", "error", {
        type: this.langManager
          .get(tipo === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle")
          .toLowerCase(),
        name: nome,
      });
      return;
    }
    vehicles.push(newVehicle);
    if (
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)
    ) {
      this.uiManager.showNotification("vehicleSaved", "success", {
        name: nome,
      });
      this.hideVehicleForm();
      this.loadAndRenderVehicles();
      if (
        vehicles.filter((v) => v.tipo === this.currentVehicleType).length === 1
      )
        this.selectVehicle(newVehicle.id);
    }
  }
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
      this.uiManager.showNotification("vehicleDeleted", "success", {
        name: Utils.sanitizeHTML(vehicleToDelete.nome),
      });
      if (this.currentVehicle && this.currentVehicle.id === vehicleId) {
        this.currentVehicle = null;
        if (this.dom.mainFormEfficiencyInput)
          this.dom.mainFormEfficiencyInput.value = "";
      }
      this.loadAndRenderVehicles();
      if (
        vehicles.filter((v) => v.tipo === this.currentVehicleType).length ===
          0 &&
        this.dom.mainFormEfficiencyInput
      )
        this.dom.mainFormEfficiencyInput.placeholder = this.langManager.get(
          "tripEfficiencyPlaceholder"
        );
    }
  }
  getCurrentVehicleName() {
    return this.currentVehicle ? this.currentVehicle.nome : null;
  }
  resetState() {
    this.currentVehicle = null;
    this.currentVehicleType = "carro";
    if (this.dom.mainFormEfficiencyInput) {
      this.dom.mainFormEfficiencyInput.value = "";
      this.dom.mainFormEfficiencyInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
    }
    this.selectVehicleType("carro");
  }
}

// ===== CALCULADORA DE COMBUSTÍVEL =====
class FuelCalculator {
  constructor(
    storageManager,
    uiManager,
    validator,
    vehicleManager,
    languageManager
  ) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.validator = validator;
    this.vehicleManager = vehicleManager;
    this.langManager = languageManager;
    this.dom = {
      form: document.getElementById("fuelForm"),
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
    };
    this._bindEvents();
    document.addEventListener("languageChanged", () =>
      this._updateResultCardCurrency()
    );
  }
  _updateResultCardCurrency() {
    if (this.dom.resultCard && this.dom.resultCard.style.display === "block") {
      if (
        this.dom.custoResult.textContent !==
          this.langManager.get("currencyPlaceholder") &&
        this.dom.custoResult.textContent !==
          this.langManager.get("currencyPlaceholder", {}, "en")
      ) {
        // Usar chave para placeholder
        const custoText = this.dom.custoResult.textContent
          .replace(/[R$\sA-Z]/gi, "")
          .replace(",", "."); // Remove símbolos de moeda e letras
        if (!isNaN(parseFloat(custoText)))
          this.dom.custoResult.textContent = Utils.formatCurrency(
            parseFloat(custoText),
            this.langManager.currentLanguage
          );
      }
      if (
        this.dom.lucroResult.textContent !==
          this.langManager.get("currencyPlaceholder") &&
        this.dom.lucroResult.textContent !==
          this.langManager.get("currencyPlaceholder", {}, "en") &&
        this.dom.lucroResult.textContent !== "N/A"
      ) {
        const lucroText = this.dom.lucroResult.textContent
          .replace(/[R$\sA-Z]/gi, "")
          .replace(",", ".");
        if (!isNaN(parseFloat(lucroText)))
          this.dom.lucroResult.textContent = Utils.formatCurrency(
            parseFloat(lucroText),
            this.langManager.currentLanguage
          );
      }
    }
  }
  _bindEvents() {
    if (this.dom.form)
      this.dom.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.calculateAndDisplayTrip();
      });
  }
  calculateAndDisplayTrip() {
    const validationResult = this.validator.validateTrip(
      this.dom.kmInicialInput.value,
      this.dom.kmFinalInput.value,
      this.dom.kmPorLitroInput.value,
      this.dom.precoCombustivelInput.value,
      this.dom.ganhoUberInput.value
    );
    if (!validationResult.isValid) return;
    const { kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber } =
      validationResult.data;
    const distancia = kmFinal - kmInicial;
    const litrosConsumidos = distancia / kmPorLitro;
    const custoTotal = litrosConsumidos * precoCombustivel;
    const lucroLiquido = ganhoUber !== null ? ganhoUber - custoTotal : null;
    if (this.dom.distanciaResult)
      this.dom.distanciaResult.textContent = `${distancia.toFixed(1)} km`;
    if (this.dom.litrosResult)
      this.dom.litrosResult.textContent = `${litrosConsumidos.toFixed(1)} L`;
    if (this.dom.custoResult)
      this.dom.custoResult.textContent = Utils.formatCurrency(
        custoTotal,
        this.langManager.currentLanguage
      );
    if (this.dom.lucroResult) {
      const lucroItem = this.dom.lucroResult.closest(".result-item");
      if (lucroLiquido !== null) {
        this.dom.lucroResult.textContent = Utils.formatCurrency(
          lucroLiquido,
          this.langManager.currentLanguage
        );
        if (lucroItem) lucroItem.style.display = "";
      } else {
        this.dom.lucroResult.textContent = "N/A";
        if (lucroItem) lucroItem.style.display = "none";
      }
    }
    if (this.dom.resultCard) this.dom.resultCard.style.display = "block";
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
    document.dispatchEvent(new CustomEvent("tripCalculated"));
  }
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
        : this.langManager.get("manualOrUnspecified"),
      kmInicial: tripData.kmInicial,
      kmFinal: tripData.kmFinal,
      distancia: tripData.distancia.toFixed(1),
      kmPorLitroUtilizado: tripData.kmPorLitro,
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
    history.unshift(newRecord);
    if (history.length > CONFIG.HISTORY_LIMIT) history.pop();
    this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, history);
  }
  _clearTripForm() {
    if (this.dom.form) {
      this.dom.kmInicialInput.value = "";
      this.dom.kmFinalInput.value = "";
      if (!this.vehicleManager.currentVehicle)
        this.dom.kmPorLitroInput.value = "";
      this.dom.precoCombustivelInput.value = "";
      this.dom.ganhoUberInput.value = "";
      this.dom.kmInicialInput.focus();
    }
  }
  resetState() {
    this._clearTripForm();
    if (this.dom.resultCard) this.dom.resultCard.style.display = "none";
    if (this.dom.kmPorLitroInput && !this.vehicleManager.currentVehicle)
      this.dom.kmPorLitroInput.value = "";
  }
}

// ===== GERENCIADOR DE HISTÓRICO DE VIAGENS =====
class HistoryManager {
  constructor(storageManager, uiManager, vehicleManager, languageManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.vehicleManager = vehicleManager;
    this.langManager = languageManager;
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
        const vehicleTypeTranslated = this.langManager.get(
          this.vehicleManager.currentVehicleType === "carro"
            ? "vehicleTypeCar"
            : "vehicleTypeMotorcycle"
        );
        const confirmed = await this.uiManager.showConfirm(
          this.langManager.get("confirmClearTypeHistory", {
            type: vehicleTypeTranslated.toLowerCase(),
          })
        );
        if (confirmed) this.clearHistoryForCurrentType();
      });
    }
    document.addEventListener("languageChanged", () => this.renderHistory());
    document.addEventListener("vehicleTypeChanged", () => this.renderHistory());
    document.addEventListener("tripCalculated", () => this.renderHistory());
    document.addEventListener("allDataCleared", () => this.renderHistory());
  }
  toggleFullHistory(showFull) {
    this.isFullHistoryVisible = showFull;
    this.renderHistory();
  }
  renderHistory() {
    if (!this.dom.historyList || !this.dom.historySection) return;
    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const filteredHistory = allHistory.filter(
      (item) => item.tipoVeiculo === this.vehicleManager.currentVehicleType
    );
    this.dom.historyList.innerHTML = "";
    if (filteredHistory.length === 0) {
      this.dom.historySection.style.display = "none";
      return;
    }
    this.dom.historySection.style.display = "block";
    const itemsToRender = this.isFullHistoryVisible
      ? filteredHistory
      : filteredHistory.slice(0, CONFIG.HISTORY_DISPLAY_COUNT);
    const vehicleTypeTranslated = this.langManager.get(
      this.vehicleManager.currentVehicleType === "carro"
        ? "vehicleTypeCar"
        : "vehicleTypeMotorcycle"
    );
    if (itemsToRender.length === 0 && filteredHistory.length > 0)
      this.dom.historyList.innerHTML = `<li class="empty-message-list">${this.langManager.get(
        "noRecordsToDisplay"
      )}</li>`;
    else if (itemsToRender.length === 0)
      this.dom.historyList.innerHTML = `<li class="empty-message-list">${this.langManager.get(
        "noHistoryForType",
        { type: vehicleTypeTranslated.toLowerCase() }
      )}</li>`;
    itemsToRender.forEach((record) =>
      this.dom.historyList.appendChild(this._createHistoryItemElement(record))
    );
    const totalFiltered = filteredHistory.length;
    if (this.dom.seeMoreBtn)
      this.dom.seeMoreBtn.style.display =
        totalFiltered > CONFIG.HISTORY_DISPLAY_COUNT &&
        !this.isFullHistoryVisible
          ? "block"
          : "none";
    if (this.dom.minimizeBtn)
      this.dom.minimizeBtn.style.display =
        totalFiltered > CONFIG.HISTORY_DISPLAY_COUNT &&
        this.isFullHistoryVisible
          ? "block"
          : "none";
  }
  _createHistoryItemElement(record) {
    const li = document.createElement("li");
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    const formattedDate = Utils.formatLocalDate(
      record.dataISO,
      this.langManager.currentLanguage
    );
    li.setAttribute(
      "aria-label",
      this.langManager.get("tripDetailsAriaLabel", { date: formattedDate })
    );
    li.dataset.recordId = record.id;
    const dateSpan = document.createElement("span");
    dateSpan.textContent = formattedDate;
    const summaryStrong = document.createElement("strong"); // Renomeado para clareza
    let summaryText = `${this.langManager.get(
      "costLabel"
    )}: ${Utils.formatCurrency(
      parseFloat(record.custoTotalCombustivel),
      this.langManager.currentLanguage
    )}`;
    if (record.lucroLiquidoViagem !== null) {
      summaryText += ` / ${this.langManager.get(
        "profitLabel"
      )}: ${Utils.formatCurrency(
        parseFloat(record.lucroLiquidoViagem),
        this.langManager.currentLanguage
      )}`;
    }
    summaryStrong.textContent = summaryText;
    li.appendChild(dateSpan);
    li.appendChild(summaryStrong);
    li.addEventListener("click", () => this._showRecordDetails(record.id));
    li.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._showRecordDetails(record.id);
      }
    });
    return li;
  }
  _showRecordDetails(recordId) {
    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const record = allHistory.find((item) => item.id === recordId);
    if (!record) {
      this.uiManager.showNotification("recordNotFound", "error");
      return;
    }
    const currentLang = this.langManager.currentLanguage;
    const details = [
      {
        labelKey: "detailLabelDate",
        value: Utils.formatLocalDate(record.dataISO, currentLang),
      },
      { labelKey: "detailLabelVehicle", value: record.veiculoNome }, // Nome do veículo já está sanitizado ao salvar
      {
        labelKey: "detailLabelType",
        value: this.langManager.get(
          record.tipoVeiculo === "carro"
            ? "vehicleTypeCar"
            : "vehicleTypeMotorcycle"
        ),
      },
      { labelKey: "detailLabelInitialKm", value: `${record.kmInicial} km` },
      { labelKey: "detailLabelFinalKm", value: `${record.kmFinal} km` },
      { labelKey: "detailLabelDistance", value: `${record.distancia} km` },
      {
        labelKey: "detailLabelEfficiencyUsed",
        value: `${record.kmPorLitroUtilizado} km/L`,
      },
      {
        labelKey: "detailLabelFuelConsumed",
        value: `${record.litrosConsumidos} L`,
      },
      {
        labelKey: "detailLabelPricePerLiter",
        value: Utils.formatCurrency(record.precoPorLitro, currentLang),
      },
      {
        labelKey: "detailLabelTotalFuelCost",
        value: Utils.formatCurrency(record.custoTotalCombustivel, currentLang),
      },
    ];
    if (record.ganhoBrutoInformado !== null) {
      details.push({
        labelKey: "detailLabelGrossGain",
        value: Utils.formatCurrency(record.ganhoBrutoInformado, currentLang),
      });
      details.push({
        labelKey: "detailLabelNetProfit",
        value: Utils.formatCurrency(record.lucroLiquidoViagem, currentLang),
      });
    }
    this.uiManager.showDetailsModal("tripDetailsModalTitle", details);
  }
  clearHistoryForCurrentType() {
    const currentType = this.vehicleManager.currentVehicleType;
    let allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const remainingHistory = allHistory.filter(
      (item) => item.tipoVeiculo !== currentType
    );
    if (
      this.storageManager.safeSetItem(
        CONFIG.STORAGE_KEYS.HISTORY,
        remainingHistory
      )
    ) {
      const vehicleTypeTranslated = this.langManager.get(
        currentType === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle"
      );
      this.uiManager.showNotification("historyClearedSuccess", "success", {
        type: vehicleTypeTranslated.toLowerCase(),
      });
      this.isFullHistoryVisible = false;
      this.renderHistory();
      document.dispatchEvent(
        new CustomEvent("historyCleared", { detail: { type: currentType } })
      );
    }
  }
  resetState() {
    this.isFullHistoryVisible = false;
    this.renderHistory();
  }
}

// ===== GERENCIADOR DE ESTATÍSTICAS =====
class StatisticsManager {
  constructor(storageManager, uiManager, vehicleManager, languageManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.vehicleManager = vehicleManager;
    this.langManager = languageManager;
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
    document.addEventListener("languageChanged", () => this.debouncedUpdate());
    document.addEventListener("vehicleTypeChanged", () =>
      this.debouncedUpdate()
    );
    document.addEventListener("tripCalculated", () => this.debouncedUpdate());
    document.addEventListener("historyCleared", () => this.debouncedUpdate());
    document.addEventListener("allDataCleared", () => this.debouncedUpdate());
  }
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
      this.dom.totalGastoStat.textContent = Utils.formatCurrency(
        totalGasto,
        this.langManager.currentLanguage
      );
    if (this.dom.mediaConsumoStat)
      this.dom.mediaConsumoStat.textContent = `${mediaConsumo.toFixed(1)} km/L`;
  }
  _prepareChartData(historyData) {
    const dailyCosts = {};
    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - CONFIG.CHART_MAX_DAYS);
    historyData.forEach((item) => {
      const itemDate = new Date(item.dataISO);
      if (itemDate >= cutOffDate) {
        const dateKey = itemDate.toLocaleDateString(
          this.langManager.currentLanguage,
          { day: "2-digit", month: "2-digit" }
        );
        dailyCosts[dateKey] =
          (dailyCosts[dateKey] || 0) + parseFloat(item.custoTotalCombustivel);
      }
    });
    const sortedDates = Object.keys(dailyCosts).sort((a, b) => {
      const [dayA, monthA] = a.split("/");
      const [dayB, monthB] = b.split("/");
      return (
        new Date(
          new Date().getFullYear(),
          parseInt(monthA) - 1,
          parseInt(dayA)
        ) -
        new Date(new Date().getFullYear(), parseInt(monthB) - 1, parseInt(dayB))
      );
    });
    return {
      labels: sortedDates,
      data: sortedDates.map((date) => dailyCosts[date].toFixed(2)),
    };
  }
  _renderOrUpdateChart(historyData) {
    if (!this.dom.chartCanvas || typeof Chart === "undefined") return;
    const { labels, data } = this._prepareChartData(historyData);
    const vehicleTypeTranslated = this.langManager.get(
      this.vehicleManager.currentVehicleType === "carro"
        ? "vehicleTypeCar"
        : "vehicleTypeMotorcycle"
    );
    const chartLabel = this.langManager.get("chartDailyExpenseLabel", {
      type: vehicleTypeTranslated,
    });
    const textColor = "#e0e0e0";
    const gridColor = "#444444";
    const uberGreen = "#00c165";
    const uberGreenTransparent = "rgba(0, 193, 101, 0.2)";
    const chartConfig = {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: chartLabel,
            data: data,
            borderColor: uberGreen,
            backgroundColor: uberGreenTransparent,
            tension: 0.3,
            fill: true,
            pointBackgroundColor: uberGreen,
            pointBorderColor: "#fff",
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: uberGreen,
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
              callback: (value) =>
                Utils.formatCurrency(value, this.langManager.currentLanguage),
              font: { size: 10 },
            },
            grid: { color: gridColor, drawBorder: false },
            beginAtZero: true,
          },
        },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 12 } } },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: uberGreen,
            bodyColor: textColor,
            borderColor: uberGreen,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
            callbacks: {
              label: (context) =>
                `${context.dataset.label || ""}: ${Utils.formatCurrency(
                  context.parsed.y,
                  this.langManager.currentLanguage
                )}`,
            },
          },
        },
        animation: { duration: 800, easing: "easeInOutQuart" },
      },
    };
    if (this.chartInstance) {
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.data.datasets[0].label = chartLabel;
      this.chartInstance.options.scales.y.ticks.callback = (value) =>
        Utils.formatCurrency(value, this.langManager.currentLanguage);
      this.chartInstance.options.plugins.tooltip.callbacks.label = (context) =>
        `${context.dataset.label || ""}: ${Utils.formatCurrency(
          context.parsed.y,
          this.langManager.currentLanguage
        )}`;
      this.chartInstance.update();
    } else {
      try {
        this.chartInstance = new Chart(
          this.dom.chartCanvas.getContext("2d"),
          chartConfig
        );
      } catch (error) {
        console.error("Erro Chart:", error);
        this.uiManager.showNotification("genericError", "error");
        this.chartInstance = null;
      }
    }
  }
  resetState() {
    this.updateStatistics();
  }
}

// ===== GERENCIADOR PRINCIPAL DA APLICAÇÃO (AppManager) =====
class AppManager {
  constructor() {
    this.storageManager = new StorageManager(null); // UIManager será injetado depois
    this.languageManager = new LanguageManager(this.storageManager);
    this.uiManager = new UIManager(this.languageManager);
    this.storageManager.uiManager = this.uiManager; // Injeta UIManager
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
    this.dom = { appVersionSpan: document.getElementById("appVersion") };
    this._init();
  }
  _init() {
    this._displayAppVersion();
    this.languageManager.setLanguage(this.languageManager.currentLanguage);
    this._registerServiceWorker();
    this._bindGlobalAppEvents();
    // _initializeAppState não é mais necessário aqui, pois setLanguage e os construtores dos módulos cuidam disso.
    this._hideSplashScreen();
  }
  _displayAppVersion() {
    if (this.dom.appVersionSpan)
      this.dom.appVersionSpan.textContent = CONFIG.APP_VERSION;
  }
  _registerServiceWorker() {
    if ("serviceWorker" in navigator)
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("./sw.js")
          .then((reg) => console.log("SW FuelCalc OK. Escopo:", reg.scope))
          .catch((err) => console.error("Falha SW FuelCalc:", err));
      });
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
            this.languageManager.setLanguage(newLang); // Isso dispara 'languageChanged'
            // Os listeners de 'languageChanged' devem atualizar os módulos.
            // Forçar atualização explícita dos dados após a mudança de idioma ter sido aplicada.
            this.vehicleManager.selectVehicleType(
              this.vehicleManager.currentVehicleType
            );
            // As chamadas abaixo podem ser redundantes se 'languageChanged' e 'vehicleTypeChanged' já atualizam tudo.
            // this.historyManager.renderHistory();
            // this.statisticsManager.updateStatistics();
          }
          importFileInput.value = "";
        }
      });
    }
    const clearAllDataBtn = document.getElementById("clearAllDataBtn");
    if (clearAllDataBtn) {
      clearAllDataBtn.addEventListener("click", async () => {
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
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.uiManager.hideDetailsModal();
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
      this.languageManager.setLanguage(CONFIG.DEFAULT_LANGUAGE); // Reseta para o idioma padrão
      document.dispatchEvent(new CustomEvent("allDataCleared"));
      this.uiManager.showNotification("allDataClearedSuccess", "success");
    } else this.uiManager.showNotification("allDataClearError", "error");
  }
  _hideSplashScreen() {
    const s = document.getElementById("splash-screen");
    if (s) {
      s.classList.add("hidden");
      s.addEventListener(
        "transitionend",
        () => {
          if (s.classList.contains("hidden")) {
            /* s.remove(); */
          }
        },
        { once: true }
      );
    }
  }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
if (document.readyState === "loading")
  document.addEventListener("DOMContentLoaded", () => new AppManager());
else new AppManager();
