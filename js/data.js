const fmt = (v) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pv = (s) => parseFloat(String(s).replace(/\./g, '').replace(',', '.')) || 0;
let nid = 200;

let A = [
  { id: 0, n: 'Máquina 0', c: 'ROYALTY', v: 0 },
  { id: 2, n: 'Máquina 2', c: 'JOSEPH', v: 1560 },
  { id: 3, n: 'Máquina 3', c: 'BOGO', v: 1500 },
  { id: 4, n: 'Máquina 4', c: 'TESTAROSSA', v: 1500 },
  { id: 5, n: 'Máquina 5', c: 'OUS', v: 1350 },
  { id: 9, n: 'Máquina 9', c: 'GRASSY 3 ESTAÇÕES', v: 1450 },
  { id: 10, n: 'Máquina 10', c: 'GRASSY 2 ESTAÇÕES', v: 1350 },
  { id: 11, n: 'Máquina 11', c: 'HAGI', v: 1200 },
  { id: 13, n: 'Máquina 13', c: 'KLAS', v: 1350 },
];
let N = [
  { id: 1, n: 'Máquina 1', p: 'Escritório', v: 0, pr: '' },
  { id: 6, n: 'Máquina 6', p: 'Escritório', v: 0, pr: '' },
  { id: 7, n: 'Máquina 7', p: 'NÃO EXISTE', v: 0, pr: '' },
  { id: 8, n: 'Máquina 8', p: 'Escritório', v: 0, pr: '' },
  { id: 12, n: 'Máquina 12', p: 'Escritório', v: 0, pr: '' },
  { id: 14, n: 'Máquina 14', p: 'Escritório', v: 0, pr: '' },
  { id: 15, n: 'Máquina 15', p: 'Escritório', v: 0, pr: '' },
];
let F = [
  { id: 1, d: 'Custo fixo 1', v: 0 },
  { id: 2, d: 'Custo fixo 2', v: 0 },
];
let V = [{ id: 1, d: 'Custo variável 1', v: 0 }];
let R = [];
