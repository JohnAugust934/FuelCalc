// js/managers/FuelCalculator.js
// Responsável por calcular os gastos de combustível de uma viagem,
// interagir com o formulário de cálculo e exibir os resultados.

// Importa configurações globais e utilitários.
import { CONFIG } from "../config.js";
import { Utils } from "../utils.js";
// StorageManager, UIManager, Validator, VehicleManager, e LanguageManager são injetados via construtor.

export class FuelCalculator {
  /**
   * Construtor da classe FuelCalculator.
   * @param {StorageManager} storageManager - Instância do gestor de armazenamento.
   * @param {UIManager} uiManager - Instância do gestor da UI.
   * @param {Validator} validator - Instância do validador de dados.
   * @param {VehicleManager} vehicleManager - Instância do gestor de veículos.
   * @param {LanguageManager} languageManager - Instância do gestor de idioma.
   */
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
    this.vehicleManager = vehicleManager; // Para obter o tipo e ID do veículo atual.
    this.langManager = languageManager; // Para traduzir textos e formatar moeda.

    // Cache de elementos do DOM relevantes para o cálculo de combustível.
    this.dom = {
      form: document.getElementById("fuelForm"),
      kmInicialInput: document.getElementById("kmInicial"),
      kmFinalInput: document.getElementById("kmFinal"),
      kmPorLitroInput: document.getElementById("kmPorLitro"), // Eficiência no formulário principal.
      precoCombustivelInput: document.getElementById("precoCombustivel"),
      ganhoUberInput: document.getElementById("ganhoUber"),
      // Elementos do card de resultado.
      resultCard: document.getElementById("resultCard"),
      distanciaResult: document.getElementById("distanciaResult"),
      litrosResult: document.getElementById("litrosResult"),
      custoResult: document.getElementById("custoResult"),
      lucroResult: document.getElementById("lucroResult"),
    };

