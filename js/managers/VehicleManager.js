// js/managers/VehicleManager.js
// Responsável por gerir os veículos da aplicação: adicionar, selecionar, excluir, carregar e renderizar.

// Importa configurações e utilitários.
import { CONFIG } from "../config.js";
import { Utils } from "../utils.js";
// StorageManager, UIManager, Validator e LanguageManager são injetados através do construtor.

export class VehicleManager {
  /**
   * Construtor da classe VehicleManager.
   * @param {StorageManager} storageManager - Instância do gestor de armazenamento.
   * @param {UIManager} uiManager - Instância do gestor da UI.
   * @param {Validator} validator - Instância do validador de dados.
   * @param {LanguageManager} languageManager - Instância do gestor de idioma.
   */
  constructor(storageManager, uiManager, validator, languageManager) {
    this.storageManager = storageManager;
    this.uiManager = uiManager;
    this.validator = validator;
    this.langManager = languageManager;

    this.currentVehicle = null; // Objeto do veículo atualmente selecionado.
    this.currentVehicleType = "carro"; // Tipo de veículo padrão ('carro' ou 'moto').

    // Cache de elementos do DOM relevantes para a gestão de veículos.
    this.dom = {
      vehicleTypeButtons: document.querySelectorAll("[data-vehicle-type]"),
      vehicleListContainer: document.getElementById("vehicleList"),
      addVehicleBtn: document.getElementById("addVehicleBtn"),
      vehicleForm: document.getElementById("vehicleForm"),
      vehicleTypeInput: document.getElementById("vehicleType"), // Input hidden no formulário de veículo.
      vehicleNameInput: document.getElementById("vehicleName"),
      vehicleEfficiencyInput: document.getElementById("vehicleEfficiency"),
      saveVehicleBtn: document.getElementById("saveVehicleBtn"),
      cancelVehicleBtn: document.getElementById("cancelVehicleBtn"),
      mainFormEfficiencyInput: document.getElementById("kmPorLitro"), // Input de eficiência no formulário principal de cálculo.
    };

    this._bindEvents(); // Vincula os eventos aos elementos do DOM.
    // Ouve o evento de mudança de idioma para re-renderizar a lista de veículos com textos traduzidos.
    document.addEventListener("languageChanged", () =>
      this.loadAndRenderVehicles()
    );
  }

