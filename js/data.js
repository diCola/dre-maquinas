const fmt = (v) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pv = (s) => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0;
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const STORAGE_KEY    = 'dre-maquinas-v3';
const STORAGE_KEY_V2 = 'dre-maquinas-por-mes';

let nid = 200;

/**
 * Catálogo global de máquinas — identidade e campos descritivos.
 * [{id, n, c, p, pr}]
 *   n  = nome
 *   c  = cliente (quando ativa)
 *   p  = situação (quando em negociação)
 *   pr = previsão de ativação (texto livre)
 */
let maqCatalogo = [];

/**
 * Histórico de status por máquina.
 * {[id]: [{from: 'YYYY-MM', status: 'ativa'|'negociacao'}]}
 * Cada entrada indica "a partir deste mês, o status é X".
 * Automaticamente, todos os meses ≥ from herdam o status sem nenhuma cópia.
 */
let maqStatus = {};

/**
 * Dados por período.
 * {[mesKey]: {maqV: {[id]: v}, F: [], V: [], R: [], n1, n2, n3}}
 *   maqV = valor R$/mês por máquina (herdado do mês anterior se ausente)
 */
let porMes = {};

// Globais de conveniência para F/V/R — apontam para porMes[key].F/V/R (mesma referência).
let F = [];
let V = [];
let R = [];

// ─── Helpers de chave de mês ─────────────────────────────────────────────────

function mesKeyNum(ano, monthNum) {
  const a = String(ano || new Date().getFullYear());
  const n = parseInt(monthNum, 10);
  const m = n >= 1 && n <= 12 ? n : 1;
  return `${a}-${String(m).padStart(2, '0')}`;
}

function mesKey(ano, nomeMes) {
  const i = MESES.indexOf(nomeMes);
  return mesKeyNum(ano, i >= 0 ? i + 1 : 1);
}

function prevMesKey(key) {
  const parts = String(key).split('-');
  let y = parseInt(parts[0], 10);
  let m = parseInt(parts[1], 10);
  if (!y || !m) return null;
  m -= 1;
  if (m < 1) { y -= 1; m = 12; }
  return `${y}-${String(m).padStart(2, '0')}`;
}

function labelMesAno(key) {
  const [y, mm] = key.split('-');
  const mi = parseInt(mm, 10) - 1;
  return `${MESES[mi] || mm} ${y}`;
}

// ─── API de máquinas ─────────────────────────────────────────────────────────

/** Retorna o status ('ativa'|'negociacao') da máquina no mês, ou null. */
function statusAt(id, mk) {
  const t = maqStatus[id];
  if (!t || !t.length) return null;
  const relevant = t.filter(e => e.from <= mk);
  if (!relevant.length) return null;
  return relevant.reduce((a, b) => (a.from >= b.from ? a : b)).status;
}

/**
 * Retorna o valor R$/mês da máquina no mês.
 * Busca o valor mais recente ≤ mk, sem copiar dados entre meses.
 */
function valorAt(id, mk) {
  let key = mk;
  for (let i = 0; i < 48; i++) {
    const pm = porMes[key];
    if (pm && pm.maqV && pm.maqV[id] !== undefined) return pm.maqV[id];
    const prev = prevMesKey(key);
    if (!prev) break;
    key = prev;
  }
  return 0;
}

/** Grava override de valor para um mês específico. */
function setValorAt(id, mk, v) {
  ensureMesPayload(mk);
  porMes[mk].maqV[id] = v;
}

/**
 * Registra mudança de status a partir de fromKey.
 * Todos os meses ≥ fromKey que não tenham outro registro posterior usarão este status.
 */
function setStatusEntry(id, fromKey, status) {
  if (!maqStatus[id]) maqStatus[id] = [];
  maqStatus[id] = maqStatus[id].filter(e => e.from !== fromKey);
  maqStatus[id].push({ from: fromKey, status });
  maqStatus[id].sort((a, b) => a.from.localeCompare(b.from));
}

