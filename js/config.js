// js/config.js

// Versão atual da aplicação, visível para o utilizador e útil para versionamento de cache/storage.
export const APP_VERSION = "1.5.2"; // Incrementada a versão devido à refatoração de módulos

// Configurações e constantes globais da aplicação.
export const CONFIG = {
  APP_VERSION, // Inclui a versão da aplicação para fácil acesso
  STORAGE_KEYS: {
    VEHICLES: `fuelCalc_vehicles_v${APP_VERSION.substring(0, 3)}`, // Chaves de storage podem ser versionadas
    HISTORY: `fuelCalc_history_v${APP_VERSION.substring(0, 3)}`,
    APP_SETTINGS: `fuelCalc_settings_v${APP_VERSION.substring(0, 3)}`, // Incluindo idioma
  },
  DEFAULT_LANGUAGE: "pt-BR", // Idioma padrão da aplicação
  VALIDATION: {
    // Regras de validação para inputs
    MIN_EFFICIENCY: 1, // km/L
    MAX_EFFICIENCY: 70, // km/L (considerando motos e GNV)
    MIN_KM: 0,
    MAX_KM: 9999999, // Aumentado limite de KM
    MIN_PRICE: 0.1, // R$
    MAX_PRICE: 25, // R$ (considerando flutuações)
    MAX_TRIP_DISTANCE: 5000, // km (viagens mais longas)
    MIN_VEHICLE_NAME_LENGTH: 2,
    MAX_VEHICLE_NAME_LENGTH: 40,
    MAX_UBER_GAIN: 20000, // R$
  },
  HISTORY_DISPLAY_COUNT: 3, // Quantidade inicial de itens no histórico a serem exibidos
  HISTORY_LIMIT: 50, // Máximo de registos no histórico geral por tipo de veículo
  DEBOUNCE_DELAY: 350, // ms - Atraso para funções "debounced" (ex: atualização de estatísticas)
  NOTIFICATION_TIMEOUT: 4000, // ms (4 segundos) - Duração das notificações "toast"
  CHART_MAX_DAYS: 30, // Mostrar dados dos últimos 30 dias no gráfico de estatísticas
};

