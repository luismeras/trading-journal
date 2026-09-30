/* Lógica de cálculo: cuenta, estadísticas y Monte Carlo. Sin dependencias del DOM. */
(function (TJ) {
  TJ.ACCOUNTS = ['Backtest', 'Demo', 'Live'];

  TJ.defaultRule = () => ({ size: 50000, pct: 6, mll: 2000, type: 'trailing', be: 50 });
  TJ.defaultRules = () => ({ Backtest: TJ.defaultRule(), Demo: TJ.defaultRule(), Live: TJ.defaultRule() });
  TJ.emptyEntries = () => ({ Backtest: [], Demo: [], Live: [] });

  TJ.isoDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  TJ.today = () => TJ.isoDate(new Date());

  // Floor for a given peak balance.
  TJ.floorAt = (r, peak) => r.type === 'trailing' ? Math.min(r.size, peak - r.mll) : r.size - r.mll;

  /** list: entries sorted by date ascending ({date, pnl, plan, ...}); r: rules. */
  TJ.calc = function (list, r) {
    const size = r.size, target = size * r.pct / 100, be = r.be;
    let bal = size, peak = size, lost = false, ok = false;
    const rows = list.map(e => {
      bal += e.pnl; peak = Math.max(peak, bal);
      const floor = TJ.floorAt(r, peak);
      const cush = bal - floor;
      if (bal <= floor) lost = true;
      if (bal - size >= target) ok = true;
      return Object.assign({}, e, { bal, floor, cush, prog: (bal - size) / target });
    });
    const net = bal - size;
    const wins = list.filter(e => e.pnl > be), loss = list.filter(e => e.pnl < -be);
    const gw = wins.reduce((a, e) => a + e.pnl, 0), gl = Math.abs(loss.reduce((a, e) => a + e.pnl, 0));
    let streak = 0, ms = 0;
    list.forEach(e => { if (e.pnl < -be) { streak++; ms = Math.max(ms, streak); } else streak = 0; });
    let pk = size, dd = 0, b2 = size;
    list.forEach(e => { b2 += e.pnl; pk = Math.max(pk, b2); dd = Math.max(dd, pk - b2); });
    const last = rows[rows.length - 1];
    const floor = last ? last.floor : size - r.mll;
    return {
      rows, size, target, net, bal, floor, cush: bal - floor, lost, ok, gw, gl, wins, loss, ms, dd, last, n: list.length, be,
      wr: wins.length + loss.length ? wins.length / (wins.length + loss.length) * 100 : 0,
      pf: gl ? gw / gl : (gw ? 99 : 0),
      avgW: wins.length ? gw / wins.length : 0,
      avgL: loss.length ? gl / loss.length : 0,
      exp: list.length ? net / list.length : 0
    };
  };

  /** Monte Carlo: resamples daily P&L with replacement. Deterministic for a given seed. */
  TJ.sim = function (list, r, hz, seed, N) {
    N = N || 5000;
    const pn = list.map(e => e.pnl), size = r.size, target = size * r.pct / 100;
    let s = seed * 9301 + 49297;
    const rnd = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    let pass = 0, bust = 0; const days = [];
    for (let i = 0; i < N; i++) {
      let bal = size, peak = size, res = 0;
      for (let d = 1; d <= hz; d++) {
        bal += pn[Math.floor(rnd() * pn.length)]; peak = Math.max(peak, bal);
        if (bal <= TJ.floorAt(r, peak)) { res = -1; break; }
        if (bal - size >= target) { res = 1; days.push(d); break; }
      }
      if (res === 1) pass++; else if (res === -1) bust++;
    }
    days.sort((a, b) => a - b);
    return { N, pass: pass / N * 100, bust: bust / N * 100, open: (N - pass - bust) / N * 100, med: days.length ? days[Math.floor(days.length / 2)] : 0 };
  };

  TJ.verdict = res => res.pass >= 60 && res.bust <= 30 ? 'clear' : res.pass > res.bust ? 'marginal' : 'none';

  // Formatting (cifras siempre en en-US, como en el diseño).
  TJ.fmt = {
    usd: n => (n < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US'),
    usdS: n => (Math.round(n) > 0 ? '+' : Math.round(n) < 0 ? '−' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-US'),
    pct: (n, d) => n.toFixed(d || 0) + '%'
  };
})(window.TJ = window.TJ || {});
