// ===== CONFIGURAÇÕES E CONSTANTES =====
const CONFIG = {
  STORAGE_KEYS: {
    VEHICLES: "veiculos",
    HISTORY: "historicoCombustivel",
  },
  VALIDATION: {
    MIN_EFFICIENCY: 5,
    MAX_EFFICIENCY: 50,
    MIN_KM: 0,
    MAX_KM: 999999,
    MIN_PRICE: 0.1,
    MAX_PRICE: 20,
  },
  HISTORY_LIMIT: 25,
  DEBOUNCE_DELAY: 300,
};

// ===== UTILITÁRIOS DE SEGURANÇA =====
class SecurityUtils {
  static sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
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
}

// ===== GERENCIADOR DE NOTIFICAÇÕES =====
class NotificationManager {
  static showError(message) {
    this.showNotification(message, "error");
  }

  static showSuccess(message) {
    this.showNotification(message, "success");
  }

  static showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.setAttribute("role", "alert");
    notification.setAttribute("aria-live", "polite");

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.className = "notification-close";
    closeBtn.setAttribute("aria-label", "Fechar notificação");
    closeBtn.addEventListener("click", () =>
      this.removeNotification(notification)
    );

    notification.appendChild(messageSpan);
    notification.appendChild(closeBtn);

    document.body.appendChild(notification);

    // Auto-remove após 5 segundos
    setTimeout(() => this.removeNotification(notification), 5000);
  }

  static removeNotification(notification) {
    if (notification && notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }
}