    this._bindEvents(); // Vincula os eventos aos elementos do DOM.
    // Ouve o evento de mudança de idioma para atualizar a formatação da moeda no card de resultado, se visível.
    document.addEventListener("languageChanged", () =>
      this._updateResultCardCurrency()
    );
  }

  /**
   * Atualiza a formatação da moeda no card de resultado quando o idioma muda.
   * Esta função tenta reformatar os valores numéricos já exibidos.
   * @private
   */
  _updateResultCardCurrency() {
    // Verifica se o card de resultado está visível.
    if (this.dom.resultCard && this.dom.resultCard.style.display === "block") {
      // Tenta reformatar o custo total.
      if (
        this.dom.custoResult.textContent !==
          this.langManager.get("currencyPlaceholder") &&
        this.dom.custoResult.textContent !==
          this.langManager.get("currencyPlaceholder", {}, "en")
      ) {
        // Compara com placeholders de ambos os idiomas
        // Extrai o valor numérico do texto, removendo símbolos de moeda e espaços, e tratando vírgula/ponto.
        const custoText = this.dom.custoResult.textContent
          .replace(/[R$\sA-Z]/gi, "")
          .replace(",", ".");
        if (!isNaN(parseFloat(custoText))) {
          this.dom.custoResult.textContent = Utils.formatCurrency(
            parseFloat(custoText),
            this.langManager.currentLanguage
          );
        }
      }
      // Tenta reformatar o lucro líquido.
      if (
        this.dom.lucroResult.textContent !==
          this.langManager.get("currencyPlaceholder") &&
        this.dom.lucroResult.textContent !==
          this.langManager.get("currencyPlaceholder", {}, "en") &&
        this.dom.lucroResult.textContent !== "N/A"
      ) {
        // Não tenta reformatar "N/A"
        const lucroText = this.dom.lucroResult.textContent
          .replace(/[R$\sA-Z]/gi, "")
          .replace(",", ".");
        if (!isNaN(parseFloat(lucroText))) {
          this.dom.lucroResult.textContent = Utils.formatCurrency(
            parseFloat(lucroText),
            this.langManager.currentLanguage
          );
        }
      }
    }
  }

  /**
   * Vincula os listeners de evento aos elementos do DOM (principalmente o submit do formulário).
   * @private
   */
  _bindEvents() {
    if (this.dom.form) {
      this.dom.form.addEventListener("submit", (e) => {
        e.preventDefault(); // Previne o comportamento padrão de submit do formulário.
        this.calculateAndDisplayTrip(); // Chama o método principal de cálculo.
      });
    }
  }

  /**
   * Orquestra o processo de cálculo: valida os inputs, calcula os gastos e lucros,
   * exibe os resultados na UI, guarda no histórico e limpa o formulário.
   */
  calculateAndDisplayTrip() {
    // Valida os dados inseridos no formulário de cálculo.
    const validationResult = this.validator.validateTrip(
      this.dom.kmInicialInput.value,
      this.dom.kmFinalInput.value,
      this.dom.kmPorLitroInput.value, // Eficiência pode vir de um veículo selecionado ou ser manual.
      this.dom.precoCombustivelInput.value,
      this.dom.ganhoUberInput.value
    );

    // Se a validação falhar, o validador já exibiu a notificação de erro.
    if (!validationResult.isValid) return;

    // Obtém os dados validados e parseados.
    const { kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber } =
      validationResult.data;

    // Realiza os cálculos.
    const distancia = kmFinal - kmInicial;
    const litrosConsumidos = distancia / kmPorLitro;
    const custoTotal = litrosConsumidos * precoCombustivel;
    const lucroLiquido = ganhoUber !== null ? ganhoUber - custoTotal : null;

    // Exibe os resultados calculados na UI.
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
      const lucroItemContainer = this.dom.lucroResult.closest(".result-item"); // Encontra o elemento pai '.result-item'.
      if (lucroLiquido !== null) {
        this.dom.lucroResult.textContent = Utils.formatCurrency(
          lucroLiquido,
          this.langManager.currentLanguage
        );
        if (lucroItemContainer) lucroItemContainer.style.display = ""; // Mostra o item do lucro.
      } else {
        this.dom.lucroResult.textContent = "N/A"; // Ou uma chave de tradução para "Não Aplicável".
        if (lucroItemContainer) lucroItemContainer.style.display = "none"; // Esconde o item do lucro se não houver ganho.
      }
    }
    if (this.dom.resultCard) this.dom.resultCard.style.display = "block"; // Torna o card de resultado visível.

    // Guarda os dados da viagem no histórico.
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

    this._clearTripForm(); // Limpa os campos do formulário após o cálculo.

    // Dispara um evento personalizado para notificar outros módulos (ex: Histórico, Estatísticas)
    // que uma nova viagem foi calculada e os seus dados precisam ser atualizados.
    document.dispatchEvent(new CustomEvent("tripCalculated"));
  }

  /**
   * Guarda os dados da viagem calculada no localStorage através do StorageManager.
   * @param {object} tripData - Objeto contendo todos os dados relevantes da viagem.
   * @private
   */
  _saveTripToHistory(tripData) {
    const history = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.HISTORY,
      []
    );
    const currentVehicle = this.vehicleManager.currentVehicle; // Obtém o veículo selecionado (se houver).

    // Cria um novo registo de histórico.
    const newRecord = {
      id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, // ID único para o registo.
      dataISO: new Date().toISOString(), // Data e hora da criação do registo em formato ISO.
      tipoVeiculo: this.vehicleManager.currentVehicleType, // Tipo de veículo usado (carro/moto).
      veiculoId: currentVehicle ? currentVehicle.id : null, // ID do veículo, se selecionado.
      veiculoNome: currentVehicle
        ? currentVehicle.nome
        : this.langManager.get("manualOrUnspecified"), // Nome do veículo ou "Manual/Não especificado".
      kmInicial: tripData.kmInicial,
      kmFinal: tripData.kmFinal,
      distancia: tripData.distancia.toFixed(1),
      kmPorLitroUtilizado: tripData.kmPorLitro, // Eficiência que foi usada neste cálculo específico.
      litrosConsumidos: tripData.litrosConsumidos.toFixed(1),
      precoPorLitro: tripData.precoCombustivel, // Preço do combustível no momento do cálculo.
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

    history.unshift(newRecord); // Adiciona o novo registo no início do array (mais recente primeiro).
    // Se o histórico exceder o limite definido, remove o registo mais antigo.
    if (history.length > CONFIG.HISTORY_LIMIT) {
      history.pop();
    }
    this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, history); // Guarda o histórico atualizado.
  }

  /**
   * Limpa os campos do formulário de cálculo de viagem.
   * Não limpa o campo de eficiência se um veículo estiver selecionado.
   * @private
   */
  _clearTripForm() {
    if (this.dom.form) {
      this.dom.kmInicialInput.value = "";
      this.dom.kmFinalInput.value = "";
      // Só limpa kmPorLitro se nenhum veículo estiver selecionado,
      // caso contrário, mantém a eficiência do veículo selecionado.
      if (!this.vehicleManager.currentVehicle && this.dom.kmPorLitroInput) {
        this.dom.kmPorLitroInput.value = "";
      }
      this.dom.precoCombustivelInput.value = "";
      this.dom.ganhoUberInput.value = "";
      this.dom.kmInicialInput.focus(); // Coloca o foco no primeiro campo após limpar.
    }
  }

  /**
   * Reseta o estado da calculadora.
   * Usado, por exemplo, após limpar todos os dados da aplicação.
   * Limpa o formulário e esconde o card de resultado.
   */
  resetState() {
    this._clearTripForm(); // Limpa os campos do formulário.
    if (this.dom.resultCard) {
      this.dom.resultCard.style.display = "none"; // Esconde o card de resultado.
    }
    // Garante que o campo de eficiência seja limpo se não houver veículo selecionado.
    if (this.dom.kmPorLitroInput && !this.vehicleManager.currentVehicle) {
      this.dom.kmPorLitroInput.value = "";
      this.dom.kmPorLitroInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
    }
  }
}
