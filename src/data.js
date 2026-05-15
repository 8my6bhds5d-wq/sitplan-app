export const STATUS_CONFIG = {
  novo:         { label: "Novo",          emoji: "🔵", color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  tentativa:    { label: "Tentativa",     emoji: "📞", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  agendado:     { label: "Agendado",      emoji: "📅", color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
  apresentado:  { label: "Apresentado",   emoji: "✅", color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
  fechamento:   { label: "Fechamento",    emoji: "🤝", color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
  semInteresse: { label: "Sem Interesse", emoji: "❌", color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
  pausado:      { label: "Pausado",       emoji: "⏸️", color: "#9CA3AF", bg: "#F9FAFB", border: "#E5E7EB" },
  cliente:      { label: "Cliente",       emoji: "⭐", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
};

export const FUNIL_ORDER = [
  "novo", "tentativa", "agendado", "apresentado", "fechamento", "cliente", "semInteresse", "pausado"
];

export const LEADS_INICIAIS = [
  { id: 1,  nome: "Mineiro Junior", indicadoPor: "Tarcisio",      segmento: "Depósito de Bebidas",  telefone: "24999990001", status: "agendado",    proximoPasso: "Reunião amanhã 10h",   dataContato: "2025-05-10" },
  { id: 2,  nome: "Gilberto",       indicadoPor: "Eder",          segmento: "Mecânico",             telefone: "24999990002", status: "tentativa",   proximoPasso: "Ligar às 14h",         dataContato: "2025-05-11" },
  { id: 3,  nome: "Mauro",          indicadoPor: "Mineiro Junior", segmento: "Depósito de Bebidas", telefone: "24999990003", status: "apresentado", proximoPasso: "Aguardando resposta",  dataContato: "2025-05-09" },
  { id: 4,  nome: "Natan",          indicadoPor: "Mineiro Junior", segmento: "Barbeiro",            telefone: "24999990004", status: "novo",        proximoPasso: "",                     dataContato: "" },
  { id: 5,  nome: "Fernando",       indicadoPor: "Jeferson",      segmento: "Mecânico",             telefone: "24999990005", status: "pausado",     proximoPasso: "Aguardando cirurgia",  dataContato: "2025-05-08" },
  { id: 6,  nome: "Ariane",         indicadoPor: "Mineiro Junior", segmento: "Representante Coca",  telefone: "24999990006", status: "fechamento",  proximoPasso: "Proposta enviada",     dataContato: "2025-05-07" },
  { id: 7,  nome: "Junior",         indicadoPor: "Mineiro Junior", segmento: "Oficina",             telefone: "24999990007", status: "cliente",     proximoPasso: "",                     dataContato: "2025-04-30" },
  { id: 8,  nome: "Elton",          indicadoPor: "Mineiro Junior", segmento: "Guincho",             telefone: "24999990008", status: "semInteresse",proximoPasso: "",                     dataContato: "2025-05-06" },
  { id: 9,  nome: "Robson",         indicadoPor: "Eder Sales",    segmento: "Mecânico",             telefone: "24999990009", status: "agendado",    proximoPasso: "Reunião sexta 16h",    dataContato: "2025-05-11" },
  { id: 10, nome: "Danilo",         indicadoPor: "AnaRita",       segmento: "Mecânico",             telefone: "24999990010", status: "tentativa",   proximoPasso: "Tentar de tarde",      dataContato: "2025-05-12" },
];
