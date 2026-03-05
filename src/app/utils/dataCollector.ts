// ============================================================
// DIGITAL EXPOSURE — Data Collection Engine
// Coleta dados reais do browser. Zero mocks. Zero hardcode.
// ============================================================

export interface ExposureScore {
  score: number;
  label: 'HIGH' | 'MEDIUM' | 'LOW';
  color: 'red' | 'amber' | 'green';
  factors: string[];
  data_points_count: number;
}

export interface CollectedData {
  // Network
  ip: string;
  local_ip: string;
  isp: string;
  asn: string;
  country: string;
  country_code: string;
  region: string;
  city: string;
  latitude: string | number;
  longitude: string | number;
  connection_type: string;
  downlink_mbps: string | number;
  rtt_ms: string | number;
  // System
  os_raw: string;
  platform: string;
  cpu_cores: string | number;
  ram_gb: string | number;
  device_type: string;
  // Browser
  user_agent: string;
  browser_vendor: string;
  browser_name: string;
  browser_version: string;
  language: string;
  languages: string;
  do_not_track: string;
  cookies_enabled: boolean | string;
  pdf_viewer: boolean | string;
  webassembly: boolean | string;
  service_workers: boolean | string;
  // Screen
  screen_width: number;
  screen_height: number;
  viewport_width: number;
  viewport_height: number;
  pixel_ratio: number;
  color_depth: number;
  orientation: string;
  // Environment
  timezone: string;
  utc_offset: string;
  locale: string;
  timestamp_unix: number;
  local_datetime: string;
  // Security
  https_active: string;
  webrtc_active: string;
  // Fingerprints
  canvas_hash: string;
  webgl_hash: string;
  gpu_renderer: string;
  gpu_vendor: string;
  audio_hash: string;
  fonts_detected: string[];
  // Battery
  battery_level: string;
  charging_status: string;
  time_to_full: string;
  // Media
  cameras: string | number;
  microphones: string | number;
  speakers: string | number;
  // Sensors
  accelerometer: boolean | string;
  gyroscope: boolean | string;
  touch_points: number;
  pointer_type: string;
  // Storage
  localstorage: boolean | string;
  sessionstorage: boolean | string;
  indexeddb: boolean | string;
  cache_api: boolean | string;
  // Derived
  device_hash: string;
  exposure: ExposureScore;
}

// ── Browser parser ─────────────────────────────────────────
export function parseBrowser(ua: string): { name: string; version: string } {
  if (/Edg\//.test(ua)) {
    const v = ua.match(/Edg\/([\d.]+)/);
    return { name: 'Edge', version: v?.[1] ?? 'unknown' };
  }
  if (/OPR\//.test(ua)) {
    const v = ua.match(/OPR\/([\d.]+)/);
    return { name: 'Opera', version: v?.[1] ?? 'unknown' };
  }
  if (/Brave/.test(ua)) return { name: 'Brave', version: 'unknown' };
  if (/Firefox\//.test(ua)) {
    const v = ua.match(/Firefox\/([\d.]+)/);
    return { name: 'Firefox', version: v?.[1] ?? 'unknown' };
  }
  if (/Chrome\//.test(ua)) {
    const v = ua.match(/Chrome\/([\d.]+)/);
    return { name: 'Chrome', version: v?.[1] ?? 'unknown' };
  }
  if (/Safari\//.test(ua)) {
    const v = ua.match(/Version\/([\d.]+)/);
    return { name: 'Safari', version: v?.[1] ?? 'unknown' };
  }
  return { name: 'Unknown', version: 'unknown' };
}