// ===== GERENCIADOR DE ARMAZENAMENTO =====
class StorageManager {
  static safeGetItem(key, defaultValue = []) {
    try {
      if (!this.isStorageAvailable()) {
        console.warn("localStorage não disponível");
        return defaultValue;
      }

      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Erro ao carregar ${key}:`, error);
      NotificationManager.showError(`Erro ao carregar dados: ${error.message}`);
      return defaultValue;
    }
  }

  static safeSetItem(key, value) {
    try {
      if (!this.isStorageAvailable()) {
        NotificationManager.showError("Armazenamento não disponível");
        return false;
      }

      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Erro ao salvar ${key}:`, error);
      NotificationManager.showError(`Erro ao salvar dados: ${error.message}`);
      return false;
    }
  }

  static isStorageAvailable() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  static exportData() {
    const data = {
      vehicles: this.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES),
      history: this.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `fuelcalc-backup-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    NotificationManager.showSuccess("Dados exportados com sucesso!");
  }

  static importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          if (data.vehicles && Array.isArray(data.vehicles)) {
            this.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, data.vehicles);
          }

          if (data.history && Array.isArray(data.history)) {
            this.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, data.history);
          }

          NotificationManager.showSuccess("Dados importados com sucesso!");
          resolve(data);
        } catch (error) {
          NotificationManager.showError(
            "Erro ao importar dados: arquivo inválido"
          );
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsText(file);
    });
  }
}

// ===== VALIDADOR APRIMORADO =====
class Validator {
  static validateVehicle(nome, eficiencia, tipo) {
    const errors = [];

    if (!nome || nome.trim().length < 2) {
      errors.push("Nome do veículo deve ter pelo menos 2 caracteres");
    }

    if (nome && nome.trim().length > 50) {
      errors.push("Nome do veículo deve ter no máximo 50 caracteres");
    }

    if (
      !SecurityUtils.validateNumber(
        eficiencia,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    ) {
      errors.push(
        `Eficiência deve estar entre ${CONFIG.VALIDATION.MIN_EFFICIENCY} e ${CONFIG.VALIDATION.MAX_EFFICIENCY} km/L`
      );
    }

    if (!["carro", "moto"].includes(tipo)) {
      errors.push("Tipo de veículo inválido");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateTrip(
    kmInicial,
    kmFinal,
    kmPorLitro,
    precoCombustivel,
    ganhoUber
  ) {
    const errors = [];

    if (
      !SecurityUtils.validateNumber(
        kmInicial,
        CONFIG.VALIDATION.MIN_KM,
        CONFIG.VALIDATION.MAX_KM
      )
    ) {
      errors.push("KM Inicial deve ser um número válido");
    }

    if (
      !SecurityUtils.validateNumber(
        kmFinal,
        kmInicial + 0.1,
        CONFIG.VALIDATION.MAX_KM
      )
    ) {
      errors.push("KM Final deve ser maior que KM Inicial");
    }

    if (kmFinal - kmInicial > 2000) {
      errors.push("Distância muito grande (máximo 2000 km por viagem)");
    }

    if (
      !SecurityUtils.validateNumber(
        kmPorLitro,
        CONFIG.VALIDATION.MIN_EFFICIENCY,
        CONFIG.VALIDATION.MAX_EFFICIENCY
      )
    ) {
      errors.push(
        `Eficiência deve estar entre ${CONFIG.VALIDATION.MIN_EFFICIENCY} e ${CONFIG.VALIDATION.MAX_EFFICIENCY} km/L`
      );
    }

    if (
      !SecurityUtils.validateNumber(
        precoCombustivel,
        CONFIG.VALIDATION.MIN_PRICE,
        CONFIG.VALIDATION.MAX_PRICE
      )
    ) {
      errors.push(
        `Preço deve estar entre R$ ${CONFIG.VALIDATION.MIN_PRICE} e R$ ${CONFIG.VALIDATION.MAX_PRICE}`
      );
    }

    if (
      ganhoUber !== null &&
      ganhoUber !== "" &&
      !SecurityUtils.validateNumber(ganhoUber, 0, 10000)
    ) {
      errors.push("Ganho da Uber deve ser um valor entre R$ 0 e R$ 10.000");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// ===== GERENCIADOR DE VEÍCULOS =====
class VehicleManager {
  constructor() {
    this.currentVehicle = null;
    this.currentType = "carro";
    this.domCache = this.initDOMCache();
    this.bindEvents();
  }

  initDOMCache() {
    return {
      vehicleList: document.getElementById("vehicleList"),
      vehicleForm: document.getElementById("vehicleForm"),
      vehicleName: document.getElementById("vehicleName"),
      vehicleEfficiency: document.getElementById("vehicleEfficiency"),
      vehicleType: document.getElementById("vehicleType"),
      kmPorLitro: document.getElementById("kmPorLitro"),
      typeButtons: document.querySelectorAll(
        ".vehicle-type-buttons .uber-button"
      ),
    };
  }

  bindEvents() {
    // Event listeners para botões de tipo de veículo
    this.domCache.typeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tipo = button.getAttribute("data-tipo");
        this.selectVehicleType(tipo);
      });
    });

    // Event listeners para formulário de veículo
    const addBtn = document.getElementById("adicionarVeiculoBtn");
    const saveBtn = document.getElementById("salvarVeiculoBtn");
    const cancelBtn = document.getElementById("cancelarVeiculoBtn");

    if (addBtn) addBtn.addEventListener("click", () => this.showVehicleForm());
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveVehicle());
    if (cancelBtn)
      cancelBtn.addEventListener("click", () => this.hideVehicleForm());
  }

  selectVehicleType(type) {
    this.currentType = type;
    this.updateTypeButtons();
    this.loadVehicles();
  }

  updateTypeButtons() {
    this.domCache.typeButtons.forEach((button) => {
      const buttonType = button.getAttribute("data-tipo");
      button.classList.toggle("selected", buttonType === this.currentType);
    });
  }

  saveVehicle() {
    const nome = this.domCache.vehicleName.value.trim();
    const eficiencia = parseFloat(
      SecurityUtils.convertCommaToPoint(this.domCache.vehicleEfficiency.value)
    );
    const tipo = this.domCache.vehicleType.value;

    const validation = Validator.validateVehicle(nome, eficiencia, tipo);

    if (!validation.isValid) {
      NotificationManager.showError(validation.errors.join("\n"));
      return;
    }

    // Verificar se já existe veículo com mesmo nome
    const vehicles = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES);
    const existingVehicle = vehicles.find(
      (v) => v.nome.toLowerCase() === nome.toLowerCase() && v.tipo === tipo
    );

    if (existingVehicle) {
      NotificationManager.showError("Já existe um veículo com este nome");
      return;
    }

    const vehicle = {
      nome: SecurityUtils.sanitizeHTML(nome),
      eficiencia,
      tipo,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    vehicles.push(vehicle);

    if (StorageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)) {
      this.loadVehicles();
      this.hideVehicleForm();
      NotificationManager.showSuccess("Veículo salvo com sucesso!");
    }
  }

  loadVehicles() {
    const vehicles = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES);
    const filteredVehicles = vehicles.filter(
      (v) => v.tipo === this.currentType
    );

    // Limpar container
    this.domCache.vehicleList.innerHTML = "";

    if (filteredVehicles.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "empty-message";
      emptyMessage.textContent = `Nenhum ${this.currentType} cadastrado`;
      this.domCache.vehicleList.appendChild(emptyMessage);
      return;
    }

    filteredVehicles.forEach((vehicle) => {
      const card = this.createVehicleCard(vehicle);
      this.domCache.vehicleList.appendChild(card);
    });
  }

  createVehicleCard(vehicle) {
    const card = document.createElement("div");
    card.className = `vehicle-card ${
      vehicle.id === this.currentVehicle?.id ? "active" : ""
    }`;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Selecionar veículo ${vehicle.nome}`);

    const title = document.createElement("h4");
    title.textContent = vehicle.nome;

    const efficiency = document.createElement("span");
    efficiency.textContent = `${vehicle.eficiencia} km/L`;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "Excluir";
    deleteBtn.setAttribute("aria-label", `Excluir veículo ${vehicle.nome}`);

    // Event listeners seguros
    const selectHandler = () => this.selectVehicle(vehicle.id);
    card.addEventListener("click", selectHandler);
    card.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectHandler();
      }
    });

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.deleteVehicle(vehicle.id, vehicle.nome);
    });

    card.appendChild(title);
    card.appendChild(efficiency);
    card.appendChild(deleteBtn);

    return card;
  }
  selectVehicle(id) {
    const vehicles = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES);
    this.currentVehicle = vehicles.find((v) => v.id === id);

    if (this.currentVehicle && this.domCache.kmPorLitro) {
      this.domCache.kmPorLitro.value = this.currentVehicle.eficiencia;
    }

    this.loadVehicles();
  }

  deleteVehicle(id, nome) {
    if (confirm(`Tem certeza que deseja excluir o veículo "${nome}"?`)) {
      let vehicles = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.VEHICLES);
      vehicles = vehicles.filter((v) => v.id !== id);

      if (StorageManager.safeSetItem(CONFIG.STORAGE_KEYS.VEHICLES, vehicles)) {
        if (this.currentVehicle && this.currentVehicle.id === id) {
          this.currentVehicle = null;
          if (this.domCache.kmPorLitro) {
            this.domCache.kmPorLitro.value = "";
          }
        }
        this.loadVehicles();
        NotificationManager.showSuccess("Veículo excluído com sucesso!");
      }
    }
  }

  showVehicleForm() {
    this.domCache.vehicleType.value = this.currentType;
    this.domCache.vehicleForm.style.display = "block";
    this.domCache.vehicleName.focus();
  }

  hideVehicleForm() {
    this.domCache.vehicleForm.style.display = "none";
    this.clearVehicleForm();
  }

  clearVehicleForm() {
    this.domCache.vehicleName.value = "";
    this.domCache.vehicleEfficiency.value = "";
    this.domCache.vehicleType.value = this.currentType;
  }
}

