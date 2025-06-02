// js/managers/StatisticsManager.js
// Responsável por calcular, exibir estatísticas resumidas e renderizar o gráfico de gastos.

// Importa configurações globais e utilitários.
import { CONFIG } from "../config.js";
import { Utils } from "../utils.js";
// StorageManager, UIManager, VehicleManager, e LanguageManager são injetados via construtor.
// Chart.js é esperado estar globalmente disponível (carregado via <script> no HTML).

export class StatisticsManager {
  /**
   * Construtor da classe StatisticsManager.
   * @param {StorageManager} storageManager - Instância do gestor de armazenamento.
   * @param {UIManager} uiManager - Instância do gestor da UI (para notificações, se necessário).
   * @param {VehicleManager} vehicleManager - Instância do gestor de veículos.
   * @param {LanguageManager} languageManager - Instância do gestor de idioma.
   */
  constructor(storageManager, uiManager, vehicleManager, languageManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.vehicleManager = vehicleManager; // Para filtrar estatísticas pelo tipo de veículo atual.
    this.langManager = languageManager; // Para traduzir textos e formatar números/moedas.

    this.chartInstance = null; // Armazena a instância do Chart.js.
    // Função "debounced" para atualizar as estatísticas, evitando chamadas excessivas.
    this.debouncedUpdate = Utils.debounce(
      () => this.updateStatistics(),
      CONFIG.DEBOUNCE_DELAY
    );

    // Cache de elementos do DOM relevantes para as estatísticas.
    this.dom = {
      statsSection: document.getElementById("statsSection"),
      totalKmStat: document.getElementById("totalKmStat"),
      totalGastoStat: document.getElementById("totalGastoStat"),
      mediaConsumoStat: document.getElementById("mediaConsumoStat"),
      chartCanvas: document.getElementById("fuelChartCanvas"),
    };

    this._bindEvents(); // Vincula os listeners de evento.
  }

  /**
   * Vincula listeners a eventos globais da aplicação que requerem a atualização das estatísticas.
   * @private
   */
  _bindEvents() {
    // Ouve eventos que indicam a necessidade de re-renderizar as estatísticas:
    document.addEventListener("languageChanged", () => this.debouncedUpdate());
    document.addEventListener("vehicleTypeChanged", () =>
      this.debouncedUpdate()
    );
    document.addEventListener("tripCalculated", () => this.debouncedUpdate());
    document.addEventListener("historyCleared", () => this.debouncedUpdate());
    document.addEventListener("allDataCleared", () => this.debouncedUpdate());
  }

  /**
   * Atualiza e renderiza as estatísticas resumidas e o gráfico.
   * Esta é a função principal chamada para atualizar a seção de estatísticas.
   */
  updateStatistics() {
    if (!this.dom.statsSection) return; // Sai se a seção de estatísticas não existir no DOM.

    // Carrega todos os registos de histórico.
    const allHistory = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    // Filtra o histórico para o tipo de veículo atualmente selecionado.
    const filteredHistory = allHistory.filter(
      (item) => item.tipoVeiculo === this.vehicleManager.currentVehicleType
    );

    // Se não houver histórico para o tipo de veículo atual, esconde a seção de estatísticas
    // e destrói qualquer instância de gráfico existente.
    if (filteredHistory.length === 0) {
      this.dom.statsSection.style.display = "none";
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
      return;
    }

    // Torna a seção de estatísticas visível e atualiza os dados.
    this.dom.statsSection.style.display = "block";
    this._calculateAndDisplaySummary(filteredHistory);
    this._renderOrUpdateChart(filteredHistory);
  }

