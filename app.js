// Seleciona o formulário de combustível e o div de resultado
const form = document.getElementById("fuelForm");
const resultadoDiv = document.getElementById("resultado");

// Variáveis globais
let veiculoAtual = null;
let tipoVeiculoAtual = "carro"; // Tipo de veículo selecionado
const ctx = document.getElementById("fuelChart").getContext("2d");
let fuelChart = null;

// Função para selecionar o tipo de veículo
function selecionarTipoVeiculo(tipo) {
  tipoVeiculoAtual = tipo;
  document.getElementById("vehicleType").value = tipo;
  carregarVeiculos();
  atualizarEstatisticas();
  atualizarHistorico();

  // Atualiza a classe 'selected' nos botões
  document.querySelectorAll('.vehicle-type-buttons .uber-button').forEach(button => {
    button.classList.remove('selected');
  });
  document.querySelector(`.vehicle-type-buttons .uber-button[data-tipo="${tipo}"]`).classList.add('selected');
}

// Função para mostrar o formulário de adicionar veículo
function mostrarFormVeiculo() {
  document.getElementById("vehicleForm").style.display = "block";
}

// Função para salvar um novo veículo
function salvarVeiculo() {
  const vehicle = {
    nome: document.getElementById("vehicleName").value,
    eficiencia: parseFloat(document.getElementById("vehicleEfficiency").value),
    tipo: document.getElementById("vehicleType").value,
    id: Date.now(),
  };

  // Recupera os veículos do localStorage, adiciona o novo veículo e salva novamente
  const veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
  veiculos.push(vehicle);
  localStorage.setItem("veiculos", JSON.stringify(veiculos));

  // Atualiza a lista de veículos e esconde o formulário
  carregarVeiculos();
  document.getElementById("vehicleForm").style.display = "none";
}

// Função para carregar e exibir os veículos salvos
function carregarVeiculos() {
  const veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
  const container = document.getElementById("vehicleList");

  // Filtra os veículos pelo tipo selecionado
  const veiculosFiltrados = veiculos.filter(
    (veiculo) => veiculo.tipo === tipoVeiculoAtual
  );

  // Gera o HTML para cada veículo e adiciona ao container
  container.innerHTML = veiculosFiltrados
    .map(
      (veiculo) => `
        <div class="vehicle-card ${
          veiculo.id === veiculoAtual?.id ? "active" : ""
        }" 
             onclick="selecionarVeiculo(${veiculo.id})">
            <h4>${veiculo.nome}</h4>
            <span>${veiculo.eficiencia} km/L</span>
            <button class="delete-button" onclick="excluirVeiculo(event, ${veiculo.id})">Excluir</button>
        </div>
    `
    )
    .join("");
}

// Função para selecionar um veículo
function selecionarVeiculo(id) {
  const veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
  veiculoAtual = veiculos.find((v) => v.id === id);
  if (veiculoAtual) {
    document.getElementById("kmPorLitro").value = veiculoAtual.eficiencia;
  }
  carregarVeiculos();
}

// Função para excluir um veículo
function excluirVeiculo(event, id) {
  event.stopPropagation();
  let veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
  veiculos = veiculos.filter((v) => v.id !== id);
  localStorage.setItem("veiculos", JSON.stringify(veiculos));
  carregarVeiculos();
}

// Função para atualizar as estatísticas
function atualizarEstatisticas() {
  const historico =
    JSON.parse(localStorage.getItem("historicoCombustivel")) || [];

  // Filtra o histórico pelo tipo de veículo
  const historicoFiltrado = historico.filter(
    (item) => item.tipo === tipoVeiculoAtual
  );

  const totalKm = historicoFiltrado.reduce(
    (acc, item) => acc + parseFloat(item.distancia),
    0
  );
  const totalGasto = historicoFiltrado.reduce(
    (acc, item) => acc + parseFloat(item.custo),
    0
  );

  document.getElementById("totalKm").textContent = `${totalKm.toFixed(1)} km`;
  document.getElementById("totalGasto").textContent = `R$ ${totalGasto.toFixed(
    2
  )}`;

  atualizarGrafico(historicoFiltrado);
}

// Função para atualizar o gráfico
function atualizarGrafico(historico) {
  if (fuelChart) fuelChart.destroy();

  const datas = historico.map((item) => item.data.split(",")[0]);
  const custos = historico.map((item) => item.custo);

  fuelChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: datas,
      datasets: [
        {
          label: "Gasto Diário (R$)",
          data: custos,
          borderColor: "#00C165",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Configuração inicial ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  selecionarTipoVeiculo("carro"); // Seleciona carro por padrão
});

// Cálculo principal ao submeter o formulário
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const kmInicial = parseFloat(document.getElementById("kmInicial").value);
  const kmFinal = parseFloat(document.getElementById("kmFinal").value);
  const kmPorLitro = parseFloat(document.getElementById("kmPorLitro").value);
  const precoCombustivel = parseFloat(
    document.getElementById("precoCombustivel").value
  );

  if (kmFinal <= kmInicial) {
    mostrarErro("KM Final deve ser maior que KM Inicial!");
    return;
  }

  const distancia = kmFinal - kmInicial;
  const litros = distancia / kmPorLitro;
  const custo = litros * precoCombustivel;

  exibirResultado(distancia, litros, custo);
  salvarHistorico(precoCombustivel, kmInicial, kmFinal, kmPorLitro);
  atualizarEstatisticas();
});