// ===== CALCULADORA DE COMBUSTÍVEL =====
class FuelCalculator {
  constructor(vehicleManager) {
    this.vehicleManager = vehicleManager;
    this.domCache = this.initDOMCache();
    this.bindEvents();
  }

  initDOMCache() {
    return {
      form: document.getElementById("fuelForm"),
      kmInicial: document.getElementById("kmInicial"),
      kmFinal: document.getElementById("kmFinal"),
      kmPorLitro: document.getElementById("kmPorLitro"),
      precoCombustivel: document.getElementById("precoCombustivel"),
      ganhoUber: document.getElementById("ganhoUber"),
      resultado: document.getElementById("resultado"),
      calcularBtn: document.getElementById("calcularGastosBtn"),
    };
  }

  bindEvents() {
    if (this.domCache.form) {
      this.domCache.form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.calculate();
      });
    }

    if (this.domCache.calcularBtn) {
      this.domCache.calcularBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.calculate();
      });
    }
  }

  calculate() {
    const kmInicial = parseFloat(
      SecurityUtils.convertCommaToPoint(this.domCache.kmInicial.value)
    );
    const kmFinal = parseFloat(
      SecurityUtils.convertCommaToPoint(this.domCache.kmFinal.value)
    );
    const kmPorLitro = parseFloat(
      SecurityUtils.convertCommaToPoint(this.domCache.kmPorLitro.value)
    );
    const precoCombustivel = parseFloat(
      SecurityUtils.convertCommaToPoint(this.domCache.precoCombustivel.value)
    );
    const ganhoUber = this.domCache.ganhoUber.value
      ? parseFloat(
          SecurityUtils.convertCommaToPoint(this.domCache.ganhoUber.value)
        )
      : null;

    const validation = Validator.validateTrip(
      kmInicial,
      kmFinal,
      kmPorLitro,
      precoCombustivel,
      ganhoUber
    );

    if (!validation.isValid) {
      NotificationManager.showError(validation.errors.join("\n"));
      return;
    }

    const results = this.performCalculation(
      kmInicial,
      kmFinal,
      kmPorLitro,
      precoCombustivel,
      ganhoUber
    );

    this.displayResults(results);
    this.saveToHistory(results);
    this.clearForm();

    // Atualizar estatísticas e histórico
    if (window.historyManager) {
      window.historyManager.updateHistory();
    }
    if (window.statisticsManager) {
      window.statisticsManager.updateStatistics();
    }
  }

  performCalculation(
    kmInicial,
    kmFinal,
    kmPorLitro,
    precoCombustivel,
    ganhoUber
  ) {
    const distancia = kmFinal - kmInicial;
    const litros = distancia / kmPorLitro;
    const custo = litros * precoCombustivel;
    const ganho = ganhoUber !== null ? ganhoUber - custo : null;

    return {
      distancia,
      litros,
      custo,
      ganho,
      kmInicial,
      kmFinal,
      kmPorLitro,
      precoCombustivel,
    };
  }

  displayResults(results) {
    const resultElements = {
      distancia: document.getElementById("distancia"),
      litros: document.getElementById("litros"),
      custo: document.getElementById("custo"),
      ganho: document.getElementById("ganho"),
    };

    if (resultElements.distancia) {
      resultElements.distancia.textContent = `${results.distancia.toFixed(
        1
      )} km`;
    }
    if (resultElements.litros) {
      resultElements.litros.textContent = `${results.litros.toFixed(1)} L`;
    }
    if (resultElements.custo) {
      resultElements.custo.textContent = `R$ ${results.custo.toFixed(2)}`;
    }
    if (resultElements.ganho) {
      if (results.ganho !== null) {
        resultElements.ganho.textContent = `R$ ${results.ganho.toFixed(2)}`;
      } else {
        resultElements.ganho.textContent = "N/A";
      }
    }

    this.domCache.resultado.style.display = "block";
  }

  saveToHistory(results) {
    const history = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY);

    const record = {
      preco: results.precoCombustivel,
      kmInicial: results.kmInicial,
      kmFinal: results.kmFinal,
      kmPorLitro: results.kmPorLitro,
      tipo: this.vehicleManager.currentType,
      data: new Date().toLocaleString("pt-BR"),
      distancia: results.distancia.toFixed(1),
      litros: results.litros.toFixed(1),
      custo: results.custo.toFixed(2),
    };

    if (results.ganho !== null) {
      record.ganho = results.ganho.toFixed(2);
    }

    history.unshift(record);
    if (history.length > CONFIG.HISTORY_LIMIT) {
      history.pop();
    }

    StorageManager.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, history);
  }

  clearForm() {
    if (this.domCache.form) {
      this.domCache.form.reset();
    }
  }
}

