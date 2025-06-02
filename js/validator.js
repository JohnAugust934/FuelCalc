// js/managers/Validator.js
// Responsável por validar os dados de entrada da aplicação.

// Importa as configurações globais (para aceder às regras de validação) e utilitários.
import { CONFIG } from "./config.js";
import { Utils } from "./utils.js";
// LanguageManager e UIManager são injetados através do construtor.

export class Validator {
  /**
   * Construtor da classe Validator.
   * @param {UIManager} uiManager - Instância do gestor da UI para exibir notificações de erro.
   * @param {LanguageManager} languageManager - Instância do gestor de idioma para traduzir mensagens de erro.
   */
  constructor(uiManager, languageManager) {
    this.uiManager = uiManager;
    this.langManager = languageManager;
  }

  /**
   * Valida os dados de um veículo (nome, eficiência, tipo).
   * Exibe notificações de erro através do UIManager se a validação falhar.
   * @param {string} nome - O nome do veículo.
   * @param {number|string} eficiencia - A eficiência do veículo (pode ser string vinda do input).
   * @param {string} tipo - O tipo do veículo ('carro' ou 'moto').
   * @returns {{isValid: boolean, errors: string[], data: object|null}}
   * Um objeto contendo:
   * - `isValid`: `true` se os dados forem válidos, `false` caso contrário.
   * - `errors`: Um array de strings com as mensagens de erro (já traduzidas).
   * - `data`: Um objeto com os dados validados e parseados (nome trimado, eficiência como número) se `isValid` for `true`, senão `null`.
   */
  validateVehicle(nome, eficiencia, tipo) {
    const errors = [];
    // Converte a eficiência para número, tratando vírgulas.
    const parsedEficiencia = parseFloat(
      Utils.convertCommaToPoint(String(eficiencia))
    );
    // Remove espaços em branco do início e fim do nome.
    const trimmedNome = String(nome).trim();

    // Valida o comprimento do nome do veículo.
    if (
      trimmedNome.length < CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH ||
      trimmedNome.length > CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH
    ) {
      errors.push(
        this.langManager.get("vehicleNameLengthError", {
          min: CONFIG.VALIDATION.MIN_VEHICLE_NAME_LENGTH,
          max: CONFIG.VALIDATION.MAX_VEHICLE_NAME_LENGTH,
        })
      );
    }

    // Valida a eficiência do veículo.
    if (
      !Utils.validateNumber(
        parsedEficiencia,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    ) {
      errors.push(
        this.langManager.get("vehicleEfficiencyError", {
          min: CONFIG.VALIDATION.MIN_EFFICIENCY,
          max: CONFIG.VALIDATION.MAX_EFFICIENCY,
        })
      );
    }

    // Valida o tipo do veículo.
    if (!["carro", "moto"].includes(tipo)) {
      errors.push(this.langManager.get("invalidVehicleTypeError"));
    }

    const isValid = errors.length === 0;
    // Se houver erros, mostra uma notificação concatenando todas as mensagens de erro.
    if (!isValid && this.uiManager) {
      this.uiManager.showNotification(errors.join("\n"), "error");
    }

    return {
      isValid,
      errors,
      data: isValid
        ? { nome: trimmedNome, eficiencia: parsedEficiencia, tipo }
        : null,
    };
  }

  /**
   * Valida os dados de uma viagem (KM inicial/final, eficiência, preço do combustível, ganho opcional).
   * Exibe notificações de erro através do UIManager se a validação falhar.
   * @param {string|number} kmInicial - Quilometragem inicial.
   * @param {string|number} kmFinal - Quilometragem final.
   * @param {string|number} kmPorLitro - Eficiência do veículo para esta viagem.
   * @param {string|number} precoCombustivel - Preço do combustível por unidade.
   * @param {string|number|null} ganhoUber - Ganho bruto da viagem (opcional).
   * @returns {{isValid: boolean, errors: string[], data: object|null}}
   * Um objeto contendo:
   * - `isValid`: `true` se os dados forem válidos, `false` caso contrário.
   * - `errors`: Um array de strings com as mensagens de erro (já traduzidas).
   * - `data`: Um objeto com os dados validados e parseados se `isValid` for `true`, senão `null`.
   */
  validateTrip(kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber) {
    const errors = [];
    const data = {}; // Objeto para armazenar os valores numéricos parseados.

    // Valida KM Inicial.
    data.kmInicial = parseFloat(Utils.convertCommaToPoint(String(kmInicial)));
    if (
      !Utils.validateNumber(
        data.kmInicial,
        CONFIG.VALIDATION.MIN_KM,
        CONFIG.VALIDATION.MAX_KM
      )
    ) {
      errors.push(
        this.langManager.get("initialKmError", {
          min: CONFIG.VALIDATION.MIN_KM,
          max: CONFIG.VALIDATION.MAX_KM,
        })
      );
    }

    // Valida KM Final (deve ser maior que KM Inicial).
    data.kmFinal = parseFloat(Utils.convertCommaToPoint(String(kmFinal)));
    if (
      !Utils.validateNumber(
        data.kmFinal,
        data.kmInicial + 0.01,
        CONFIG.VALIDATION.MAX_KM
      )
    ) {
      errors.push(
        this.langManager.get("finalKmError", {
          max: CONFIG.VALIDATION.MAX_KM,
        })
      );
    } else if (
      data.kmFinal - data.kmInicial >
      CONFIG.VALIDATION.MAX_TRIP_DISTANCE
    ) {
      // Valida a distância máxima da viagem.
      errors.push(
        this.langManager.get("maxTripDistanceError", {
          limit: CONFIG.VALIDATION.MAX_TRIP_DISTANCE,
        })
      );
    }

    // Valida Eficiência (km/L).
    data.kmPorLitro = parseFloat(Utils.convertCommaToPoint(String(kmPorLitro)));
    if (
      !Utils.validateNumber(
        data.kmPorLitro,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    ) {
      errors.push(
        this.langManager.get("vehicleEfficiencyError", {
          // Reutiliza a chave de erro de eficiência do veículo
          min: CONFIG.VALIDATION.MIN_EFFICIENCY,
          max: CONFIG.VALIDATION.MAX_EFFICIENCY,
        })
      );
    }

    // Valida Preço do Combustível.
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
        this.langManager.get("fuelPriceError", {
          min: CONFIG.VALIDATION.MIN_PRICE.toFixed(2), // Formata para exibição
          max: CONFIG.VALIDATION.MAX_PRICE.toFixed(2),
        })
      );
    }

    // Valida Ganho da Viagem (se informado).
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
          this.langManager.get("tripGainError", {
            max: CONFIG.VALIDATION.MAX_UBER_GAIN.toFixed(2),
          })
        );
      }
    } else {
      data.ganhoUber = null; // Trata como não informado se vazio ou nulo.
    }

    const isValid = errors.length === 0;
    if (!isValid && this.uiManager) {
      this.uiManager.showNotification(errors.join("\n"), "error");
    }

    return {
      isValid,
      errors,
      data: isValid ? data : null,
    };
  }
}
