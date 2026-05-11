const fmt = (v) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pv = (s) => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0;

/** Nomes dos meses (mesmo índice que o <select id="mes">) */
const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const STORAGE_KEY = 'dre-maquinas-por-mes';

let nid = 200;

/** Estado por período YYYY-MM */
let porMes = {};

function defaultPayload() {
  return {
    A: [
      { id: 0, n: 'Máquina 0', c: 'ROYALTY', v: 0 },
      { id: 2, n: 'Máquina 2', c: 'JOSEPH', v: 1560 },
      { id: 3, n: 'Máquina 3', c: 'BOGO', v: 1500 },
      { id: 4, n: 'Máquina 4', c: 'TESTAROSSA', v: 1500 },
      { id: 5, n: 'Máquina 5', c: 'OUS', v: 1350 },
      { id: 9, n: 'Máquina 9', c: 'GRASSY 3 ESTAÇÕES', v: 1450 },
      { id: 10, n: 'Máquina 10', c: 'GRASSY 2 ESTAÇÕES', v: 1350 },
      { id: 11, n: 'Máquina 11', c: 'HAGI', v: 1200 },
      { id: 13, n: 'Máquina 13', c: 'KLAS', v: 1350 },
    ],
    N: [
      { id: 1, n: 'Máquina 1', p: 'Escritório', v: 0, pr: '' },
      { id: 6, n: 'Máquina 6', p: 'Escritório', v: 0, pr: '' },
      { id: 7, n: 'Máquina 7', p: 'NÃO EXISTE', v: 0, pr: '' },
      { id: 8, n: 'Máquina 8', p: 'Escritório', v: 0, pr: '' },
      { id: 12, n: 'Máquina 12', p: 'Escritório', v: 0, pr: '' },
      { id: 14, n: 'Máquina 14', p: 'Escritório', v: 0, pr: '' },
      { id: 15, n: 'Máquina 15', p: 'Escritório', v: 0, pr: '' },
    ],
    F: [
      { id: 1, d: 'Custo fixo 1', v: 0 },
      { id: 2, d: 'Custo fixo 2', v: 0 },
    ],
    V: [{ id: 1, d: 'Custo variável 1', v: 0 }],
    R: [],
    n1: 'Sócio 1',
    n2: 'Sócio 2',
    n3: 'Sócio 3',
  };
}

let A = [];
let N = [];
let F = [];
let V = [];
let R = [];

function assignArraysFromPayload(p) {
  A = JSON.parse(JSON.stringify(p.A));
  N = JSON.parse(JSON.stringify(p.N));
  F = JSON.parse(JSON.stringify(p.F));
  V = JSON.parse(JSON.stringify(p.V));
  R = JSON.parse(JSON.stringify(p.R));
}

function normalizePayload(raw) {
  if (!raw || typeof raw !== 'object') return defaultPayload();
  const d = defaultPayload();
  return {
    A: Array.isArray(raw.A) ? JSON.parse(JSON.stringify(raw.A)) : d.A,
    N: Array.isArray(raw.N) ? JSON.parse(JSON.stringify(raw.N)) : d.N,
    F: Array.isArray(raw.F) ? JSON.parse(JSON.stringify(raw.F)) : d.F,
    V: Array.isArray(raw.V) ? JSON.parse(JSON.stringify(raw.V)) : d.V,
    R: Array.isArray(raw.R) ? JSON.parse(JSON.stringify(raw.R)) : d.R,
    n1: typeof raw.n1 === 'string' ? raw.n1 : d.n1,
    n2: typeof raw.n2 === 'string' ? raw.n2 : d.n2,
    n3: typeof raw.n3 === 'string' ? raw.n3 : d.n3,
  };
}

/** Chave estável YYYY-MM a partir do valor numérico do <select id="mes"> (1–12). */
function mesKeyNum(ano, monthNum) {
  const a = String(ano || new Date().getFullYear());
  const n = parseInt(monthNum, 10);
  const m = n >= 1 && n <= 12 ? n : 1;
  return `${a}-${String(m).padStart(2, '0')}`;
}

/** Legado: nome do mês (texto da option). Prefira mesKeyNum. */
function mesKey(ano, nomeMes) {
  const i = MESES.indexOf(nomeMes);
  return mesKeyNum(ano, i >= 0 ? i + 1 : 1);
}

function emptyPayload() {
  return {
    A: [],
    N: [],
    F: [],
    V: [],
    R: [],
    n1: 'Sócio 1',
    n2: 'Sócio 2',
    n3: 'Sócio 3',
  };
}

function prevMesKey(key) {
  const parts = String(key).split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  if (!y || !m) return null;
  m -= 1;
  if (m < 1) {
    y -= 1;
    m = 12;
  }
  return `${y}-${String(m).padStart(2, '0')}`;
}

/** Mês ainda sem registro: copia A, N, F e nomes do mês anterior; V e R vazios. */
function payloadForNewMonth(key) {
  const pk = prevMesKey(key);
  if (pk) {
    const prevRaw = porMes[pk];
    if (prevRaw) {
      const pn = normalizePayload(prevRaw);
      const z = emptyPayload();
      return normalizePayload({
        A: JSON.parse(JSON.stringify(pn.A)),
        N: JSON.parse(JSON.stringify(pn.N)),
        F: JSON.parse(JSON.stringify(pn.F)),
        V: z.V,
        R: z.R,
        n1: pn.n1,
        n2: pn.n2,
        n3: pn.n3,
      });
    }
  }
  return normalizePayload(defaultPayload());
}

/** Jun–Dez/2026: sem chave OU só “carcaça” vazia (A/N/F vazios) — copia Maio/2026. */
function mes2026PrecisaCopiarMaio(key) {
  const raw = porMes[key];
  if (raw === undefined) return true;
  const p = normalizePayload(raw);
  return p.A.length === 0 && p.N.length === 0 && p.F.length === 0;
}

/** Preenche Maio–Dez/2026 com base em Maio; meses já editados (com A, N ou F) não são tocados. */
function seedMaioADezembro2026() {
  const keyMai = '2026-05';
  let changed = false;
  if (porMes[keyMai] === undefined) {
    porMes[keyMai] = normalizePayload(defaultPayload());
    changed = true;
  }
  const base = normalizePayload(porMes[keyMai]);
  const baseClone = () => JSON.parse(JSON.stringify(base));
  for (let m = 6; m <= 12; m++) {
    const key = `2026-${String(m).padStart(2, '0')}`;
    if (mes2026PrecisaCopiarMaio(key)) {
      porMes[key] = baseClone();
      changed = true;
    }
  }
  if (changed) savePorMesStorage();
}

function labelMesAno(key) {
  const [y, mm] = key.split('-');
  const mi = parseInt(mm, 10) - 1;
  const nome = MESES[mi] || mm;
  return `${nome} ${y}`;
}

function loadPorMesStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const o = JSON.parse(raw);
    if (o.nid != null) nid = o.nid;
    if (o.porMes && typeof o.porMes === 'object') porMes = o.porMes;
  } catch (_) {}
}

function savePorMesStorage() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nid, porMes }),
    );
  } catch (_) {}
}