// ===== GERENCIADOR DE HISTÓRICO =====
class HistoryManager {
  constructor(vehicleManager) {
    this.vehicleManager = vehicleManager;
    this.domCache = this.initDOMCache();
    this.bindEvents();
  }

  initDOMCache() {
    return {
      historySection: document.getElementById("historySection"),
      historicoPrecos: document.getElementById("historicoPrecos"),
      verMaisBtn: document.getElementById("verMaisBtn"),
      minimizarBtn: document.getElementById("minimizarBtn"),
      limparHistoricoBtn: document.getElementById("limparHistoricoBtn"),
      modalOverlay: document.getElementById("modalOverlay"),
      modalDetails: document.getElementById("modalDetails"),
      fecharModalBtn: document.getElementById("fecharModalBtn"),
    };
  }

  bindEvents() {
    if (this.domCache.verMaisBtn) {
      this.domCache.verMaisBtn.addEventListener("click", () =>
        this.showFullHistory()
      );
    }

    if (this.domCache.minimizarBtn) {
      this.domCache.minimizarBtn.addEventListener("click", () =>
        this.minimizeHistory()
      );
    }

    if (this.domCache.limparHistoricoBtn) {
      this.domCache.limparHistoricoBtn.addEventListener("click", () =>
        this.clearHistory()
      );
    }

    if (this.domCache.fecharModalBtn) {
      this.domCache.fecharModalBtn.addEventListener("click", () =>
        this.closeModal()
      );
    }

    if (this.domCache.modalOverlay) {
      this.domCache.modalOverlay.addEventListener("click", (e) => {
        if (e.target === this.domCache.modalOverlay) {
          this.closeModal();
        }
      });
    }
  }

