window.barakahStorage = (function(){
  function get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return localStorage.getItem(k); } }
  function set(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
  function remove(k){ localStorage.removeItem(k); }
  return { get, set, remove };
})();
