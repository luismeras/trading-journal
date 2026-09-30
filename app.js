/* Trading Journal — UI. Rutas por hash: #/ (portada), #/resumen, #/registros, #/registrar, #/simulador, #/ajustes */
(function (TJ) {
  const { T, ACCOUNTS, calc, sim, store, fmt } = TJ;
  const $ = fmt.usd, $s = fmt.usdS, pc = fmt.pct;
  const SCREENS = ['resumen', 'registros', 'registrar', 'simulador', 'ajustes'];
  const MOB = 760;
  const EASE = 'cubic-bezier(.16,1,.3,1)';

  const blankForm = () => ({ date: TJ.today(), dir: 'gan', amt: '', tk: 'NQ', pma: '', img: '', plan: 'y', notes: '' });
  const navLang = (navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en';

  const st = {
    acc: 'Backtest',
    lang: ['es', 'en'].includes(store.pref('lang')) ? store.pref('lang') : navLang,
    theme: store.pref('theme') === 'light' ? 'light' : 'dark',
    cal: null, seed: 1, hz: 60, toast: '', formErr: '', pasteMsg: '',
    entries: store.loadEntries(), rules: store.loadRules(), form: blankForm()
  };

  const root = document.getElementById('app');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let lastKey = '', mob = innerWidth < MOB;

  // ---------- helpers ----------
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const screen = () => { const h = location.hash.replace(/^#\/?/, ''); return SCREENS.includes(h) ? h : 'login'; };
  const t = () => T[st.lang];
  const dd = s => { const d = new Date(s + 'T12:00:00'), tt = t(); return st.lang === 'en' ? tt.dw[d.getDay()] + ' ' + tt.ms[d.getMonth()] + ' ' + d.getDate() : tt.dw[d.getDay()] + ' ' + d.getDate() + ' ' + tt.ms[d.getMonth()]; };
  const col = (p, be) => p > be ? 'var(--gain)' : p < -be ? 'var(--loss)' : 'var(--muted)';
  const arrow = n => n > 0 ? '▲' : n < 0 ? '▼' : '■';
  const svg = (d, s) => `<svg width="${s || 18}" height="${s || 18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="${d}"></path></svg>`;
  const ARW = '<svg class="arw" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" aria-hidden="true"><path d="M5 12h14 M12 5l7 7-7 7"></path></svg>';
  const list = () => st.entries[st.acc];
  const rules = () => st.rules[st.acc];
  let settled = false;
  const rv = d => settled ? 'data-rv="in"' : `data-rv style="--d:${d || 0}s"`;
  const anim = (name, dur, delay) => `animation:${name} ${dur}s ${delay}s ${EASE} backwards`;

  const NAV = [
    ['resumen', 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z'],
    ['registros', 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01'],
    ['registrar', 'M12 5v14 M5 12h14'],
    ['simulador', 'M22 12h-4l-3 9L9 3l-3 9H2'],
    ['ajustes', 'M21 4h-7 M10 4H3 M21 12h-9 M8 12H3 M21 20h-5 M12 20H3 M14 2v4 M8 10v4 M16 18v4']];
  const SUN = 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4';
  const MOON = 'M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z';

  // ---------- shared bits ----------
  const langSw = thin => `<div class="langsw${thin ? ' thin' : ''}">${['es', 'en'].map(l => `<button data-action="lang" data-arg="${l}" aria-label="${l === 'es' ? 'Español' : 'English'}" class="${st.lang === l ? 'on' : ''}">${l.toUpperCase()}</button>`).join('')}</div>`;
  const seg = (opts, cur, action, cls) => `<div class="seg${cls ? ' ' + cls : ''}" style="grid-template-columns:repeat(${opts.length},${cls === 'hz' ? 'auto' : '1fr'})">${opts.map(([v, l]) => `<button data-action="${action}" data-arg="${v}" class="${cur === v ? 'on' : ''}" aria-pressed="${cur === v}">${esc(l)}</button>`).join('')}</div>`;

  // ---------- LOGIN ----------
  function loginView() {
    const tt = t();
    return `<div class="login">
      ${langSw()}
      <div class="login-inner">
        <div class="login-name" style="${anim('fadeUp', .8, .05)}">Trading Journal</div>
        <div class="kicker" style="${anim('fadeUp', .8, .15)}"><span></span>${tt.kicker}</div>
        <h1><span style="${anim('fadeUp', .8, .3)}">Trading</span><br><span style="${anim('fadeUp', .8, .38)}">Journal</span></h1>
        <p class="lema" style="${anim('fadeUp', .8, .8)}">${tt.tagline}</p>
        <button class="btn btn-primary enter" style="${anim('fadeIn', .8, 1)}" data-action="enter">${tt.enter} ${ARW}</button>
        <div class="vline a-growY"></div>
        <div class="inc-h" style="${anim('fadeUp', .8, 1.05)}">${tt.incH}</div>
        <div class="inc">${tt.inc.map(([h, b], i) => `<div style="animation:fadeUp .7s ${(1.1 + i * .1).toFixed(2)}s ${EASE} backwards"><span class="n">0${i + 1}</span><span class="h">${h}</span><span class="b">${b}</span></div>`).join('')}</div>
      </div>
    </div>`;
  }

  // ---------- APP SHELL ----------
  function appView(scr) {
    const tt = t();
    const navBtns = NAV.map(([k], i) => `<button data-action="go" data-arg="${k}" class="${scr === k ? 'on' : ''}"${scr === k ? ' aria-current="page"' : ''}>${tt.navL[i]}</button>`).join('');
    const accts = ACCOUNTS.map(n => {
      const c = calc(st.entries[n], st.rules[n]);
      const sx = c.lost ? tt.stLost : c.ok ? tt.stOk : tt.stRun;
      const dot = c.lost ? 'var(--loss)' : c.ok ? 'var(--gain)' : (c.n ? 'var(--accent)' : 'var(--rule)');
      return `<button data-action="acc" data-arg="${n}" class="${n === st.acc ? 'on' : ''}" aria-pressed="${n === st.acc}">
        <span class="nm lbl"><span class="sq8" style="background:${dot}"></span>${n}</span>
        <span class="bal">${$(c.bal)}</span>
        ${mob ? '' : `<span class="st">${sx}</span>`}</button>`;
    }).join('');
    const body = { resumen: resumenView, registros: registrosView, registrar: registrarView, simulador: simView, ajustes: ajustesView }[scr]();
    return `<div class="shell">
      <header class="hdr${scrollY > 8 ? ' scrolled' : ''}" id="hdr">
        <div class="brand">Trading Journal</div>
        ${mob ? '<div style="flex:1"></div>' : `<nav class="topnav" aria-label="Principal">${navBtns}</nav>`}
        <div class="hdr-tools">
          ${langSw(true)}
          <button class="btn btn-secondary btn-icon" data-action="theme" aria-label="${tt.themeAria}" title="${tt.themeAria}">${svg(st.theme === 'dark' ? SUN : MOON)}</button>
          <button class="btn btn-secondary" data-action="logout">${tt.logout}</button>
        </div>
      </header>
      <div class="accts">${accts}</div>
      <div class="hline"></div>
      <main class="${settled ? 'settled' : ''}">
        ${st.toast ? `<div class="toast" role="status">${esc(st.toast)}</div>` : ''}
        ${body}
      </main>
      ${mob ? `<nav class="tabs" aria-label="Principal">${NAV.map(([k, d], i) => `<button data-action="go" data-arg="${k}" class="${scr === k ? 'on' : ''}">${svg(d, 20)}<span>${tt.navS[i]}</span></button>`).join('')}</nav>` : ''}
    </div>`;
  }

  // ---------- RESUMEN ----------
  function resumenView() {
    const tt = t(), r = rules(), L = list(), S = calc(L, r), be = r.be;
    const status = S.lost ? tt.stLost : S.ok ? tt.stOk : tt.stRun;
    const stC = S.lost ? ['var(--loss)', 'var(--bg)'] : S.ok ? ['var(--gain)', 'var(--bg)'] : ['var(--surface)', 'var(--text)'];
    const stNote = S.lost ? tt.stnLost : S.ok ? tt.stnOk : tt.stnRun(S.n);
    const cushPct = Math.max(0, Math.min(1, S.cush / r.mll));
    const cushC = cushPct > 0.5 ? 'var(--gain)' : cushPct > 0.25 ? 'var(--warn)' : 'var(--loss)';
    const prog = Math.max(0, Math.min(1, S.net / S.target));
    const netColor = S.net === 0 ? 'var(--text)' : col(S.net, 0);
    const netPct = (S.net >= 0 ? '+' : '−') + Math.abs(S.net / S.size * 100).toFixed(2) + '%';
    const bars = [
      { label: tt.barTarget + ' +' + r.pct + '% · ' + $(S.target), pct: pc(prog * 100, 1), w: prog * 100, c: 'var(--gain)', a: $s(S.net), b: $(S.target) },
      { label: tt.barCush, pct: pc(cushPct * 100, 0), w: cushPct * 100, c: cushC, a: $(S.cush) + ' ' + tt.free, b: tt.floorW + ' ' + $(S.floor) }];

    let html = `
    <section ${rv(0)} class="gridrule hero">
      <div class="cell">
        <div class="lbl">${tt.netPL} · ${st.acc}</div>
        <div class="big" style="color:${netColor}">${arrow(S.net)} ${$s(S.net)}</div>
        <div class="mono muted" style="font-size:14px;margin-top:6px">${netPct} ${tt.over} ${$(S.size)}</div>
      </div>
      <div class="cell">
        <div class="lbl">${tt.lastDay}</div>
        <div class="mono" style="font-weight:600;font-size:28px;margin-top:8px;color:${S.last ? col(S.last.pnl, 0) : 'var(--muted)'}">${S.last ? arrow(S.last.pnl) + ' ' + $s(S.last.pnl) : '—'}</div>
        <div class="muted" style="font-size:13px;margin-top:6px">${S.last ? dd(S.last.date) : tt.noRec}</div>
      </div>
      <div class="cell">
        <div class="lbl">${tt.accStatus}</div>
        <div class="chip" style="background:${stC[0]};color:${stC[1]}">${status}</div>
        <div class="muted" style="font-size:13px;margin-top:8px">${stNote}</div>
      </div>
    </section>
    <section ${rv(.09)} class="gridrule" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      ${bars.map(b => `<div class="cell">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:baseline;flex-wrap:wrap"><span class="lbl">${b.label}</span><span class="mono" style="font-size:14px;font-weight:600">${b.pct}</span></div>
        <div class="bar" style="margin:10px 0 8px" role="progressbar" aria-valuenow="${Math.round(b.w)}" aria-valuemin="0" aria-valuemax="100"><div style="width:${b.w}%;background:${b.c}"></div></div>
        <div class="mono muted" style="display:flex;justify-content:space-between;font-size:13px"><span>${b.a}</span><span>${b.b}</span></div>
      </div>`).join('')}
    </section>`;

    if (!S.n) {
      return html + `<section ${rv(.18)} class="box empty">
        <h3 style="margin:0 0 8px">${tt.noRecIn} ${st.acc}</h3>
        <p>${tt.emptyTxt($(S.size), $(S.floor))}</p>
        <button class="btn btn-primary" style="padding:12px 18px" data-action="go" data-arg="registrar">${tt.firstDay}</button>
      </section>`;
    }

    // equity
    const eqs = [S.size, ...S.rows.map(x => x.bal)], fls = [S.size - r.mll, ...S.rows.map(x => x.floor)];
    const hi = Math.max(S.size + S.target, ...eqs) + 150, lo = Math.min(...fls, ...eqs) - 150, n = eqs.length - 1 || 1;
    const X = i => (i / n * 640).toFixed(1), Y = v => ((hi - v) / (hi - lo) * 220).toFixed(1);
    const line = 'M' + eqs.map((v, i) => X(i) + ' ' + Y(v)).join('L');
    const floor = 'M' + fls.map((v, i) => X(i) + ' ' + Y(v)).join('L');
    html += `
    <section ${rv(.27)} class="box pad">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:16px">
        <h5>${tt.equityCurve}</h5>
        <div class="legend">
          <span><span style="width:16px;height:3px;background:var(--accent)"></span>${tt.equity}</span>
          <span><span style="width:16px;height:3px;background:var(--loss)"></span>${tt.floor}</span>
          <span><span style="width:16px;height:0;border-top:3px dashed var(--gain)"></span>${tt.target}</span>
        </div>
      </div>
      <div class="eq-wrap">
        <div class="eq-axis">${[hi, (hi + lo) / 2, lo].map(v => `<span>${$(v)}</span>`).join('')}</div>
        <svg class="eq-svg" viewBox="0 0 640 220" preserveAspectRatio="none" role="img" aria-label="${tt.equityCurve}">
          <path d="${floor}L640 220L0 220Z" fill="var(--lossBg)" stroke="none" style="animation:fadeIn 1.4s .4s both"></path>
          <path d="M0 55H640 M0 110H640 M0 165H640" stroke="var(--rule)" stroke-opacity=".35" stroke-width="1" fill="none"></path>
          <path d="M0 ${Y(S.size + S.target)}H640" stroke="var(--gain)" stroke-width="2" stroke-dasharray="7 5" fill="none"></path>
          <path d="${floor}" pathLength="1" stroke="var(--loss)" stroke-width="2.5" fill="none" style="stroke-dasharray:1;animation:draw 1.8s .3s ease-out both"></path>
          <path d="${line}" pathLength="1" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linejoin="round" style="stroke-dasharray:1;animation:draw 2s .2s ease-out both"></path>
        </svg>
      </div>
      <div class="eq-x"><span>${tt.start}</span><span>${dd(S.last.date)}</span></div>
    </section>`;

    // strip
    const strip = L.slice(-20);
    html += `
    <section ${rv(.36)} class="box pad">
      <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:12px">
        <h5>${tt.lastN} 20 ${tt.recordsL}</h5><span class="muted" style="font-size:12px">${tt.stripLegend}</span>
      </div>
      <div class="strip">${strip.map((e, i) => `<div title="${esc(dd(e.date) + ' ' + $s(e.pnl))}" style="background:${e.pnl > be ? 'var(--gain)' : e.pnl < -be ? 'var(--loss)' : 'var(--rule)'};animation-delay:${i * 28}ms"></div>`).join('')}</div>
    </section>`;

    // KPIs
    const kp = [
      [tt.kWin, pc(S.wr, 0), S.wins.length + ' ' + tt.wl[0] + ' · ' + S.loss.length + ' ' + tt.wl[1] + ' · ' + (S.n - S.wins.length - S.loss.length) + ' BE', 'var(--text)'],
      [tt.kPf, S.pf.toFixed(2), tt.kGP, S.pf >= 1 ? 'var(--gain)' : 'var(--loss)'],
      [tt.kExp, $s(S.exp), tt.kPerDay, col(S.exp, 0)],
      [tt.kAvgW, $s(S.avgW), tt.kWd, 'var(--gain)'],
      [tt.kAvgL, S.avgL ? '−' + $(S.avgL) : '$0', tt.kLd, 'var(--loss)'],
      [tt.kStreak, String(S.ms), tt.kMs, 'var(--text)'],
      [tt.kMdd, '−' + $(S.dd), tt.kPv, 'var(--loss)']];
    html += `
    <section ${rv(0)}>
      <h5 style="margin:0 0 8px">${tt.indicators}</h5>
      <div class="gridrule kpis">${kp.map(([l, v, sub, c], i) => `<div class="cell" style="animation-delay:${i * 100}ms">
        <div class="lbl">${l}</div><div class="mono" style="font-size:24px;font-weight:600;margin-top:6px;color:${c}">${v}</div><div class="muted" style="font-size:12px;margin-top:2px">${sub}</div></div>`).join('')}</div>
    </section>`;

    // breakdowns
    const grp = (title, keyFn, items) => {
      const rows = items.map(it => { const g = L.filter(e => keyFn(e) === it.id); const p = g.reduce((a, e) => a + e.pnl, 0); const w = g.filter(e => e.pnl > be).length, l = g.filter(e => e.pnl < -be).length; return { name: it.name, n: g.length, p, wr: w + l ? w / (w + l) * 100 : null }; });
      const mx = Math.max(1, ...rows.map(x => Math.abs(x.p)));
      return `<div class="cell">
        <h5 style="margin:0 0 4px">${title}</h5>
        <div class="grp-row grp-head"><span></span><span class="r">${tt.days}</span><span class="r">${tt.win}</span><span class="r">P&amp;L</span></div>
        ${rows.map(x => { const c = x.n ? col(x.p, 0) : 'var(--muted)'; return `<div class="grp-item">
          <div class="grp-row"><span style="font-weight:600;min-width:0">${x.name}</span><span class="r mono muted">${x.n}</span><span class="r mono muted">${x.wr === null ? '—' : pc(x.wr)}</span><span class="r mono" style="font-weight:600;color:${c}">${x.n ? $s(x.p) : '—'}</span></div>
          <div class="minibar"><div style="width:${Math.abs(x.p) / mx * 100}%;background:${c}"></div></div></div>`; }).join('')}
      </div>`;
    };
    html += `
    <section ${rv(.45)} class="gridrule" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      ${grp(tt.gDay, e => new Date(e.date + 'T12:00:00').getDay(), [1, 2, 3, 4, 5].map((id, i) => ({ id, name: tt.wdFull[i] })))}
      ${grp(tt.gDisc, e => e.plan ? 'y' : 'n', [{ id: 'y', name: tt.followed }, { id: 'n', name: tt.broke }])}
    </section>`;

    // calendar
    const lastD = new Date(S.last.date + 'T12:00:00');
    const cm = st.cal || { y: lastD.getFullYear(), m: lastD.getMonth() };
    const first = new Date(cm.y, cm.m, 1), lead = (first.getDay() + 6) % 7, nd = new Date(cm.y, cm.m + 1, 0).getDate();
    const byDate = {}; L.forEach(e => byDate[e.date] = e.pnl);
    const cells = []; for (let i = 0; i < lead; i++) cells.push({ day: '', v: '', bg: 'var(--surface)', c: '' });
    let mt = 0, md = 0;
    for (let d = 1; d <= nd; d++) {
      const k = cm.y + '-' + String(cm.m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0'), p = byDate[k], wk = (lead + d - 1) % 7 > 4;
      if (p !== undefined) { mt += p; md++; }
      cells.push({ day: d, v: p === undefined ? '' : (p > 0 ? '+' : p < 0 ? '−' : '') + '$' + Math.abs(p).toLocaleString('en-US'), bg: p === undefined ? (wk ? 'var(--surface)' : 'var(--bg)') : p > be ? 'var(--gainBg)' : p < -be ? 'var(--lossBg)' : 'var(--surface)', c: p === undefined ? '' : col(p, be) });
    }
    while (cells.length % 7) cells.push({ day: '', v: '', bg: 'var(--surface)', c: '' });
    html += `
    <section ${rv(.54)} class="box pad">
      <div class="cal-top">
        <div class="cal-nav">
          <button class="btn btn-secondary btn-icon" data-action="cal" data-arg="-1" aria-label="${tt.prevMonth}">${svg('m15 18-6-6 6-6')}</button>
          <h5 aria-live="polite">${tt.mn[cm.m]} ${cm.y}</h5>
          <button class="btn btn-secondary btn-icon" data-action="cal" data-arg="1" aria-label="${tt.nextMonth}">${svg('m9 18 6-6-6-6')}</button>
        </div>
        <div class="mono" style="font-size:14px">${tt.month}: <strong style="color:${md ? col(mt, 0) : 'var(--muted)'}">${md ? $s(mt) : '—'}</strong> · ${md} ${tt.daysL}</div>
      </div>
      <div class="cal">
        ${tt.head.map(h => `<div class="hd">${h}</div>`).join('')}
        ${cells.map(c => `<div class="dc" style="background:${c.bg}"><span class="d">${c.day}</span><span class="v" style="color:${c.c}">${c.v}</span></div>`).join('')}
      </div>
    </section>`;
    return html;
  }

  // ---------- REGISTROS ----------
  function registrosView() {
    const tt = t(), r = rules(), S = calc(list(), r), be = r.be;
    let html = `<div class="pagehead">
      <div><h2>${tt.recordsTitle}</h2><div class="sub">${st.acc} · ${S.n} ${tt.daysL}. ${tt.rowNote}</div></div>
      <button class="btn btn-primary" style="padding:10px 16px" data-action="go" data-arg="registrar">${tt.logDay}</button>
    </div>`;
    if (!S.n) {
      return html + `<section ${rv(0)} class="box empty">
        <h3 style="margin:0 0 8px">${tt.noRecords}</h3>
        <p>${tt.emptyReg}</p>
        <div class="gridrule" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr));margin-bottom:20px">
          <div class="cell" style="padding:12px"><div class="lbl">${tt.balance}</div><div class="mono">${$(S.size)}</div></div>
          <div class="cell" style="padding:12px"><div class="lbl">${tt.floorS}</div><div class="mono">${$(S.floor)}</div></div>
          <div class="cell" style="padding:12px"><div class="lbl">${tt.target}</div><div class="mono">${$s(S.target)}</div></div>
        </div>
        <button class="btn btn-primary" style="padding:12px 18px" data-action="go" data-arg="registrar">${tt.firstDay}</button>
      </section>`;
    }
    const rows = S.rows.slice().reverse().map((x, i) => ({
      d: Math.min(i, 14) * 35, tk: esc(x.tk || 'NQ'), rules: x.plan ? tt.yes : tt.no, rc: x.plan ? 'var(--gain)' : 'var(--loss)',
      out: x.pnl > be ? tt.oWin : x.pnl < -be ? tt.oLoss : tt.oBE, date: dd(x.date), pnl: $s(x.pnl), c: col(x.pnl, be) }));
    if (!mob) {
      html += `<section ${rv(.09)} class="box" role="table" aria-label="${tt.recordsTitle}">
        <div class="rec-grid rec-head lbl" role="row"><span></span><span role="columnheader">${tt.date}</span><span role="columnheader">${tt.tickerL}</span><span role="columnheader" class="r">P&amp;L</span><span role="columnheader">${tt.rulesF}</span><span role="columnheader">${tt.outcome}</span></div>
        ${rows.map(x => `<div class="rec-grid rec-row" role="row" style="animation-delay:${x.d}ms">
          <span class="stripe" style="background:${x.c}"></span>
          <span class="body" role="cell">${x.date}</span>
          <span role="cell" style="font-weight:600">${x.tk}</span>
          <span role="cell" class="r" style="font-weight:600;color:${x.c}">${x.pnl}</span>
          <span role="cell" class="body" style="color:${x.rc}">${x.rules}</span>
          <span role="cell"><span class="badge" style="color:${x.c}">${x.out}</span></span>
        </div>`).join('')}
      </section>`;
    } else {
      html += `<section ${rv(.18)} class="rec-cards">
        ${rows.map(x => `<div class="rec-card" style="animation-delay:${x.d}ms">
          <span style="background:${x.c}"></span>
          <div class="in-c">
            <div class="top"><span style="font-weight:600">${x.date}</span><span class="mono" style="font-weight:600;font-size:18px;color:${x.c}">${x.pnl}</span></div>
            <div class="meta">
              <div><div class="ml">${tt.tickerL}</div><span class="mono" style="font-weight:600">${x.tk}</span></div>
              <div><div class="ml">${tt.rulesF}</div><span style="font-weight:600;color:${x.rc}">${x.rules}</span></div>
              <div><div class="ml">${tt.outcome}</div><span style="font-weight:800;color:${x.c}">${x.out}</span></div>
            </div>
          </div>
        </div>`).join('')}
      </section>`;
    }
    return html;
  }

  // ---------- REGISTRAR ----------
  function projView() {
    const tt = t(), r = rules(), F = st.form;
    const amt = parseFloat(F.amt) || 0, signed = F.dir === 'gan' ? amt : -amt;
    const P = calc([...list().filter(e => e.date !== F.date), { date: F.date, pnl: signed }].sort((a, b) => a.date < b.date ? -1 : 1), r);
    const proj = [
      { l: tt.dayPL, v: amt ? $s(signed) : '—', c: amt ? col(signed, 0) : 'var(--muted)' },
      { l: tt.balance, v: $(P.bal), c: 'var(--text)' },
      { l: tt.floor, v: $(P.floor), c: 'var(--muted)' },
      { l: tt.cushion, v: $(P.cush), c: P.cush < r.mll * 0.25 ? 'var(--loss)' : 'var(--text)' },
      { l: tt.progTarget, v: pc(Math.max(0, P.net) / P.target * 100, 1), c: 'var(--text)' }];
    return `<div class="panel-h lbl">${tt.afterRec}</div>
      ${proj.map(p => `<div class="kv"><span style="font-size:14px">${p.l}</span><span class="mono" style="font-weight:600;font-size:18px;color:${p.c}">${p.v}</span></div>`).join('')}`;
  }

  function registrarView() {
    const tt = t(), F = st.form;
    return `<div><h2>${tt.logDay}</h2><div class="sub muted" style="font-size:14px;margin-top:4px">${tt.savedIn} ${st.acc}. ${tt.onePerDay}</div></div>
    <div class="two">
      <section ${rv(0)} class="box form">
        <div class="pair">
          <div class="field"><label for="f-date">${tt.date}</label><input id="f-date" class="input" type="date" value="${esc(F.date)}" data-field="date" required></div>
          <div class="field"><label for="f-amt">${tt.amount}</label><input id="f-amt" class="input mono" type="number" inputmode="decimal" min="0" step="any" placeholder="0" value="${esc(F.amt)}" data-field="amt"></div>
        </div>
        <div><div class="flabel">${tt.dayResult}</div>${seg([['gan', tt.profit], ['per', tt.loss]], F.dir, 'form-dir')}</div>
        <div><div class="flabel">${tt.tickerL}</div>${seg([['NQ', 'NQ'], ['ES', 'ES'], ['YM', 'YM']], F.tk, 'form-tk')}</div>
        <div class="field"><label for="f-pma">Pre Market Analysis</label><textarea id="f-pma" class="input" rows="4" placeholder="${tt.pmaPh}" data-field="pma">${esc(F.pma)}</textarea></div>
        <div>
          <div class="flabel">${tt.tvChart}</div>
          ${F.img ? `<div class="box">
            <div class="shot" role="img" aria-label="${tt.pastedAlt}" style="background-image:url('${F.img}')"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-top:2px solid var(--rule);font-size:13px"><span class="muted">${tt.attached}</span><button class="btn btn-secondary" style="padding:6px 12px" data-action="clear-img">${tt.remove}</button></div>
          </div>` : `<div class="paste" tabindex="0" role="button" data-action="paste">
            <span class="t">${tt.pasteTitle}</span>
            <span class="h">${tt.pasteHelp}</span>
            ${st.pasteMsg ? `<span class="err" style="font-size:13px">${st.pasteMsg}</span>` : ''}
          </div>`}
        </div>
        <div class="pair"><div><div class="flabel">${tt.followRules}</div>${seg([['y', tt.yes], ['n', tt.no]], F.plan, 'form-plan')}</div></div>
        <div class="field"><label for="f-notes">${tt.notes}</label><textarea id="f-notes" class="input" rows="3" placeholder="${tt.notesPh}" data-field="notes">${esc(F.notes)}</textarea></div>
        ${st.formErr ? `<div class="err" role="alert">${st.formErr}</div>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" style="padding:12px 20px" data-action="save">${tt.saveDay}</button>
          <button class="btn btn-secondary" style="padding:12px 20px" data-action="go" data-arg="registros">${tt.cancel}</button>
        </div>
      </section>
      <section ${rv(.09)} class="box" id="proj" aria-live="polite">${projView()}</section>
    </div>`;
  }

  // ---------- SIMULADOR ----------
  function simView() {
    const tt = t(), r = rules(), L = list(), S = calc(L, r);
    let html = `<div class="pagehead">
      <div><h2>${tt.simTitle}</h2><div class="sub">${tt.simSub(st.acc)}</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${seg([30, 60, 90].map(h => [String(h), h + ' ' + tt.dayU]), String(st.hz), 'hz', 'hz')}
        <button class="btn btn-secondary" style="padding:9px 14px" data-action="reseed">${tt.resim}</button>
      </div>
    </div>`;
    if (S.n < 10) {
      return html + `<section ${rv(0)} class="box empty">
        <h3 style="margin:0 0 8px">${tt.simLockedT}</h3>
        <p style="margin-bottom:16px">${tt.simLock(S.n)}</p>
        <div class="bar" style="max-width:420px;margin-bottom:20px"><div style="width:${Math.min(100, S.n / 10 * 100)}%;background:var(--text)"></div></div>
        <button class="btn btn-primary" style="padding:12px 18px" data-action="go" data-arg="registrar">${tt.logDay}</button>
      </section>`;
    }
    const res = sim(L, r, st.hz, st.seed), pass = Math.round(res.pass), bust = Math.round(res.bust), open = Math.max(0, 100 - pass - bust);
    const v = TJ.verdict(res);
    const [vt, vc, vx] = v === 'clear' ? [tt.vClear, 'var(--gain)', tt.vxClear(pass, bust)] : v === 'marginal' ? [tt.vMarg, 'var(--warn)', tt.vxMarg] : [tt.vNone, 'var(--loss)', tt.vxNone(pass, bust)];
    const probs = [
      { l: tt.pPass, v: pass, c: 'var(--gain)', n: tt.reach + ' ' + $(S.target) + ' ' + tt.beforeFloor },
      { l: tt.pBust, v: bust, c: 'var(--loss)', n: tt.touch },
      { l: tt.pOpen, v: open, c: 'var(--muted)', n: tt.stillOpen + ' ' + st.hz + ' ' + tt.dayU }];
    const facts = [
      { l: tt.fTyp, v: res.med ? res.med + ' ' + tt.dayU : '—' }, { l: tt.fWr, v: pc(S.wr) },
      { l: tt.fExp, v: $s(S.exp) + tt.perDayU }, { l: tt.fHz, v: st.hz + ' ' + tt.dayU }];
    return html + `
    <section ${rv(.09)} class="verdict" style="border-left-color:${vc}">
      <div class="lbl">${tt.verdict}</div>
      <div class="vt" style="color:${vc}">${vt}</div>
      <div style="font-size:16px;max-width:680px">${vx}</div>
    </section>
    <section ${rv(.18)} class="gridrule probs">
      ${probs.map(p => `<div class="cell"><div class="lbl">${p.l}</div><div class="pv" style="color:${p.c}">${p.v}%</div>
        <div style="height:10px;background:var(--surface)" class="minibar"><div style="width:${p.v}%;background:${p.c}"></div></div>
        <div class="muted" style="font-size:12px;margin-top:8px">${p.n}</div></div>`).join('')}
    </section>
    <section ${rv(.27)} class="gridrule facts">
      ${facts.map(f => `<div class="cell"><div class="lbl">${f.l}</div><div class="mono" style="font-size:18px;font-weight:600;margin-top:4px">${f.v}</div></div>`).join('')}
    </section>`;
  }

  // ---------- AJUSTES ----------
  function ajustesView() {
    const tt = t(), r = rules();
    const notes = [
      { l: tt.initBal, v: $(r.size) }, { l: tt.tgtGain, v: $s(r.size * r.pct / 100) + ' (+' + r.pct + '%)' },
      { l: tt.initFloor, v: $(r.size - r.mll) }, { l: tt.maxFloor, v: r.type === 'trailing' ? $(r.size) + ' ' + tt.locks : tt.fixed },
      { l: tt.be, v: '±' + $(r.be) }];
    return `<div><h2>${tt.settings}</h2><div class="muted" style="font-size:14px;margin-top:4px">${tt.rulesOf} ${st.acc}. ${tt.eachOwn}</div></div>
    <div class="two">
      <section ${rv(0)} class="box form">
        <div class="field"><label for="r-size">${tt.accSize}</label>
          <select id="r-size" class="input mono" data-rule="size">${[50000, 100000, 150000].map(v => `<option value="${v}"${r.size === v ? ' selected' : ''}>$${v.toLocaleString('en-US')}</option>`).join('')}</select></div>
        <div class="pair">
          <div class="field"><label for="r-pct">${tt.profitPct}</label><input id="r-pct" class="input mono" type="number" step="0.5" min="0.5" value="${r.pct}" data-rule="pct"></div>
          <div class="field"><label for="r-tgt">${tt.targetUsd}</label><input id="r-tgt" class="input mono" style="opacity:.7" readonly value="${$s(r.size * r.pct / 100)}"></div>
        </div>
        <div class="field"><label for="r-mll">${tt.maxDD}</label><input id="r-mll" class="input mono" type="number" min="1" value="${r.mll}" data-rule="mll"></div>
        <div><div class="flabel">${tt.ddType}</div>${seg([['trailing', tt.trail], ['static', tt.stat]], r.type, 'ddtype')}</div>
        <div class="field"><label for="r-be">${tt.beBand}</label><input id="r-be" class="input mono" type="number" min="0" value="${r.be}" data-rule="be"></div>
        <div><button class="btn btn-secondary" style="padding:10px 16px" data-action="reset-rules">${tt.resetRules}</button></div>
      </section>
      <section ${rv(.09)} class="box">
        <div class="panel-h lbl">${tt.howApplied}</div>
        ${notes.map(p => `<div class="kv"><span style="font-size:14px">${p.l}</span><span class="mono" style="font-weight:600;text-align:right">${p.v}</span></div>`).join('')}
        <div class="muted" style="padding:14px 20px;font-size:13px">${r.type === 'trailing' ? tt.helpT : tt.helpS}</div>
      </section>
    </div>`;
  }

  // ---------- render ----------
  let io;
  function scan() {
    if (!io) io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.06, rootMargin: '0px 0px -4% 0px' });
    root.querySelectorAll('[data-rv]:not(.in):not([data-rv="in"])').forEach(el => io.observe(el));
  }

  function render() {
    const scr = screen();
    const key = scr + '|' + st.acc;
    settled = key === lastKey;
    lastKey = key;
    document.documentElement.lang = st.lang;
    document.documentElement.dataset.theme = st.theme;
    document.querySelector('meta[name=theme-color]').content = st.theme === 'dark' ? '#070a0f' : '#eceae3';
    document.title = scr === 'login' ? 'Trading Journal' : t().navL[SCREENS.indexOf(scr)] + ' · Trading Journal';
    document.body.classList.toggle('is-mob', mob);
    root.innerHTML = scr === 'login' ? loginView() : appView(scr);
    if (!settled) scan();
  }

  const go = s => {
    st.toast = ''; st.formErr = '';
    const target = s === 'login' ? '#/' : '#/' + s;
    if (location.hash === target) render(); else location.hash = target;
    if (s !== 'login') window.scrollTo({ top: 0, behavior: reduced.matches ? 'auto' : 'smooth' });
  };

  function save() {
    const tt = t(), F = st.form, L = list();
    const amt = parseFloat(F.amt) || 0, signed = F.dir === 'gan' ? amt : -amt;
    if (!(amt > 0)) { st.formErr = tt.errAmt; return render(); }
    if (!F.date) { st.formErr = tt.errDate; return render(); }
    if (L.some(e => e.date === F.date)) { st.formErr = tt.errDup; return render(); }
    const ne = { date: F.date, tk: F.tk, pnl: signed, pma: F.pma, img: F.img, plan: F.plan === 'y', notes: F.notes };
    st.entries = Object.assign({}, st.entries, { [st.acc]: [...L, ne].sort((a, b) => a.date < b.date ? -1 : 1) });
    store.saveEntries(st.entries);
    const toast = tt.logged + ' ' + dd(F.date) + ' · ' + $s(signed);
    st.form = blankForm(); st.cal = null;
    go('registros');
    st.toast = toast;
    render();
  }

  function readImg(file) {
    if (!file) return;
    const fr = new FileReader();
    fr.onload = () => { st.pasteMsg = ''; st.form.img = fr.result; render(); };
    fr.readAsDataURL(file);
  }

  async function pasteFromClipboard() {
    const tt = t();
    try {
      const items = await navigator.clipboard.read();
      for (const it of items) { const ty = it.types.find(x => x.startsWith('image/')); if (ty) return readImg(await it.getType(ty)); }
      st.pasteMsg = tt.pNone;
    } catch (e) { st.pasteMsg = tt.pKey; }
    render();
  }

  const setRule = (k, v) => { st.rules = Object.assign({}, st.rules, { [st.acc]: Object.assign({}, rules(), { [k]: v }) }); store.saveRules(st.rules); render(); };

  const actions = {
    enter: () => go('resumen'),
    logout: () => go('login'),
    go: a => go(a),
    lang: l => { st.lang = l; store.setPref('lang', l); render(); },
    theme: () => { st.theme = st.theme === 'dark' ? 'light' : 'dark'; store.setPref('theme', st.theme); render(); },
    acc: a => { st.acc = a; st.cal = null; st.toast = ''; render(); },
    cal: d => {
      const L = list(), last = L[L.length - 1], base = last ? new Date(last.date + 'T12:00:00') : new Date();
      const cm = st.cal || { y: base.getFullYear(), m: base.getMonth() };
      const nd = new Date(cm.y, cm.m + Number(d), 1); st.cal = { y: nd.getFullYear(), m: nd.getMonth() }; render();
    },
    'form-dir': v => { st.form.dir = v; render(); },
    'form-tk': v => { st.form.tk = v; render(); },
    'form-plan': v => { st.form.plan = v; render(); },
    paste: () => pasteFromClipboard(),
    'clear-img': () => { st.form.img = ''; render(); },
    save,
    hz: v => { st.hz = Number(v); render(); },
    reseed: () => { st.seed++; render(); },
    ddtype: v => setRule('type', v),
    'reset-rules': () => { st.rules = Object.assign({}, st.rules, { [st.acc]: TJ.defaultRule() }); store.saveRules(st.rules); render(); }
  };

  // ---------- events ----------
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (el && root.contains(el)) actions[el.dataset.action](el.dataset.arg);
  });
  root.addEventListener('keydown', e => {
    const el = e.target.closest('.paste');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pasteFromClipboard(); }
  });
  // Form fields: update state without re-rendering (keeps focus); refresh only the projection panel.
  root.addEventListener('input', e => {
    const k = e.target.dataset.field;
    if (!k) return;
    st.form[k] = e.target.value;
    if (st.formErr) { st.formErr = ''; const er = root.querySelector('.err[role=alert]'); if (er) er.remove(); }
    if (k === 'amt' || k === 'date') { const p = document.getElementById('proj'); if (p) p.innerHTML = projView(); }
  });
  root.addEventListener('change', e => {
    const k = e.target.dataset.rule;
    if (!k) return;
    const raw = e.target.value;
    const v = k === 'size' ? parseInt(raw, 10) : parseFloat(raw);
    const ok = k === 'be' ? v >= 0 : v > 0;
    if (isNaN(v) || !ok) { e.target.value = rules()[k]; return; }
    setRule(k, v);
  });
  document.addEventListener('paste', e => {
    if (screen() !== 'registrar') return;
    const it = [...(e.clipboardData ? e.clipboardData.items : [])].find(i => i.type.startsWith('image/'));
    if (!it) return;
    e.preventDefault(); readImg(it.getAsFile());
  });

  window.addEventListener('hashchange', render);
  window.addEventListener('resize', () => { const m = innerWidth < MOB; if (m !== mob) { mob = m; render(); } });

  // Header gains background on scroll; particles parallax.
  const particles = document.getElementById('particles');
  window.addEventListener('scroll', () => {
    const h = document.getElementById('hdr');
    if (h) h.classList.toggle('scrolled', scrollY > 8);
    if (particles && !reduced.matches) particles.style.setProperty('--sy', scrollY);
  }, { passive: true });

  // Background particles: 3 layers of random box-shadow dots (1/2/3px), no canvas.
  (function initParticles() {
    if (!particles) return;
    const counts = [90, 45, 22];
    particles.querySelectorAll('.pl i').forEach((el, i) => {
      const dots = [];
      // Extend beyond 100vh so parallax never reveals an empty band.
      for (let n = 0; n < counts[i]; n++) dots.push((Math.random() * 100).toFixed(2) + 'vw ' + (Math.random() * 160).toFixed(2) + 'vh currentColor');
      el.style.boxShadow = dots.join(',');
    });
  })();

  render();
})(window.TJ);