  updateHistory() {
    const history = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY);
    const filteredHistory = history.filter(
      (item) => item.tipo === this.vehicleManager.currentType
    );

    this.domCache.historicoPrecos.innerHTML = "";

    if (filteredHistory.length === 0) {
      this.domCache.historySection.style.display = "none";
      return;
    }

    this.domCache.historySection.style.display = "block";

    // Mostrar apenas os 3 primeiros registros inicialmente
    const displayedHistory = filteredHistory.slice(0, 3);
    this.renderHistoryItems(displayedHistory, filteredHistory);

    // Controlar botões Ver Mais/Minimizar
    if (filteredHistory.length > 3) {
      this.domCache.verMaisBtn.style.display = "block";
      this.domCache.minimizarBtn.style.display = "none";
    } else {
      this.domCache.verMaisBtn.style.display = "none";
      this.domCache.minimizarBtn.style.display = "none";
    }
  }

  renderHistoryItems(items, fullHistory) {
    this.domCache.historicoPrecos.innerHTML = "";

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.setAttribute("data-index", index);
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0");
      li.setAttribute("aria-label", `Ver detalhes da viagem de ${item.data}`);

      const dateSpan = document.createElement("span");
      dateSpan.textContent = item.data;

      const priceStrong = document.createElement("strong");
      priceStrong.textContent = `R$ ${parseFloat(item.preco).toFixed(2)}`;

      li.appendChild(dateSpan);
      li.appendChild(priceStrong);

      // Event listeners seguros
      const showDetailsHandler = () =>
        this.showDetails(fullHistory.findIndex((h) => h.data === item.data));
      li.addEventListener("click", showDetailsHandler);
      li.addEventListener("keypress", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          showDetailsHandler();
        }
      });

      this.domCache.historicoPrecos.appendChild(li);
    });
  }

  showFullHistory() {
    const history = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY);
    const filteredHistory = history.filter(
      (item) => item.tipo === this.vehicleManager.currentType
    );

    this.renderHistoryItems(filteredHistory, filteredHistory);
    this.domCache.verMaisBtn.style.display = "none";
    this.domCache.minimizarBtn.style.display = "block";
  }

  minimizeHistory() {
    const history = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY);
    const filteredHistory = history.filter(
      (item) => item.tipo === this.vehicleManager.currentType
    );
    const displayedHistory = filteredHistory.slice(0, 3);

    this.renderHistoryItems(displayedHistory, filteredHistory);
    this.domCache.verMaisBtn.style.display = "block";
    this.domCache.minimizarBtn.style.display = "none";
  }

  showDetails(index) {
    const history = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY);
    const filteredHistory = history.filter(
      (item) => item.tipo === this.vehicleManager.currentType
    );
    const record = filteredHistory[index];

    if (!record) return;

    this.domCache.modalDetails.innerHTML = "";

    const details = [
      { label: "Data", value: record.data },
      { label: "KM Inicial", value: `${record.kmInicial} km` },
      { label: "KM Final", value: `${record.kmFinal} km` },
      { label: "Distância", value: `${record.distancia} km` },
      { label: "Eficiência", value: `${record.kmPorLitro} km/L` },
      { label: "Combustível", value: `${record.litros} L` },
      {
        label: "Preço por Litro",
        value: `R$ ${parseFloat(record.preco).toFixed(2)}`,
      },
      { label: "Custo Total", value: `R$ ${record.custo}` },
    ];

    if (record.ganho) {
      details.push({ label: "Ganho na Uber", value: `R$ ${record.ganho}` });
    }

    details.forEach((detail) => {
      const div = document.createElement("div");
      div.className = "modal-detail-item";

      const labelSpan = document.createElement("span");
      labelSpan.textContent = detail.label + ":";

      const valueStrong = document.createElement("strong");
      valueStrong.textContent = detail.value;

      div.appendChild(labelSpan);
      div.appendChild(valueStrong);
      this.domCache.modalDetails.appendChild(div);
    });

    this.domCache.modalOverlay.style.display = "flex";
  }

  closeModal() {
    this.domCache.modalOverlay.style.display = "none";
  }

  clearHistory() {
    if (
      confirm(
        `Tem certeza que deseja limpar todo o histórico de ${this.vehicleManager.currentType}s?`
      )
    ) {
      const history = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY);
      const filteredHistory = history.filter(
        (item) => item.tipo !== this.vehicleManager.currentType
      );

      if (
        StorageManager.safeSetItem(CONFIG.STORAGE_KEYS.HISTORY, filteredHistory)
      ) {
        this.updateHistory();
        if (window.statisticsManager) {
          window.statisticsManager.updateStatistics();
        }
        NotificationManager.showSuccess("Histórico limpo com sucesso!");
      }
    }
  }
}
// ===== GERENCIADOR DE ESTATÍSTICAS =====
class StatisticsManager {
  constructor(vehicleManager) {
    this.vehicleManager = vehicleManager;
    this.domCache = this.initDOMCache();
    this.chart = null;
    this.debouncedUpdate = SecurityUtils.debounce(
      () => this.updateStatistics(),
      CONFIG.DEBOUNCE_DELAY
    );
  }

