// app.js - Lógica Principal do FuelCalc
// Versão: 1.5.4 (Melhorias de Foco e Input)
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  // ===== CONFIGURAÇÕES E CONSTANTES GLOBAIS =====
  const APP_VERSION = "1.5.4";
  const CONFIG = {
    APP_VERSION,
    STORAGE_KEYS: {
      VEHICLES: `fuelCalc_vehicles_v1.5`,
      HISTORY: `fuelCalc_history_v1.5`,
      APP_SETTINGS: `fuelCalc_settings_v1.5`,
    },
    DEFAULT_LANGUAGE: "pt-BR",
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
      initialKmPlaceholder: "Ex: 150000",
      finalKmLabel: "KM Final:",
      finalKmPlaceholder: "Ex: 150120",
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
      confirmDeleteVehicle:
        'Tem certeza que deseja excluir o veículo "{name}"?',
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
      importSuccess:
        "Dados importados com sucesso! A aplicação será atualizada.",
      importErrorFile:
        "Arquivo inválido. Por favor, selecione um arquivo .json.",
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
      initialKmNotIntegerError: "KM Inicial deve ser um número inteiro.",
      finalKmNotIntegerError: "KM Final deve ser um número inteiro.",
      finalKmError:
        "KM Final inválido (deve ser maior que KM Inicial e até {max}).",
      maxTripDistanceError:
        "Distância da viagem excede o limite de {limit} km.",
      fuelPriceError:
        "Preço do combustível inválido (entre R${min} e R${max}).",
      tripGainError: "Ganho da viagem inválido (entre R$0 e R${max}).",
      currencyPlaceholder: "R$ --",
      desktopNoticeTitle: "Otimizado para Mobile!",
      desktopNoticeMessage:
        "Esta aplicação foi desenhada para uma experiência móvel. Para usar o FuelCalc, por favor, acesse através do seu smartphone ou tablet.",
      desktopScanQrMessage:
        "Escaneie o QR Code abaixo com seu dispositivo móvel:",
      desktopOrVisit: "Ou visite:",
    },
    en: {
      initialKmNotIntegerError: "Initial KM must be an integer.",
      finalKmNotIntegerError: "Final KM must be an integer.",
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
      vehicleEfficiencyLabel: "Efficiency (km/L or MPG):",
      vehicleEfficiencyPlaceholder: "Ex: 12.5",
      saveVehicleBtn: "Save Vehicle",
      cancelBtn: "Cancel",
      confirmBtn: "Confirm",
      calculateTripTitle: "Calculate Trip Expenses",
      tripEfficiencyLabel: "Vehicle Efficiency (km/L or MPG):",
      tripEfficiencyPlaceholder: "Select a vehicle or enter manually",
      initialKmLabel: "Initial KM (or Miles):",
      initialKmPlaceholder: "Ex: 150000",
      finalKmLabel: "Final KM (or Miles):",
      finalKmPlaceholder: "Ex: 150120",
      fuelPriceLabel: "Price per Liter (or Gallon):",
      fuelPricePlaceholder: "Ex: 1.50",
      tripGrossGainLabel: "Gross Trip Earnings (optional):",
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
      totalKmStatLabel: "Total KM/Miles Driven:",
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
      importErrorVehiclesFormat:
        "Vehicle data in the backup file is malformed.",
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
      chartDailyExpenseLabel: "Daily Expense ({type})",
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
      detailLabelInitialKm: "Initial KM/Miles",
      detailLabelFinalKm: "Final KM/Miles",
      detailLabelDistance: "Distance",
      detailLabelEfficiencyUsed: "Efficiency (at calculation)",
      detailLabelFuelConsumed: "Fuel Consumed",
      detailLabelPricePerLiter: "Price per Unit (at date)",
      detailLabelTotalFuelCost: "Total Fuel Cost",
      detailLabelGrossGain: "Gross Earnings Reported",
      detailLabelNetProfit: "Estimated Net Profit",
      vehicleNameLengthError:
        "Vehicle name must be between {min} and {max} characters.",
      vehicleEfficiencyError:
        "Efficiency must be a number between {min} and {max}.",
      invalidVehicleTypeError:
        "Invalid vehicle type. Select 'Car' or 'Motorcycle'.",
      initialKmError: "Initial KM/Miles invalid (between {min} and {max}).",
      finalKmError:
        "Final KM/Miles invalid (must be greater than Initial and up to {max}).",
      maxTripDistanceError: "Trip distance exceeds the limit of {limit}.",
      fuelPriceError: "Fuel price invalid (between ${min} and ${max}).",
      tripGainError: "Trip earnings invalid (between $0 and ${max}).",
      currencyPlaceholder: "$ --",
      desktopNoticeTitle: "Optimized for Mobile!",
      desktopNoticeMessage:
        "This application is designed for a mobile experience. To use FuelCalc, please access it via your smartphone or tablet.",
      desktopScanQrMessage: "Scan the QR Code below with your mobile device:",
      desktopOrVisit: "Or visit:",
    },
  };

  // ===== INÍCIO DAS CLASSES DA APLICAÇÃO =====
  // A ordem é importante: classes sem dependências ou com poucas vêm primeiro.

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
    constructor(storageManager) {
      this.storageManager = storageManager;
      this.currentLanguage =
        this._loadLanguagePreference() || CONFIG.DEFAULT_LANGUAGE;
      this.translationData = translations;
      this._bindLanguageButtons();
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
      document.querySelectorAll(".lang-button").forEach((b) => {
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
        document
          .querySelectorAll(".lang-button")
          .forEach((b) =>
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
          if (k) el.textContent = this.get(k);
          if (pk) el.placeholder = this.get(pk);
          if (ak) el.setAttribute("aria-label", this.get(ak));
          if (tk) el.title = this.get(tk);
        });
      const pte = document.querySelector("title[data-translate-key]");
      if (pte) pte.textContent = this.get(pte.dataset.translateKey);
    }
  }

  class UIManager {
    constructor(languageManager) {
      this.langManager = languageManager;
      this.notificationArea = document.getElementById("notificationArea");
      this.detailsModalOverlay = document.getElementById("detailsModalOverlay");
      this.detailsModalContent = document.getElementById("detailsModalContent");
      this.closeDetailsModalBtn = document.getElementById(
        "closeDetailsModalBtn"
      );
      this.confirmModalOverlay = document.getElementById("confirmModalOverlay");
      this.confirmModalTitle = document.getElementById("confirmModalTitle");
      this.confirmModalMessage = document.getElementById("confirmModalMessage");
      this.confirmModalConfirmBtn = document.getElementById(
        "confirmModalConfirmBtn"
      );
      this.confirmModalCancelBtn = document.getElementById(
        "confirmModalCancelBtn"
      );
      this._resolveConfirm = null;
      this._bindModalEvents();
      document.addEventListener("languageChanged", () =>
        this._retranslateOpenModals()
      );
    }
    _retranslateOpenModals() {
      if (
        this.detailsModalOverlay &&
        this.detailsModalOverlay.classList.contains("active")
      ) {
        const t = this.detailsModalOverlay.querySelector("#detailsModalTitle");
        if (t) t.textContent = this.langManager.get("tripDetailsModalTitle");
      }
      if (
        this.confirmModalOverlay &&
        this.confirmModalOverlay.classList.contains("active")
      ) {
        if (this.confirmModalTitle)
          this.confirmModalTitle.textContent = this.langManager.get(
            "confirmActionModalTitle"
          );
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
    showNotification(key, type = "info", params = {}) {
      if (!this.notificationArea) return;
      const msg = this.langManager.get(key, params);
      const n = document.createElement("div");
      n.className = `notification ${type}`;
      n.setAttribute("role", "alert");
      n.setAttribute("aria-live", "assertive");
      const ms = document.createElement("span");
      ms.className = "notification-message";
      ms.textContent = msg;
      const cb = document.createElement("button");
      cb.innerHTML = "&times;";
      cb.className = "notification-close";
      cb.setAttribute(
        "aria-label",
        this.langManager.get("closeModalAriaLabel")
      );
      cb.addEventListener("click", () => this._removeNotification(n));
      n.appendChild(ms);
      n.appendChild(cb);
      this.notificationArea.appendChild(n);
      void n.offsetWidth;
      n.style.opacity = "1";
      n.style.transform = "translateX(0)";
      setTimeout(
        () => this._removeNotification(n),
        CONFIG.NOTIFICATION_TIMEOUT
      );
    }
    _removeNotification(n) {
      if (n && n.parentNode) {
        n.style.opacity = "0";
        n.style.transform = "translateX(100%)";
        n.addEventListener(
          "transitionend",
          () => {
            if (n.parentNode) n.parentNode.removeChild(n);
          },
          { once: true }
        );
        setTimeout(() => {
          if (n.parentNode) n.parentNode.removeChild(n);
        }, 350);
      }
    }
    showDetailsModal(key, details) {
      if (!this.detailsModalOverlay || !this.detailsModalContent) return;
      const t = this.detailsModalOverlay.querySelector("#detailsModalTitle");
      if (t) t.textContent = this.langManager.get(key);
      this.detailsModalContent.innerHTML = "";
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
        this.detailsModalContent.appendChild(i);
      });
      this.detailsModalOverlay.style.display = "flex";
      document.body.classList.add("modal-open");
      void this.detailsModalOverlay.offsetWidth;
      this.detailsModalOverlay.classList.add("active");
      if (this.closeDetailsModalBtn) this.closeDetailsModalBtn.focus();
    }
    hideDetailsModal() {
      if (!this.detailsModalOverlay) return;
      this.detailsModalOverlay.classList.remove("active");
      document.body.classList.remove("modal-open");
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
    showConfirm(key, titleKey = "confirmActionModalTitle", params = {}) {
      return new Promise((resolve) => {
        if (!this.confirmModalOverlay) {
          resolve(window.confirm(this.langManager.get(key, params)));
          return;
        }
        this.confirmModalTitle.textContent = this.langManager.get(titleKey);
        this.confirmModalMessage.textContent = this.langManager.get(
          key,
          params
        );
        this._resolveConfirm = resolve;
        this.confirmModalOverlay.style.display = "flex";
        document.body.classList.add("modal-open");
        void this.confirmModalOverlay.offsetWidth;
        this.confirmModalOverlay.classList.add("active");
        if (this.confirmModalConfirmBtn) this.confirmModalConfirmBtn.focus();
      });
    }
    _handleConfirm(confirmed) {
      if (!this.confirmModalOverlay) return;
      this.confirmModalOverlay.classList.remove("active");
      document.body.classList.remove("modal-open");
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
  class StorageManager {
    constructor() {
      this.uiManager = null;
    }
    safeGetItem(key, defaultValue = []) {
      try {
        if (!this._isStorageAvailable()) {
          return defaultValue;
        }
        const i = localStorage.getItem(key);
        return i ? JSON.parse(i) : defaultValue;
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
        settings: this.safeGetItem(CONFIG.STORAGE_KEYS.APP_SETTINGS, {
          language: CONFIG.DEFAULT_LANGUAGE,
        }),
      };
      const b = new Blob([JSON.stringify(d, null, 2)], {
        type: "application/json",
      });
      const u = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = u;
      a.download = `fuelcalc_backup_${CONFIG.APP_VERSION}_${
        new Date().toISOString().split("T")[0]
      }.json`;
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
          if (d.settings.language && translations[d.settings.language]) {
            ns.language = d.settings.language;
          } else if (d.settings.language) {
            ns.language = cs.language || CONFIG.DEFAULT_LANGUAGE;
          }
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
    validateVehicle(nome, eficiencia, tipo) {
      const e = [];
      const pe = parseFloat(Utils.convertCommaToPoint(String(eficiencia)));
      const tn = String(nome).trim();
      if (
        tn.length < CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH ||
        tn.length > CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH
      )
        e.push(
          this.langManager.get("vehicleNameLengthError", {
            min: CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH,
            max: CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH,
          })
        );
      if (
        !Utils.validateNumber(
          pe,
          CONFIG.VALIDATION.MIN_EFFICIENCY,
          CONFIG.VALIDATION.MAX_EFFICIENCY
        )
      )
        e.push(
          this.langManager.get("vehicleEfficiencyError", {
            min: CONFIG.VALIDATION.MIN_EFFICIENCY,
            max: CONFIG.VALIDATION.MAX_EFFICIENCY,
          })
        );
      if (!["carro", "moto"].includes(tipo))
        e.push(this.langManager.get("invalidVehicleTypeError"));
      const i = e.length === 0;
      if (!i) this.uiManager.showNotification(e.join("\n"), "error");
      return {
        isValid: i,
        errors: e,
        data: i ? { nome: tn, eficiencia: pe, tipo } : null,
      };
    }
    validateTrip(ki, kf, kpl, pc, gu) {
      const e = [];
      const d = {};
      d.kmInicial = parseFloat(Utils.convertCommaToPoint(String(ki)));
      if (
        !Utils.validateNumber(
          d.kmInicial,
          CONFIG.VALIDATION.MIN_KM,
          CONFIG.VALIDATION.MAX_KM
        )
      )
        e.push(
          this.langManager.get("initialKmError", {
            min: CONFIG.VALIDATION.MIN_KM,
            max: CONFIG.VALIDATION.MAX_KM,
          })
        );
      else if (!Number.isInteger(d.kmInicial))
        e.push(this.langManager.get("initialKmNotIntegerError"));
      d.kmFinal = parseFloat(Utils.convertCommaToPoint(String(kf)));
      if (
        !Utils.validateNumber(
          d.kmFinal,
          d.kmInicial + 1,
          CONFIG.VALIDATION.MAX_KM
        )
      )
        e.push(
          this.langManager.get("finalKmError", {
            max: CONFIG.VALIDATION.MAX_KM,
          })
        );
      else if (!Number.isInteger(d.kmFinal))
        e.push(this.langManager.get("finalKmNotIntegerError"));
      else if (d.kmFinal - d.kmInicial > CONFIG.VALIDATION.MAX_TRIP_DISTANCE)
        e.push(
          this.langManager.get("maxTripDistanceError", {
            limit: CONFIG.VALIDATION.MAX_TRIP_DISTANCE,
          })
        );
      d.kmPorLitro = parseFloat(Utils.convertCommaToPoint(String(kpl)));
      if (
        !Utils.validateNumber(
          d.kmPorLitro,
          CONFIG.VALIDATION.MIN_EFFICIENCY,
          CONFIG.VALIDATION.MAX_EFFICIENCY
        )
      )
        e.push(
          this.langManager.get("vehicleEfficiencyError", {
            min: CONFIG.VALIDATION.MIN_EFFICIENCY,
            max: CONFIG.VALIDATION.MAX_EFFICIENCY,
          })
        );
      d.precoCombustivel = parseFloat(Utils.convertCommaToPoint(String(pc)));
      if (
        !Utils.validateNumber(
          d.precoCombustivel,
          CONFIG.VALIDATION.MIN_PRICE,
          CONFIG.VALIDATION.MAX_PRICE
        )
      )
        e.push(
          this.langManager.get("fuelPriceError", {
            min: CONFIG.VALIDATION.MIN_PRICE.toFixed(2),
            max: CONFIG.VALIDATION.MAX_PRICE.toFixed(2),
          })
        );
      if (gu !== null && gu !== undefined && String(gu).trim() !== "") {
        d.ganhoUber = parseFloat(Utils.convertCommaToPoint(String(gu)));
        if (
          !Utils.validateNumber(d.ganhoUber, 0, CONFIG.VALIDATION.MAX_UBER_GAIN)
        )
          e.push(
            this.langManager.get("tripGainError", {
              max: CONFIG.VALIDATION.MAX_UBER_GAIN.toFixed(2),
            })
          );
      } else {
        d.ganhoUber = null;
      }
      const i = e.length === 0;
      if (!i) this.uiManager.showNotification(e.join("\n"), "error");
      return { isValid: i, errors: e, data: i ? d : null };
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
      console.log("Formatadores de input inicializados.");
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
    constructor(sm, um, v, lm) {
      this.storageManager = sm;
      this.uiManager = um;
      this.validator = v;
      this.langManager = lm;
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
    }
    selectVehicleType(type) {
      if (type !== "carro" && type !== "moto") return;
      this.currentVehicleType = type;
      this.dom.vehicleTypeButtons.forEach((b) => {
        b.classList.toggle("selected", b.dataset.vehicleType === type);
        b.setAttribute("aria-pressed", String(b.dataset.vehicleType === type));
      });
      this.currentVehicle = null;
      if (this.dom.mainFormEfficiencyInput) {
        this.dom.mainFormEfficiencyInput.value = "";
        this.dom.mainFormEfficiencyInput.placeholder = this.langManager.get(
          "tripEfficiencyPlaceholder"
        );
      }
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
      const t = document.createElement("h4");
      t.textContent = vs;
      const es = document.createElement("span");
      es.textContent = `${v.eficiencia} km/L`;
      const db = document.createElement("button");
      db.className = "delete-button";
      db.innerHTML = "&times;";
      db.setAttribute(
        "aria-label",
        this.langManager.get("deleteVehicleAriaLabel", { name: vs })
      );
      db.addEventListener("click", async (e) => {
        e.stopPropagation();
        const conf = await this.uiManager.showConfirm(
          this.langManager.get("confirmDeleteVehicle", { name: vs })
        );
        if (conf) this.deleteVehicle(v.id);
      });
      c.appendChild(t);
      c.appendChild(es);
      c.appendChild(db);
      c.addEventListener("click", () => this.selectVehicle(v.id));
      c.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.selectVehicle(v.id);
        }
      });
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
        if (this.dom.mainFormEfficiencyInput)
          this.dom.mainFormEfficiencyInput.value = v.eficiencia;
        this.dom.vehicleListContainer
          .querySelectorAll(".vehicle-card")
          .forEach((c) =>
            c.classList.toggle("active", c.dataset.vehicleId === id)
          );
        this.uiManager.showNotification("vehicleSelected", "info", {
          name: Utils.sanitizeHTML(v.nome),
        });
      }
    }
    showVehicleForm() {
      if (
        !this.dom.vehicleForm ||
        !this.dom.vehicleTypeInput ||
        !this.dom.vehicleNameInput ||
        !this.dom.vehicleEfficiencyInput
      )
        return;
      this.dom.vehicleTypeInput.value = this.currentVehicleType;
      this.dom.vehicleNameInput.value = "";
      this.dom.vehicleEfficiencyInput.value = "";
      this.dom.vehicleForm.style.display = "block";
      this.dom.vehicleNameInput.focus();
      this.dom.vehicleForm.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
    hideVehicleForm() {
      if (this.dom.vehicleForm) this.dom.vehicleForm.style.display = "none";
    }
    saveVehicle() {
      const vr = this.validator.validateVehicle(
        this.dom.vehicleNameInput.value,
        this.dom.vehicleEfficiencyInput.value,
        this.dom.vehicleTypeInput.value
      );
      if (!vr.isValid) return;
      const { nome, eficiencia, tipo } = vr.data;
      const nv = {
        id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        nome,
        eficiencia,
        tipo,
        createdAt: new Date().toISOString(),
      };
      const v = this.storageManager.safeGetItem(
        CONFIG.STORAGE_KEYS.VEHICLES,
        []
      );
      const ev = v.find(
        (vh) => vh.nome.toLowerCase() === nome.toLowerCase() && vh.tipo === tipo
      );
      if (ev) {
        const vt = this.langManager.get(
          tipo === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle"
        );
        this.uiManager.showNotification("vehicleExistsError", "error", {
          type: vt.toLowerCase(),
          name: nome,
        });
        return;
      }
      v.push(nv);
      if (this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, v)) {
        this.uiManager.showNotification("vehicleSaved", "success", {
          name: nome,
        });
        this.hideVehicleForm();
        this.loadAndRenderVehicles();
        if (v.filter((vh) => vh.tipo === this.currentVehicleType).length === 1)
          this.selectVehicle(nv.id);
      }
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
          if (this.dom.mainFormEfficiencyInput)
            this.dom.mainFormEfficiencyInput.value = "";
        }
        this.loadAndRenderVehicles();
        if (
          v.filter((vh) => vh.tipo === this.currentVehicleType).length === 0 &&
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
      if (this.dom.mainFormEfficiencyInput) {
        this.dom.mainFormEfficiencyInput.value = "";
        this.dom.mainFormEfficiencyInput.placeholder = this.langManager.get(
          "tripEfficiencyPlaceholder"
        );
      }
      this.selectVehicleType("carro");
    }
  }
  class FuelCalculator {
    constructor(sm, um, v, vm, lm) {
      this.storageManager = sm;
      this.uiManager = um;
      this.validator = v;
      this.vehicleManager = vm;
      this.langManager = lm;
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
      if (
        this.dom.resultCard &&
        this.dom.resultCard.style.display === "block"
      ) {
        if (
          this.dom.custoResult.textContent !==
            this.langManager.get("currencyPlaceholder") &&
          this.dom.custoResult.textContent !==
            this.langManager.get("currencyPlaceholder", {}, "en")
        ) {
          const ct = this.dom.custoResult.textContent
            .replace(/[R$\sA-Z]/gi, "")
            .replace(",", ".");
          if (!isNaN(parseFloat(ct)))
            this.dom.custoResult.textContent = Utils.formatCurrency(
              parseFloat(ct),
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
          const lt = this.dom.lucroResult.textContent
            .replace(/[R$\sA-Z]/gi, "")
            .replace(",", ".");
          if (!isNaN(parseFloat(lt)))
            this.dom.lucroResult.textContent = Utils.formatCurrency(
              parseFloat(lt),
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
      const vr = this.validator.validateTrip(
        this.dom.kmInicialInput.value,
        this.dom.kmFinalInput.value,
        this.dom.kmPorLitroInput.value,
        this.dom.precoCombustivelInput.value,
        this.dom.ganhoUberInput.value
      );
      if (!vr.isValid) return;
      const { kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber } =
        vr.data;
      const d = kmFinal - kmInicial;
      const lc = d / kmPorLitro;
      const ct = lc * precoCombustivel;
      const ll = ganhoUber !== null ? ganhoUber - ct : null;
      if (this.dom.distanciaResult)
        this.dom.distanciaResult.textContent = `${d.toFixed(1)} km`;
      if (this.dom.litrosResult)
        this.dom.litrosResult.textContent = `${lc.toFixed(1)} L`;
      if (this.dom.custoResult)
        this.dom.custoResult.textContent = Utils.formatCurrency(
          ct,
          this.langManager.currentLanguage
        );
      if (this.dom.lucroResult) {
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
      }
      if (this.dom.resultCard) {
        this.dom.resultCard.style.display = "block";
        this.dom.resultCard.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
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
      if (this.dom.form) {
        this.dom.kmInicialInput.value = "";
        this.dom.kmFinalInput.value = "";
        if (!this.vehicleManager.currentVehicle)
          this.dom.kmPorLitroInput.value = "";
        this.dom.precoCombustivelInput.value = "";
        this.dom.ganhoUberInput.value = "";
      }
    }
    resetState() {
      this._clearTripForm();
      if (this.dom.resultCard) this.dom.resultCard.style.display = "none";
      if (this.dom.kmPorLitroInput && !this.vehicleManager.currentVehicle)
        this.dom.kmPorLitroInput.value = "";
    }
  }
  class HistoryManager {
    constructor(sm, um, vm, lm) {
      this.storageManager = sm;
      this.uiManager = um;
      this.vehicleManager = vm;
      this.langManager = lm;
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
      const ds = document.createElement("span");
      ds.textContent = fd;
      const ss = document.createElement("strong");
      let st = `${this.langManager.get("costLabel")}: ${Utils.formatCurrency(
        parseFloat(r.custoTotalCombustivel),
        this.langManager.currentLanguage
      )}`;
      if (r.lucroLiquidoViagem !== null) {
        st += ` / ${this.langManager.get(
          "profitLabel"
        )}: ${Utils.formatCurrency(
          parseFloat(r.lucroLiquidoViagem),
          this.langManager.currentLanguage
        )}`;
      }
      ss.textContent = st;
      li.appendChild(ds);
      li.appendChild(ss);
      li.addEventListener("click", () => this._showRecordDetails(r.id));
      li.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this._showRecordDetails(r.id);
        }
      });
      return li;
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
    constructor(sm, um, vm, lm) {
      this.storageManager = sm;
      this.uiManager = um;
      this.vehicleManager = vm;
      this.langManager = lm;
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
      document.addEventListener("languageChanged", () =>
        this.debouncedUpdate()
      );
      document.addEventListener("vehicleTypeChanged", () =>
        this.debouncedUpdate()
      );
      document.addEventListener("tripCalculated", () => this.debouncedUpdate());
      document.addEventListener("historyCleared", () => this.debouncedUpdate());
      document.addEventListener("allDataCleared", () => this.debouncedUpdate());
    }
    updateStatistics() {
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
      this._renderOrUpdateChart(fh);
    }
    _calculateAndDisplaySummary(hd) {
      const tk = hd.reduce((s, i) => s + parseFloat(i.distancia), 0);
      const tg = hd.reduce(
        (s, i) => s + parseFloat(i.custoTotalCombustivel),
        0
      );
      const tl = hd.reduce((s, i) => s + parseFloat(i.litrosConsumidos), 0);
      const mc = tl > 0 ? tk / tl : 0;
      if (this.dom.totalKmStat)
        this.dom.totalKmStat.textContent = `${tk.toFixed(1)} km`;
      if (this.dom.totalGastoStat)
        this.dom.totalGastoStat.textContent = Utils.formatCurrency(
          tg,
          this.langManager.currentLanguage
        );
      if (this.dom.mediaConsumoStat)
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
      const tc =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--uber-text-primary")
          .trim() || "#e0e0e0";
      const gc =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--uber-gray-light")
          .trim() || "#444444";
      const ug =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--uber-green")
          .trim() || "#00c165";
      const ugt = "rgba(0, 193, 101, 0.2)";
      const cc = {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: cl,
              data: data,
              borderColor: ug,
              backgroundColor: ugt,
              tension: 0.3,
              fill: true,
              pointBackgroundColor: ug,
              pointBorderColor: "#fff",
              pointRadius: 4,
              pointHoverRadius: 7,
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: ug,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              ticks: { color: tc, font: { size: 10 } },
              grid: { color: gc, drawBorder: false },
            },
            y: {
              ticks: {
                color: tc,
                callback: (v) =>
                  Utils.formatCurrency(v, this.langManager.currentLanguage),
                font: { size: 10 },
              },
              grid: { color: gc, drawBorder: false },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: { labels: { color: tc, font: { size: 12 } } },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.85)",
              titleColor: ug,
              bodyColor: tc,
              borderColor: ug,
              borderWidth: 1,
              padding: 10,
              cornerRadius: 4,
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
        this.chartInstance.data.labels = labels;
        this.chartInstance.data.datasets[0].data = data;
        this.chartInstance.data.datasets[0].label = cl;
        this.chartInstance.options.scales.y.ticks.callback = (v) =>
          Utils.formatCurrency(v, this.langManager.currentLanguage);
        this.chartInstance.options.plugins.tooltip.callbacks.label = (c) =>
          `${c.dataset.label || ""}: ${Utils.formatCurrency(
            c.parsed.y,
            this.langManager.currentLanguage
          )}`;
        this.chartInstance.update();
      } else {
        try {
          this.chartInstance = new Chart(
            this.dom.chartCanvas.getContext("2d"),
            cc
          );
        } catch (e) {
          console.error("Erro Chart:", e);
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
    constructor() {
      this.storageManager = new StorageManager();
      this.languageManager = new LanguageManager(this.storageManager);
      this.uiManager = new UIManager(this.languageManager);
      this.storageManager.uiManager = this.uiManager;
      this.validator = new Validator(this.uiManager, this.languageManager);
      this.inputFormatter = new InputFormatter();
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
      this.inputFormatter.initialize();
      if (this._isDesktop()) {
        this._setupDesktopNotice();
      } else {
        if (this.dom.appContainer)
          this.dom.appContainer.classList.remove("app-content-hidden");
        if (this.dom.desktopNoticeOverlay)
          this.dom.desktopNoticeOverlay.style.display = "none";
        this._registerServiceWorker();
        this._bindGlobalAppEvents();
      }
      this._hideSplashScreen();
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
            size: 200,
            level: "H",
            background: null,
            foreground: "black",
            padding: 0,
          });
        } else {
          console.warn("Canvas ou QRious não encontrado.");
          if (this.dom.qrCodeCanvas)
            this.dom.qrCodeCanvas.style.display = "none";
        }
      }
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
            .then((reg) => console.log("SW FuelCalc OK. Escopo:", reg.scope))
            .catch((err) => console.error("Falha SW FuelCalc:", err));
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
        this.languageManager.setLanguage(CONFIG.DEFAULT_LANGUAGE);
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
                /* s.remove(); */
              }
            },
            { once: true }
          );
        }, 50);
      }
    }
  }

  // Inicia a aplicação.
  try {
    new AppManager();
  } catch (e) {
    console.error("Erro fatal ao inicializar a aplicação:", e);
    // Exibe uma mensagem de erro na tela de splash se a aplicação falhar em carregar.
    const splash = document.getElementById("splash-screen");
    if (splash) {
      splash.innerHTML = `<div style="padding: 2rem; color: #ffcdd2;"><h1>Erro Crítico</h1><p>A aplicação não pôde ser iniciada. Por favor, tente recarregar a página ou limpar o cache do navegador.</p><p style="font-size: 0.8rem; margin-top: 1rem;">Erro: ${e.message}</p></div>`;
    }
  }
});
