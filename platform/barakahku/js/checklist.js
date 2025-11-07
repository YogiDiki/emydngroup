// simple checklist management using barakahStorage
window.ChecklistModule = (function(){
  const KEY = 'barakah_checklist_v1';
  function loadDefault(defaultObj){
    const data = window.barakahStorage.get(KEY);
    if (!data) {
      window.barakahStorage.set(KEY, defaultObj);
      return defaultObj;
    }
    return data;
  }
  function save(state){ window.barakahStorage.set(KEY, state); }
  return { loadDefault, save, KEY };
})();
