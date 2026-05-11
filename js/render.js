let lastMesKey = null;

function mesKeyFromSelectors() {
  const anoEl = document.getElementById('ano');
  const mesEl = document.getElementById('mes');
  const ano = anoEl && anoEl.value ? anoEl.value : String(new Date().getFullYear());
  const mv = mesEl ? mesEl.value : '1';
  return mesKeyNum(ano, mv);
}

function saveCurrentMonthNames() {
  if (!lastMesKey) return;
  ensureMesPayload(lastMesKey);
  const n1el = document.getElementById('n1');
  const n2el = document.getElementById('n2');
  const n3el = document.getElementById('n3');
  if (n1el) porMes[lastMesKey].n1 = n1el.value;
  if (n2el) porMes[lastMesKey].n2 = n2el.value;
  if (n3el) porMes[lastMesKey].n3 = n3el.value;
}

function onMesOuAnoChange() {
  const newKey = mesKeyFromSelectors();
  if (lastMesKey !== null && lastMesKey !== newKey) {
    saveCurrentMonthNames();
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
  mes.addEventListener('change', () => onMesOuAnoChange());
  ano.addEventListener('change', () => onMesOuAnoChange());
}

function initApp() {
  loadPorMesStorage();
  initDefaultData();
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

// ─── Status do mês ────────────────────────────────────────────────────────────

function onMesStatusChange(value) {
  setMesStatus(mesKeyFromSelectors(), value);
  render();
}

function isMesFechado() {
  return getMesStatus(mesKeyFromSelectors()) === 'fechado';
}

// ─── Helpers de edição ────────────────────────────────────────────────────────

function updateMaqNome(id, value) {
  if (isMesFechado()) return;
  const m = maqCatalogo.find(x => x.id === id);
  if (m) m.n = value;
  savePorMesStorage();
}

function updateMaqCliente(id, value) {
  if (isMesFechado()) return;
  const m = maqCatalogo.find(x => x.id === id);
  if (m) m.c = value;
  savePorMesStorage();
}

function updateMaqSituacao(id, value) {
  if (isMesFechado()) return;
  const m = maqCatalogo.find(x => x.id === id);
  if (m) m.p = value;
  savePorMesStorage();
}

function updateMaqPrevisao(id, value) {
  if (isMesFechado()) return;
  const m = maqCatalogo.find(x => x.id === id);
  if (m) m.pr = value;
  savePorMesStorage();
}

// ─── Adicionar / remover ──────────────────────────────────────────────────────

function addA() {
  if (isMesFechado()) return;
  const id = ++nid;
  const mk = mesKeyFromSelectors();
  maqCatalogo.push({ id, n: 'Nova máquina', c: '', p: '', pr: '' });
  setStatusEntry(id, mk, 'ativa');
  setValorAt(id, mk, 0);
  render();
}

function addN() {
  if (isMesFechado()) return;
  const id = ++nid;
  const mk = mesKeyFromSelectors();
  maqCatalogo.push({ id, n: 'Nova máquina', c: '', p: '', pr: '' });
  setStatusEntry(id, mk, 'negociacao');
  setValorAt(id, mk, 0);
  render();
}

function addF() {
  if (isMesFechado()) return;
  F.push({ id: ++nid, d: 'Novo custo', v: 0 });
  render();
}
function addV() {
  if (isMesFechado()) return;
  V.push({ id: ++nid, d: 'Novo custo', v: 0 });
  render();
}
function addR() {
  if (isMesFechado()) return;
  R.push({ id: ++nid, s: '', d: '', dt: '', v: 0, st: 'pendente' });
  render();
}

/** Remove máquina do catálogo e de todo o histórico. */
function delMaquina(id) {
  if (isMesFechado()) return;
  maqCatalogo = maqCatalogo.filter(m => m.id !== id);
  delete maqStatus[id];
  for (const key of Object.keys(porMes)) {
    if (porMes[key].maqV) delete porMes[key].maqV[id];
  }
  render();
}

/** Remove item de F, V ou R. */
function del(arr, id) {
  if (isMesFechado()) return;
  const i = arr.findIndex((x) => x.id === id);
  if (i > -1) arr.splice(i, 1);
  render();
}

// ─── Movimentação de status ───────────────────────────────────────────────────

/**
 * Move máquina para "Em negociação / escritório" a partir do mês atual.
 * Todos os meses seguintes herdarão o novo status automaticamente.
 */
function enviarAtivaParaNegociacao(id) {
  if (isMesFechado()) return;
  const mk = mesKeyFromSelectors();
  const m = maqCatalogo.find(x => x.id === id);
  if (!m || statusAt(id, mk) !== 'ativa') return;
  const v = valorAt(id, mk);
  const cliente = m.c && String(m.c).trim();
  m.p = cliente ? 'Escritório · ' + cliente : 'Escritório';
  setStatusEntry(id, mk, 'negociacao');
  setValorAt(id, mk, v);
  render();
}

/**
 * Move máquina para "Máquinas ativas" a partir do mês atual.
 * Todos os meses seguintes herdarão o novo status automaticamente.
 */
function enviarNegociacaoParaAtiva(id) {
  if (isMesFechado()) return;
  const mk = mesKeyFromSelectors();
  const m = maqCatalogo.find(x => x.id === id);
  if (!m || statusAt(id, mk) !== 'negociacao') return;
  const v = valorAt(id, mk);
  const prefix = 'Escritório · ';
  if (m.p && String(m.p).startsWith(prefix)) {
    m.c = String(m.p).slice(prefix.length);
  }
  setStatusEntry(id, mk, 'ativa');
  setValorAt(id, mk, v);
  render();
}

// ─── Render ───────────────────────────────────────────────────────────────────

function render() {
  const mk = mesKeyFromSelectors();
  const fechado = getMesStatus(mk) === 'fechado';
  const rd = fechado ? ' readonly' : '';

  // Seletor de status do mês
  const statusSel = document.getElementById('mes-status');
  if (statusSel) {
    const s = getMesStatus(mk);
    statusSel.value = s;
    statusSel.className = 'mes-sel mes-st-' + s;
  }

  // Banner de mês fechado
  const fechadoBanner = document.getElementById('fechado-banner');
  if (fechadoBanner) fechadoBanner.style.display = fechado ? '' : 'none';

  // Aplica/remove bloqueio visual global
  document.body.classList.toggle('mes-fechado', fechado);

  const n1 = document.getElementById('n1') ? document.getElementById('n1').value : 'Sócio 1';
  const n2 = document.getElementById('n2') ? document.getElementById('n2').value : 'Sócio 2';
  const n3 = document.getElementById('n3') ? document.getElementById('n3').value : 'Sócio 3';

  // Deriva ativas e negociação a partir do catálogo + histórico de status
  const ativasArr = maqCatalogo
    .filter(m => statusAt(m.id, mk) === 'ativa')
    .sort((a, b) => a.id - b.id)
    .map(m => ({ ...m, v: valorAt(m.id, mk) }));

  const negArr = maqCatalogo
    .filter(m => statusAt(m.id, mk) === 'negociacao')
    .sort((a, b) => a.id - b.id)
    .map(m => ({ ...m, v: valorAt(m.id, mk) }));

  let sA = 0, sN = 0, sF = 0, sV = 0, sR = 0;
  let tb;

  document.getElementById('bdg-a').textContent = ativasArr.length + ' alugada' + (ativasArr.length !== 1 ? 's' : '');
  document.getElementById('bdg-n').textContent = negArr.length + ' pendentes';

  // Máquinas ativas
  tb = document.getElementById('tb-a');
  tb.innerHTML = '';
  ativasArr.forEach((m) => {
    sA += m.v;
    const f = m.id < 13 ? 1 : 2;
    const roy = m.v === 0 && m.c === 'ROYALTY';
    tb.innerHTML += `<tr>
      <td style="color:var(--hint);font-size:11px">${m.id}</td>
      <td><input type="text"${rd} value="${esc(m.n)}" onchange="updateMaqNome(${m.id},this.value)"></td>
      <td><input type="text"${rd} value="${esc(m.c)}" onchange="updateMaqCliente(${m.id},this.value)"></td>
      <td class="num">${roy ? '<span style="font-size:11px;color:var(--hint)">royalty </span>' : ''}<input class="ed"${rd} type="text" value="${fmt(m.v)}" onchange="setValorAt(${m.id},'${mk}',pv(this.value));render()"></td>
      <td style="width:72px"><span class="fase-tag ft${f}">fase ${f}</span></td>
      <td><button type="button" class="to-neg-btn" onclick="enviarAtivaParaNegociacao(${m.id})" title="Enviar para Em negociação / escritório. Máquinas ativas não podem ser excluídas.">→ Escritório</button></td>
    </tr>`;
  });
  document.getElementById('tot-a').textContent = 'R$ ' + fmt(sA);

  // Em negociação / escritório
  tb = document.getElementById('tb-n');
  tb.innerHTML = '';
  negArr.forEach((m) => {
    sN += m.v;
    const ne = m.p === 'NÃO EXISTE';
    tb.innerHTML += `<tr>
      <td style="color:var(--hint);font-size:11px">${m.id}</td>
      <td><input type="text"${rd} value="${esc(m.n)}" onchange="updateMaqNome(${m.id},this.value)"></td>
      <td><input type="text"${rd} value="${esc(m.p)}" onchange="updateMaqSituacao(${m.id},this.value)" style="${ne ? 'color:var(--red);font-weight:500' : ''}"></td>
      <td class="num"><input class="ed"${rd} type="text" value="${fmt(m.v)}" onchange="setValorAt(${m.id},'${mk}',pv(this.value));render()"></td>
      <td><input type="text"${rd} value="${esc(m.pr)}" onchange="updateMaqPrevisao(${m.id},this.value)" placeholder="mês/ano" style="width:68px;font-size:12px"></td>
      <td><button type="button" class="to-neg-btn" onclick="enviarNegociacaoParaAtiva(${m.id})" title="Mover para Máquinas ativas">→ Ativas</button></td>
      <td><button class="del-btn" onclick="delMaquina(${m.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('tot-n').textContent = 'R$ ' + fmt(sN);

  // Custos fixos
  tb = document.getElementById('tb-f');
  tb.innerHTML = '';
  F.forEach((c, i) => {
    sF += c.v;
    tb.innerHTML += `<tr>
      <td><input type="text"${rd} value="${esc(c.d)}" onchange="F[${i}].d=this.value"></td>
      <td class="num"><input class="ed"${rd} type="text" value="${fmt(c.v)}" onchange="F[${i}].v=pv(this.value);render()"></td>
      <td><button class="del-btn" onclick="del(F,${c.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('tot-f').textContent = 'R$ ' + fmt(sF);

  // Custos variáveis
  tb = document.getElementById('tb-v');
  tb.innerHTML = '';
  V.forEach((c, i) => {
    sV += c.v;
    tb.innerHTML += `<tr>
      <td><input type="text"${rd} value="${esc(c.d)}" onchange="V[${i}].d=this.value"></td>
      <td class="num"><input class="ed"${rd} type="text" value="${fmt(c.v)}" onchange="V[${i}].v=pv(this.value);render()"></td>
      <td><button class="del-btn" onclick="del(V,${c.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('tot-v').textContent = 'R$ ' + fmt(sV);

  // Reembolsos
  tb = document.getElementById('tb-r');
  tb.innerHTML = '';
  R.forEach((r, i) => {
    if (r.st === 'pendente') sR += r.v;
    tb.innerHTML += `<tr>
      <td><input type="text"${rd} value="${esc(r.s)}" onchange="R[${i}].s=this.value" placeholder="nome"></td>
      <td><input type="text"${rd} value="${esc(r.d)}" onchange="R[${i}].d=this.value" placeholder="descrição"></td>
      <td><input type="text"${rd} value="${esc(r.dt)}" onchange="R[${i}].dt=this.value" placeholder="dd/mm" style="width:62px"></td>
      <td class="num"><input class="ed"${rd} type="text" value="${fmt(r.v)}" onchange="R[${i}].v=pv(this.value);render()"></td>
      <td><select class="st"${rd ? ' disabled' : ''} onchange="R[${i}].st=this.value;render()">
        <option value="pendente"${r.st === 'pendente' ? ' selected' : ''}>pendente</option>
        <option value="pago"${r.st === 'pago' ? ' selected' : ''}>pago</option>
      </select></td>
      <td><button class="del-btn" onclick="del(R,${r.id})">✕</button></td>
    </tr>`;
  });
  document.getElementById('tot-r').textContent = 'R$ ' + fmt(sR);

  // Resultado operacional
  const tc = sF + sV + sR;
  const op = sA - tc;
  document.getElementById('r-rec').textContent = 'R$ ' + fmt(sA);
  document.getElementById('r-cus').textContent = '- R$ ' + fmt(sF + sV);
  document.getElementById('r-rem').textContent = '- R$ ' + fmt(sR);
  const el = document.getElementById('r-op');
  el.textContent = 'R$ ' + fmt(op);
  el.className = 'num ' + (op >= 0 ? 'pos' : 'neg');

  calcDist(ativasArr, sA, tc, n1, n2, n3);

  // Persistir
  ensureMesPayload(mk);
  porMes[mk].n1 = n1;
  porMes[mk].n2 = n2;
  porMes[mk].n3 = n3;
  lastMesKey = mk;
  savePorMesStorage();

  const dp = document.getElementById('dist-periodo');
  if (dp) dp.textContent = 'Distribuição — ' + labelMesAno(mk);
  const dr = document.getElementById('dre-periodo');
  if (dr) dr.textContent = 'Receitas das Máquinas — ' + labelMesAno(mk);
}

initApp();

// ─── Exportar / Importar ──────────────────────────────────────────────────────

function exportData() {
  saveCurrentMonthNames();
  savePorMesStorage();
  const data = { version: 3, nid, maqCatalogo, maqStatus, porMes };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dre-maquinas-' + new Date().toISOString().slice(0, 10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
  const st = document.getElementById('save-status');
  st.textContent = 'Salvo: ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  setTimeout(() => (st.textContent = ''), 4000);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Limpa estado global
      maqCatalogo = [];
      maqStatus = {};
      porMes = {};
      nid = 200;

      if (data.version === 3) {
        if (data.nid != null) nid = data.nid;
        if (Array.isArray(data.maqCatalogo)) maqCatalogo = data.maqCatalogo;
        if (data.maqStatus) maqStatus = data.maqStatus;
        if (data.porMes) porMes = data.porMes;
      } else if (data.version === 2 && data.meses) {
        migrateFromV2({ porMes: data.meses, nid: data.nid });
        if (data.nid != null) nid = data.nid;
      } else {
        // v1 ou formato livre — tenta tratar como payload único
        const guessKey = (() => {
          if (data.ano) {
            const mesIdx = data.mes ? MESES.indexOf(data.mes) : -1;
            return mesKeyNum(data.ano, mesIdx >= 0 ? mesIdx + 1 : 5);
          }
          return '2026-05';
        })();
        migrateFromV2({ porMes: { [guessKey]: data } });
      }

      initDefaultData();
      savePorMesStorage();
      lastMesKey = mesKeyFromSelectors();
      applyMonthKey(lastMesKey);
      render();

      const st = document.getElementById('save-status');
      st.style.color = 'var(--green)';
      st.textContent = '✓ Dados carregados: ' + file.name;
      setTimeout(() => { st.textContent = ''; st.style.color = 'var(--muted)'; }, 4000);
    } catch (_) {
      alert('Erro ao carregar arquivo. Verifique se é um JSON válido.');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}