// ─── Payload por mês ─────────────────────────────────────────────────────────

function ensureMesPayload(key) {
  if (!porMes[key]) {
    porMes[key] = { maqV: {}, F: [], V: [], R: [], n1: 'Sócio 1', n2: 'Sócio 2', n3: 'Sócio 3' };
  }
  if (!porMes[key].maqV) porMes[key].maqV = {};
}

/**
 * Aplica os dados do mês `key` nos globais F/V/R e nos inputs de nomes.
 * F/V/R são a mesma referência de porMes[key].F/V/R — edições in-place ficam em sync.
 */
function applyMonthKey(key) {
  ensureMesPayload(key);
  const pm = porMes[key];

  // Herda F de mês anterior se vazio
  if (!pm.F || pm.F.length === 0) {
    const pk = prevMesKey(key);
    if (pk && porMes[pk] && porMes[pk].F && porMes[pk].F.length > 0) {
      pm.F = JSON.parse(JSON.stringify(porMes[pk].F));
    } else {
      pm.F = [{ id: 1, d: 'Custo fixo 1', v: 0 }, { id: 2, d: 'Custo fixo 2', v: 0 }];
    }
  }
  if (!pm.V) pm.V = [];
  if (!pm.R) pm.R = [];

  F = pm.F;
  V = pm.V;
  R = pm.R;

  const n1el = document.getElementById('n1');
  const n2el = document.getElementById('n2');
  const n3el = document.getElementById('n3');
  if (n1el) n1el.value = pm.n1 || 'Sócio 1';
  if (n2el) n2el.value = pm.n2 || 'Sócio 2';
  if (n3el) n3el.value = pm.n3 || 'Sócio 3';
}

// ─── Dados padrão ─────────────────────────────────────────────────────────────

function initDefaultData() {
  if (maqCatalogo.length > 0) return;

  const from = '2026-05';

  const defaultAtivas = [
    { id: 0,  n: 'Máquina 0',  c: 'ROYALTY',           v: 0    },
    { id: 2,  n: 'Máquina 2',  c: 'JOSEPH',             v: 1560 },
    { id: 3,  n: 'Máquina 3',  c: 'BOGO',               v: 1500 },
    { id: 4,  n: 'Máquina 4',  c: 'TESTAROSSA',         v: 1500 },
    { id: 5,  n: 'Máquina 5',  c: 'OUS',                v: 1350 },
    { id: 9,  n: 'Máquina 9',  c: 'GRASSY 3 ESTAÇÕES',  v: 1450 },
    { id: 10, n: 'Máquina 10', c: 'GRASSY 2 ESTAÇÕES',  v: 1350 },
    { id: 11, n: 'Máquina 11', c: 'HAGI',               v: 1200 },
    { id: 13, n: 'Máquina 13', c: 'KLAS',               v: 1350 },
  ];
  const defaultNeg = [
    { id: 1,  n: 'Máquina 1',  p: 'Escritório',  v: 0, pr: '' },
    { id: 6,  n: 'Máquina 6',  p: 'Escritório',  v: 0, pr: '' },
    { id: 7,  n: 'Máquina 7',  p: 'NÃO EXISTE',  v: 0, pr: '' },
    { id: 8,  n: 'Máquina 8',  p: 'Escritório',  v: 0, pr: '' },
    { id: 12, n: 'Máquina 12', p: 'Escritório',  v: 0, pr: '' },
    { id: 14, n: 'Máquina 14', p: 'Escritório',  v: 0, pr: '' },
    { id: 15, n: 'Máquina 15', p: 'Escritório',  v: 0, pr: '' },
  ];

  for (const m of defaultAtivas) {
    maqCatalogo.push({ id: m.id, n: m.n, c: m.c, p: '', pr: '' });
    setStatusEntry(m.id, from, 'ativa');
    setValorAt(m.id, from, m.v);
  }
  for (const m of defaultNeg) {
    maqCatalogo.push({ id: m.id, n: m.n, c: '', p: m.p, pr: m.pr || '' });
    setStatusEntry(m.id, from, 'negociacao');
    setValorAt(m.id, from, m.v);
  }

  ensureMesPayload(from);
  porMes[from].F = [{ id: 1, d: 'Custo fixo 1', v: 0 }, { id: 2, d: 'Custo fixo 2', v: 0 }];
  porMes[from].V = [{ id: 1, d: 'Custo variável 1', v: 0 }];
}

