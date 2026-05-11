let lastMesKey = null;

function mesKeyFromSelectors() {
  const anoEl = document.getElementById('ano');
  const mesEl = document.getElementById('mes');
  const ano = anoEl && anoEl.value ? anoEl.value : String(new Date().getFullYear());
  const mv = mesEl ? mesEl.value : '1';
  return mesKeyNum(ano, mv);
}

function snapshotPayload() {
  return normalizePayload({
    A,
    N,
    F,
    V,
    R,
    n1: document.getElementById('n1') ? document.getElementById('n1').value : 'Sócio 1',
    n2: document.getElementById('n2') ? document.getElementById('n2').value : 'Sócio 2',
    n3: document.getElementById('n3') ? document.getElementById('n3').value : 'Sócio 3',
  });
}

function applyMonthKey(key) {
  const raw = porMes[key];
  const p = raw !== undefined ? normalizePayload(raw) : payloadForNewMonth(key);
  assignArraysFromPayload(p);
  const n1el = document.getElementById('n1');
  const n2el = document.getElementById('n2');
  const n3el = document.getElementById('n3');
  if (n1el) n1el.value = p.n1;
  if (n2el) n2el.value = p.n2;
  if (n3el) n3el.value = p.n3;
}

function onMesOuAnoChange() {
  const newKey = mesKeyFromSelectors();
  if (lastMesKey !== null && lastMesKey !== newKey) {
    porMes[lastMesKey] = snapshotPayload();
    savePorMesStorage();
  }
  applyMonthKey(newKey);
  lastMesKey = newKey;
  render();
}

function populateYearSelect() {
  const sel = document.getElementById('ano');
  const y = new Date().getFullYear();
  sel.innerHTML = '';
  for (let a = y - 2; a <= y + 3; a++) {
    sel.innerHTML += `<option value="${a}"${a === y ? ' selected' : ''}>${a}</option>`;
  }
}

function bindMesAnoSelectors() {
  const mes = document.getElementById('mes');
  const ano = document.getElementById('ano');
  const fn = () => onMesOuAnoChange();
  mes.addEventListener('change', fn);
  ano.addEventListener('change', fn);
}

function initApp() {
  loadPorMesStorage();
  seedMaioADezembro2026();
  populateYearSelect();
  bindMesAnoSelectors();
  lastMesKey = mesKeyFromSelectors();
  applyMonthKey(lastMesKey);
  render();
}

function showTab(p, btn) {
  document.querySelectorAll('.page').forEach((e) => e.classList.remove('active'));
  document.querySelectorAll('.tab').forEach((e) => e.classList.remove('active'));
  document.getElementById('page-' + p).classList.add('active');
  btn.classList.add('active');
  render();
}
function addA() {
  A.push({ id: ++nid, n: 'Nova máquina', c: '', v: 0 });
  render();
}
function addN() {
  N.push({ id: ++nid, n: 'Nova máquina', p: '', v: 0, pr: '' });
  render();
}
function addF() {
  F.push({ id: ++nid, d: 'Novo custo', v: 0 });
  render();
}
function addV() {
  V.push({ id: ++nid, d: 'Novo custo', v: 0 });
  render();
}
function addR() {
  R.push({ id: ++nid, s: '', d: '', dt: '', v: 0, st: 'pendente' });
  render();
}
/** Máquinas ativas não podem ser excluídas — só enviadas para negociação. */
function enviarAtivaParaNegociacao(id) {
  const i = A.findIndex((x) => x.id === id);
  if (i === -1) return;
  const m = A[i];
  A.splice(i, 1);
  const cliente = m.c && String(m.c).trim();
  const p = cliente ? 'Escritório · ' + cliente : 'Escritório';
  N.push({ id: m.id, n: m.n, p, v: m.v, pr: '' });
  render();
}

function enviarNegociacaoParaAtiva(id) {
  const i = N.findIndex((x) => x.id === id);
  if (i === -1) return;
  const m = N[i];
  N.splice(i, 1);
  let c = '';
  const prefix = 'Escritório · ';
  if (m.p && String(m.p).startsWith(prefix)) {
    c = String(m.p).slice(prefix.length);
  }
  A.push({ id: m.id, n: m.n, c, v: m.v });
  render();
}

function del(arr, id) {
  if (arr === A) return;
  const i = arr.findIndex((x) => x.id === id);
  if (i > -1) arr.splice(i, 1);
  render();
}

