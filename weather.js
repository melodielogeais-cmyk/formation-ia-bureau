// Météo de Bordeaux en temps réel : Open-Meteo, avec wttr.in en secours.
// Remplit les éléments [data-weather="temp|desc|wind|icon|updated"] et se rafraîchit toutes les 10 min.
(function () {
  const WMO = {0:'Grand soleil',1:'Plutôt ensoleillé',2:'Partiellement nuageux',3:'Couvert',45:'Brouillard',48:'Brouillard givrant',
    51:'Bruine légère',53:'Bruine',55:'Bruine dense',61:'Pluie faible',63:'Pluie',65:'Forte pluie',66:'Pluie verglaçante',67:'Pluie verglaçante',
    71:'Neige faible',73:'Neige',75:'Forte neige',80:'Averses',81:'Averses',82:'Fortes averses',95:'Orage',96:'Orage et grêle',99:'Orage et grêle'};
  const icon = c => c === 0 || c === 1 ? '☀' : c === 2 ? '⛅' : c === 3 || c === 45 || c === 48 ? '☁' : c >= 95 ? '⚡' : c >= 71 && c <= 77 ? '❄' : '☂';

  async function fromOpenMeteo() {
    const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=44.84&longitude=-0.58&current=temperature_2m,weather_code,wind_speed_10m&timezone=Europe%2FParis');
    const d = await r.json();
    if (!d.current) throw new Error('open-meteo indisponible');
    const c = d.current.weather_code;
    return { temp: Math.round(d.current.temperature_2m), desc: WMO[c] || 'Variable', wind: Math.round(d.current.wind_speed_10m), icon: icon(c) };
  }

  async function fromWttr() {
    const r = await fetch('https://wttr.in/Bordeaux?format=j1&lang=fr');
    const c = (await r.json()).current_condition[0];
    const desc = (c.lang_fr && c.lang_fr[0].value) || c.weatherDesc[0].value;
    const code = +c.weatherCode;
    const ic = code === 113 ? '☀' : code === 116 ? '⛅' : code === 119 || code === 122 || code === 143 || code === 248 ? '☁' : code >= 386 ? '⚡' : [179,227,230,323,326,329,332,335,338,368,371].includes(code) ? '❄' : '☂';
    return { temp: +c.temp_C, desc: desc.charAt(0).toUpperCase() + desc.slice(1).toLowerCase(), wind: +c.windspeedKmph, icon: ic };
  }

  function paint(w) {
    const set = (k, v) => document.querySelectorAll(`[data-weather="${k}"]`).forEach(el => el.textContent = v);
    set('temp', w.temp + '°');
    set('desc', w.desc);
    set('wind', w.wind + ' km/h');
    set('icon', w.icon);
    set('updated', 'mis à jour à ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    document.querySelectorAll('[data-weather-box]').forEach(el => el.hidden = false);
  }

  async function update() {
    try { paint(await fromOpenMeteo()); }
    catch (e) { try { paint(await fromWttr()); } catch (e2) { /* garde l'affichage précédent */ } }
  }

  update();
  setInterval(update, 10 * 60 * 1000);
})();