// ─── Persistência ─────────────────────────────────────────────────────────────

function savePorMesStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nid, porMes, maqCatalogo, maqStatus }));
  } catch (_) {}
}

function loadPorMesStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const o = JSON.parse(raw);
      if (o.nid != null) nid = o.nid;
      if (o.porMes && typeof o.porMes === 'object') porMes = o.porMes;
      if (Array.isArray(o.maqCatalogo)) maqCatalogo = o.maqCatalogo;
      if (o.maqStatus && typeof o.maqStatus === 'object') maqStatus = o.maqStatus;
      return;
    }
    // Tentar migrar formato v2
    const oldRaw = localStorage.getItem(STORAGE_KEY_V2);
    if (oldRaw) migrateFromV2(JSON.parse(oldRaw));
  } catch (_) {}
}

/**
 * Migra dados do formato v2 (A/N arrays por mês) para o novo formato.
 * Detecta mudanças de status entre meses consecutivos e cria entradas no histórico.
 */
function migrateFromV2(old) {
  if (!old || !old.porMes) return;
  if (old.nid != null) nid = old.nid;

  const sortedKeys = Object.keys(old.porMes).sort();
  if (!sortedKeys.length) return;

  let prevAIds = new Set();

  for (const key of sortedKeys) {
    const p = old.porMes[key] || {};
    const curA = Array.isArray(p.A) ? p.A : [];
    const curN = Array.isArray(p.N) ? p.N : [];
    const curAIds = new Set(curA.map(m => m.id));

    for (const m of curA) {
      if (!maqCatalogo.find(x => x.id === m.id)) {
        maqCatalogo.push({ id: m.id, n: m.n || '', c: m.c || '', p: '', pr: '' });
      } else {
        const cat = maqCatalogo.find(x => x.id === m.id);
        if (m.n) cat.n = m.n;
        if (m.c) cat.c = m.c;
      }
      if (!maqStatus[m.id] || !prevAIds.has(m.id)) {
        setStatusEntry(m.id, key, 'ativa');
      }
      setValorAt(m.id, key, m.v || 0);
    }

    for (const m of curN) {
      if (!maqCatalogo.find(x => x.id === m.id)) {
        maqCatalogo.push({ id: m.id, n: m.n || '', c: '', p: m.p || '', pr: m.pr || '' });
      } else {
        const cat = maqCatalogo.find(x => x.id === m.id);
        if (m.n) cat.n = m.n;
        if (m.p) cat.p = m.p;
        if (m.pr) cat.pr = m.pr;
      }
      if (!maqStatus[m.id] || prevAIds.has(m.id)) {
        setStatusEntry(m.id, key, 'negociacao');
      }
      setValorAt(m.id, key, m.v || 0);
    }

    prevAIds = curAIds;

    ensureMesPayload(key);
    if (Array.isArray(p.F)) porMes[key].F = JSON.parse(JSON.stringify(p.F));
    if (Array.isArray(p.V)) porMes[key].V = JSON.parse(JSON.stringify(p.V));
    if (Array.isArray(p.R)) porMes[key].R = JSON.parse(JSON.stringify(p.R));
    if (p.n1) porMes[key].n1 = p.n1;
    if (p.n2) porMes[key].n2 = p.n2;
    if (p.n3) porMes[key].n3 = p.n3;
  }
}