function render() {
  const n1 = document.getElementById('n1') ? document.getElementById('n1').value : 'Sócio 1';
  const n2 = document.getElementById('n2') ? document.getElementById('n2').value : 'Sócio 2';
  const n3 = document.getElementById('n3') ? document.getElementById('n3').value : 'Sócio 3';
  let sA = 0;
  let sN = 0;
  let sF = 0;
  let sV = 0;
  let sR = 0;
  let tb;

  document.getElementById('bdg-a').textContent = A.length + ' alugada' + (A.length !== 1 ? 's' : '');
  document.getElementById('bdg-n').textContent = N.length + ' pendentes';

  tb = document.getElementById('tb-a');
  tb.innerHTML = '';
  A.forEach((m, i) => {
    sA += m.v;
    const f = i < 12 ? 1 : 2;
    const roy = m.v === 0 && m.c === 'ROYALTY';
    tb.innerHTML += `<tr>
      <td style="color:var(--hint);font-size:11px">${m.id}</td>
      <td><input type="text" value="${m.n}" onchange="A[${i}].n=this.value"></td>
      <td><input type="text" value="${m.c}" onchange="A[${i}].c=this.value"></td>
      <td class="num">${roy ? '<span style="font-size:11px;color:var(--hint)">royalty </span>' : ''}<input class="ed" type="text" value="${fmt(m.v)}" onchange="A[${i}].v=pv(this.value);render()"></td>
      <td style="width:72px"><span class="fase-tag ft${f}">fase ${f}</span></td>
      <td><button type="button" class="to-neg-btn" onclick="enviarAtivaParaNegociacao(${m.id})" title="Enviar para «Em negociação / escritório». Máquinas ativas não podem ser excluídas.">→ Escritorio</button></td>
    </tr>`;
  });
  document.getElementById('tot-a').textContent = 'R$ ' + fmt(sA);

  tb = document.getElementById('tb-n');
  tb.innerHTML = '';
  N.forEach((m, i) => {
    sN += m.v;
    const ne = m.p === 'NÃO EXISTE';
    tb.innerHTML += `<tr>
      <td style="color:var(--hint);font-size:11px">${m.id}</td>
      <td><input type="text" value="${m.n}" onchange="N[${i}].n=this.value"></td>
      <td><input type="text" value="${m.p}" onchange="N[${i}].p=this.value" style="${ne ? 'color:var(--red);font-weight:500' : ''}"></td>
      <td class="num"><input class="ed" type="text" value="${fmt(m.v)}" onchange="N[${i}].v=pv(this.value);render()"></td>
      <td><input type="text" value="${m.pr}" onchange="N[${i}].pr=this.value" placeholder="mês/ano" style="width:68px;font-size:12px"></td>
      <td><button type="button" class="to-neg-btn" onclick="enviarNegociacaoParaAtiva(${m.id})" title="Mover para Máquinas ativas">→ Ativas</button></td>
      <td><button class="del-btn" onclick="del(N,${m.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('tot-n').textContent = 'R$ ' + fmt(sN);

  tb = document.getElementById('tb-f');
  tb.innerHTML = '';
  F.forEach((c, i) => {
    sF += c.v;
    tb.innerHTML += `<tr><td><input type="text" value="${c.d}" onchange="F[${i}].d=this.value"></td><td class="num"><input class="ed" type="text" value="${fmt(c.v)}" onchange="F[${i}].v=pv(this.value);render()"></td><td><button class="del-btn" onclick="del(F,${c.id})">✕</button></td></tr>`;
  });
  document.getElementById('tot-f').textContent = 'R$ ' + fmt(sF);

  tb = document.getElementById('tb-v');
  tb.innerHTML = '';
  V.forEach((c, i) => {
    sV += c.v;
    tb.innerHTML += `<tr><td><input type="text" value="${c.d}" onchange="V[${i}].d=this.value"></td><td class="num"><input class="ed" type="text" value="${fmt(c.v)}" onchange="V[${i}].v=pv(this.value);render()"></td><td><button class="del-btn" onclick="del(V,${c.id})">✕</button></td></tr>`;
  });
  document.getElementById('tot-v').textContent = 'R$ ' + fmt(sV);

  tb = document.getElementById('tb-r');
  tb.innerHTML = '';
  R.forEach((r, i) => {
    if (r.st === 'pendente') sR += r.v;
    tb.innerHTML += `<tr>
      <td><input type="text" value="${r.s}" onchange="R[${i}].s=this.value" placeholder="nome"></td>
      <td><input type="text" value="${r.d}" onchange="R[${i}].d=this.value" placeholder="descrição"></td>
      <td><input type="text" value="${r.dt}" onchange="R[${i}].dt=this.value" placeholder="dd/mm" style="width:62px"></td>
      <td class="num"><input class="ed" type="text" value="${fmt(r.v)}" onchange="R[${i}].v=pv(this.value);render()"></td>
      <td><select class="st" onchange="R[${i}].st=this.value;render()"><option value="pendente" ${r.st === 'pendente' ? 'selected' : ''}>pendente</option><option value="pago" ${r.st === 'pago' ? 'selected' : ''}>pago</option></select></td>
      <td><button class="del-btn" onclick="del(R,${r.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('tot-r').textContent = 'R$ ' + fmt(sR);

  const tc = sF + sV + sR;
  const op = sA - tc;
  document.getElementById('r-rec').textContent = 'R$ ' + fmt(sA);
  document.getElementById('r-cus').textContent = '- R$ ' + fmt(sF + sV);
  document.getElementById('r-rem').textContent = '- R$ ' + fmt(sR);
  const el = document.getElementById('r-op');
  el.textContent = 'R$ ' + fmt(op);
  el.className = 'num ' + (op >= 0 ? 'pos' : 'neg');

  calcDist(A, sA, tc, n1, n2, n3);

  const k = mesKeyFromSelectors();
  porMes[k] = snapshotPayload();
  lastMesKey = k;
  savePorMesStorage();

  const dp = document.getElementById('dist-periodo');
  if (dp) dp.textContent = 'Distribuição — ' + labelMesAno(k);
  const dr = document.getElementById('dre-periodo');
  if (dr) dr.textContent = 'Receitas das Máquinas — ' + labelMesAno(k);
}

initApp();

function exportData() {
  const key = mesKeyFromSelectors();
  porMes[key] = snapshotPayload();
  savePorMesStorage();
  const data = {
    version: 2,
    ano: parseInt(document.getElementById('ano').value, 10),
    nid,
    meses: porMes,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ano = document.getElementById('ano').value;
  a.href = url;
  a.download = 'dre-maquinas-' + ano + '-todos-meses.json';
  a.click();
  URL.revokeObjectURL(url);
  const st = document.getElementById('save-status');
  st.textContent =
    'Salvo JSON (todos os meses): ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  setTimeout(() => (st.textContent = ''), 4000);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.version === 2 && data.meses && typeof data.meses === 'object') {
        porMes = data.meses;
        if (data.nid != null) nid = data.nid;
        if (data.ano != null) document.getElementById('ano').value = String(data.ano);
        lastMesKey = mesKeyFromSelectors();
        applyMonthKey(lastMesKey);
      } else {
        const p = normalizePayload({
          A: data.A,
          N: data.N,
          F: data.F,
          V: data.V,
          R: data.R,
          n1: data.n1,
          n2: data.n2,
          n3: data.n3,
        });
        const ano =
          data.ano != null ? String(data.ano) : document.getElementById('ano').value;
        if (data.mes) {
          const mi = MESES.indexOf(data.mes);
          if (mi >= 0) document.getElementById('mes').value = String(mi + 1);
        }
        document.getElementById('ano').value = ano;
        const key = mesKeyFromSelectors();
        porMes[key] = p;
        lastMesKey = key;
        assignArraysFromPayload(p);
        const n1el = document.getElementById('n1');
        const n2el = document.getElementById('n2');
        const n3el = document.getElementById('n3');
        if (n1el) n1el.value = p.n1;
        if (n2el) n2el.value = p.n2;
        if (n3el) n3el.value = p.n3;
      }
      render();
      savePorMesStorage();
      const st = document.getElementById('save-status');
      st.style.color = 'var(--green)';
      st.textContent = '✓ Dados carregados: ' + file.name;
      setTimeout(() => {
        st.textContent = '';
        st.style.color = 'var(--muted)';
      }, 4000);
    } catch (err) {
      alert('Erro ao carregar arquivo. Verifique se é um JSON válido.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
