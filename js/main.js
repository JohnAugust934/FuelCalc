// js/main.js
// Ponto de entrada principal da aplicação FuelCalc.
// Este ficheiro é responsável por importar e instanciar o AppManager,
// que por sua vez inicializa todos os outros módulos e a aplicação.

// Importa a classe AppManager do seu respetivo módulo.
// O caminho './managers/AppManager.js' é relativo à localização de main.js (dentro da pasta js/).
import { AppManager } from "./managers/AppManager.js";

// Garante que o DOM (Document Object Model) esteja completamente carregado e parseado
// antes de tentar instanciar o AppManager e interagir com elementos da página.
// Isto previne erros que podem ocorrer se o script tentar aceder a elementos
// que ainda não foram criados pelo navegador.
if (document.readyState === "loading") {
  // Se o DOM ainda estiver a carregar, adiciona um listener para o evento DOMContentLoaded.
  document.addEventListener("DOMContentLoaded", () => {
    // Cria uma nova instância do AppManager, o que inicia a aplicação.
    new AppManager();
    console.log("FuelCalc App inicializada (após DOMContentLoaded).");
  });
} else {
  // Se o DOM já estiver carregado (interactive ou complete), inicializa a aplicação imediatamente.
  new AppManager();
  console.log("FuelCalc App inicializada (DOM já carregado).");
}
