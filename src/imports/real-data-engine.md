Aqui está o segundo prompt, focado 100% em dados reais, dinâmicos e globais:

---

## 🔴 PROMPT 2 — Dados Reais (Zero Mocks)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 PROMPT 2 — DATA ENGINE: ZERO MOCKS, 100% REAL DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is the data layer for the "DIGITAL EXPOSURE" project.
The user can be ANYWHERE in the world — Brazil, Germany, Japan, USA, anywhere.

ABSOLUTE RULE: 
  ❌ NEVER hardcode any value (no "São Paulo", no "Brazil", no fake IPs,
     no placeholder hashes, no example usernames, no dummy data of any kind)
  ✅ EVERY single value displayed to the user must be computed or fetched 
     in real-time from the actual browser or a live API call at runtime
  ✅ If a value cannot be obtained, display: "— unavailable" in --text-muted
  ✅ All API calls must be CORS-safe and work from GitHub Pages (no proxy needed)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 MODULE 1 — NETWORK DATA (real fetch, real user IP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Implement this exact async logic, in this exact fallback order:

STEP 1 — Get public IP:
  Primary:   fetch("https://api.ipify.org?format=json")      → { ip }
  Fallback1: fetch("https://api4.my-ip.io/ip.json")          → { ip }
  Fallback2: fetch("https://icanhazip.com") → plain text, trim()
  If all fail: ip = "unavailable"

STEP 2 — Get geolocation from real IP:
  Use the IP obtained in Step 1.
  Primary:   fetch(`https://ipapi.co/${ip}/json/`)
    Returns: { city, region, country_name, country_code, org, asn,
               latitude, longitude, timezone, utc_offset, 
               network, version (IPv4/IPv6) }
  
  Fallback:  fetch(`https://freeipapi.com/api/json/${ip}`)
    Returns: { cityName, regionName, countryName, countryCode,
               latitude, longitude, timeZone, ipVersion }
  
  Map fallback fields to primary field names for consistency.
  If geolocation fails entirely: all geo fields = "unavailable"

STEP 3 — WebRTC local IP leak:
  Use RTCPeerConnection to extract local network IP (192.168.x.x or 10.x.x.x).
  
  Exact implementation:
  ```javascript
  async function getLocalIP() {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(o => pc.setLocalDescription(o));
      pc.onicecandidate = (e) => {
        if (!e || !e.candidate) return;
        const match = e.candidate.candidate.match(
          /(\d{1,3}(\.\d{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{0,4}){2,7})/
        );
        if (match) { resolve(match[1]); pc.close(); }
      };
      setTimeout(() => resolve('unavailable'), 1000);
    });
  }
  ```
  
  Display result labeled: "LOCAL IP (WebRTC leak)"
  If WebRTC is blocked/unavailable: show "blocked — WebRTC disabled"
  ⚠ This is a REAL privacy leak demonstration — make it visually alarming.

STEP 4 — Connection quality (real, from browser):
  navigator.connection?.effectiveType   → "4g" / "3g" / "2g" / "slow-2g"
  navigator.connection?.downlink        → number in Mbps (e.g. 8.5)
  navigator.connection?.rtt             → round-trip time in ms (e.g. 50)
  navigator.connection?.saveData        → boolean
  If NetworkInformation API unavailable: "unavailable"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💻 MODULE 2 — SYSTEM & BROWSER (100% navigator API, real)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Collect ALL of the following. No fallback to hardcoded values — 
if unavailable, the field shows "unavailable". 

Every single line below must be a real JS expression:

  // Platform
  os_raw:            navigator.platform
  cpu_cores:         navigator.hardwareConcurrency ?? 'unavailable'
  ram_gb:            navigator.deviceMemory ?? 'unavailable'  // in GB
  device_type:       derived — if (/Mobi|Android/i.test(navigator.userAgent)) 
                       'mobile' else if (/Tablet|iPad/i.test(...)) 'tablet' 
                       else 'desktop'
  
  // Browser identity
  user_agent:        navigator.userAgent
  browser_vendor:    navigator.vendor
  language:          navigator.language
  languages:         navigator.languages.join(', ')
  do_not_track:      navigator.doNotTrack === '1' ? 'enabled' : 'disabled'
  cookies_enabled:   navigator.cookieEnabled
  java_enabled:      navigator.javaEnabled?.() ?? false
  pdf_viewer:        navigator.pdfViewerEnabled ?? 'unavailable'
  
  // Parse browser name + version from userAgent:
  // Write a parseBrowser(ua) function that returns { name, version }
  // Must correctly identify: Chrome, Firefox, Safari, Edge, Opera, Brave
  // Use userAgent string patterns — no external library
  
  // Screen
  screen_width:      screen.width
  screen_height:     screen.height
  viewport_width:    window.innerWidth
  viewport_height:   window.innerHeight
  pixel_ratio:       window.devicePixelRatio
  color_depth:       screen.colorDepth
  orientation:       screen.orientation?.type ?? 'unavailable'
  
  // Environment
  timezone:          Intl.DateTimeFormat().resolvedOptions().timeZone
  utc_offset:        new Date().getTimezoneOffset() / -60  
                     → format as "+3:00" or "-5:00" dynamically
  locale:            Intl.DateTimeFormat().resolvedOptions().locale
  timestamp_unix:    Date.now()
  local_datetime:    new Date().toLocaleString(navigator.language)
                     ← uses the REAL user locale, NOT hardcoded format
  
  // Security
  https_active:      location.protocol === 'https:' ? 'YES' : 'NO ⚠'
  webrtc_active:     typeof RTCPeerConnection !== 'undefined'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 MODULE 3 — FINGERPRINTING (real computed hashes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

All hashes must be computed from REAL browser rendering output.
Use SubtleCrypto (crypto.subtle.digest) for all SHA-256 hashing.
Never generate random hashes. The same browser must always produce 
the same hash. Different browsers must produce different hashes.

CANVAS FINGERPRINT:
  ```javascript
  async function getCanvasFingerprint() {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('DigitalExposure🔍', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('DigitalExposure🔍', 4, 17);
    const dataURL = canvas.toDataURL();
    const buffer = new TextEncoder().encode(dataURL);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2,'0')).join('').slice(0,16);
  }
  ```

WEBGL FINGERPRINT:
  ```javascript
  async function getWebGLFingerprint() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return { renderer: 'unavailable', vendor: 'unavailable', hash: 'unavailable' };
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
      : gl.getParameter(gl.RENDERER);
    const vendor = debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
      : gl.getParameter(gl.VENDOR);
    
    // Also render a scene for a visual fingerprint
    // Draw gradient triangle, read pixels
    // Hash the pixel data
    const str = renderer + vendor + gl.getParameter(gl.VERSION);
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2,'0')).join('').slice(0,16);
    
    return { renderer, vendor, hash };
  }
  ```

AUDIO FINGERPRINT:
  ```javascript
  async function getAudioFingerprint() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return 'unavailable';
      
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);
      
      gain.gain.value = 0; // muted — user hears nothing
      oscillator.type = 'triangle';
      oscillator.frequency.value = 10000;
      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(ctx.destination);
      
      return new Promise((resolve) => {
        scriptProcessor.onaudioprocess = async (e) => {
          const samples = e.inputBuffer.getChannelData(0);
          const sum = samples.slice(0, 500).reduce((a,b) => a + Math.abs(b), 0);
          const str = sum.toString();
          const buffer = new TextEncoder().encode(str);
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          resolve(hashArray.map(b => b.toString(16).padStart(2,'0')).join('').slice(0,16));
          oscillator.stop();
          ctx.close();
        };
        oscillator.start(0);
        setTimeout(() => resolve('timeout'), 3000);
      });
    } catch(e) { return 'unavailable'; }
  }
  ```

FONT DETECTION (no external lib):
  ```javascript
  function detectFonts() {
    const testFonts = [
      'Arial','Verdana','Helvetica','Times New Roman','Courier New',
      'Georgia','Palatino','Garamond','Bookman','Comic Sans MS',
      'Trebuchet MS','Impact','Lucida Console','Tahoma','Geneva',
      'Segoe UI','Roboto','Ubuntu','Fira Code','Consolas'
    ];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const baseFonts = ['monospace','sans-serif','serif'];
    const testString = 'mmmmmmmmmmlli';
    
    function getWidth(font) {
      ctx.font = `72px ${font}`;
      return ctx.measureText(testString).width;
    }
    
    const baseWidths = {};
    baseFonts.forEach(f => baseWidths[f] = getWidth(f));
    
    const detected = testFonts.filter(font => {
      return baseFonts.some(base => 
        getWidth(`'${font}',${base}`) !== baseWidths[base]
      );
    });
    
    return detected; // real list, differs per device/OS
  }
  ```

MASTER DEVICE HASH:
  Combine ALL collected data into one deterministic hash:
  ```javascript
  async function generateDeviceHash(data) {
    const components = [
      data.canvas_hash,
      data.webgl_hash,
      data.audio_hash,
      data.renderer,
      data.cpu_cores,
      data.ram_gb,
      data.screen_width,
      data.screen_height,
      data.pixel_ratio,
      data.color_depth,
      data.timezone,
      data.language,
      data.platform,
      data.fonts_detected.join(',')
    ].join('|');
    
    const buffer = new TextEncoder().encode(components);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
    
    // Format as groups: XXXX·XXXX·XXXX·XXXX
    return hex.slice(0,4).toUpperCase() + '·' +
           hex.slice(4,8).toUpperCase() + '·' +
           hex.slice(8,12).toUpperCase() + '·' +
           hex.slice(12,16).toUpperCase();
  }
  ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔋 MODULE 4 — DEVICE SENSORS & MEDIA (real APIs)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BATTERY:
  ```javascript
  async function getBattery() {
    if (!navigator.getBattery) return { level: 'unavailable', charging: 'unavailable', eta: 'unavailable' };
    const battery = await navigator.getBattery();
    return {
      level: Math.round(battery.level * 100) + '%',  // e.g. "74%"
      charging: battery.charging ? 'YES — charging' : 'NO — on battery',
      time_to_full: battery.chargingTime === Infinity 
        ? 'unavailable' 
        : Math.round(battery.chargingTime / 60) + ' min'
    };
  }
  ```

MEDIA DEVICES:
  ```javascript
  async function getMediaDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        cameras:     devices.filter(d => d.kind === 'videoinput').length,
        microphones: devices.filter(d => d.kind === 'audioinput').length,
        speakers:    devices.filter(d => d.kind === 'audiooutput').length,
        total:       devices.length
      };
    } catch(e) {
      return { cameras: 'unavailable', microphones: 'unavailable', 
               speakers: 'unavailable', total: 'unavailable' };
    }
  }
  ```

SENSORS (check availability, do not request permission):
  ```javascript
  function getSensorSupport() {
    return {
      accelerometer:    typeof DeviceMotionEvent !== 'undefined',
      gyroscope:        typeof DeviceOrientationEvent !== 'undefined',
      touch_points:     navigator.maxTouchPoints ?? 0,
      pointer_type:     window.matchMedia('(pointer: coarse)').matches 
                          ? 'touch' : 'mouse/trackpad'
    };
  }
  ```

STORAGE AVAILABILITY:
  Test each — catch errors, return boolean:
  ```javascript
  function getStorageSupport() {
    const test = (fn) => { try { fn(); return true; } catch(e) { return false; } };
    return {
      localstorage:   test(() => localStorage.setItem('_t','1') || localStorage.removeItem('_t')),
      sessionstorage: test(() => sessionStorage.setItem('_t','1') || sessionStorage.removeItem('_t')),
      indexeddb:      typeof indexedDB !== 'undefined',
      cookies:        navigator.cookieEnabled,
      cache_api:      typeof caches !== 'undefined'
    };
  }
  ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 MODULE 5 — EXPOSURE SCORE (calculated, not fixed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The score shown to the user must be CALCULATED from their real data.
Never show a hardcoded "78/100". The score varies per user.

```javascript
function calculateExposureScore(data) {
  let score = 0;
  let factors = [];

  // Network exposure (max 30 pts)
  if (data.ip !== 'unavailable')         { score += 10; factors.push('IP exposed (+10)'); }
  if (data.local_ip !== 'unavailable')   { score += 10; factors.push('Local IP leaked via WebRTC (+10)'); }
  if (data.isp !== 'unavailable')        { score += 5;  factors.push('ISP identified (+5)'); }
  if (data.city !== 'unavailable')       { score += 5;  factors.push('City exposed (+5)'); }

  // Fingerprint quality (max 30 pts)
  if (data.canvas_hash !== 'unavailable') { score += 8; factors.push('Canvas fingerprint (+8)'); }
  if (data.webgl_hash !== 'unavailable')  { score += 8; factors.push('WebGL fingerprint (+8)'); }
  if (data.audio_hash !== 'unavailable')  { score += 7; factors.push('Audio fingerprint (+7)'); }
  if (data.fonts_detected.length > 5)    { score += 7; factors.push('Font fingerprint (+7)'); }

  // System info (max 20 pts)
  if (data.cpu_cores !== 'unavailable')  { score += 5; }
  if (data.ram_gb !== 'unavailable')     { score += 5; }
  if (data.gpu_renderer !== 'unavailable') { score += 5; }
  if (data.battery_level !== 'unavailable') { score += 5; }

  // Privacy settings (max 20 pts — penalties for bad hygiene)
  if (data.do_not_track === 'disabled')  { score += 5;  factors.push('DNT disabled (+5)'); }
  if (data.cookies_enabled)             { score += 5;  factors.push('Cookies enabled (+5)'); }
  if (data.https_active === 'NO ⚠')    { score += 10; factors.push('No HTTPS — severe (+10)'); }

  const capped = Math.min(score, 100);

  return {
    score: capped,
    label: capped >= 70 ? 'HIGH' : capped >= 40 ? 'MEDIUM' : 'LOW',
    color: capped >= 70 ? 'red' : capped >= 40 ? 'amber' : 'green',
    factors,
    data_points_count: Object.values(data)
      .filter(v => v !== 'unavailable' && v !== false && v !== null).length
  };
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ MODULE 6 — MASTER ORCHESTRATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Write one async function that runs ALL modules above in parallel 
where possible (Promise.allSettled for API calls), then populates 
the UI with real values. This is the entry point called on page load.

```javascript
async function collectAllData() {
  // Phase 1 — parallel where possible
  const [ipResult, localIP, battery, mediaDevices] = await Promise.allSettled([
    fetchPublicIP(),     // with fallback chain
    getLocalIP(),
    getBattery(),
    getMediaDevices()
  ]);

  const ip = ipResult.status === 'fulfilled' ? ipResult.value : 'unavailable';

  // Phase 2 — depends on IP
  const geoResult = await fetchGeoFromIP(ip).catch(() => ({}));

  // Phase 3 — local browser APIs (synchronous)
  const system    = getSystemData();
  const screen    = getScreenData();
  const storage   = getStorageSupport();
  const sensors   = getSensorSupport();
  const fonts     = detectFonts();
  const env       = getEnvironmentData();  // timezone, locale, datetime

  // Phase 4 — fingerprints (async, can run in parallel)
  const [canvasHash, webglData, audioHash] = await Promise.allSettled([
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    getAudioFingerprint()
  ]);

  // Assemble full data object
  const data = {
    // Network
    ip,
    local_ip:         localIP.status === 'fulfilled' ? localIP.value : 'unavailable',
    isp:              geoResult.org ?? 'unavailable',
    asn:              geoResult.asn ?? 'unavailable',
    country:          geoResult.country_name ?? 'unavailable',
    country_code:     geoResult.country_code ?? 'unavailable',
    region:           geoResult.region ?? 'unavailable',
    city:             geoResult.city ?? 'unavailable',       // REAL city from IP
    latitude:         geoResult.latitude ?? 'unavailable',
    longitude:        geoResult.longitude ?? 'unavailable',
    connection_type:  navigator.connection?.effectiveType ?? 'unavailable',
    downlink_mbps:    navigator.connection?.downlink ?? 'unavailable',
    rtt_ms:           navigator.connection?.rtt ?? 'unavailable',
    
    // System
    ...system,
    ...screen,
    
    // Fingerprints
    canvas_hash:  canvasHash.status === 'fulfilled' ? canvasHash.value : 'unavailable',
    webgl_hash:   webglData.status === 'fulfilled' ? webglData.value.hash : 'unavailable',
    gpu_renderer: webglData.status === 'fulfilled' ? webglData.value.renderer : 'unavailable',
    gpu_vendor:   webglData.status === 'fulfilled' ? webglData.value.vendor : 'unavailable',
    audio_hash:   audioHash.status === 'fulfilled' ? audioHash.value : 'unavailable',
    fonts_detected: fonts,
    
    // Device
    battery_level:    battery.status === 'fulfilled' ? battery.value.level : 'unavailable',
    charging_status:  battery.status === 'fulfilled' ? battery.value.charging : 'unavailable',
    cameras:          mediaDevices.status === 'fulfilled' ? mediaDevices.value.cameras : 'unavailable',
    microphones:      mediaDevices.status === 'fulfilled' ? mediaDevices.value.microphones : 'unavailable',
    
    // Storage & sensors
    ...storage,
    ...sensors,
    ...env
  };

  // Phase 5 — derived values
  data.device_hash   = await generateDeviceHash(data);
  data.exposure      = calculateExposureScore(data);

  return data;
}
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 MODULE 7 — ENDPOINTS FINAL REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These are the ONLY external calls allowed. All others must be local JS.
All must work globally — not just for one country or region.

┌─────────────────────────────────────────────────────────┐
│ 1. PUBLIC IP DETECTION                                  │
│    URL:    https://api.ipify.org?format=json            │
│    Method: GET                                          │
│    Returns:{ "ip": "203.0.113.42" }                    │
│    CORS:   ✅ open                                      │
│    Fallback: https://api4.my-ip.io/ip.json             │
│    Fallback: https://icanhazip.com (plain text)         │
├─────────────────────────────────────────────────────────┤
│ 2. IP GEOLOCATION                                       │
│    URL:    https://ipapi.co/{ip}/json/                  │
│    Method: GET                                          │
│    Returns: city, region, country_name, org, asn,      │
│             latitude, longitude, timezone, utc_offset   │
│    CORS:   ✅ open (30k req/month free, no key)        │
│    Fallback: https://freeipapi.com/api/json/{ip}        │
├─────────────────────────────────────────────────────────┤
│ 3. ALL OTHER DATA                                       │
│    Source: Browser APIs only (no external call needed)  │
│    APIs:   Navigator, WebGL, Canvas, AudioContext,      │
│            RTCPeerConnection, Battery, MediaDevices,     │
│            SubtleCrypto, Intl, Screen, matchMedia       │
└─────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MANDATORY FINAL OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Deliver a single index.html file containing:

[ ] All 7 modules above as working JavaScript
[ ] The full UI from PROMPT 1 (cyberpunk design)
[ ] Every displayed value wired to real collected data
[ ] Loading states: each field shows "scanning..." then 
    updates with real value when resolved
[ ] Error states: if any API fails, field shows "unavailable" 
    (never crashes the page, never shows a hardcoded fallback value)
[ ] The score gauge animates from 0 to the REAL calculated score
[ ] The fingerprint ID shows the REAL computed device hash
[ ] The city/country shown is from the REAL user IP geolocation
[ ] All data collection starts automatically on page load
[ ] Works for users in any country, any city, any network

VALIDATION CHECKLIST (test before delivering):
[ ] Open in Chrome incognito → page collects and displays all data
[ ] Open in Firefox → different canvas/audio hash than Chrome ✓
[ ] Open on mobile → device_type shows 'mobile', touch_points > 0 ✓
[ ] Disconnect internet → API fields show 'unavailable', page still works ✓
[ ] No hardcoded city, country, IP, hash, or score anywhere in the code ✓
```

---

**O que esse prompt resolve que o anterior não fazia:**

- **Proíbe explicitamente** qualquer valor hardcoded com exemplos concretos do que não pode aparecer
- **Cadeia de fallbacks** para IP — se uma API cair, tenta a próxima automaticamente
- **A cidade/país é sempre real** — vem do IP do usuário, não importa onde ele esteja
- **O score é calculado** a partir dos dados reais coletados, varia por pessoa
- **O hash do dispositivo** é um SHA-256 de dados reais do browser, nunca o mesmo entre usuários
- **Checklist de validação** no final força o Figma Make a testar cenários reais