  /**
   * Vincula os listeners de evento aos elementos do DOM.
   * @private
   */
  _bindEvents() {
    // Listeners para os botões de tipo de veículo (Carro/Moto).
    this.dom.vehicleTypeButtons.forEach((button) => {
      button.addEventListener("click", (e) =>
        this.selectVehicleType(e.currentTarget.dataset.vehicleType)
      );
    });
    // Listener para o botão "Adicionar Veículo".
    if (this.dom.addVehicleBtn) {
      this.dom.addVehicleBtn.addEventListener("click", () =>
        this.showVehicleForm()
      );
    }
    // Listener para o submit do formulário de veículo.
    if (this.dom.vehicleForm) {
      this.dom.vehicleForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Previne o comportamento padrão de submit do formulário.
        this.saveVehicle();
      });
    }
    // Listener para o botão "Cancelar" no formulário de veículo.
    if (this.dom.cancelVehicleBtn) {
      this.dom.cancelVehicleBtn.addEventListener("click", () =>
        this.hideVehicleForm()
      );
    }
  }

  /**
   * Seleciona o tipo de veículo (carro ou moto) e atualiza a UI.
   * @param {'carro'|'moto'} type - O tipo de veículo a ser selecionado.
   */
  selectVehicleType(type) {
    if (type !== "carro" && type !== "moto") return; // Validação básica do tipo.
    this.currentVehicleType = type;

    // Atualiza o estado visual (classe 'selected' e 'aria-pressed') dos botões de tipo.
    this.dom.vehicleTypeButtons.forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.vehicleType === type);
      btn.setAttribute(
        "aria-pressed",
        String(btn.dataset.vehicleType === type)
      );
    });

    // Limpa a seleção de veículo atual e o campo de eficiência no formulário principal,
    // pois o tipo de veículo mudou.
    this.currentVehicle = null;
    if (this.dom.mainFormEfficiencyInput) {
      this.dom.mainFormEfficiencyInput.value = "";
      // Atualiza o placeholder do input de eficiência no formulário principal
      this.dom.mainFormEfficiencyInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
    }

    this.loadAndRenderVehicles(); // Carrega e renderiza os veículos do novo tipo selecionado.

    // Dispara um evento personalizado para notificar outros módulos sobre a mudança de tipo.
    document.dispatchEvent(
      new CustomEvent("vehicleTypeChanged", { detail: { type } })
    );
  }

  /**
   * Carrega os veículos do localStorage (filtrados pelo tipo atual) e os renderiza na UI.
   */
  loadAndRenderVehicles() {
    if (!this.dom.vehicleListContainer) return; // Sai se o container não existir.

    const allVehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const filteredVehicles = allVehicles.filter(
      (v) => v.tipo === this.currentVehicleType
    );

    this.dom.vehicleListContainer.innerHTML = ""; // Limpa a lista de veículos existente.

    if (filteredVehicles.length === 0) {
      // Exibe uma mensagem traduzida se não houver veículos do tipo selecionado.
      const vehicleTypeTranslated = this.langManager.get(
        this.currentVehicleType === "carro"
          ? "vehicleTypeCar"
          : "vehicleTypeMotorcycle"
      );
      this.dom.vehicleListContainer.innerHTML = `<li class="empty-message">${this.langManager.get(
        "noVehiclesOfType",
        { type: vehicleTypeTranslated.toLowerCase() }
      )}</li>`;
      return;
    }

    // Cria e adiciona um card para cada veículo filtrado.
    filteredVehicles.forEach((vehicle) => {
      this.dom.vehicleListContainer.appendChild(
        this._createVehicleCardElement(vehicle)
      );
    });
  }

  /**
   * Cria o elemento HTML (card) para um veículo específico.
   * @param {object} vehicle - O objeto do veículo contendo id, nome, eficiência.
   * @returns {HTMLElement} O elemento `<div>` do card do veículo.
   * @private
   */
  _createVehicleCardElement(vehicle) {
    const card = document.createElement("div");
    card.className = "vehicle-card";
    card.dataset.vehicleId = vehicle.id; // Armazena o ID do veículo no dataset para fácil acesso.
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    // Sanitiza o nome do veículo antes de usá-lo em atributos ou textContent.
    const vehicleNameSanitized = Utils.sanitizeHTML(vehicle.nome);
    // Define um aria-label traduzido para acessibilidade.
    card.setAttribute(
      "aria-label",
      this.langManager.get("selectVehicleAriaLabel", {
        name: vehicleNameSanitized,
        efficiency: vehicle.eficiencia,
      })
    );

    // Adiciona a classe 'active' se este for o veículo atualmente selecionado.
    if (this.currentVehicle && this.currentVehicle.id === vehicle.id) {
      card.classList.add("active");
    }

    const title = document.createElement("h4");
    title.textContent = vehicleNameSanitized; // Nome do veículo.

    const efficiencySpan = document.createElement("span");
    efficiencySpan.textContent = `${vehicle.eficiencia} km/L`; // Eficiência.

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.innerHTML = "&times;"; // Símbolo 'x' para o botão de excluir.
    deleteBtn.setAttribute(
      "aria-label",
      this.langManager.get("deleteVehicleAriaLabel", {
        name: vehicleNameSanitized,
      })
    );
    // Adiciona listener para excluir o veículo, com confirmação.
    deleteBtn.addEventListener("click", async (e) => {
      e.stopPropagation(); // Impede que o clique no botão também selecione o card.
      const confirmed = await this.uiManager.showConfirm(
        this.langManager.get("confirmDeleteVehicle", {
          name: vehicleNameSanitized,
        })
      );
      if (confirmed) this.deleteVehicle(vehicle.id);
    });

    card.appendChild(title);
    card.appendChild(efficiencySpan);
    card.appendChild(deleteBtn);

    // Listener para selecionar o veículo ao clicar no card.
    card.addEventListener("click", () => this.selectVehicle(vehicle.id));
    // Listener para selecionar o veículo com as teclas Enter ou Espaço (acessibilidade).
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.selectVehicle(vehicle.id);
      }
    });
    return card;
  }

  /**
   * Seleciona um veículo específico, atualizando o estado interno e a UI.
   * @param {string} vehicleId - O ID do veículo a ser selecionado.
   */
  selectVehicle(vehicleId) {
    const allVehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const vehicle = allVehicles.find((v) => v.id === vehicleId);

    if (vehicle) {
      this.currentVehicle = vehicle; // Define o veículo selecionado.
      // Preenche o campo de eficiência no formulário principal com a eficiência do veículo.
      if (this.dom.mainFormEfficiencyInput) {
        this.dom.mainFormEfficiencyInput.value = vehicle.eficiencia;
      }
      // Atualiza a classe 'active' em todos os cards de veículo.
      this.dom.vehicleListContainer
        .querySelectorAll(".vehicle-card")
        .forEach((cardEl) => {
          cardEl.classList.toggle(
            "active",
            cardEl.dataset.vehicleId === vehicleId
          );
        });
      // Mostra uma notificação de que o veículo foi selecionado.
      this.uiManager.showNotification("vehicleSelected", "info", {
        name: Utils.sanitizeHTML(vehicle.nome),
      });
    }
  }

  /**
   * Mostra o formulário para adicionar um novo veículo.
   * Preenche o tipo de veículo no formulário e foca no campo do nome.
   */
  showVehicleForm() {
    if (
      !this.dom.vehicleForm ||
      !this.dom.vehicleTypeInput ||
      !this.dom.vehicleNameInput ||
      !this.dom.vehicleEfficiencyInput
    )
      return;
    this.dom.vehicleTypeInput.value = this.currentVehicleType; // Garante que o tipo correto está no form.
    this.dom.vehicleNameInput.value = ""; // Limpa campos do formulário.
    this.dom.vehicleEfficiencyInput.value = "";
    this.dom.vehicleForm.style.display = "block"; // Torna o formulário visível.
    this.dom.vehicleNameInput.focus(); // Foca no campo do nome.
    // Rola a página para que o formulário fique visível.
    this.dom.vehicleForm.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  /**
   * Esconde o formulário de adicionar/editar veículo.
   */
  hideVehicleForm() {
    if (this.dom.vehicleForm) this.dom.vehicleForm.style.display = "none";
  }

  /**
   * Valida os dados do formulário de veículo e, se válidos, guarda o novo veículo.
   */
  saveVehicle() {
    // Valida os dados inseridos no formulário.
    const validationResult = this.validator.validateVehicle(
      this.dom.vehicleNameInput.value,
      this.dom.vehicleEfficiencyInput.value,
      this.dom.vehicleTypeInput.value // O tipo vem do input hidden, já definido por currentVehicleType.
    );

    if (!validationResult.isValid) return; // Se inválido, o validador já mostrou o erro.

    const { nome, eficiencia, tipo } = validationResult.data; // Dados validados e parseados.
    const newVehicle = {
      id: `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, // ID único.
      nome, // Nome já está trimado e sanitizado (se a sanitização for feita antes de guardar).
      eficiencia,
      tipo,
      createdAt: new Date().toISOString(), // Data de criação.
    };

    const vehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    // Verifica se já existe um veículo com o mesmo nome e tipo.
    const existingVehicle = vehicles.find(
      (v) => v.nome.toLowerCase() === nome.toLowerCase() && v.tipo === tipo
    );
    if (existingVehicle) {
      const vehicleTypeTranslated = this.langManager.get(
        tipo === "carro" ? "vehicleTypeCar" : "vehicleTypeMotorcycle"
      );
      this.uiManager.showNotification("vehicleExistsError", "error", {
        type: vehicleTypeTranslated.toLowerCase(),
        name: nome,
      });
      return;
    }

    vehicles.push(newVehicle); // Adiciona o novo veículo à lista.
    // Tenta guardar a lista atualizada no localStorage.
    if (
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)
    ) {
      this.uiManager.showNotification("vehicleSaved", "success", {
        name: nome,
      });
      this.hideVehicleForm(); // Esconde o formulário.
      this.loadAndRenderVehicles(); // Atualiza a lista de veículos na UI.
      // Se este for o primeiro veículo do tipo adicionado, seleciona-o automaticamente.
      if (
        vehicles.filter((v) => v.tipo === this.currentVehicleType).length === 1
      ) {
        this.selectVehicle(newVehicle.id);
      }
    }
  }

  /**
   * Deleta um veículo do localStorage e atualiza a UI.
   * @param {string} vehicleId - O ID do veículo a ser deletado.
   */
  deleteVehicle(vehicleId) {
    let vehicles = this.storageManager.safeGetItem(
      CONFIG.STORAGE_KEYS.VEHICLES,
      []
    );
    const vehicleToDelete = vehicles.find((v) => v.id === vehicleId);
    if (!vehicleToDelete) return; // Veículo não encontrado.

    vehicles = vehicles.filter((v) => v.id !== vehicleId); // Remove o veículo da lista.
    // Tenta guardar a lista atualizada.
    if (
      this.storageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)
    ) {
      this.uiManager.showNotification("vehicleDeleted", "success", {
        name: Utils.sanitizeHTML(vehicleToDelete.nome),
      });
      // Se o veículo excluído era o atualmente selecionado, limpa a seleção.
      if (this.currentVehicle && this.currentVehicle.id === vehicleId) {
        this.currentVehicle = null;
        if (this.dom.mainFormEfficiencyInput)
          this.dom.mainFormEfficiencyInput.value = "";
      }
      this.loadAndRenderVehicles(); // Atualiza a lista de veículos na UI.
      // Se não houver mais veículos do tipo atual, atualiza o placeholder do input de eficiência.
      if (
        vehicles.filter((v) => v.tipo === this.currentVehicleType).length ===
          0 &&
        this.dom.mainFormEfficiencyInput
      ) {
        this.dom.mainFormEfficiencyInput.placeholder = this.langManager.get(
          "tripEfficiencyPlaceholder"
        );
      }
    }
  }

  /**
   * Obtém o nome do veículo atualmente selecionado.
   * @returns {string|null} O nome do veículo, ou `null` se nenhum estiver selecionado.
   */
  getCurrentVehicleName() {
    return this.currentVehicle ? this.currentVehicle.nome : null;
  }

  /**
   * Reseta o estado do gestor de veículos.
   * Usado, por exemplo, após limpar todos os dados da aplicação.
   */
  resetState() {
    this.currentVehicle = null;
    // Não redefine currentVehicleType aqui, pois ele deve ser controlado pelo utilizador.
    // Se for necessário resetar o tipo, o AppManager pode chamar selectVehicleType("carro") após o reset.
    if (this.dom.mainFormEfficiencyInput) {
      this.dom.mainFormEfficiencyInput.value = "";
      this.dom.mainFormEfficiencyInput.placeholder = this.langManager.get(
        "tripEfficiencyPlaceholder"
      );
    }
    // A chamada a selectVehicleType no AppManager após limpar tudo irá re-renderizar com o tipo padrão.
    // Se o AppManager não fizer isso, então a linha abaixo seria necessária:
    this.loadAndRenderVehicles(); // Para mostrar a lista vazia (ou com o tipo padrão)
  }
}
