// js/managers/HistoryManager.js
// Responsável por gerir e exibir o histórico de viagens da aplicação.

// Importa configurações globais e utilitários.
import { CONFIG } from "../config.js";
import { Utils } from "../utils.js";
// StorageManager, UIManager, VehicleManager, e LanguageManager são injetados via construtor.

export class HistoryManager {
  /**
   * Construtor da classe HistoryManager.
   * @param {StorageManager} storageManager - Instância do gestor de armazenamento.
   * @param {UIManager} uiManager - Instância do gestor da UI.
   * @param {VehicleManager} vehicleManager - Instância do gestor de veículos para filtrar histórico por tipo.
   * @param {LanguageManager} languageManager - Instância do gestor de idioma para traduções.
   */
  constructor(storageManager, uiManager, vehicleManager, languageManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.vehicleManager = vehicleManager; // Para filtrar o histórico pelo tipo de veículo atual.
    this.langManager = languageManager; // Para traduzir textos e formatar datas/moedas.

    // Estado interno para controlar se o histórico completo está visível ou apenas um resumo.
    this.isFullHistoryVisible = false;

    // Cache de elementos do DOM relevantes para o histórico.
    this.dom = {
      historySection: document.getElementById("historySection"),
      historyList: document.getElementById("historyList"), // O <ul> onde os itens do histórico são renderizados.
      seeMoreBtn: document.getElementById("seeMoreHistoryBtn"),
      minimizeBtn: document.getElementById("minimizeHistoryBtn"),
      clearHistoryBtn: document.getElementById("clearHistoryBtn"),
    };

    this._bindEvents(); // Vincula os eventos aos elementos do DOM.
  }