// ── System data ────────────────────────────────────────────
export function getSystemData() {
  const ua = navigator.userAgent;
  const browser = parseBrowser(ua);
  const deviceType = /Mobi|Android/i.test(ua)
    ? 'mobile'
    : /Tablet|iPad/i.test(ua)
    ? 'tablet'
    : 'desktop';

  const offsetMin = new Date().getTimezoneOffset();
  const offsetHr = offsetMin / -60;
  const offsetStr = offsetHr >= 0 ? `+${offsetHr}:00` : `${offsetHr}:00`;

  return {
    os_raw: navigator.platform,
    platform: navigator.platform,
    cpu_cores: navigator.hardwareConcurrency ?? 'unavailable',
    ram_gb: (navigator as any).deviceMemory ?? 'unavailable',
    device_type: deviceType,
    user_agent: navigator.userAgent,
    browser_vendor: navigator.vendor,
    browser_name: browser.name,
    browser_version: browser.version,
    language: navigator.language,
    languages: navigator.languages?.join(', ') ?? 'unavailable',
    do_not_track: navigator.doNotTrack === '1' ? 'enabled' : 'disabled',
    cookies_enabled: navigator.cookieEnabled,
    pdf_viewer: (navigator as any).pdfViewerEnabled ?? 'unavailable',
    webassembly: typeof WebAssembly !== 'undefined',
    service_workers: 'serviceWorker' in navigator,
    screen_width: screen.width,
    screen_height: screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    pixel_ratio: window.devicePixelRatio,
    color_depth: screen.colorDepth,
    orientation: screen.orientation?.type ?? 'unavailable',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    utc_offset: offsetStr,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    timestamp_unix: Date.now(),
    local_datetime: new Date().toLocaleString(navigator.language),
    https_active: location.protocol === 'https:' ? 'YES' : 'NO ⚠',
    webrtc_active: typeof RTCPeerConnection !== 'undefined' ? 'YES' : 'NO',
    connection_type: (navigator as any).connection?.effectiveType ?? 'unavailable',
    downlink_mbps: (navigator as any).connection?.downlink ?? 'unavailable',
    rtt_ms: (navigator as any).connection?.rtt ?? 'unavailable',
  };
}

// ── IP fetch with fallback chain ───────────────────────────
export async function fetchPublicIP(): Promise<string> {
  const timeout = (ms: number) => new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms));

  try {
    const r = await Promise.race([
      fetch('https://api.ipify.org?format=json'),
      timeout(3000),
    ]) as Response;
    const d = await r.json();
    if (d.ip) return d.ip;
  } catch {}

  try {
    const r = await Promise.race([
      fetch('https://api4.my-ip.io/ip.json'),
      timeout(3000),
    ]) as Response;
    const d = await r.json();
    if (d.ip) return d.ip;
  } catch {}

  try {
    const r = await Promise.race([
      fetch('https://icanhazip.com'),
      timeout(3000),
    ]) as Response;
    const text = await r.text();
    return text.trim();
  } catch {}

  return 'unavailable';
}

// ── Geo from IP ────────────────────────────────────────────
export async function fetchGeoFromIP(ip: string) {
  if (!ip || ip === 'unavailable') return null;
  const timeout = (ms: number) => new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms));

  try {
    const r = await Promise.race([
      fetch(`https://ipapi.co/${ip}/json/`),
      timeout(5000),
    ]) as Response;
    const d = await r.json();
    if (!d.error) return d;
  } catch {}

  try {
    const r = await Promise.race([
      fetch(`https://freeipapi.com/api/json/${ip}`),
      timeout(5000),
    ]) as Response;
    const d = await r.json();
    return {
      city: d.cityName,
      region: d.regionName,
      country_name: d.countryName,
      country_code: d.countryCode,
      org: 'unavailable',
      asn: 'unavailable',
      latitude: d.latitude,
      longitude: d.longitude,
      timezone: d.timeZone,
      utc_offset: 'unavailable',
    };
  } catch {}

  return null;
}

