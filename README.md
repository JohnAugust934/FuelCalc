# 🚖 Uber Fuel Calculator

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue.svg)
![Version](https://img.shields.io/badge/Version-2.0.0-orange)

Aplicativo PWA para cálculo de gastos com combustível para motoristas de Uber/99 com estatísticas detalhadas e gerenciamento de veículos.

<img width="1491" alt="image" src="https://github.com/user-attachments/assets/388bd94b-91bf-469e-a376-2ef8c0e4d431" />



## ✨ Funcionalidades Principais

- 🛢️ Cálculo preciso de consumo de combustível
- 📈 Estatísticas mensais com gráficos interativos
- 🚗 Gerenciamento de múltiplos veículos
- 📅 Histórico de corridas com detalhes completos
- 📱 PWA (Funciona offline e instalável)
- 🌓 Modo escuro automático
- 💾 Armazenamento local dos dados

## 🛠️ Tecnologias Utilizadas

- **Frontend:**  
  ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
  ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
  
- **Bibliotecas:**  
  ![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)
  
- **Recursos:**  
  ![PWA](https://img.shields.io/badge/PWA-5A0FC8?logo=pwa&logoColor=white)
  ![LocalStorage](https://img.shields.io/badge/LocalStorage-007ACC?logo=html5&logoColor=white)

## 🚀 Como Usar

### Pré-requisitos
- Navegador moderno (Chrome, Firefox, Edge)
- Conexão HTTPS para instalação PWA

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/uber-fuel-calculator.git

# Entre no diretório
cd uber-fuel-calculator

# Instale as dependências (opcional)
npm install

# Inicie o servidor local (ou abra index.html diretamente)
npx serve
```

### Como Utilizar
1. **Adicionar Veículo**  
   - Clique em "+ Adicionar Veículo"
   - Preencha nome e eficiência (km/L)

2. **Calcular Corrida**  
   - Insira KM inicial e final
   - Selecione veículo ou insira eficiência manualmente
   - Informe preço do combustível

3. **Ver Histórico**  
   - Clique em qualquer registro para ver detalhes
   - Use o gráfico para analisar padrões de consumo

4. **Instalar como App**  
   - No Chrome/Firefox: clique em "Instalar" na barra de endereços
   - Funciona offline após primeira visita

## 📂 Estrutura do Projeto
```
uber-fuel-calculator/
├── index.html          # Página principal
├── styles.css          # Estilos globais
├── app.js              # Lógica principal
├── manifest.json       # Configuração PWA
├── sw.js               # Service Worker
└── icons/              # Ícones para PWA
    ├── icon-192x192.png
    └── icon-512x512.png
```

## 🤝 Como Contribuir
1. Faça um Fork do projeto
2. Crie sua Branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a Branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

**Desenvolvido com ❤️ por [João Augusto]**  
✨ Contribuições são sempre bem-vindas! ✨