  /**
   * Vincula os listeners de evento aos botões de controlo do histórico e
   * ouve eventos globais da aplicação que requerem a atualização do histórico.
   * @private
   */
  _bindEvents() {
    // Listeners para os botões "Ver Mais" e "Minimizar".
    if (this.dom.seeMoreBtn) {
      this.dom.seeMoreBtn.addEventListener("click", () =>
        this.toggleFullHistory(true)
      );
    }
    if (this.dom.minimizeBtn) {
      this.dom.minimizeBtn.addEventListener("click", () =>
        this.toggleFullHistory(false)
      );
    }
    // Listener para o botão "Limpar Histórico".
    if (this.dom.clearHistoryBtn) {
      this.dom.clearHistoryBtn.addEventListener("click", async () => {
        // Pede confirmação ao utilizador antes de limpar.
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

    // Ouve eventos que indicam a necessidade de re-renderizar o histórico:
    // - Mudança de idioma (para traduzir textos e formatos).
    document.addEventListener("languageChanged", () => this.renderHistory());
    // - Mudança do tipo de veículo selecionado (para filtrar o histórico).
    document.addEventListener("vehicleTypeChanged", () => {
      this.isFullHistoryVisible = false; // Reseta a visualização para resumida ao mudar de tipo
      this.renderHistory();
    });
    // - Uma nova viagem foi calculada e adicionada ao histórico.
    document.addEventListener("tripCalculated", () => this.renderHistory());
    // - Todos os dados da aplicação foram limpos.
    document.addEventListener("allDataCleared", () => this.renderHistory());
  }

  /**
   * Alterna a visualização do histórico entre completo e resumido.
   * @param {boolean} showFull - `true` para mostrar o histórico completo, `false` para o resumido.
   */
  toggleFullHistory(showFull) {
    this.isFullHistoryVisible = showFull;
    this.renderHistory(); // Re-renderiza o histórico com a nova configuração de visualização.
  }

  /**
   * Renderiza a lista de histórico na interface do utilizador.
   * Filtra o histórico pelo tipo de veículo atual e controla a paginação (ver mais/minimizar).
   */
  renderHistory() {
    // Sai se os elementos do DOM necessários não estiverem presentes.
    if (!this.dom.historyList || !this.dom.historySection) return;

    // Carrega todos os registos de histórico do localStorage.
    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    // Filtra os registos para mostrar apenas os do tipo de veículo atualmente selecionado.
    const filteredHistory = allHistory.filter(
      (item) => item.tipoVeiculo === this.vehicleManager.currentVehicleType
    );

    this.dom.historyList.innerHTML = ""; // Limpa a lista de histórico existente na UI.

    // Se não houver registos filtrados, esconde a seção de histórico.
    if (filteredHistory.length === 0) {
      this.dom.historySection.style.display = "none";
      return;
    }

    // Torna a seção de histórico visível.
    this.dom.historySection.style.display = "block";
    // Determina quais itens renderizar com base no estado de `isFullHistoryVisible`.
    const itemsToRender = this.isFullHistoryVisible
      ? filteredHistory
      : filteredHistory.slice(0, CONFIG.HISTORY_DISPLAY_COUNT);

    // Exibe uma mensagem se não houver itens para renderizar (mas existem no histórico completo)
    // ou se a lista filtrada estiver completamente vazia.
    const vehicleTypeTranslated = this.langManager.get(
      this.vehicleManager.currentVehicleType === "carro"
        ? "vehicleTypeCar"
        : "vehicleTypeMotorcycle"
    );
    if (itemsToRender.length === 0 && filteredHistory.length > 0) {
      this.dom.historyList.innerHTML = `<li class="empty-message-list">${this.langManager.get(
        "noRecordsToDisplay"
      )}</li>`;
    } else if (itemsToRender.length === 0) {
      // Implica filteredHistory.length também é 0
      this.dom.historyList.innerHTML = `<li class="empty-message-list">${this.langManager.get(
        "noHistoryForType",
        { type: vehicleTypeTranslated.toLowerCase() }
      )}</li>`;
    }

    // Cria e adiciona um elemento <li> para cada registo a ser renderizado.
    itemsToRender.forEach((record) => {
      this.dom.historyList.appendChild(this._createHistoryItemElement(record));
    });

    // Controla a visibilidade dos botões "Ver Mais" e "Minimizar".
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
   * Cria o elemento HTML (`<li>`) para um item individual do histórico.
   * @param {object} record - O objeto do registo de histórico.
   * @returns {HTMLElement} O elemento `<li>` criado.
   * @private
   */
  _createHistoryItemElement(record) {
    const li = document.createElement("li");
    li.setAttribute("role", "button"); // Indica que é um elemento interativo.
    li.setAttribute("tabindex", "0"); // Torna o elemento focável via teclado.
    // Formata a data do registo para o idioma atual.
    const formattedDate = Utils.formatLocalDate(
      record.dataISO,
      this.langManager.currentLanguage
    );
    // Define um aria-label traduzido para acessibilidade.
    li.setAttribute(
      "aria-label",
      this.langManager.get("tripDetailsAriaLabel", { date: formattedDate })
    );
    li.dataset.recordId = record.id; // Armazena o ID do registo no dataset para fácil acesso.

    const dateSpan = document.createElement("span");
    dateSpan.textContent = formattedDate; // Exibe a data formatada.

    const summaryStrong = document.createElement("strong"); // Para o resumo de custo/lucro.
    // Constrói o texto de resumo, traduzindo "Custo" e "Lucro".
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

    // Adiciona listener para mostrar detalhes ao clicar no item.
    li.addEventListener("click", () => this._showRecordDetails(record.id));
    // Adiciona listener para mostrar detalhes com as teclas Enter ou Espaço (acessibilidade).
    li.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._showRecordDetails(record.id);
      }
    });
    return li;
  }

  /**
   * Mostra os detalhes de um registo específico do histórico num modal.
   * @param {string} recordId - O ID do registo a ser detalhado.
   * @private
   */
  _showRecordDetails(recordId) {
    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const record = allHistory.find((item) => item.id === recordId); // Encontra o registo pelo ID.

    if (!record) {
      this.uiManager.showNotification("recordNotFound", "error"); // Notifica se o registo não for encontrado.
      return;
    }

    const currentLang = this.langManager.currentLanguage; // Obtém o idioma atual.
    // Prepara um array de objetos com as chaves de tradução para as labels e os valores formatados.
    const details = [
      {
        labelKey: "detailLabelDate",
        value: Utils.formatLocalDate(record.dataISO, currentLang),
      },
      { labelKey: "detailLabelVehicle", value: record.veiculoNome }, // Nome do veículo já está sanitizado ao guardar.
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
    // Adiciona informações de ganho e lucro se estiverem presentes no registo.
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
    // Chama o UIManager para exibir o modal de detalhes.
    this.uiManager.showDetailsModal("tripDetailsModalTitle", details);
  }

  /**
   * Limpa o histórico de viagens para o tipo de veículo atualmente selecionado.
   * Pede confirmação ao utilizador antes de realizar a ação.
   */
  clearHistoryForCurrentType() {
    const currentType = this.vehicleManager.currentVehicleType;
    let allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    // Filtra o histórico, mantendo apenas os registos que NÃO são do tipo de veículo atual.
    const remainingHistory = allHistory.filter(
      (item) => item.tipoVeiculo !== currentType
    );

    // Guarda o histórico atualizado.
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
      this.isFullHistoryVisible = false; // Reseta a visualização para resumida.
      this.renderHistory(); // Atualiza a UI do histórico.
      // Dispara um evento para notificar outros módulos (ex: Estatísticas) sobre a limpeza.
      document.dispatchEvent(
        new CustomEvent("historyCleared", { detail: { type: currentType } })
      );
    }
  }

  /**
   * Reseta o estado do gestor de histórico.
   * Usado, por exemplo, após limpar todos os dados da aplicação.
   * Define a visualização como resumida e re-renderiza o histórico (que estará vazio).
   */
  resetState() {
    this.isFullHistoryVisible = false;
    this.renderHistory(); // Isso irá limpar a lista na UI se não houver dados.
  }
}
