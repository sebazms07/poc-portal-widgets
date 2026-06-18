/*
 * Inyecta la barra superior (badges de stack/env/versión) y la nota al pie,
 * leyendo los parámetros que el portal pasa por query string.
 * Cada demo solo debe incluir <header id="demo-chrome"></header> y
 * <footer id="demo-note"></footer> y este script.
 */
(function () {
  const q = new URLSearchParams(location.search);
  const pathId = location.pathname.split('/').filter(Boolean).slice(-1)[0];
  const id = q.get('id') || pathId || 'widget';
  const name = q.get('name') || id;
  const stack = q.get('stack') || 'angular';
  const env = q.get('env') || 'prod';
  const version = q.get('version') || '';

  document.title = name + ' · demo';

  const head = document.getElementById('demo-chrome');
  if (head) {
    head.className = 'demo-chrome';
    const badges = [
      `<span class="dc-badge dc-${stack}">${stack}</span>`,
      `<span class="dc-badge dc-env dc-${env}">${env}</span>`,
    ];
    if (version) badges.push(`<span class="dc-badge dc-ver">v${version}</span>`);
    head.innerHTML =
      `<span class="dc-name">${name}</span><span class="dc-badges">${badges.join('')}</span>`;
  }

  const note = document.getElementById('demo-note');
  if (note) {
    note.className = 'demo-note';
    note.textContent =
      'Demo simulada · en producción este iframe carga el build estático real de widgets.tuorg.dev';
  }
})();
