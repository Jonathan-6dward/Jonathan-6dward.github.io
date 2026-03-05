/**
 * FINGERPRINT ENGINE
 * Jonathan Xavier — SOC Analyst Portfolio
 * 
 * Propósito educativo: demonstrar quais dados o navegador expõe
 * sem instalação de plugins ou permissões especiais.
 * 
 * Dados coletados localmente, processados no browser do visitante.
 * Nenhum dado é transmitido a servidores externos.
 */

const FingerprintEngine = (() => {

  // ─── UTILITIES ────────────────────────────────────────────────

  /**
   * Hash simples FNV-1a 32-bit para produzir identificadores estáveis
   */
  function fnv1a(str) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
  }

  /**
   * Hash SHA-256 via WebCrypto API — async
   */
  async function sha256(str) {
    try {
      const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(str)
      );
      return Array.from(new Uint8Array(buf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } catch {
      return fnv1a(str);
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ─── 1. USER AGENT & BROWSER DETECTION ────────────────────────

  function getUserAgentData() {
    const ua = navigator.userAgent;
    
    // Detecção de browser
    let browser = 'Unknown';
    let browserVersion = '';
    
    if (/Edg\/(\d+)/.test(ua))      { browser = 'Microsoft Edge';  browserVersion = RegExp.$1; }
    else if (/OPR\/(\d+)/.test(ua)) { browser = 'Opera';           browserVersion = RegExp.$1; }
    else if (/Chrome\/(\d+)/.test(ua)) { browser = 'Chrome';        browserVersion = RegExp.$1; }
    else if (/Firefox\/(\d+)/.test(ua)) { browser = 'Firefox';      browserVersion = RegExp.$1; }
    else if (/Safari\/(\d+)/.test(ua)) { browser = 'Safari';        browserVersion = RegExp.$1; }

    // Detecção de SO
    let os = 'Unknown OS';
    if (/Windows NT 10/.test(ua))     os = 'Windows 10/11';
    else if (/Windows NT 6\.3/.test(ua)) os = 'Windows 8.1';
    else if (/Mac OS X/.test(ua))     os = 'macOS';
    else if (/Android/.test(ua))      os = 'Android';
    else if (/iPhone|iPad/.test(ua))  os = 'iOS';
    else if (/Linux/.test(ua))        os = 'Linux';

    // Detecção de dispositivo
    let deviceType = 'Desktop';
    if (/Mobi|Android/.test(ua)) deviceType = 'Mobile';
    else if (/Tablet|iPad/.test(ua)) deviceType = 'Tablet';

    return { ua, browser, browserVersion, os, deviceType };
  }

  // ─── 2. CANVAS FINGERPRINT ─────────────────────────────────────

  async function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      canvas.width  = 280;
      canvas.height = 60;
      const ctx = canvas.getContext('2d');
      if (!ctx) return { hash: 'blocked', raw: null };

      // Texto principal
      ctx.textBaseline = 'top';
      ctx.font = '16px "Arial"';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);

      ctx.fillStyle = '#069';
      ctx.fillText('SOC Analyst Portfolio 🔐', 2, 15);

      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Browser Fingerprint Test', 4, 35);

      // Formas geométricas (diferem por GPU/antialiasing)
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255, 0, 255)';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgb(0, 255, 255)';
      ctx.beginPath();
      ctx.arc(100, 50, 50, 0, Math.PI * 2);
      ctx.fill();

      const raw = canvas.toDataURL();
      const hash = await sha256(raw);

      return {
        hash: hash.substring(0, 16),
        fullHash: hash,
        raw: raw.substring(0, 50) + '...'
      };
    } catch (e) {
      return { hash: 'error:' + e.message, raw: null };
    }
  }

  // ─── 3. AUDIO FINGERPRINT ──────────────────────────────────────
  /**
   * Processa onda sonora EM MEMÓRIA — nenhum som é reproduzido.
   * Diferenças de hardware no processador de áudio produzem valores float únicos.
   */
  async function getAudioFingerprint() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return { hash: 'not-supported', value: null };

      const ctx = new AudioCtx();
      const oscillator = ctx.createOscillator();
      const analyser   = ctx.createAnalyser();
      const gain       = ctx.createGain();
      const scriptNode = ctx.createScriptProcessor(4096, 1, 1);

      gain.gain.value = 0; // MUDO — sem nenhum som

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, ctx.currentTime);

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-50, ctx.currentTime);
      compressor.knee.setValueAtTime(40, ctx.currentTime);
      compressor.ratio.setValueAtTime(12, ctx.currentTime);
      compressor.attack.setValueAtTime(0, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      oscillator.connect(compressor);
      compressor.connect(analyser);
      analyser.connect(scriptNode);
      scriptNode.connect(gain);
      gain.connect(ctx.destination);

      return new Promise((resolve) => {
        let result = null;

        scriptNode.onaudioprocess = function(e) {
          const buffer = e.inputBuffer.getChannelData(0);
          // Soma dos valores float produz diferenças por hardware
          const sum = buffer.reduce((acc, val) => acc + Math.abs(val), 0);
          result = sum;

          oscillator.stop(0);
          ctx.close();
          scriptNode.disconnect();

          const hashStr = result.toString();
          resolve({
            hash: fnv1a(hashStr),
            value: result.toFixed(10)
          });
        };

        oscillator.start(0);

        // Timeout fallback
        setTimeout(() => {
          if (!result) {
            ctx.close().catch(() => {});
            resolve({ hash: 'timeout', value: null });
          }
        }, 2000);
      });
    } catch (e) {
      return { hash: 'blocked', value: null };
    }
  }

  // ─── 4. WEBGL / GPU FINGERPRINT ────────────────────────────────

  function getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { renderer: 'not-supported', vendor: 'not-supported' };

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);

      const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);

      // Parâmetros adicionais para aumentar unicidade
      const params = {
        renderer,
        vendor,
        version:  gl.getParameter(gl.VERSION),
        glslVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewport: gl.getParameter(gl.MAX_VIEWPORT_DIMS)?.join('x'),
        extensions: gl.getSupportedExtensions()?.length || 0
      };

      const hashStr = JSON.stringify(params);
      return { ...params, hash: fnv1a(hashStr) };

    } catch (e) {
      return { renderer: 'error', vendor: 'error', hash: 'error' };
    }
  }

  // ─── 5. SCREEN & DISPLAY ──────────────────────────────────────

  function getScreenData() {
    return {
      width:       screen.width,
      height:      screen.height,
      availWidth:  screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth:  screen.colorDepth,
      pixelRatio:  window.devicePixelRatio,
      orientation: screen.orientation?.type || 'unknown',
      innerWidth:  window.innerWidth,
      innerHeight: window.innerHeight
    };
  }

  // ─── 6. TIMEZONE & LOCALE ─────────────────────────────────────

  function getLocaleData() {
    const tz = Intl.DateTimeFormat().resolvedOptions();
    return {
      timezone:     tz.timeZone,
      locale:       navigator.language,
      languages:    (navigator.languages || [navigator.language]).join(', '),
      tzOffset:     new Date().getTimezoneOffset(),
      dateFormat:   new Intl.DateTimeFormat().format(new Date()),
      numberFormat: new Intl.NumberFormat().format(1234567.89)
    };
  }

  // ─── 7. HARDWARE CONCURRENCY & MEMORY ─────────────────────────

  function getHardwareData() {
    return {
      cpuCores:    navigator.hardwareConcurrency || 'unknown',
      memory:      navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'not-disclosed',
      platform:    navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack:  navigator.doNotTrack || 'not-set',
      maxTouchPoints: navigator.maxTouchPoints || 0
    };
  }

  // ─── 8. CONNECTION INFO ────────────────────────────────────────

  function getConnectionData() {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return { type: 'not-supported', effectiveType: 'unknown' };

    return {
      effectiveType: conn.effectiveType || 'unknown',
      downlink:      conn.downlink ? conn.downlink + ' Mbps' : 'unknown',
      rtt:           conn.rtt ? conn.rtt + ' ms' : 'unknown',
      saveData:      conn.saveData || false,
      type:          conn.type || 'unknown'
    };
  }

  // ─── 9. ADBLOCK DETECTION ─────────────────────────────────────
  /**
   * Cria elemento com classes típicas de anúncio e verifica se foi ocultado
   */
  async function detectAdBlock() {
    return new Promise(resolve => {
      // Método 1: elemento de isca
      const bait = document.createElement('div');
      bait.className = 'adsbox ad-banner pub_300x250 textads';
      bait.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
      bait.innerHTML = '&nbsp;';
      document.body.appendChild(bait);

      setTimeout(() => {
        const blocked = !bait.offsetParent
          || bait.offsetHeight === 0
          || bait.offsetWidth === 0
          || getComputedStyle(bait).display === 'none'
          || getComputedStyle(bait).visibility === 'hidden';
        document.body.removeChild(bait);
        resolve(blocked);
      }, 100);
    });
  }

  // ─── 10. INCOGNITO DETECTION ──────────────────────────────────
  /**
   * Estimativa via Storage Quota API — modo incógnito tem quota menor
   * NÃO é 100% preciso — navegadores atualizam constantemente
   */
  async function detectIncognito() {
    try {
      if (!navigator.storage || !navigator.storage.estimate) {
        return { likely: false, confidence: 'low', reason: 'API not available' };
      }

      const { quota } = await navigator.storage.estimate();

      // Chrome incógnito limita a ~120MB
      if (quota < 120 * 1024 * 1024) {
        return {
          likely: true,
          confidence: 'medium',
          reason: `Storage quota: ${(quota / 1024 / 1024).toFixed(0)} MB (típico de incógnito)`,
          quota: quota
        };
      }

      return {
        likely: false,
        confidence: 'medium',
        reason: `Storage quota: ${(quota / 1024 / 1024 / 1024).toFixed(1)} GB (normal)`,
        quota: quota
      };
    } catch (e) {
      return { likely: false, confidence: 'low', reason: 'Error: ' + e.message };
    }
  }

  // ─── 11. AUTOMATION DETECTION ─────────────────────────────────
  /**
   * Detecta navegadores controlados por Puppeteer, Selenium, Playwright, etc.
   */
  function detectAutomation() {
    const signals = [];
    let score = 0;

    // Webdriver flag (mais óbvia)
    if (navigator.webdriver === true) {
      signals.push('navigator.webdriver = true');
      score += 40;
    }

    // PhantomJS
    if (window.callPhantom || window._phantom) {
      signals.push('PhantomJS detected');
      score += 50;
    }

    // NightmareJS
    if (window.__nightmare) {
      signals.push('NightmareJS detected');
      score += 50;
    }

    // ChromeDriver artifact
    const driverKey = Object.keys(document).find(k =>
      k.startsWith('$cdc_') || k.startsWith('$chrome_')
    );
    if (driverKey) {
      signals.push(`ChromeDriver key: ${driverKey}`);
      score += 45;
    }

    // Headless: sem plugins
    if (navigator.plugins.length === 0 && !navigator.webdriver) {
      signals.push('No browser plugins (headless indicator)');
      score += 15;
    }

    // outerHeight == 0 (headless)
    if (window.outerHeight === 0) {
      signals.push('outerHeight = 0 (headless)');
      score += 20;
    }

    // Dimensões exatas de headless padrão
    const w = window.outerWidth, h = window.outerHeight;
    if ((w === 800 && h === 600) || (w === 1280 && h === 720 && screen.width === 1280)) {
      signals.push(`Exact headless dimensions: ${w}x${h}`);
      score += 10;
    }

    return {
      isBot: score >= 40,
      score: Math.min(score, 100),
      signals
    };
  }

  // ─── 12. CAMERA / MICROPHONE DETECTION ─────────────────────────
  /**
   * Detecta quantidade de câmeras e microfones disponíveis
   * SEM permissão — apenas conta dispositivos disponíveis
   */
  async function getMediaDevicesInfo() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return {
          cameras: 0,
          microphones: 0,
          speakers: 0,
          error: 'API not available'
        };
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(d => d.kind === 'videoinput').length;
      const microphones = devices.filter(d => d.kind === 'audioinput').length;
      const speakers = devices.filter(d => d.kind === 'audiooutput').length;

      return {
        cameras,
        microphones,
        speakers,
        totalDevices: devices.length,
        hasWebcam: cameras > 0,
        hasMic: microphones > 0
      };
    } catch (e) {
      return {
        cameras: 0,
        microphones: 0,
        speakers: 0,
        error: e.message
      };
    }
  }

  // ─── 13. SOCIAL MEDIA & NAME DETECTION ─────────────────────────
  /**
   * Tenta identificar nome do usuário e redes sociais através de:
   * 1. WebRTC leak (nome do dispositivo/hostname)
   * 2. Browser history pattern detection (limitado por privacidade)
   * 3. Saved form data detection
   * 4. Cross-origin resource timing attacks (mitigado em browsers modernos)
   *
   * ATENÇÃO: Browsers modernos limitam severamente essas técnicas.
   * Esta é uma demonstração educativa das limitações atuais.
   */
  async function getSocialMediaPresence() {
    const result = {
      detectedProfiles: [],
      possibleName: null,
      possibleEmail: null,
      confidence: 'low',
      methods: []
    };

    // Método 1: WebRTC para obter hostname (pode revelar nome do computador)
    try {
      const hostname = await getWebRTCHostname();
      if (hostname && hostname.length > 2) {
        result.possibleName = hostname;
        result.methods.push('WebRTC hostname leak');
        result.confidence = 'medium';
      }
    } catch (e) {
      // WebRTC não disponível ou bloqueado
    }

    // Método 2: Detectar login sessions via Image timing attack
    const socialNetworks = [
      { name: 'Facebook', checkUrl: 'https://graph.facebook.com/me' },
      { name: 'Twitter/X', checkUrl: 'https://api.twitter.com/2/users/me' },
      { name: 'LinkedIn', checkUrl: 'https://www.linkedin.com/api/authors' },
      { name: 'GitHub', checkUrl: 'https://api.github.com/user' },
      { name: 'Google', checkUrl: 'https://www.googleapis.com/oauth2/v3/userinfo' }
    ];

    for (const network of socialNetworks) {
      const isLoggedIn = await checkSocialMediaLogin(network);
      if (isLoggedIn) {
        result.detectedProfiles.push({
          network: network.name,
          status: 'logged_in'
        });
        result.methods.push(`${network.name} session detected`);
      }
    }

    // Método 3: Form field autofill detection
    const autofillData = await detectAutofillData();
    if (autofillData.name || autofillData.email) {
      result.possibleName = autofillData.name || result.possibleName;
      result.possibleEmail = autofillData.email;
      result.methods.push('Form autofill detection');
      result.confidence = autofillData.name ? 'high' : result.confidence;
    }

    return result;
  }

  /**
   * Tenta obter hostname via WebRTC
   */
  async function getWebRTCHostname() {
    return new Promise((resolve) => {
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        
        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            pc.close();
            resolve(null);
          } else if (e.candidate.candidate) {
            const candidate = e.candidate.candidate;
            const parts = candidate.split(' ');
            if (parts.length > 5 && !parts[5].match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
              resolve(parts[5]);
            }
          }
        };

        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(() => resolve(null));

        setTimeout(() => {
          pc.close();
          resolve(null);
        }, 1000);
      } catch (e) {
        resolve(null);
      }
    });
  }

  /**
   * Verifica se usuário está logado em rede social via timing attack
   */
  async function checkSocialMediaLogin(network) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.referrerPolicy = 'no-referrer';
        
        const timeout = setTimeout(() => {
          img.onload = null;
          img.onerror = null;
          resolve(false);
        }, 1500);

        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };

        img.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };

        img.src = network.checkUrl + '?t=' + Date.now();
      } catch (e) {
        resolve(false);
      }
    });
  }

  /**
   * Detecta dados de autofill em formulários
   */
  async function detectAutofillData() {
    return new Promise((resolve) => {
      const data = { name: null, email: null, username: null };
      
      const form = document.createElement('form');
      form.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;';
      
      const nameInput = document.createElement('input');
      nameInput.name = 'name';
      nameInput.type = 'text';
      nameInput.autocomplete = 'name';
      
      const emailInput = document.createElement('input');
      emailInput.name = 'email';
      emailInput.type = 'email';
      emailInput.autocomplete = 'email';
      
      form.appendChild(nameInput);
      form.appendChild(emailInput);
      document.body.appendChild(form);

      setTimeout(() => {
        if (nameInput.value) data.name = nameInput.value;
        if (emailInput.value) data.email = emailInput.value;
        try { document.body.removeChild(form); } catch(e) {}
        resolve(data);
      }, 200);
    });
  }

  // ─── 14. CAMERA PERMISSION REQUEST ─────────────────────────────
  /**
   * Solicita permissão explícita para acessar câmera e microfone
   * Retorna stream de vídeo se permitido, ou erro se negado
   */
  async function requestCameraPermission() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return {
          success: false,
          error: 'API not available',
          stream: null
        };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });

      return {
        success: true,
        stream: stream,
        error: null
      };
    } catch (e) {
      return {
        success: false,
        stream: null,
        error: e.name === 'NotAllowedError' ? 'Permission denied' : e.message
      };
    }
  }

  // ─── 15. FONT DETECTION ───────────────────────────────────────
  /**
   * Detecta fontes instaladas medindo largura de texto renderizado
   */
  function detectFonts() {
    const testString = 'mmmmmmmmmmlli';
    const testSize   = '72px';
    const baseFonts  = ['serif', 'sans-serif', 'monospace'];
    
    const fontsToTest = [
      // Windows
      'Calibri', 'Cambria', 'Consolas', 'Segoe UI', 'Verdana',
      'Arial Black', 'Comic Sans MS', 'Impact', 'Tahoma',
      // Mac/iOS
      'Helvetica Neue', 'SF Pro', 'Monaco', 'Menlo', 'Optima',
      // Linux
      'Ubuntu', 'DejaVu Sans', 'Liberation Sans',
      // Web / Apps
      'Roboto', 'Open Sans', 'Lato', 'Montserrat',
      // Office / Adobe
      'Franklin Gothic Medium', 'Palatino Linotype',
    ];

    const canvas  = document.createElement('canvas');
    const ctx     = canvas.getContext('2d');
    if (!ctx) return { count: 0, fonts: [] };

    // Medir largura base para cada fonte fallback
    const baseWidths = {};
    baseFonts.forEach(base => {
      ctx.font = `${testSize} ${base}`;
      baseWidths[base] = ctx.measureText(testString).width;
    });

    const detected = [];
    fontsToTest.forEach(font => {
      const installed = baseFonts.some(base => {
        ctx.font = `${testSize} '${font}', ${base}`;
        return ctx.measureText(testString).width !== baseWidths[base];
      });
      if (installed) detected.push(font);
    });

    return { count: detected.length, fonts: detected };
  }

  // ─── 13. IP VIA WEBRTC LEAK ───────────────────────────────────
  /**
   * Tentativa de obter IP local via WebRTC ICE candidates
   * Detecta IPs que podem estar mascarados por VPN
   */
  async function detectWebRTCLeak() {
    return new Promise((resolve) => {
      try {
        if (!window.RTCPeerConnection) {
          return resolve({ localIPs: [], support: false });
        }

        const pc = new RTCPeerConnection({ iceServers: [] });
        const ips = new Set();

        pc.createDataChannel('');
        pc.createOffer().then(o => pc.setLocalDescription(o));

        pc.onicecandidate = (e) => {
          if (!e || !e.candidate || !e.candidate.candidate) {
            pc.close();
            return resolve({ localIPs: Array.from(ips), support: true });
          }
          const match = e.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match) ips.add(match[1]);
        };

        setTimeout(() => {
          try { pc.close(); } catch(e) {}
          resolve({ localIPs: Array.from(ips), support: true });
        }, 1500);

      } catch(e) {
        resolve({ localIPs: [], support: false, error: e.message });
      }
    });
  }

  // ─── SCORE CALCULATOR ─────────────────────────────────────────
  /**
   * Calcula score de rastreabilidade estimado (0-100)
   * Baseado em entropia de cada sinal de fingerprinting
   */
  function calculateTrackabilityScore(data) {
    let score = 0;
    const breakdown = [];

    // Canvas FP — alta unicidade (~25 bits de entropia estimados)
    if (data.canvas && data.canvas.hash !== 'blocked') {
      score += 25;
      breakdown.push({ label: 'Canvas Fingerprint', value: 25, color: '#ff3366' });
    } else {
      breakdown.push({ label: 'Canvas Fingerprint', value: 0, color: '#ff3366' });
    }

    // WebGL — GPU + driver (~20 bits)
    if (data.webgl && data.webgl.renderer !== 'not-supported') {
      score += 20;
      breakdown.push({ label: 'WebGL / GPU', value: 20, color: '#ff8c42' });
    } else {
      breakdown.push({ label: 'WebGL / GPU', value: 0, color: '#ff8c42' });
    }

    // Audio FP — hardware DSP (~15 bits)
    if (data.audio && data.audio.hash !== 'blocked' && data.audio.hash !== 'timeout') {
      score += 15;
      breakdown.push({ label: 'Audio Fingerprint', value: 15, color: '#ffd60a' });
    } else {
      breakdown.push({ label: 'Audio Fingerprint', value: 0, color: '#ffd60a' });
    }

    // Timezone + Locale (~10 bits)
    if (data.locale) {
      score += 10;
      breakdown.push({ label: 'Timezone + Idioma', value: 10, color: '#00d4ff' });
    }

    // Fontes instaladas (~10 bits para combinações únicas)
    if (data.fonts && data.fonts.count > 5) {
      score += 10;
      breakdown.push({ label: 'Fontes do Sistema', value: 10, color: '#9d4edd' });
    } else {
      breakdown.push({ label: 'Fontes do Sistema', value: Math.min(data.fonts?.count || 0, 5), color: '#9d4edd' });
    }

    // Screen + Hardware (~8 bits)
    if (data.screen) {
      score += 8;
      breakdown.push({ label: 'Resolução + Hardware', value: 8, color: '#00ff88' });
    }

    // User Agent (~7 bits por browser específico)
    if (data.ua) {
      score += 7;
      breakdown.push({ label: 'User-Agent', value: 7, color: '#00d4ff' });
    }

    // AdBlock status (~5 bits — distingue perfis técnicos)
    if (data.adblock !== undefined) {
      score += 5;
      breakdown.push({ label: 'Config. de Privacidade', value: 5, color: '#5a5f7a' });
    }

    return { score: Math.min(score, 100), breakdown };
  }

  // ─── MAIN COLLECT ─────────────────────────────────────────────

  async function collect(onProgress) {
    const steps = [
      { label: 'Analisando User-Agent e navegador...', key: 'ua' },
      { label: 'Coletando dados de tela e hardware...', key: 'screen' },
      { label: 'Extraindo dados de localização/timezone...', key: 'locale' },
      { label: 'Gerando Canvas Fingerprint...', key: 'canvas' },
      { label: 'Gerando Audio Fingerprint (sem som)...', key: 'audio' },
      { label: 'Extraindo dados de GPU via WebGL...', key: 'webgl' },
      { label: 'Detectando AdBlock e extensões...', key: 'adblock' },
      { label: 'Verificando modo incógnito...', key: 'incognito' },
      { label: 'Analisando sinais de automação...', key: 'automation' },
      { label: 'Detectando fontes do sistema...', key: 'fonts' },
      { label: 'Verificando WebRTC leak...', key: 'webrtc' },
      { label: 'Detectando dispositivos de mídia (câmera/mic)...', key: 'media' },
      { label: 'Buscando presença em redes sociais...', key: 'social' },
      { label: 'Calculando score de rastreabilidade...', key: 'score' }
    ];

    const data = {};
    const uaData = getUserAgentData();
    data.ua = uaData;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (onProgress) onProgress(step.label, Math.round((i / steps.length) * 100));
      await sleep(200 + Math.random() * 300);

      switch (step.key) {
        case 'ua':        data.ua       = uaData;                    break;
        case 'screen':    data.screen   = getScreenData();           break;
        case 'locale':    data.locale   = getLocaleData();           break;
        case 'canvas':    data.canvas   = await getCanvasFingerprint(); break;
        case 'audio':     data.audio    = await getAudioFingerprint();  break;
        case 'webgl':     data.webgl    = getWebGLFingerprint();     break;
        case 'adblock':   data.adblock  = await detectAdBlock();     break;
        case 'incognito': data.incognito = await detectIncognito();  break;
        case 'automation': data.automation = detectAutomation();     break;
        case 'fonts':     data.fonts    = detectFonts();             break;
        case 'webrtc':    data.webrtc   = await detectWebRTCLeak();  break;
        case 'media':     data.media    = await getMediaDevicesInfo(); break;
        case 'social':    data.social   = await getSocialMediaPresence(); break;
        case 'score': {
          data.connection = getConnectionData();
          data.hardware   = getHardwareData();
          const { score, breakdown } = calculateTrackabilityScore(data);
          data.trackability = { score, breakdown };
          break;
        }
      }
    }

    if (onProgress) onProgress('Análise completa.', 100);
    return data;
  }

  return { collect, calculateTrackabilityScore, requestCameraPermission };
})();

window.FingerprintEngine = FingerprintEngine;
