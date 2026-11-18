/* © 2026 Think! Design and Planning, LLC. All rights reserved.
   Keyboard access for the app's clickable cards and scroll areas.
   Many views render <div onclick="..."> cards; this makes each one reachable with Tab
   and usable with Enter/Space, and lets keyboard users scroll overflow regions. */

(function () {
  const NATIVE = /^(A|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|SUMMARY|OPTION)$/;
  const SCROLLERS = '.wizard-steps, .pipeline-board, main, .workspace';

  function fix(root) {
    root.querySelectorAll('[onclick]').forEach(el => {
      if (NATIVE.test(el.tagName) || el.dataset.a11y) return;
      if (el.querySelector('a, button, input, select, textarea')) return; // container with its own controls
      el.dataset.a11y = '1';
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    });
    root.querySelectorAll(SCROLLERS).forEach(el => {
      if (!el.hasAttribute('tabindex') && el.scrollWidth + el.scrollHeight > el.clientWidth + el.clientHeight) el.tabIndex = 0;
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target;
    if (!el || !el.dataset || el.dataset.a11y !== '1' || el.getAttribute('role') !== 'button') return;
    e.preventDefault();
    el.click();
  });

  let queued = false;
  const run = () => { queued = false; fix(document); };
  new MutationObserver(() => { if (!queued) { queued = true; setTimeout(run, 0); } })
    .observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', run);
})();
