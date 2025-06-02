// js/managers/UIManager.js
// Responsável por gerir elementos da interface do utilizador, como modais e notificações.

// Utils será importado quando AppManager o instanciar e passar como dependência (se necessário).
// LanguageManager é passado no construtor.
import { CONFIG } from "../config.js"; // Para timeouts, etc.

export class UIManager {
  /**
   * Construtor da classe UIManager.
   * @param {LanguageManager} languageManager - Instância do gestor de idioma para traduções.
   */
  constructor(languageManager) {
    this.langManager = languageManager;

    // Cache de elementos do DOM para modais e notificações.
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

    this._resolveConfirm = null; // Armazena a função 'resolve' da promessa do modal de confirmação.
    this._bindModalEvents(); // Vincula eventos básicos para fechar modais.

    // Ouve o evento 'languageChanged' para re-traduzir elementos de modais que possam estar abertos.
    document.addEventListener("languageChanged", () =>
      this._retranslateOpenModals()
    );
  }

  /**
   * Re-traduz os títulos e botões de modais que possam estar abertos quando o idioma muda.
   * O conteúdo dinâmico dos modais (como detalhes de histórico) deve ser re-renderizado
   * pelos seus respetivos gestores que ouvem o 'languageChanged'.
   * @private
   */
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
      // O botão de fechar do modal de detalhes já usa data-translate-key-aria-label,
      // então será atualizado pelo LanguageManager.applyTranslationsToPage.
    }
    if (
      this.confirmModalOverlay &&
      this.confirmModalOverlay.classList.contains("active")
    ) {
      if (this.confirmModalTitle)
        this.confirmModalTitle.textContent = this.langManager.get(
          "confirmActionModalTitle"
        );
      // A mensagem do confirmModalMessage é definida dinamicamente ao mostrar o modal.
      if (this.confirmModalCancelBtn)
        this.confirmModalCancelBtn.textContent =
          this.langManager.get("cancelBtn");
      if (this.confirmModalConfirmBtn)
        this.confirmModalConfirmBtn.textContent =
          this.langManager.get("confirmBtn");
    }
  }

  /**
   * Vincula eventos de clique para fechar modais e para os botões de ação do modal de confirmação.
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
        // Fecha o modal apenas se o clique for no próprio overlay (fundo).
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
        if (e.target === this.confirmModalOverlay) this._handleConfirm(false); // Cancela se clicar fora.
      });
    }
  }

  /**
   * Mostra uma notificação "toast" na tela.
   * @param {string} messageKey - A chave da string de tradução para a mensagem.
   * @param {'success'|'error'|'info'} [type='info'] - O tipo de notificação (afeta o estilo).
   * @param {Object} [params={}] - Parâmetros para substituir placeholders na mensagem traduzida.
   */
  showNotification(messageKey, type = "info", params = {}) {
    if (!this.notificationArea) return;
    const message = this.langManager.get(messageKey, params); // Traduz a mensagem.

    const notification = document.createElement("div");
    notification.className = `notification ${type}`; // Aplica classe de tipo para estilização.
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "assertive"); // Para leitores de tela.

    const messageSpan = document.createElement("span");
    messageSpan.className = "notification-message";
    messageSpan.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;"; // Símbolo 'x' para fechar.
    closeBtn.className = "notification-close";
    closeBtn.setAttribute(
      "aria-label",
      this.langManager.get("closeModalAriaLabel")
    ); // Traduz o aria-label.
    closeBtn.addEventListener("click", () =>
      this._removeNotification(notification)
    );

    notification.appendChild(messageSpan);
    notification.appendChild(closeBtn);
    this.notificationArea.appendChild(notification);

    // Força um reflow para garantir que a animação de entrada seja aplicada.
    void notification.offsetWidth;
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";

    // Remove a notificação automaticamente após um tempo definido.
    setTimeout(
      () => this._removeNotification(notification),
      CONFIG.NOTIFICATION_TIMEOUT
    );
  }

  /**
   * Remove uma notificação do DOM com uma animação de saída.
   * @param {HTMLElement} notification - O elemento da notificação a ser removido.
   * @private
   */
  _removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)"; // Animação de saída.
      // Remove o elemento do DOM após a transição CSS.
      notification.addEventListener(
        "transitionend",
        () => {
          if (notification.parentNode)
            notification.parentNode.removeChild(notification);
        },
        { once: true }
      );
      // Fallback para remover o elemento caso a transição não dispare.
      setTimeout(() => {
        if (notification.parentNode)
          notification.parentNode.removeChild(notification);
      }, 350); // Deve ser um pouco maior que a duração da transição CSS.
    }
  }

  /**
   * Mostra o modal de detalhes com informações formatadas.
   * @param {string} titleKey - A chave de tradução para o título do modal.
   * @param {Array<{labelKey: string, value: string|number, isValueKey?: boolean, labelParams?: object}>} detailsArray
   * - Array de objetos, cada um contendo:
   * - `labelKey`: chave para traduzir a label.
   * - `value`: o valor a ser exibido (pode ser string ou número).
   * - `isValueKey` (opcional): true se o `value` também for uma chave de tradução.
   * - `labelParams` (opcional): parâmetros para a tradução da label.
   */
  showDetailsModal(titleKey, detailsArray) {
    if (!this.detailsModalOverlay || !this.detailsModalContent) return;

    const modalTitleElement =
      this.detailsModalOverlay.querySelector("#detailsModalTitle");
    if (modalTitleElement)
      modalTitleElement.textContent = this.langManager.get(titleKey);

    this.detailsModalContent.innerHTML = ""; // Limpa conteúdo anterior.

    detailsArray.forEach((detail) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "modal-detail-item";

      const labelSpan = document.createElement("span");
      labelSpan.textContent = `${this.langManager.get(
        detail.labelKey,
        detail.labelParams || {}
      )}:`;

      const valueStrong = document.createElement("strong");
      const displayValue = detail.isValueKey
        ? this.langManager.get(String(detail.value))
        : String(detail.value);
      valueStrong.innerHTML = Utils.sanitizeHTML(displayValue); // Sanitiza o valor final.

      itemDiv.appendChild(labelSpan);
      itemDiv.appendChild(valueStrong);
      this.detailsModalContent.appendChild(itemDiv);
    });

    this.detailsModalOverlay.style.display = "flex";
    document.body.classList.add("modal-open"); // Impede o scroll do body.
    void this.detailsModalOverlay.offsetWidth; // Força reflow para animação.
    this.detailsModalOverlay.classList.add("active");
    if (this.closeDetailsModalBtn) this.closeDetailsModalBtn.focus(); // Foco no botão de fechar.
  }

  /**
   * Esconde o modal de detalhes.
   */
  hideDetailsModal() {
    if (!this.detailsModalOverlay) return;
    this.detailsModalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open"); // Permite o scroll do body novamente.
    // Espera a transição CSS antes de definir display:none.
    this.detailsModalOverlay.addEventListener(
      "transitionend",
      () => {
        if (!this.detailsModalOverlay.classList.contains("active"))
          this.detailsModalOverlay.style.display = "none";
      },
      { once: true }
    );
    // Fallback.
    setTimeout(() => {
      if (!this.detailsModalOverlay.classList.contains("active"))
        this.detailsModalOverlay.style.display = "none";
    }, 350);
  }

  /**
   * Mostra um modal de confirmação genérico.
   * @param {string} messageKey - A chave de tradução para a mensagem principal do modal.
   * @param {string} [titleKey="confirmActionModalTitle"] - A chave de tradução para o título do modal.
   * @param {Object} [params={}] - Parâmetros para a mensagem traduzida.
   * @returns {Promise<boolean>} Uma promessa que resolve para `true` se o utilizador confirmar, `false` caso contrário.
   */
  showConfirm(messageKey, titleKey = "confirmActionModalTitle", params = {}) {
    return new Promise((resolve) => {
      if (
        !this.confirmModalOverlay ||
        !this.confirmModalTitle ||
        !this.confirmModalMessage
      ) {
        // Fallback para o confirm nativo se os elementos do modal não estiverem disponíveis.
        console.warn(
          "Modal de confirmação não encontrado, a usar confirm nativo."
        );
        resolve(window.confirm(this.langManager.get(messageKey, params)));
        return;
      }

      this.confirmModalTitle.textContent = this.langManager.get(titleKey);
      this.confirmModalMessage.textContent = this.langManager.get(
        messageKey,
        params
      );
      this._resolveConfirm = resolve; // Armazena a função resolve para ser chamada pelos botões do modal.

      this.confirmModalOverlay.style.display = "flex";
      document.body.classList.add("modal-open"); // Impede scroll.
      void this.confirmModalOverlay.offsetWidth; // Reflow.
      this.confirmModalOverlay.classList.add("active");
      if (this.confirmModalConfirmBtn) this.confirmModalConfirmBtn.focus(); // Foco no botão de confirmar.
    });
  }

  /**
   * Manipula a resposta do modal de confirmação (Confirmar/Cancelar).
   * @param {boolean} confirmed - `true` se o utilizador confirmou, `false` se cancelou.
   * @private
   */
  _handleConfirm(confirmed) {
    if (!this.confirmModalOverlay) return;
    this.confirmModalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open"); // Permite scroll.
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
      this._resolveConfirm(confirmed); // Resolve a promessa com a decisão do utilizador.
      this._resolveConfirm = null; // Limpa para a próxima chamada.
    }
  }
}