// Objeto contendo todas as strings de tradução para os idiomas suportados.
export const translations = {
  "pt-BR": {
    // Chaves para elementos HTML (identificados por data-translate-key)
    appTitle: "FuelCalc: Calculadora de Combustível",
    appDescriptionMeta:
      "Calculadora PWA de gastos com combustível, com estatísticas e gerenciamento de veículos.",
    appName: "FuelCalc",
    splashLoading: "Carregando sua calculadora...",
    appSubtitle: "Sua calculadora de combustível inteligente",
    manageVehiclesTitle: "Gerenciar Veículos",
    vehicleTypeCar: "Carro",
    vehicleTypeMotorcycle: "Moto",
    addVehicleBtn: "+ Adicionar Veículo",
    vehicleNameLabel: "Nome do Veículo:",
    vehicleNamePlaceholder: "Ex: Onix 1.0",
    vehicleEfficiencyLabel: "Eficiência (km/L):",
    vehicleEfficiencyPlaceholder: "Ex: 12.5",
    saveVehicleBtn: "Salvar Veículo",
    cancelBtn: "Cancelar",
    confirmBtn: "Confirmar",
    calculateTripTitle: "Calcular Gastos da Viagem",
    tripEfficiencyLabel: "Eficiência do Veículo (km/L):",
    tripEfficiencyPlaceholder: "Selecione um veículo ou informe",
    initialKmLabel: "KM Inicial:",
    initialKmPlaceholder: "Ex: 15000.0",
    finalKmLabel: "KM Final:",
    finalKmPlaceholder: "Ex: 15120.5",
    fuelPriceLabel: "Preço por Litro (R$):",
    fuelPricePlaceholder: "Ex: 5.89",
    tripGrossGainLabel: "Ganho Bruto da Viagem (R$, opcional):",
    tripGrossGainPlaceholder: "Ex: 75.50",
    calculateTripBtn: "Calcular Gastos",
    calculationResultTitle: "Resultado do Cálculo",
    distanceTraveledLabel: "Distância Percorrida:",
    fuelConsumedLabel: "Combustível Consumido:",
    totalFuelCostLabel: "Custo Total do Combustível:",
    netProfitLabel: "Lucro Líquido da Viagem:",
    tripHistoryTitle: "Histórico de Viagens",
    seeMoreBtn: "Ver Mais",
    minimizeBtn: "Minimizar",
    clearTypeHistoryBtn: "Limpar Histórico deste Tipo de Veículo",
    currentVehicleStatsTitle: "Estatísticas do Tipo de Veículo Atual",
    totalKmStatLabel: "Total de KM Rodados:",
    totalFuelCostStatLabel: "Total Gasto com Combustível:",
    avgConsumptionStatLabel: "Média de Consumo Geral:",
    fuelChartAriaLabel: "Gráfico de gastos diários com combustível",
    backupRestoreTitle: "Backup e Restauração de Dados",
    exportDataBtn: "📤 Exportar Dados",
    importDataBtn: "📥 Importar Dados",
    backupInfoText:
      "Exporte seus dados para um arquivo de backup ou importe de um arquivo salvo anteriormente.",
    clearAllDataBtn: "⚠️ Limpar Todos os Dados da Aplicação",
    clearAllDataWarning:
      "Atenção: Esta ação é irreversível e apagará todos os veículos e históricos.",
    allRightsReserved: "Todos os direitos reservados.",
    developedWithLove: "Desenvolvido com ❤️",
    versionLabel: "Versão:",
    tripDetailsModalTitle: "Detalhes da Viagem",
    confirmActionModalTitle: "Confirmar Ação",
    areYouSure: "Você tem certeza?",
    closeModalAriaLabel: "Fechar Detalhes",

    // Chaves para strings usadas no JavaScript (notificações, mensagens de erro, etc.)
    vehicleSelected: 'Veículo "{name}" selecionado.',
    vehicleSaved: 'Veículo "{name}" salvo com sucesso!',
    vehicleDeleted: 'Veículo "{name}" excluído.',
    vehicleExistsError: 'Já existe um {type} com o nome "{name}".',
    noVehiclesOfType: "Nenhum {type} cadastrado.",
    confirmDeleteVehicle: 'Tem certeza que deseja excluir o veículo "{name}"?',
    confirmClearTypeHistory:
      "Tem certeza que deseja limpar TODO o histórico de viagens para {type}s? Esta ação não pode ser desfeita.",
    confirmClearAllData:
      "TEM CERTEZA ABSOLUTA?\n\nEsta ação apagará TODOS os veículos, TODO o histórico e quaisquer outras configurações guardadas.\n\nEsta ação é IRREVERSÍVEL!",
    confirmFinalClearAllData:
      "CONFIRMAÇÃO FINAL:\n\nRealmente deseja apagar todos os dados? Não haverá como os recuperar.",
    clearAllDataCancelled: "Ação de limpeza total cancelada.",
    historyClearedSuccess: "Histórico de {type}s limpo com sucesso!",
    allDataClearedSuccess:
      "Todos os dados da aplicação foram apagados com sucesso!",
    allDataClearError: "Ocorreu um erro ao tentar limpar todos os dados.",
    importSuccess: "Dados importados com sucesso! A aplicação será atualizada.",
    importErrorFile: "Arquivo inválido. Por favor, selecione um arquivo .json.",
    importErrorFormat: "Formato de arquivo de backup inválido.",
    importErrorVehiclesFormat:
      "Dados de veículos no arquivo de backup estão mal formatados.",
    importErrorHistoryFormat:
      "Dados de histórico no arquivo de backup estão mal formatados.",
    importErrorProcessing:
      "Erro ao processar o arquivo de backup. Verifique o console para detalhes.",
    importNoValidData:
      "Nenhum dado válido de veículos ou histórico encontrado no arquivo.",
    exportSuccess: "Dados exportados com sucesso!",
    storageUnavailableError:
      "Armazenamento local não disponível. Não foi possível salvar os dados.",
    storageQuotaError:
      "Espaço de armazenamento local cheio. Não foi possível salvar. Tente limpar o histórico ou exportar dados.",
    storageSaveError: "Erro ao salvar dados ({key}).",
    storageLoadError:
      "Erro ao carregar dados locais ({key}). Alguns dados podem ter sido perdidos.",
    recordNotFound: "Registro não encontrado.",
    genericError: "Ocorreu um erro. Tente novamente.",
    chartDailyExpenseLabel: "Gasto Diário ({type}) (R$)",
    noHistoryForType: "Nenhum histórico para {type}s.",
    noRecordsToDisplay: "Nenhum registro para exibir (verifique 'Ver Mais').",
    manualOrUnspecified: "Manual/Não especificado", // Para histórico sem veículo selecionado
    costLabel: "Custo", // Usado na lista de histórico
    profitLabel: "Lucro", // Usado na lista de histórico
    selectVehicleAriaLabel: "Selecionar veículo {name}, {efficiency} km/L",
    deleteVehicleAriaLabel: "Excluir veículo {name}",
    tripDetailsAriaLabel: "Detalhes da viagem de {date}",
    // Labels para o modal de detalhes do histórico
    detailLabelDate: "Data/Hora",
    detailLabelVehicle: "Veículo",
    detailLabelType: "Tipo",
    detailLabelInitialKm: "KM Inicial",
    detailLabelFinalKm: "KM Final",
    detailLabelDistance: "Distância",
    detailLabelEfficiencyUsed: "Eficiência (no cálculo)",
    detailLabelFuelConsumed: "Combustível Consumido",
    detailLabelPricePerLiter: "Preço por Litro (na data)",
    detailLabelTotalFuelCost: "Custo Total Combustível",
    detailLabelGrossGain: "Ganho Bruto Informado",
    detailLabelNetProfit: "Lucro Líquido Estimado",
    // Mensagens de erro de validação
    vehicleNameLengthError:
      "Nome do veículo deve ter entre {min} e {max} caracteres.",
    vehicleEfficiencyError:
      "Eficiência deve ser um número entre {min} e {max} km/L.",
    invalidVehicleTypeError:
      "Tipo de veículo inválido. Selecione 'Carro' ou 'Moto'.",
    initialKmError: "KM Inicial inválido (entre {min} e {max}).",
    finalKmError:
      "KM Final inválido (deve ser maior que KM Inicial e até {max}).",
    maxTripDistanceError: "Distância da viagem excede o limite de {limit} km.",
    fuelPriceError: "Preço do combustível inválido (entre R${min} e R${max}).",
    tripGainError: "Ganho da viagem inválido (entre R$0 e R${max}).",
    currencyPlaceholder: "R$ --", // Placeholder para valores monetários não calculados
  },
  en: {
    // ... (traduções para inglês - preencher conforme necessário) ...
    // Mantenha a mesma estrutura de chaves que em "pt-BR"
    appTitle: "FuelCalc: Fuel Calculator",
    appDescriptionMeta:
      "PWA fuel expense calculator with statistics and vehicle management.",
    appName: "FuelCalc",
    splashLoading: "Loading your calculator...",
    appSubtitle: "Your smart fuel calculator",
    manageVehiclesTitle: "Manage Vehicles",
    vehicleTypeCar: "Car",
    vehicleTypeMotorcycle: "Motorcycle",
    addVehicleBtn: "+ Add Vehicle",
    vehicleNameLabel: "Vehicle Name:",
    vehicleNamePlaceholder: "Ex: Civic 1.8",
    vehicleEfficiencyLabel: "Efficiency (km/L or MPG):", // Ajustar unidade se necessário
    vehicleEfficiencyPlaceholder: "Ex: 12.5",
    saveVehicleBtn: "Save Vehicle",
    cancelBtn: "Cancel",
    confirmBtn: "Confirm",
    calculateTripTitle: "Calculate Trip Expenses",
    tripEfficiencyLabel: "Vehicle Efficiency (km/L or MPG):",
    tripEfficiencyPlaceholder: "Select a vehicle or enter manually",
    initialKmLabel: "Initial KM (or Miles):",
    initialKmPlaceholder: "Ex: 15000.0",
    finalKmLabel: "Final KM (or Miles):",
    finalKmPlaceholder: "Ex: 15120.5",
    fuelPriceLabel: "Price per Liter (or Gallon):",
    fuelPricePlaceholder: "Ex: 1.50",
    tripGrossGainLabel: "Gross Trip Earnings (optional):",
    tripGrossGainPlaceholder: "Ex: 75.50",
    calculateTripBtn: "Calculate Expenses",
    calculationResultTitle: "Calculation Result",
    distanceTraveledLabel: "Distance Traveled:",
    fuelConsumedLabel: "Fuel Consumed:",
    totalFuelCostLabel: "Total Fuel Cost:",
    netProfitLabel: "Net Trip Profit:",
    tripHistoryTitle: "Trip History",
    seeMoreBtn: "See More",
    minimizeBtn: "Minimize",
    clearTypeHistoryBtn: "Clear History for this Vehicle Type",
    currentVehicleStatsTitle: "Current Vehicle Type Statistics",
    totalKmStatLabel: "Total KM/Miles Driven:",
    totalFuelCostStatLabel: "Total Spent on Fuel:",
    avgConsumptionStatLabel: "Overall Average Consumption:",
    fuelChartAriaLabel: "Chart of daily fuel expenses",
    backupRestoreTitle: "Data Backup and Restore",
    exportDataBtn: "📤 Export Data",
    importDataBtn: "📥 Import Data",
    backupInfoText:
      "Export your data to a backup file or import from a previously saved file.",
    clearAllDataBtn: "⚠️ Clear All Application Data",
    clearAllDataWarning:
      "Warning: This action is irreversible and will delete all vehicles and histories.",
    allRightsReserved: "All rights reserved.",
    developedWithLove: "Developed with ❤️",
    versionLabel: "Version:",
    tripDetailsModalTitle: "Trip Details",
    confirmActionModalTitle: "Confirm Action",
    areYouSure: "Are you sure?",
    closeModalAriaLabel: "Close Details",

    vehicleSelected: 'Vehicle "{name}" selected.',
    vehicleSaved: 'Vehicle "{name}" saved successfully!',
    vehicleDeleted: 'Vehicle "{name}" deleted.',
    vehicleExistsError: 'A {type} with the name "{name}" already exists.',
    noVehiclesOfType: "No {type}s registered.",
    confirmDeleteVehicle:
      'Are you sure you want to delete the vehicle "{name}"?',
    confirmClearTypeHistory:
      "Are you sure you want to clear ALL trip history for {type}s? This action cannot be undone.",
    confirmClearAllData:
      "ARE YOU ABSOLUTELY SURE?\n\nThis action will delete ALL vehicles, ALL history, and any other saved settings.\n\nThis action is IRREVERSIBLE!",
    confirmFinalClearAllData:
      "FINAL CONFIRMATION:\n\nDo you really want to delete all data? There will be no way to recover it.",
    clearAllDataCancelled: "Full data clearing action cancelled.",
    historyClearedSuccess: "History for {type}s cleared successfully!",
    allDataClearedSuccess:
      "All application data has been cleared successfully!",
    allDataClearError: "An error occurred while trying to clear all data.",
    importSuccess: "Data imported successfully! The application will update.",
    importErrorFile: "Invalid file. Please select a .json file.",
    importErrorFormat: "Invalid backup file format.",
    importErrorVehiclesFormat: "Vehicle data in the backup file is malformed.",
    importErrorHistoryFormat: "History data in the backup file is malformed.",
    importErrorProcessing:
      "Error processing the backup file. Check console for details.",
    importNoValidData: "No valid vehicle or history data found in the file.",
    exportSuccess: "Data exported successfully!",
    storageUnavailableError:
      "Local storage is unavailable. Data could not be saved.",
    storageQuotaError:
      "Local storage space is full. Could not save. Try clearing history or exporting data.",
    storageSaveError: "Error saving data ({key}).",
    storageLoadError:
      "Error loading local data ({key}). Some data may have been lost.",
    recordNotFound: "Record not found.",
    genericError: "An error occurred. Please try again.",
    chartDailyExpenseLabel: "Daily Expense ({type})", // Moeda será adicionada pela função de formatação
    noHistoryForType: "No history for {type}s.",
    noRecordsToDisplay: "No records to display (check 'See More').",
    manualOrUnspecified: "Manual/Unspecified",
    costLabel: "Cost",
    profitLabel: "Profit",
    selectVehicleAriaLabel: "Select vehicle {name}, {efficiency} km/L", // ou MPG
    deleteVehicleAriaLabel: "Delete vehicle {name}",
    tripDetailsAriaLabel: "Trip details from {date}",
    detailLabelDate: "Date/Time",
    detailLabelVehicle: "Vehicle",
    detailLabelType: "Type",
    detailLabelInitialKm: "Initial KM/Miles",
    detailLabelFinalKm: "Final KM/Miles",
    detailLabelDistance: "Distance",
    detailLabelEfficiencyUsed: "Efficiency (at calculation)",
    detailLabelFuelConsumed: "Fuel Consumed",
    detailLabelPricePerLiter: "Price per Unit (at date)", // Litro ou Galão
    detailLabelTotalFuelCost: "Total Fuel Cost",
    detailLabelGrossGain: "Gross Earnings Reported",
    detailLabelNetProfit: "Estimated Net Profit",
    vehicleNameLengthError:
      "Vehicle name must be between {min} and {max} characters.",
    vehicleEfficiencyError:
      "Efficiency must be a number between {min} and {max}.",
    invalidVehicleTypeError:
      "Invalid vehicle type. Select 'Car' or 'Motorcycle'.",
    initialKmError: "Initial KM/Miles invalid (between {min} and {max}).",
    finalKmError:
      "Final KM/Miles invalid (must be greater than Initial and up to {max}).",
    maxTripDistanceError: "Trip distance exceeds the limit of {limit}.",
    fuelPriceError: "Fuel price invalid (between {min} and {max}).",
    tripGainError: "Trip earnings invalid (between 0 and {max}).",
    currencyPlaceholder: "$ --",
  },
};