  /**
   * Calcula as estatísticas resumidas (total KM, total gasto, média de consumo)
   * e exibe-as nos elementos correspondentes da UI.
   * @param {Array<object>} historyData - Array de registos de histórico já filtrados.
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

    // Atualiza os elementos do DOM com os valores calculados e formatados.
    if (this.dom.totalKmStat)
      this.dom.totalKmStat.textContent = `${totalKm.toFixed(1)} km`;
    if (this.dom.totalGastoStat)
      this.dom.totalGastoStat.textContent = Utils.formatCurrency(
        totalGasto,
        this.langManager.currentLanguage
      );
    if (this.dom.mediaConsumoStat)
      this.dom.mediaConsumoStat.textContent = `${mediaConsumo.toFixed(1)} km/L`; // Unidade km/L é comum
  }

  /**
   * Prepara os dados para o gráfico de gastos diários.
   * Agrupa os custos por dia e considera apenas os últimos dias definidos em CONFIG.CHART_MAX_DAYS.
   * @param {Array<object>} historyData - Array de registos de histórico já filtrados.
   * @returns {{labels: string[], data: string[]}} Um objeto com arrays de labels (datas) e data (custos).
   * @private
   */
  _prepareChartData(historyData) {
    const dailyCosts = {}; // Objeto para armazenar custos agrupados por dia.
    const cutOffDate = new Date();
    cutOffDate.setDate(cutOffDate.getDate() - CONFIG.CHART_MAX_DAYS); // Data limite para os dados do gráfico.

    historyData.forEach((item) => {
      const itemDate = new Date(item.dataISO);
      // Inclui apenas registos dentro do período definido.
      if (itemDate >= cutOffDate) {
        // Cria uma chave de data formatada para o idioma atual (ex: "dd/mm").
        const dateKey = itemDate.toLocaleDateString(
          this.langManager.currentLanguage,
          { day: "2-digit", month: "2-digit" }
        );
        dailyCosts[dateKey] =
          (dailyCosts[dateKey] || 0) + parseFloat(item.custoTotalCombustivel);
      }
    });

    // Ordena as datas para exibição correta no eixo X do gráfico.
    const sortedDates = Object.keys(dailyCosts).sort((a, b) => {
      // Converte as strings de data (dd/mm) para objetos Date para ordenação correta.
      // Assume o ano atual para a ordenação, pois o gráfico geralmente mostra dados recentes.
      const [dayA, monthA] = a.split("/");
      const [dayB, monthB] = b.split("/");
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
      labels: sortedDates, // Datas formatadas para o eixo X.
      data: sortedDates.map((date) => dailyCosts[date].toFixed(2)), // Custos formatados para o eixo Y.
    };
  }

  /**
   * Renderiza um novo gráfico de estatísticas ou atualiza um existente com novos dados.
   * @param {Array<object>} historyData - Array de registos de histórico já filtrados.
   * @private
   */
  _renderOrUpdateChart(historyData) {
    // Sai se o elemento canvas do gráfico não existir ou se a biblioteca Chart.js não estiver carregada.
    if (!this.dom.chartCanvas || typeof Chart === "undefined") {
      // console.warn("Chart.js não carregado ou canvas não encontrado para estatísticas.");
      return;
    }

    const { labels, data } = this._prepareChartData(historyData); // Prepara os dados para o gráfico.
    // Traduz o nome do tipo de veículo para a legenda do gráfico.
    const vehicleTypeTranslated = this.langManager.get(
      this.vehicleManager.currentVehicleType === "carro"
        ? "vehicleTypeCar"
        : "vehicleTypeMotorcycle"
    );
    const chartLabel = this.langManager.get("chartDailyExpenseLabel", {
      type: vehicleTypeTranslated,
    });

    // Define as cores para o tema escuro, alinhadas com as variáveis CSS.
    const textColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--uber-text-primary")
        .trim() || "#e0e0e0";
    const gridColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--uber-gray-light")
        .trim() || "#444444";
    const uberGreen =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--uber-green")
        .trim() || "#00c165";
    const uberGreenTransparent = "rgba(0, 193, 101, 0.2)"; // Cor de preenchimento da área do gráfico.

    // Configuração do objeto Chart.js.
    const chartConfig = {
      type: "line", // Tipo de gráfico.
      data: {
        labels: labels, // Labels do eixo X (datas).
        datasets: [
          {
            label: chartLabel, // Legenda do dataset.
            data: data, // Dados do eixo Y (custos).
            borderColor: uberGreen,
            backgroundColor: uberGreenTransparent,
            tension: 0.3, // Suaviza a linha do gráfico.
            fill: true, // Preenche a área abaixo da linha.
            pointBackgroundColor: uberGreen,
            pointBorderColor: "#fff", // Cor da borda dos pontos.
            pointRadius: 4,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: uberGreen,
            borderWidth: 2, // Espessura da linha.
          },
        ],
      },
      options: {
        responsive: true, // Torna o gráfico responsivo.
        maintainAspectRatio: false, // Permite que o gráfico não mantenha a proporção ao redimensionar.
        scales: {
          x: {
            ticks: { color: textColor, font: { size: 10 } }, // Cor e tamanho da fonte dos ticks do eixo X.
            grid: { color: gridColor, drawBorder: false }, // Cor das linhas de grade do eixo X e remove a borda do eixo.
          },
          y: {
            ticks: {
              color: textColor,
              // Formata os ticks do eixo Y como moeda usando o idioma atual.
              callback: (value) =>
                Utils.formatCurrency(value, this.langManager.currentLanguage),
              font: { size: 10 },
            },
            grid: { color: gridColor, drawBorder: false },
            beginAtZero: true, // Garante que o eixo Y comece em zero.
          },
        },
        plugins: {
          legend: {
            // Configurações da legenda.
            labels: { color: textColor, font: { size: 12 } },
          },
          tooltip: {
            // Configurações das tooltips (dicas ao passar o mouse).
            backgroundColor: "rgba(0,0,0,0.85)", // Fundo escuro para tooltip.
            titleColor: uberGreen,
            bodyColor: textColor,
            borderColor: uberGreen,
            borderWidth: 1,
            padding: 10,
            cornerRadius: 4,
            callbacks: {
              // Formata o label da tooltip para exibir a moeda corretamente.
              label: (context) => {
                let label = context.dataset.label || "";
                if (label) label += ": ";
                if (context.parsed.y !== null) {
                  label += Utils.formatCurrency(
                    context.parsed.y,
                    this.langManager.currentLanguage
                  );
                }
                return label;
              },
            },
          },
        },
        animation: {
          // Configurações de animação do gráfico.
          duration: 800,
          easing: "easeInOutQuart",
        },
      },
    };

    // Se já existe uma instância do gráfico, atualiza os seus dados e opções.
    if (this.chartInstance) {
      this.chartInstance.data.labels = labels;
      this.chartInstance.data.datasets[0].data = data;
      this.chartInstance.data.datasets[0].label = chartLabel; // Atualiza a legenda com o idioma correto.
      // Atualiza os callbacks de formatação de moeda para o idioma atual.
      this.chartInstance.options.scales.y.ticks.callback = (value) =>
        Utils.formatCurrency(value, this.langManager.currentLanguage);
      this.chartInstance.options.plugins.tooltip.callbacks.label = (
        context
      ) => {
        let label = context.dataset.label || "";
        if (label) label += ": ";
        if (context.parsed.y !== null)
          label += Utils.formatCurrency(
            context.parsed.y,
            this.langManager.currentLanguage
          );
        return label;
      };
      this.chartInstance.update(); // Re-renderiza o gráfico com as atualizações.
    } else {
      // Se não houver instância, cria uma nova.
      try {
        const ctx = this.dom.chartCanvas.getContext("2d");
        this.chartInstance = new Chart(ctx, chartConfig);
      } catch (error) {
        console.error(
          "Erro ao criar/atualizar gráfico de estatísticas:",
          error
        );
        this.uiManager.showNotification("genericError", "error"); // Exibe notificação de erro genérico.
        this.chartInstance = null; // Define como nulo para evitar tentativas futuras de atualização num gráfico falhado.
      }
    }
  }

  /**
   * Reseta o estado do gestor de estatísticas.
   * Usado, por exemplo, após limpar todos os dados da aplicação.
   * Chama `updateStatistics` que irá esconder a seção se não houver dados.
   */
  resetState() {
    this.updateStatistics();
  }
}