// ── WebRTC local IP leak ───────────────────────────────────
export async function getLocalIP(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      pc.createDataChannel('');
      pc.createOffer().then(o => pc.setLocalDescription(o)).catch(() => {});
      pc.onicecandidate = (e) => {
        if (!e?.candidate) return;
        const match = e.candidate.candidate.match(
          /(\d{1,3}(\.\d{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{0,4}){2,7})/
        );
        if (match) {
          const ip = match[1];
          if (/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(ip)) {
            resolve(ip);
            pc.close();
          }
        }
      };
      setTimeout(() => { resolve('unavailable'); try { pc.close(); } catch {} }, 2500);
    } catch {
      resolve('unavailable');
    }
  });
}

// ── Canvas fingerprint ─────────────────────────────────────
export async function getCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'unavailable';
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
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  } catch {
    return 'unavailable';
  }
}

// ── WebGL fingerprint ──────────────────────────────────────
export async function getWebGLFingerprint(): Promise<{ renderer: string; vendor: string; hash: string }> {
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (!gl) return { renderer: 'unavailable', vendor: 'unavailable', hash: 'unavailable' };
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);
    const str = renderer + vendor + gl.getParameter(gl.VERSION);
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    return { renderer, vendor, hash };
  } catch {
    return { renderer: 'unavailable', vendor: 'unavailable', hash: 'unavailable' };
  }
}

// ── Audio fingerprint ──────────────────────────────────────
export async function getAudioFingerprint(): Promise<string> {
  try {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return 'unavailable';
    const ctx = new AC();
    const oscillator = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);
    gain.gain.value = 0;
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(ctx.destination);

    return new Promise((resolve) => {
      scriptProcessor.onaudioprocess = async (e) => {
        const samples = e.inputBuffer.getChannelData(0);
        const sum = Array.from(samples.slice(0, 500)).reduce((a, b) => a + Math.abs(b), 0);
        const str = sum.toString();
        const buffer = new TextEncoder().encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        resolve(hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16));
        oscillator.stop();
        ctx.close().catch(() => {});
      };
      oscillator.start(0);
      setTimeout(() => { resolve('timeout'); ctx.close().catch(() => {}); }, 3000);
    });
  } catch {
    return 'unavailable';
  }
}

// ── Font detection ─────────────────────────────────────────
export function detectFonts(): string[] {
  const testFonts = [
    'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
    'Trebuchet MS', 'Impact', 'Lucida Console', 'Tahoma', 'Geneva',
    'Segoe UI', 'Roboto', 'Ubuntu', 'Fira Code', 'Consolas',
  ];
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testStr = 'mmmmmmmmmmlli';
    const getW = (font: string) => { ctx.font = `72px ${font}`; return ctx.measureText(testStr).width; };
    const baseWidths: Record<string, number> = {};
    baseFonts.forEach(f => { baseWidths[f] = getW(f); });
    return testFonts.filter(font =>
      baseFonts.some(base => getW(`'${font}',${base}`) !== baseWidths[base])
    );
  } catch {
    return [];
  }
}

// ── Battery ────────────────────────────────────────────────
export async function getBattery(): Promise<{ level: string; charging: string; time_to_full: string }> {
  try {
    if (!(navigator as any).getBattery) throw new Error('N/A');
    const b = await (navigator as any).getBattery();
    return {
      level: Math.round(b.level * 100) + '%',
      charging: b.charging ? 'YES — carregando' : 'NO — bateria',
      time_to_full: b.chargingTime === Infinity ? 'unavailable' : Math.round(b.chargingTime / 60) + ' min',
    };
  } catch {
    return { level: 'unavailable', charging: 'unavailable', time_to_full: 'unavailable' };
  }
}

// ── Media devices ──────────────────────────────────────────
export async function getMediaDevicesData() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      cameras: devices.filter(d => d.kind === 'videoinput').length,
      microphones: devices.filter(d => d.kind === 'audioinput').length,
      speakers: devices.filter(d => d.kind === 'audiooutput').length,
    };
  } catch {
    return { cameras: 'unavailable', microphones: 'unavailable', speakers: 'unavailable' };
  }
}