// Função para exibir o resultado do cálculo
function exibirResultado(distancia, litros, custo) {
  document.getElementById("distancia").textContent = `${distancia.toFixed(
    1
  )} km`;
  document.getElementById("litros").textContent = `${litros.toFixed(1)} L`;
  document.getElementById("custo").textContent = `R$ ${custo.toFixed(2)}`;
  resultadoDiv.style.display = "block";
}

// Função para mostrar uma mensagem de erro
function mostrarErro(mensagem) {
  alert(mensagem);
}

// Função para salvar o histórico de preços
function salvarHistorico(preco, kmInicial, kmFinal, kmPorLitro) {
  const historico =
    JSON.parse(localStorage.getItem("historicoCombustivel")) || [];
  const registro = {
    preco: preco,
    kmInicial: kmInicial,
    kmFinal: kmFinal,
    kmPorLitro: kmPorLitro,
    tipo: tipoVeiculoAtual,
    data: new Date().toLocaleString("pt-BR"),
    distancia: (kmFinal - kmInicial).toFixed(1),
    litros: ((kmFinal - kmInicial) / kmPorLitro).toFixed(1),
    custo: (((kmFinal - kmInicial) / kmPorLitro) * preco).toFixed(2),
  };

  historico.unshift(registro);
  if (historico.length > 5) historico.pop();

  localStorage.setItem("historicoCombustivel", JSON.stringify(historico));
  atualizarHistorico();
}

// Função para atualizar o histórico de preços
function atualizarHistorico() {
  const historico =
    JSON.parse(localStorage.getItem("historicoCombustivel")) || [];

  // Filtra o histórico pelo tipo de veículo
  const historicoFiltrado = historico.filter(
    (item) => item.tipo === tipoVeiculoAtual
  );

  const lista = document.getElementById("historicoPrecos");
  lista.innerHTML = historicoFiltrado
    .map(
      (item, index) => `
      <li data-index="${index}" onclick="mostrarDetalhes(${index})">
          <span>${item.data}</span>
          <strong>R$ ${item.preco.toFixed(2)}</strong>
      </li>
  `
    )
    .join("");
}

// Função para mostrar os detalhes de um registro do histórico
function mostrarDetalhes(index) {
  const historico =
    JSON.parse(localStorage.getItem("historicoCombustivel")) || [];
  const registro = historico[index];

  if (!registro) return;

  const modalDetails = document.getElementById("modalDetails");
  modalDetails.innerHTML = `
      <div class="modal-detail-item">
          <span>Data:</span>
          <strong>${registro.data}</strong>
      </div>
      <div class="modal-detail-item">
          <span>KM Inicial:</span>
          <strong>${registro.kmInicial} km</strong>
      </div>
      <div class="modal-detail-item">
          <span>KM Final:</span>
          <strong>${registro.kmFinal} km</strong>
      </div>
      <div class="modal-detail-item">
          <span>Distância:</span>
          <strong>${registro.distancia} km</strong>
      </div>
      <div class="modal-detail-item">
          <span>Eficiência:</span>
          <strong>${registro.kmPorLitro} km/L</strong>
      </div>
      <div class="modal-detail-item">
          <span>Combustível:</span>
          <strong>${registro.litros} L</strong>
      </div>
      <div class="modal-detail-item total">
          <span>Custo Total:</span>
          <strong>R$ ${registro.custo}</strong>
      </div>
  `;

  document.getElementById("modalOverlay").style.display = "flex";
}

// Função para fechar o modal
function fecharModal() {
  document.getElementById("modalOverlay").style.display = "none";
}

// Função para ocultar a tela de carregamento
function hideSplashScreen() {
  const splashScreen = document.getElementById("splash-screen");
  splashScreen.style.opacity = 0;
  setTimeout(() => {
    splashScreen.style.display = "none";
  }, 1000);
}

// Ocultar a tela de carregamento após 1 segundo
window.addEventListener("load", () => {
  setTimeout(hideSplashScreen, 1000);
});

// Fechar modal ao clicar fora
document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === document.getElementById("modalOverlay")) {
    fecharModal();
  }
});

// Função para limpar os dados do histórico
function limparDados() {
  localStorage.removeItem("historicoCombustivel");
  atualizarHistorico();
}

// Registro do Service Worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((registration) =>
        console.log("Service Worker registrado com sucesso")
      )
      .catch((err) => console.error("Falha no registro:", err));
  });
}
