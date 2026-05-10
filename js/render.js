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
function del(arr, id) {
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
      <td><button class="del-btn" onclick="del(A,${m.id})">✕</button></td>
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
}

render();

function exportData() {
  const data = {
    version: 1,
    mes: document.getElementById('mes').value,
    n1: document.getElementById('n1') ? document.getElementById('n1').value : 'Sócio 1',
    n2: document.getElementById('n2') ? document.getElementById('n2').value : 'Sócio 2',
    n3: document.getElementById('n3') ? document.getElementById('n3').value : 'Sócio 3',
    A,
    N,
    F,
    V,
    R,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const mes = document.getElementById('mes').value;
  a.href = url;
  a.download = 'dre-maquinas-' + mes.toLowerCase() + '.json';
  a.click();
  URL.revokeObjectURL(url);
  const st = document.getElementById('save-status');
  st.textContent = 'Salvo: ' + mes + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  setTimeout(() => (st.textContent = ''), 4000);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.A) A = data.A;
      if (data.N) N = data.N;
      if (data.F) F = data.F;
      if (data.V) V = data.V;
      if (data.R) R = data.R;
      if (data.mes) document.getElementById('mes').value = data.mes;
      if (data.n1 && document.getElementById('n1')) document.getElementById('n1').value = data.n1;
      if (data.n2 && document.getElementById('n2')) document.getElementById('n2').value = data.n2;
      if (data.n3 && document.getElementById('n3')) document.getElementById('n3').value = data.n3;
      render();
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