// ── Sensors ────────────────────────────────────────────────
export function getSensorSupport() {
  return {
    accelerometer: typeof DeviceMotionEvent !== 'undefined',
    gyroscope: typeof DeviceOrientationEvent !== 'undefined',
    touch_points: navigator.maxTouchPoints ?? 0,
    pointer_type: window.matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse/trackpad',
  };
}

// ── Storage ────────────────────────────────────────────────
export function getStorageSupport() {
  const test = (fn: () => void) => { try { fn(); return true; } catch { return false; } };
  return {
    localstorage: test(() => { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); }),
    sessionstorage: test(() => { sessionStorage.setItem('_t', '1'); sessionStorage.removeItem('_t'); }),
    indexeddb: typeof indexedDB !== 'undefined',
    cache_api: typeof caches !== 'undefined',
  };
}

// ── Device hash (SHA-256) ──────────────────────────────────
export async function generateDeviceHash(data: Partial<CollectedData>): Promise<string> {
  const components = [
    data.canvas_hash, data.webgl_hash, data.audio_hash, data.gpu_renderer,
    data.cpu_cores, data.ram_gb, data.screen_width, data.screen_height,
    data.pixel_ratio, data.color_depth, data.timezone, data.language,
    data.platform, (data.fonts_detected ?? []).join(','),
  ].join('|');

  try {
    const buffer = new TextEncoder().encode(components);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return [
      hex.slice(0, 4), hex.slice(4, 8), hex.slice(8, 12),
      hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 24),
    ].join('·').toUpperCase();
  } catch {
    return 'XXXX·XXXX·XXXX·XXXX·XXXX·XXXX';
  }
}

// ── Exposure score (calculated, not fixed) ─────────────────
export function calculateExposureScore(data: Partial<CollectedData>): ExposureScore {
  let score = 0;
  const factors: string[] = [];

  if (data.ip && data.ip !== 'unavailable') { score += 10; factors.push('IP exposto (+10)'); }
  if (data.local_ip && data.local_ip !== 'unavailable') { score += 10; factors.push('IP local vazado via WebRTC (+10)'); }
  if (data.isp && data.isp !== 'unavailable') { score += 5; factors.push('ISP identificado (+5)'); }
  if (data.city && data.city !== 'unavailable') { score += 5; factors.push('Cidade exposta (+5)'); }

  if (data.canvas_hash && data.canvas_hash !== 'unavailable') { score += 8; factors.push('Canvas fingerprint (+8)'); }
  if (data.webgl_hash && data.webgl_hash !== 'unavailable') { score += 8; factors.push('WebGL fingerprint (+8)'); }
  if (data.audio_hash && !['unavailable', 'timeout'].includes(data.audio_hash as string)) { score += 7; factors.push('Audio fingerprint (+7)'); }
  if ((data.fonts_detected ?? []).length > 5) { score += 7; factors.push('Fontes detectadas (+7)'); }

  if (data.cpu_cores && data.cpu_cores !== 'unavailable') score += 5;
  if (data.ram_gb && data.ram_gb !== 'unavailable') score += 5;
  if (data.gpu_renderer && data.gpu_renderer !== 'unavailable') score += 5;
  if (data.battery_level && data.battery_level !== 'unavailable') score += 5;

  if (data.do_not_track === 'disabled') { score += 5; factors.push('DNT desativado (+5)'); }
  if (data.cookies_enabled === true) { score += 5; factors.push('Cookies habilitados (+5)'); }
  if (data.https_active === 'NO ⚠') { score += 10; factors.push('Sem HTTPS (+10)'); }

  const capped = Math.min(score, 100);
  return {
    score: capped,
    label: capped >= 70 ? 'HIGH' : capped >= 40 ? 'MEDIUM' : 'LOW',
    color: capped >= 70 ? 'red' : capped >= 40 ? 'amber' : 'green',
    factors,
    data_points_count: Object.values(data).filter(v => v !== 'unavailable' && v !== false && v !== null && v !== undefined).length,
  };
}

