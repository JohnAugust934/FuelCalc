const form = document.getElementById("fuelForm");
const resultadoDiv = document.getElementById("resultado");
const modalOverlay = document.getElementById("modalOverlay");
const calcularGastosBtn = document.getElementById("calcularGastosBtn");
const limparHistoricoBtn = document.getElementById("limparHistoricoBtn");
const fecharModalBtn = document.getElementById("fecharModalBtn");
const adicionarVeiculoBtn = document.getElementById("adicionarVeiculoBtn");
const salvarVeiculoBtn = document.getElementById("salvarVeiculoBtn");
const vehicleTypeButtons = document.querySelectorAll(
  ".vehicle-type-buttons .uber-button"
);

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
  vehicleTypeButtons.forEach((button) => {
    button.classList.remove("selected");
  });
  document
    .querySelector(`.vehicle-type-buttons .uber-button[data-tipo="${tipo}"]`)
    .classList.add("selected");
}

// Adiciona event listeners para os botões de seleção de veículo
vehicleTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const tipo = button.getAttribute("data-tipo");
    selecionarTipoVeiculo(tipo);
  });
});

// Função para mostrar o formulário de adicionar veículo
function mostrarFormVeiculo() {
  document.getElementById("vehicleForm").style.display = "block";
}

// Função para esconder o formulário de adicionar veículo
function esconderFormVeiculo() {
  document.getElementById("vehicleForm").style.display = "none";
  limparFormularioVeiculo();
}

// Função para limpar o formulário de adicionar veículo
function limparFormularioVeiculo() {
  document.getElementById("vehicleName").value = "";
  document.getElementById("vehicleEfficiency").value = "";
  document.getElementById("vehicleType").value = "carro"; // ou o valor padrão desejado
}

// Função para salvar um novo veículo
function salvarVeiculo() {
  const nome = document.getElementById("vehicleName").value;
  const eficiencia = parseFloat(document.getElementById("vehicleEfficiency").value);
  const tipo = document.getElementById("vehicleType").value;

  // Validação dos campos
  if (!nome) {
    mostrarErro("O nome do veículo não pode estar vazio!");
    return;
  }
  if (isNaN(eficiencia) || eficiencia <= 0) {
    mostrarErro("A eficiência do veículo deve ser um número maior que zero!");
    return;
  }
  if (!tipo) {
    mostrarErro("O tipo do veículo não pode estar vazio!");
    return;
  }

  const vehicle = {
    nome: nome,
    eficiencia: eficiencia,
    tipo: tipo,
    id: Date.now(),
  };

  // Recupera os veículos do localStorage, adiciona o novo veículo e salva novamente
  const veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
  veiculos.push(vehicle);
  localStorage.setItem("veiculos", JSON.stringify(veiculos));

  // Atualiza a lista de veículos e esconde o formulário
  carregarVeiculos();
  esconderFormVeiculo();
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
            <button class="delete-button" onclick="excluirVeiculo(event, ${
              veiculo.id
            })">Excluir</button>
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
    const historico = JSON.parse(localStorage.getItem("historicoCombustivel")) || [];

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
    document.getElementById("totalGasto").textContent = `R$ ${totalGasto.toFixed(2)}`;

    const statsSection = document.getElementById("statsSection");

    // Mostra ou oculta a seção de estatísticas com base na presença de registros
    if (historicoFiltrado.length > 0) {
        statsSection.style.display = "block";
    } else {
        statsSection.style.display = "none";
    }

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

// Função para exibir o resultado do cálculo
function exibirResultado(distancia, litros, custo, ganho) {
  document.getElementById("distancia").textContent = `${distancia.toFixed(
    1
  )} km`;
  document.getElementById("litros").textContent = `${litros.toFixed(1)} L`;
  document.getElementById("custo").textContent = `R$ ${custo.toFixed(2)}`;
  if (ganho !== null) {
    document.getElementById("ganho").textContent = `R$ ${ganho.toFixed(2)}`;
  } else {
    document.getElementById("ganho").textContent = "N/A";
  }
  resultadoDiv.style.display = "block"; // Mostra o card de resultado
}

// Função para mostrar uma mensagem de erro
function mostrarErro(mensagem) {
  alert(mensagem);
}

