/* Capa de acceso a datos. Hoy: localStorage (claves tj_lang, tj_theme, tj_entries, tj_rules).
   Para pasar a backend + autenticación, reemplaza estas funciones manteniendo la misma interfaz. */
(function (TJ) {
  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const okEntries = v => v && TJ.ACCOUNTS.every(a => Array.isArray(v[a]));
  const okRules = v => v && TJ.ACCOUNTS.every(a => v[a] && typeof v[a].size === 'number');

  TJ.store = {
    pref(k) { try { return localStorage.getItem('tj_' + k); } catch (e) { return null; } },
    setPref(k, v) { try { localStorage.setItem('tj_' + k, v); } catch (e) {} },

    loadEntries() { const v = read('tj_entries'); return okEntries(v) ? v : TJ.emptyEntries(); },
    saveEntries(entries) {
      try { localStorage.setItem('tj_entries', JSON.stringify(entries)); return true; }
      catch (e) {
        // Cuota llena (imágenes pegadas): guardar sin imágenes antes que perder registros.
        try {
          const lite = {};
          Object.keys(entries).forEach(k => lite[k] = entries[k].map(x => Object.assign({}, x, { img: '' })));
          localStorage.setItem('tj_entries', JSON.stringify(lite));
        } catch (e2) {}
        return false;
      }
    },

    loadRules() { const v = read('tj_rules'); return okRules(v) ? v : TJ.defaultRules(); },
    saveRules(rules) { try { localStorage.setItem('tj_rules', JSON.stringify(rules)); } catch (e) {} }
  };
})(window.TJ = window.TJ || {});