  initDOMCache() {
    return {
      statsSection: document.getElementById("statsSection"),
      totalKm: document.getElementById("totalKm"),
      totalGasto: document.getElementById("totalGasto"),
      mediaConsumo: document.getElementById("mediaConsumo"),
      chartCanvas: document.getElementById("fuelChart"),
    };
  }

  updateStatistics() {
    const history = StorageManager.safeGetItem(CONFIG.STORAGE_KEYS.HISTORY);
    const filteredHistory = history.filter(
      (item) => item.tipo === this.vehicleManager.currentType
    );

    if (filteredHistory.length === 0) {
      this.domCache.statsSection.style.display = "none";
      return;
    }

    this.domCache.statsSection.style.display = "block";

    // Calcular estatísticas
    const stats = this.calculateStatistics(filteredHistory);
    this.displayStatistics(stats);
    this.updateChart(filteredHistory);
  }

  calculateStatistics(history) {
    const totalKm = history.reduce(
      (sum, item) => sum + parseFloat(item.distancia),
      0
    );
    const totalGasto = history.reduce(
      (sum, item) => sum + parseFloat(item.custo),
      0
    );
    const totalLitros = history.reduce(
      (sum, item) => sum + parseFloat(item.litros),
      0
    );
    const mediaConsumo = totalLitros > 0 ? totalKm / totalLitros : 0;

    return {
      totalKm: totalKm.toFixed(1),
      totalGasto: totalGasto.toFixed(2),
      mediaConsumo: mediaConsumo.toFixed(1),
      totalViagens: history.length,
    };
  }

