function calcDist(arr, sA, tc, n1, n2, n3) {
  let r1 = 0;
  let r2 = 0;
  arr.forEach((m, i) => {
    i < 12 ? (r1 += m.v) : (r2 += m.v);
  });
  const f2 = arr.length > 12;
  let s1 = 0;
  let s2 = 0;
  let s3 = 0;
  let cx = 0;
  let mem = [];

  if (!f2) {
    s1 = r1 / 2 - tc / 3;
    s2 = r1 / 2 - tc / 3;
    s3 = -tc / 3;
    mem = [
      { l: 'Receita total (fase 1)', v: 'R$ ' + fmt(r1), d: false },
      { l: n1 + ' retira (50%)', v: 'R$ ' + fmt(r1 / 2), d: false },
      { l: n2 + ' retira (50%)', v: 'R$ ' + fmt(r1 / 2), d: false },
      { l: '─', v: '', d: false },
      { l: 'Custo total', v: 'R$ ' + fmt(tc), d: false },
      { l: 'Custo por sócio (÷ 3)', v: 'R$ ' + fmt(tc / 3), d: false },
      { l: '─', v: '', d: false },
      { l: n1 + ' líquido', v: 'R$ ' + fmt(s1), d: true },
      { l: n2 + ' líquido', v: 'R$ ' + fmt(s2), d: true },
      { l: n3 + ' líquido (0 − custo/3)', v: 'R$ ' + fmt(s3), d: true },
    ];
  } else {
    const saldo = r2 - tc;
    if (saldo >= 0) {
      s1 = r1 / 2;
      s2 = r1 / 2;
      s3 = 0;
      cx = saldo;
      mem = [
        { l: 'Receita fase 1 (máq. 1–12)', v: 'R$ ' + fmt(r1), d: false },
        { l: 'Receita fase 2 (máq. 13+)', v: 'R$ ' + fmt(r2), d: false },
        { l: 'Custo total', v: 'R$ ' + fmt(tc), d: false },
        { l: '─', v: '', d: false },
        { l: 'Fase 2 cobre custos — excedente', v: 'R$ ' + fmt(saldo), d: false },
        { l: '→ excedente vai ao caixa', v: 'R$ ' + fmt(saldo), d: false },
        { l: '─', v: '', d: false },
        { l: n1 + ' líquido', v: 'R$ ' + fmt(s1), d: true },
        { l: n2 + ' líquido', v: 'R$ ' + fmt(s2), d: true },
        { l: n3 + ' líquido', v: 'R$ 0,00', d: true },
        { l: 'Caixa da empresa', v: 'R$ ' + fmt(cx), d: true },
      ];
    } else {
      const def = -saldo;
      s1 = r1 / 2 - def / 3;
      s2 = r1 / 2 - def / 3;
      s3 = -def / 3;
      mem = [
        { l: 'Receita fase 1 (máq. 1–12)', v: 'R$ ' + fmt(r1), d: false },
        { l: 'Receita fase 2 (máq. 13+)', v: 'R$ ' + fmt(r2), d: false },
        { l: 'Custo total', v: 'R$ ' + fmt(tc), d: false },
        { l: '─', v: '', d: false },
        { l: 'Fase 2 não cobre — déficit', v: 'R$ ' + fmt(def), d: false },
        { l: 'Déficit por sócio (÷ 3)', v: 'R$ ' + fmt(def / 3), d: false },
        { l: '─', v: '', d: false },
        { l: n1 + ' líquido', v: 'R$ ' + fmt(s1), d: true },
        { l: n2 + ' líquido', v: 'R$ ' + fmt(s2), d: true },
        { l: n3 + ' líquido (0 − déficit/3)', v: 'R$ ' + fmt(s3), d: true },
      ];
    }
  }

  const bn = document.getElementById('banner');
  if (!f2) {
    bn.style.cssText =
      'border-radius:10px;padding:10px 16px;margin-bottom:1rem;font-size:13px;line-height:1.5;border:0.5px solid;background:var(--green-bg);border-color:var(--green-bd);color:var(--green)';
    bn.innerHTML =
      '<strong>Fase 1</strong> — ' +
      arr.length +
      ' máquinas ativas. Receita retirada pelos 2 sócios full time; custos divididos entre 3.';
  } else {
    const sl = r2 - tc;
    if (sl >= 0) {
      bn.style.cssText =
        'border-radius:10px;padding:10px 16px;margin-bottom:1rem;font-size:13px;line-height:1.5;border:0.5px solid;background:var(--purple-bg);border-color:var(--purple-bd);color:var(--purple)';
      bn.innerHTML =
        '<strong>Fase 2</strong> — ' +
        arr.length +
        ' máquinas ativas. Excedente de <strong>R$ ' +
        fmt(sl) +
        '</strong> vai ao caixa.';
    } else {
      bn.style.cssText =
        'border-radius:10px;padding:10px 16px;margin-bottom:1rem;font-size:13px;line-height:1.5;border:0.5px solid;background:var(--amber-bg);border-color:var(--amber-bd);color:var(--amber)';
      bn.innerHTML =
        '<strong>Fase 2</strong> — ' +
        arr.length +
        ' máquinas ativas. Déficit de <strong>R$ ' +
        fmt(-sl) +
        '</strong> dividido entre os 3 sócios.';
    }
  }

  const avcs = ['av1', 'av2', 'av3'];
  const nms = [n1, n2, n3];
  const ls = [s1, s2, s3];
  const rs = [r1 / 2, r1 / 2, 0];
  const sc = document.getElementById('scards');
  sc.innerHTML = '';
  [0, 1, 2].forEach((i) => {
    sc.innerHTML += `<div class="sc">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
        <div class="av ${avcs[i]}">${nms[i].substring(0, 2).toUpperCase()}</div>
        <div style="font-weight:500;font-size:14px">${nms[i]}</div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:3px">Retira</div>
      <div style="font-size:16px;font-weight:500;color:var(--green);margin-bottom:10px;font-family:'DM Mono',monospace">R$ ${fmt(rs[i])}</div>
      <div class="dvd"></div>
      <div style="font-size:11px;color:var(--muted);margin-top:10px;margin-bottom:4px">Líquido do mês</div>
      <div style="font-size:22px;font-weight:500;font-family:'DM Mono',monospace" class="${ls[i] >= 0 ? 'pos' : 'neg'}">R$ ${fmt(ls[i])}</div>
    </div>`;
  });
  if (f2 && r2 - tc >= 0) {
    sc.innerHTML += `<div class="sc">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">
        <div class="av avc">CA</div>
        <div style="font-weight:500;font-size:14px">Caixa</div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:3px">Excedente fase 2</div>
      <div style="font-size:22px;font-weight:500;color:var(--purple);font-family:'DM Mono',monospace">R$ ${fmt(r2 - tc)}</div>
    </div>`;
  }

  const mt = document.getElementById('tb-mem');
  mt.innerHTML = '';
  mem.forEach((r) => {
    if (r.l === '─') {
      mt.innerHTML += `<tr><td colspan="2" style="padding:2px 14px;border-bottom:0.5px solid var(--border)"></td></tr>`;
    } else {
      mt.innerHTML += `<tr style="${r.d ? 'background:var(--bg)' : ''}">
        <td style="color:${r.d ? 'var(--text)' : 'var(--muted)'}">${r.l}</td>
        <td class="num" style="font-weight:${r.d ? 500 : 400}">${r.v}</td>
      </tr>`;
    }
  });
}
