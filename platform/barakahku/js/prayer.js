window.PrayerModule = (function(){
  const jadwalPath = '/data/jadwal.json';

  // Read timezone label (WIB/WITA/WIT) based on UTC offset for Indonesia
  function getIndoZoneLabel(){
    const offset = new Date().getTimezoneOffset(); // in minutes behind UTC -> negative east
    // JS returns minutes behind UTC, so Jakarta (UTC+7) => -420
    const mins = -offset;
    if (mins === 420) return 'WIB';
    if (mins === 480) return 'WITA';
    if (mins === 540) return 'WIT';
    // else return generic
    return 'WIB';
  }

  // Try to fetch remote prayer times (Aladhan) as enhancement
  async function fetchRemoteTimes(lat, lng) {
    try {
      // Optional: call Aladhan or other API (no API key needed)
      const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('no remote');
      const j = await res.json();
      if (j && j.data && j.data.timings) {
        const t = j.data.timings;
        return {
          Fajr: t.Fajr,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha
        };
      }
    } catch(e) { console.warn('fetchRemoteTimes failed', e); }
    return null;
  }

  async function loadLocalTemplate(){
    try {
      const res = await fetch(jadwalPath);
      const j = await res.json();
      return j;
    } catch(e){
      console.warn('loadLocalTemplate fail', e);
      return null;
    }
  }

  // schedule notifications: best-effort. When browser open, create timers.
  const timers = [];
  function scheduleNotifications(timesObj, enable=true){
    clearScheduled();
    if (!enable) return;
    const now = new Date();
    ['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(name=>{
      const timeStr = timesObj[name];
      if (!timeStr) return;
      const [hh,mm] = timeStr.split(':').map(x=>parseInt(x));
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
      if (target < now) target.setDate(target.getDate()+1); // next day
      const delay = target.getTime() - now.getTime();
      const id = setTimeout(()=> {
        // send message to service worker to show notification
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'show-notification',
            payload: { title: `Waktu Sholat: ${name}`, body: `Saatnya ${name}`, tag: `prayer-${name}` }
          });
        } else {
          new Notification(`Waktu Sholat: ${name}`, { body: `Saatnya ${name}`});
        }
        // For recurring: schedule again for next day
        scheduleNotifications(timesObj, true);
      }, delay);
      timers.push(id);
    });
  }
  function clearScheduled(){
    while(timers.length) {
      clearTimeout(timers.pop());
    }
  }

  async function getPrayerTimes({useGeolocation=true} = {}){
    // default: use local template times according to zone
    const localTemplate = await loadLocalTemplate();
    const zone = getIndoZoneLabel();
    const zoneTimes = (localTemplate && localTemplate.zones && localTemplate.zones[zone]) ? localTemplate.zones[zone].default_times : localTemplate?.zones?.WIB?.default_times;

    // attempt geolocation -> remote times
    if (useGeolocation && navigator.geolocation) {
      try {
        const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, {enableHighAccuracy:false, timeout:8000}));
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        const remote = await fetchRemoteTimes(lat,lng);
        if (remote) return { times: remote, zone };
      } catch(e){ console.warn('geoloc/remote failed', e); }
    }
    return { times: zoneTimes, zone };
  }

  return { getPrayerTimes, scheduleNotifications, clearScheduled, getIndoZoneLabel };
})();
