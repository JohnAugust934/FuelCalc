# ⛽ FuelCalc: Sua Calculadora de Combustível Inteligente PWA

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![PWA Ready](https://img.shields.io/badge/PWA-Pronto-blueviolet.svg)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/JohnAugust934/FuelCalc)
![Version](https://img.shields.io/badge/Versão-1.5.4-orange)

**FuelCalc** é uma aplicação web progressiva (PWA) projetada para ajudar motoristas (especialmente de aplicativos como Uber e 99) a calcular e gerenciar seus gastos com combustível de forma eficiente. A aplicação oferece estatísticas detalhadas, gerenciamento de múltiplos veículos, histórico de viagens e muito mais, tudo com uma interface moderna e responsiva.

![Imagem da tela principal do FuelCalc](https://raw.githubusercontent.com/JohnAugust934/FuelCalc/main/screenshots/screenshot1.png)
_Tela principal e gerenciamento de veículos._

## ✨ Funcionalidades Principais

- 🚗 **Gerenciamento de Múltiplos Veículos:** Adicione, selecione e exclua diferentes veículos (carros e motos), cada um com sua própria eficiência de combustível.
- ⛽ **Cálculo Preciso de Consumo:** Calcule os litros consumidos e o custo total da viagem com base na quilometragem, eficiência do veículo e preço do combustível.
- 💰 **Cálculo de Lucro (Opcional):** Informe o ganho bruto da viagem para calcular o lucro líquido.
- 📊 **Estatísticas Detalhadas:** Visualize estatísticas por tipo de veículo, incluindo total de KM rodados, total gasto com combustível e média de consumo geral. Inclui um gráfico de gastos diários.
- 📅 **Histórico Completo de Viagens:** Mantenha um histórico de todas as suas viagens calculadas, com detalhes completos acessíveis através de um modal.
- 🌐 **Internacionalização (i18n):** Suporte para Português (Brasil) (padrão) e Inglês, com seletor de idioma na interface.
- 💾 **Persistência de Dados Local:** Todos os dados de veículos e histórico são salvos localmente no seu navegador usando `localStorage`.
- 📤📥 **Backup e Restauração:** Exporte todos os seus dados para um ficheiro JSON e importe-os posteriormente.
- 🗑️ **Limpeza de Dados:** Opções para limpar o histórico de um tipo de veículo específico ou limpar completamente todos os dados da aplicação (com dupla confirmação).
- 📱 **Progressive Web App (PWA):**
  - Instalável na tela inicial do seu dispositivo (desktop e mobile).
  - Funciona offline para funcionalidades básicas após o primeiro carregamento.
  - Interface responsiva que se adapta a diferentes tamanhos de ecrã.
- 🎨 **Interface Moderna:** Tema escuro elegante e componentes de UI customizados para notificações e modais.
- 🔢 **Exibição de Versão:** A versão atual da aplicação é exibida no rodapé.

## 🛠️ Tecnologias Utilizadas

- **Frontend:**
  - ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
  - ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
  - ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) (ES6+ com Classes)
- **Bibliotecas:**
  - ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white) (para gráficos de estatísticas)
- **Recursos PWA:**
  - Service Workers
  - Web App Manifest
- **Armazenamento:**
  - LocalStorage

## 🚀 Como Usar

### Online (Recomendado)

Acesse a aplicação diretamente através do link do GitHub Pages:
[https://johnaugust934.github.io/FuelCalc/](https://johnaugust934.github.io/FuelCalc/)

### Instalação Local (Para Desenvolvimento)

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/JohnAugust934/FuelCalc.git](https://github.com/JohnAugust934/FuelCalc.git)
    ```
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd FuelCalc
    ```
3.  **Abra o `index.html` no seu navegador:**
    - Simplesmente abra o ficheiro `index.html` diretamente no seu navegador.
    - Ou, para uma melhor simulação do ambiente de servidor e para o Service Worker funcionar corretamente localmente, use um servidor local simples. Se tiver Node.js instalado:
      ```bash
      npx serve .
      ```
      E acesse o endereço fornecido (geralmente `http://localhost:3000`).

### Utilização da Aplicação:

1.  **Selecione o Idioma:** Use os botões 🇧🇷 PT-BR / 🇬🇧 EN no canto superior direito para escolher o seu idioma preferido.
2.  **Gerencie seus Veículos:**
    - Escolha entre "Carro" ou "Moto".
    - Clique em "+ Adicionar Veículo" para inserir o nome e a eficiência (km/L).
    - Selecione um veículo da lista para usar sua eficiência automaticamente nos cálculos.
3.  **Calcule uma Viagem:**
    - Preencha os campos "KM Inicial", "KM Final", "Eficiência" (pode ser preenchido automaticamente ao selecionar um veículo) e "Preço por Litro".
    - Opcionalmente, adicione o "Ganho Bruto da Viagem".
    - Clique em "Calcular Gastos". O resultado será exibido e a viagem guardada no histórico.
4.  **Consulte Histórico e Estatísticas:**
    - As seções de histórico e estatísticas aparecerão abaixo dos cálculos para o tipo de veículo selecionado.
    - Clique num item do histórico para ver detalhes.
    - Use os botões "Ver Mais" / "Minimizar" para controlar a exibição do histórico.
5.  **Backup e Restauração:**
    - Na seção "Backup e Restauração", você pode exportar todos os seus dados ou importar de um ficheiro de backup.
    - Há também uma opção para limpar todos os dados da aplicação (use com cuidado!).
6.  **Instalar como App (PWA):**
    - Em navegadores compatíveis (Chrome, Edge, Firefox em Android), procure pelo ícone de instalação na barra de endereço ou no menu para adicionar o FuelCalc à sua tela inicial e usá-lo como um aplicativo nativo.

## 📂 Estrutura do Projeto
