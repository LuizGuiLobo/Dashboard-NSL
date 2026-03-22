// ══════════════════════════════════════════════════
// MÓDULO: CONSTANTS
// SETORES, SETOR_COLORS e outras constantes
// Claude Code: claude src/js/constants.js
// ══════════════════════════════════════════════════

// CONSTANTES
// ══════════════════════════════════════════
const SETORES = ['Bomba Injetora','Bomba de Alta','Injetores Mecânicos','Injetores Eletrônicos','Veículo Diesel','Turbinas'];
// STATUS_LIST e STATUS_COL removidos — etapas agora são dinâmicas via etapasKanban
const SETOR_COLORS = {'Bomba Injetora':'#3b82f6','Bomba de Alta':'#f59e0b','Injetores Mecânicos':'#10b981','Injetores Eletrônicos':'#8b5cf6','Veículo Diesel':'#ef4444','Turbinas':'#06b6d4'};

let osData = [];
let camposConfig = [];
let etapasKanban = [];
let operadoresDB = []; // operadores cadastrados por setor
let setorAtivo = SETORES[0];
let dragId = null;
let tipoEntrada = 'veiculo';
let camposTemp = [];
let etapasTemp = [];