// ── Quick data for consent screen ─────────────────────────
export async function fetchQuickData() {
  const ip = await fetchPublicIP();
  const geo = await fetchGeoFromIP(ip).catch(() => null);
  const system = getSystemData();
  return {
    ip,
    city: geo?.city ?? 'unavailable',
    region: geo?.region ?? 'unavailable',
    country: geo?.country_name ?? 'unavailable',
    isp: geo?.org ?? 'unavailable',
    device_type: system.device_type,
    browser_name: system.browser_name,
    browser_version: system.browser_version,
    os_raw: system.os_raw,
    geo,
  };
}

// ── Master orchestrator ────────────────────────────────────
export async function collectAllData(
  onProgress?: (step: string) => void,
  quickData?: Awaited<ReturnType<typeof fetchQuickData>>
): Promise<CollectedData> {
  onProgress?.('Obtendo IP público...');

  const ip = quickData?.ip ?? await fetchPublicIP();
  const geoResult = quickData?.geo ?? await fetchGeoFromIP(ip).catch(() => null);

  onProgress?.('Analisando WebRTC...');
  const [localIPResult, batteryResult, mediaResult] = await Promise.allSettled([
    getLocalIP(),
    getBattery(),
    getMediaDevicesData(),
  ]);

  onProgress?.('Coletando dados do sistema...');
  const system = getSystemData();
  const storage = getStorageSupport();
  const sensors = getSensorSupport();
  const fonts = detectFonts();

  onProgress?.('Gerando fingerprints...');
  const [canvasResult, webglResult, audioResult] = await Promise.allSettled([
    getCanvasFingerprint(),
    getWebGLFingerprint(),
    getAudioFingerprint(),
  ]);

  onProgress?.('Calculando hash do dispositivo...');

  const partial: Partial<CollectedData> = {
    ip,
    local_ip: localIPResult.status === 'fulfilled' ? localIPResult.value : 'unavailable',
    isp: geoResult?.org ?? 'unavailable',
    asn: geoResult?.asn ?? 'unavailable',
    country: geoResult?.country_name ?? 'unavailable',
    country_code: geoResult?.country_code ?? 'unavailable',
    region: geoResult?.region ?? 'unavailable',
    city: geoResult?.city ?? 'unavailable',
    latitude: geoResult?.latitude ?? 'unavailable',
    longitude: geoResult?.longitude ?? 'unavailable',
    ...system,
    canvas_hash: canvasResult.status === 'fulfilled' ? canvasResult.value : 'unavailable',
    webgl_hash: webglResult.status === 'fulfilled' ? webglResult.value.hash : 'unavailable',
    gpu_renderer: webglResult.status === 'fulfilled' ? webglResult.value.renderer : 'unavailable',
    gpu_vendor: webglResult.status === 'fulfilled' ? webglResult.value.vendor : 'unavailable',
    audio_hash: audioResult.status === 'fulfilled' ? audioResult.value : 'unavailable',
    fonts_detected: fonts,
    battery_level: batteryResult.status === 'fulfilled' ? batteryResult.value.level : 'unavailable',
    charging_status: batteryResult.status === 'fulfilled' ? batteryResult.value.charging : 'unavailable',
    time_to_full: batteryResult.status === 'fulfilled' ? batteryResult.value.time_to_full : 'unavailable',
    cameras: mediaResult.status === 'fulfilled' ? mediaResult.value.cameras : 'unavailable',
    microphones: mediaResult.status === 'fulfilled' ? mediaResult.value.microphones : 'unavailable',
    speakers: mediaResult.status === 'fulfilled' ? mediaResult.value.speakers : 'unavailable',
    accelerometer: sensors.accelerometer,
    gyroscope: sensors.gyroscope,
    touch_points: sensors.touch_points,
    pointer_type: sensors.pointer_type,
    ...storage,
  };

  const device_hash = await generateDeviceHash(partial);
  const exposure = calculateExposureScore(partial);

  return { ...partial, device_hash, exposure } as CollectedData;
}