  displayStatistics(stats) {
    if (this.domCache.totalKm) {
      this.domCache.totalKm.textContent = `${stats.totalKm} km`;
    }
    if (this.domCache.totalGasto) {
      this.domCache.totalGasto.textContent = `R$ ${stats.totalGasto}`;
    }
    if (this.domCache.mediaConsumo) {
      this.domCache.mediaConsumo.textContent = `${stats.mediaConsumo} km/L`;
    }
  }

  updateChart(history) {
    if (!this.domCache.chartCanvas || !window.Chart) return;

    // Destruir gráfico anterior de forma segura
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    if (history.length === 0) return;

    try {
      const ctx = this.domCache.chartCanvas.getContext("2d");
      const chartData = this.prepareChartData(history);

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: "Gasto Diário (R$)",
              data: chartData.data,
              borderColor: "#00C165",
              backgroundColor: "rgba(0, 193, 101, 0.1)",
              tension: 0.1,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#ffffff",
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#ffffff",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
            },
            y: {
              ticks: {
                color: "#ffffff",
              },
              grid: {
                color: "rgba(255, 255, 255, 0.1)",
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Erro ao criar gráfico:", error);
      NotificationManager.showError("Erro ao carregar gráfico de estatísticas");
    }
  }

  prepareChartData(history) {
    // Agrupar por data e somar gastos do mesmo dia
    const groupedData = {};

    history.forEach((item) => {
      const date = item.data.split(",")[0]; // Pegar apenas a data, sem horário
      if (!groupedData[date]) {
        groupedData[date] = 0;
      }
      groupedData[date] += parseFloat(item.custo);
    });

    // Ordenar por data e preparar dados para o gráfico
    const sortedEntries = Object.entries(groupedData)
      .sort(
        ([a], [b]) =>
          new Date(a.split("/").reverse().join("-")) -
          new Date(b.split("/").reverse().join("-"))
      )
      .slice(-10); // Mostrar apenas os últimos 10 dias

    return {
      labels: sortedEntries.map(([date]) => date),
      data: sortedEntries.map(([, cost]) => cost.toFixed(2)),
    };
  }
}

// ===== GERENCIADOR DE APLICAÇÃO PRINCIPAL =====
class AppManager {
  constructor() {
    this.vehicleManager = new VehicleManager();
    this.fuelCalculator = new FuelCalculator(this.vehicleManager);
    this.historyManager = new HistoryManager(this.vehicleManager);
    this.statisticsManager = new StatisticsManager(this.vehicleManager);

    // Disponibilizar globalmente para compatibilidade
    window.vehicleManager = this.vehicleManager;
    window.fuelCalculator = this.fuelCalculator;
    window.historyManager = this.historyManager;
    window.statisticsManager = this.statisticsManager;

    this.init();
  }

  init() {
    this.registerServiceWorker();
    this.bindGlobalEvents();
    this.initializeApp();
  }

  registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("sw.js")
          .then((registration) => {
            console.log("Service Worker registrado com sucesso:", registration);
          })
          .catch((error) => {
            console.error("Falha no registro do Service Worker:", error);
            NotificationManager.showError("Falha ao registrar Service Worker");
          });
      });
    }
  }

  bindGlobalEvents() {
    // Event listener para exportar dados
    const exportBtn = document.getElementById("exportDataBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => StorageManager.exportData());
    }

    // Event listener para importar dados
    const importBtn = document.getElementById("importDataBtn");
    const importFile = document.getElementById("importFileInput");

    if (importBtn && importFile) {
      importBtn.addEventListener("click", () => importFile.click());
      importFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          StorageManager.importData(file)
            .then(() => {
              this.refreshAllData();
            })
            .catch((error) => {
              console.error("Erro na importação:", error);
            });
        }
      });
    }

    // Event listener para tela de carregamento - corrigido
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => this.hideSplashScreen(), 1000);
      });
    } else {
      // Se o DOM já estiver carregado, executar imediatamente
      setTimeout(() => this.hideSplashScreen(), 1000);
    }

    // Event listeners para teclado (acessibilidade)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.historyManager.closeModal();
      }
    });
  }

  initializeApp() {
    // Inicializar com carros por padrão
    this.vehicleManager.selectVehicleType("carro");

    // Carregar dados iniciais
    this.refreshAllData();
  }

  refreshAllData() {
    this.vehicleManager.loadVehicles();
    this.historyManager.updateHistory();
    this.statisticsManager.updateStatistics();
  }

  hideSplashScreen() {
    const splashScreen = document.getElementById("splash-screen");
    if (splashScreen) {
      // Forçar a remoção imediata se já estiver carregado
      splashScreen.style.transition = "opacity 1s ease-out";
      splashScreen.style.opacity = "0";

      setTimeout(() => {
        if (splashScreen && splashScreen.parentNode) {
          splashScreen.style.display = "none";
          // Como fallback, remover completamente do DOM
          splashScreen.remove();
        }
      }, 1000);
    }
  }
}

// ===== FUNÇÕES GLOBAIS PARA COMPATIBILIDADE =====
// Manter algumas funções globais para compatibilidade com HTML existente

function selecionarTipoVeiculo(tipo) {
  if (window.vehicleManager) {
    window.vehicleManager.selectVehicleType(tipo);
  }
}

function calcularGastos() {
  if (window.fuelCalculator) {
    window.fuelCalculator.calculate();
  }
}

function mostrarFormVeiculo() {
  if (window.vehicleManager) {
    window.vehicleManager.showVehicleForm();
  }
}

function salvarVeiculo() {
  if (window.vehicleManager) {
    window.vehicleManager.saveVehicle();
  }
}

function cancelarVeiculo() {
  if (window.vehicleManager) {
    window.vehicleManager.hideVehicleForm();
  }
}

function limparDados() {
  if (window.historyManager) {
    window.historyManager.clearHistory();
  }
}

function fecharModal() {
  if (window.historyManager) {
    window.historyManager.closeModal();
  }
}

// ===== INICIALIZAÇÃO DA APLICAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  try {
    new AppManager();
  } catch (error) {
    console.error("Erro ao inicializar aplicação:", error);
    NotificationManager.showError(
      "Erro ao inicializar aplicação. Recarregue a página."
    );
  }
});

// ===== CSS ADICIONAL PARA NOTIFICAÇÕES =====
const notificationStyles = `  
.notification {  
  position: fixed;  
  top: 20px;  
  right: 20px;  
  background: var(--uber-gray);  
  color: var(--uber-text);  
  padding: 1rem;  
  border-radius: 8px;  
  border-left: 4px solid var(--uber-green);  
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);  
  z-index: 10000;  
  max-width: 300px;  
  display: flex;  
  align-items: center;  
  justify-content: space-between;  
  animation: slideIn 0.3s ease-out;  
}  
  
.notification-error {  
  border-left-color: #ff4444;  
}  
  
.notification-success {  
  border-left-color: var(--uber-green);  
}  
  
.notification-close {  
  background: none;  
  border: none;  
  color: var(--uber-text);  
  font-size: 1.2rem;  
  cursor: pointer;  
  margin-left: 1rem;  
  padding: 0;  
  width: 20px;  
  height: 20px;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
}  
  
.empty-message {  
  text-align: center;  
  color: var(--uber-light-gray);  
  padding: 2rem;  
  font-style: italic;  
}  
  
@keyframes slideIn {  
  from {  
    transform: translateX(100%);  
    opacity: 0;  
  }  
  to {  
    transform: translateX(0);  
    opacity: 1;  
  }  
}  
  
@media (max-width: 480px) {  
  .notification {  
    right: 10px;  
    left: 10px;  
    max-width: none;  
  }  
}  
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);