// Função para salvar o histórico de preços
function salvarHistorico(preco, kmInicial, kmFinal, kmPorLitro, ganho) {
  const historico = JSON.parse(localStorage.getItem("historicoCombustivel")) || [];
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

  if (ganho !== null) {
    registro.ganho = ganho.toFixed(2);
  }

  historico.unshift(registro);
  if (historico.length > 25) historico.pop();

  localStorage.setItem("historicoCombustivel", JSON.stringify(historico));
  atualizarHistorico();
}

// Função para atualizar o histórico de preços
function atualizarHistorico() {
    const historico = JSON.parse(localStorage.getItem("historicoCombustivel")) || [];

    // Filtra o histórico pelo tipo de veículo
    const historicoFiltrado = historico.filter(
        (item) => item.tipo === tipoVeiculoAtual
    );

    const lista = document.getElementById("historicoPrecos");
    const verMaisBtn = document.getElementById("verMaisBtn");
    const minimizarBtn = document.getElementById("minimizarBtn");
    const historySection = document.getElementById("historySection");

    // Exibe apenas os 3 últimos registros
    const historicoExibido = historicoFiltrado.slice(0, 3);
    lista.innerHTML = historicoExibido
        .map(
            (item, index) => `
            <li data-index="${index}" onclick="mostrarDetalhes(${index})">
                <span>${item.data}</span>
                <strong>R$ ${item.preco.toFixed(2)}</strong>
            </li>
        `
        )
        .join("");

    // Mostra ou oculta a seção de histórico com base na presença de registros
    if (historicoFiltrado.length > 0) {
        historySection.style.display = "block";
    } else {
        historySection.style.display = "none";
    }

    // Mostra o botão "Ver Mais" se houver 4 ou mais registros
    if (historicoFiltrado.length > 3) {
        verMaisBtn.style.display = "block";
        minimizarBtn.style.display = "none";
    } else {
        verMaisBtn.style.display = "none";
        minimizarBtn.style.display = "none";
    }

    // Adiciona um event listener ao botão "Ver Mais"
    verMaisBtn.onclick = () => {
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
        verMaisBtn.style.display = "none"; // Esconde o botão após clicar
        minimizarBtn.style.display = "block"; // Mostra o botão "Minimizar"
    };

    // Adiciona um event listener ao botão "Minimizar"
    minimizarBtn.onclick = () => {
        lista.innerHTML = historicoExibido
            .map(
                (item, index) => `
                <li data-index="${index}" onclick="mostrarDetalhes(${index})">
                    <span>${item.data}</span>
                    <strong>R$ ${item.preco.toFixed(2)}</strong>
                </li>
            `
            )
            .join("");
        verMaisBtn.style.display = "block"; // Mostra o botão "Ver Mais"
        minimizarBtn.style.display = "none"; // Esconde o botão "Minimizar"
    };
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
      <div class="modal-detail-item">
          <span>Custo Total:</span>
          <strong>R$ ${registro.custo}</strong>
      </div>
      <div class="modal-detail-item total">
          <span>Ganho na Uber:</span>
          <strong>R$ ${registro.ganho}</strong>
      </div>
  `;

  modalOverlay.style.display = "flex";
}

// Função para fechar o modal
function fecharModal() {
  modalOverlay.style.display = "none";
}

// Função para ocultar a tela de carregamento
function hideSplashScreen() {
  const splashScreen = document.getElementById("splash-screen");
  splashScreen.style.opacity = 0;
  setTimeout(() => {
    splashScreen.style.display = "none";
  }, 1000);
}

// Função para limpar os dados do histórico
function limparDados() {
  const historico = JSON.parse(localStorage.getItem("historicoCombustivel")) || [];
  const historicoFiltrado = historico.filter(item => item.tipo !== tipoVeiculoAtual);
  localStorage.setItem("historicoCombustivel", JSON.stringify(historicoFiltrado));
  atualizarHistorico();
  atualizarEstatisticas(); // Atualiza as estatísticas após limpar o histórico
}

// Função para limpar o formulário
function limparFormulario() {
  form.reset();
}

// Função para validar os campos
function validarCampos(
  kmInicial,
  kmFinal,
  kmPorLitro,
  precoCombustivel,
  ganhoUber
) {
  if (isNaN(kmInicial) || kmInicial <= 0) {
    mostrarErro("KM Inicial deve ser um número maior que zero!");
    return false;
  }
  if (isNaN(kmFinal) || kmFinal <= kmInicial) {
    mostrarErro("KM Final deve ser um número maior que KM Inicial!");
    return false;
  }
  if (isNaN(kmPorLitro) || kmPorLitro <= 0) {
    mostrarErro("KM por Litro deve ser um número maior que zero!");
    return false;
  }
  if (isNaN(precoCombustivel) || precoCombustivel <= 0) {
    mostrarErro("Preço do Combustível deve ser um número maior que zero!");
    return false;
  }
  if (ganhoUber !== "" && (isNaN(ganhoUber) || ganhoUber < 0)) {
    mostrarErro("Ganho na Uber deve ser um número maior ou igual a zero!");
    return false;
  }
  return true;
}

// Função para calcular os gastos
function calcularGastos() {
  const kmInicial = parseFloat(document.getElementById("kmInicial").value);
  const kmFinal = parseFloat(document.getElementById("kmFinal").value);
  const kmPorLitro = parseFloat(document.getElementById("kmPorLitro").value);
  const precoCombustivel = parseFloat(document.getElementById("precoCombustivel").value);
  const ganhoUber = document.getElementById("ganhoUber").value ? parseFloat(document.getElementById("ganhoUber").value) : null;

  // Validação dos campos
  if (!validarCampos(kmInicial, kmFinal, kmPorLitro, precoCombustivel, ganhoUber)) {
    return;
  }

  const distancia = kmFinal - kmInicial;
  const litros = distancia / kmPorLitro;
  const custo = litros * precoCombustivel;
  const ganho = ganhoUber !== null ? ganhoUber - custo : null;

  exibirResultado(distancia, litros, custo, ganho);
  salvarHistorico(precoCombustivel, kmInicial, kmFinal, kmPorLitro, ganho);
  atualizarEstatisticas();
  limparFormulario();
}

// Registro do Service Worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((registration) => {
        console.log("Service Worker registrado com sucesso");
      })
      .catch((err) => {
        console.error("Falha no registro:", err);
        alert(
          "Falha ao registrar o Service Worker. Por favor, tente novamente."
        );
      });
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  selecionarTipoVeiculo("carro"); // Seleciona carro por padrão
  setTimeout(hideSplashScreen, 1000); // Ocultar a tela de carregamento após 1 segundo
  atualizarHistorico(); // Atualiza o histórico ao carregar a página
  atualizarEstatisticas(); // Atualiza as estatísticas ao carregar a página
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  calcularGastos();
});

calcularGastosBtn.addEventListener("click", (e) => {
  e.preventDefault();
  calcularGastos();
});

limparHistoricoBtn.addEventListener("click", limparDados);
fecharModalBtn.addEventListener("click", fecharModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) {
    fecharModal();
  }
});

// Event listener para o botão de adicionar veículo
adicionarVeiculoBtn.addEventListener("click", mostrarFormVeiculo);

// Event listener para o botão de salvar veículo
salvarVeiculoBtn.addEventListener("click", salvarVeiculo);

// Event listener para o botão de cancelar veículo
document.getElementById("cancelarVeiculoBtn").addEventListener("click", esconderFormVeiculo);

document.addEventListener('DOMContentLoaded', function() {
    const historicoPrecos = document.getElementById('historicoPrecos');
    const verMaisBtn = document.getElementById('verMaisBtn');
    const minimizarBtn = document.getElementById('minimizarBtn');

    function mostrarHistoricoCompleto() {
        // Lógica para exibir todos os itens do histórico
        const items = historicoPrecos.querySelectorAll('li');
        items.forEach(item => item.style.display = 'list-item');
        verMaisBtn.style.display = 'none';
        minimizarBtn.style.display = 'inline-block';
    }

    function minimizarHistorico() {
        // Lógica para exibir apenas os 3 primeiros itens do histórico
        const items = historicoPrecos.querySelectorAll('li');
        items.forEach((item, index) => {
            item.style.display = index < 3 ? 'list-item' : 'none';
        });
        verMaisBtn.style.display = 'inline-block';
        minimizarBtn.style.display = 'none';
    }

    verMaisBtn.addEventListener('click', mostrarHistoricoCompleto);
    minimizarBtn.addEventListener('click', minimizarHistorico);

    // Inicialmente, exibir apenas os 3 primeiros itens
    minimizarHistorico();
});
