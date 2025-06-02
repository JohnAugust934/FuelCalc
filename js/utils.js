// js/utils.js
// Contém funções utilitárias estáticas usadas em várias partes da aplicação.

// Importa configurações se necessário (ex: para formatCurrency usar o idioma padrão)
import { CONFIG } from "./config.js";

export class Utils {
  /**
   * Sanitiza uma string para prevenir XSS básico, convertendo caracteres HTML especiais
   * em suas entidades correspondentes.
   * @param {string} str - A string a ser sanitizada.
   * @returns {string} A string sanitizada, ou uma string vazia se a entrada não for uma string.
   */
  static sanitizeHTML(str) {
    if (typeof str !== "string") return "";
    const temp = document.createElement("div");
    temp.textContent = str; // textContent atribui o texto literalmente, escapando HTML.
    return temp.innerHTML; // innerHTML então retorna a string com os caracteres escapados.
  }

  /**
   * Valida se um valor é um número e se está dentro de um intervalo (opcional).
   * @param {any} value - O valor a ser validado.
   * @param {number} [min=-Infinity] - O valor mínimo permitido (inclusivo).
   * @param {number} [max=Infinity] - O valor máximo permitido (inclusivo).
   * @returns {boolean} Retorna true se o valor for um número válido dentro do intervalo, false caso contrário.
   */
  static validateNumber(value, min = -Infinity, max = Infinity) {
    const num = parseFloat(value); // Tenta converter o valor para um número de ponto flutuante.
    return !isNaN(num) && num >= min && num <= max; // Verifica se é um número (NaN) e se está no intervalo.
  }

  /**
   * Converte vírgulas em pontos em uma string numérica, para facilitar o parseFloat.
   * @param {string|number} value - O valor a ser convertido (geralmente uma string de um input).
   * @returns {string|number} A string com vírgulas substituídas por pontos, ou o valor original se não for string.
   */
  static convertCommaToPoint(value) {
    return typeof value === "string" ? value.replace(/,/g, ".") : value;
  }

  /**
   * Função Debounce: Adia a execução de uma função até que um certo tempo tenha passado
   * sem que ela seja chamada novamente. Útil para otimizar eventos frequentes como digitação ou redimensionamento.
   * @param {Function} func - A função a ser "debounced".
   * @param {number} wait - O tempo de espera em milissegundos.
   * @returns {Function} A nova função "debounced" que pode ser chamada.
   */
  static debounce(func, wait) {
    let timeout; // Armazena o identificador do timeout.

    return function executedFunction(...args) {
      // Função que será realmente executada após o tempo de espera.
      const later = () => {
        clearTimeout(timeout); // Limpa o timeout anterior.
        func.apply(this, args); // Executa a função original com o contexto e argumentos corretos.
      };
      clearTimeout(timeout); // Cancela qualquer timeout pendente.
      timeout = setTimeout(later, wait); // Define um novo timeout.
    };
  }

  /**
   * Formata um número como moeda, de acordo com o idioma especificado.
   * @param {number|string} value - O valor numérico a ser formatado.
   * @param {string} [lang=CONFIG.DEFAULT_LANGUAGE] - O código do idioma (ex: 'pt-BR', 'en-US') para formatação.
   * @returns {string} O valor formatado como moeda (ex: "R$ 1.234,56" ou "$1,234.56").
   * Retorna um placeholder se o valor for inválido.
   */
  static formatCurrency(value, lang = CONFIG.DEFAULT_LANGUAGE) {
    const parsedValue = parseFloat(
      String(value)
        .replace(/[^\d,.-]/g, "")
        .replace(",", ".")
    ); // Limpa e parseia o valor
    if (isNaN(parsedValue)) {
      return lang === "en" ? "$ --" : "R$ --";
    }
    const currency = lang === "en" ? "USD" : "BRL";
    const locale = lang === "en" ? "en-US" : "pt-BR";
    try {
      return parsedValue.toLocaleString(locale, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } catch (e) {
      console.error("Erro ao formatar moeda:", e);
      return lang === "en" ? "$ 0.00" : "R$ 0,00"; // Fallback em caso de erro
    }
  }

  /**
   * Formata uma string de data ISO (ou um objeto Date) para um formato de data e hora local.
   * @param {string|Date} isoDateString - A data em formato ISO string ou um objeto Date.
   * @param {string} [lang=CONFIG.DEFAULT_LANGUAGE] - O código do idioma para formatação.
   * @returns {string} A data e hora formatadas (ex: "dd/mm/aaaa, HH:MM"), ou "--" se a entrada for inválida.
   */
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
      console.error("Erro ao formatar data local:", e);
      return "--"; // Fallback em caso de erro de data inválida
    }
  }
}
