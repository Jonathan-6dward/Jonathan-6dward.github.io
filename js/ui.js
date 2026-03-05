/**
 * UI CONTROLLER — v2
 * Jonathan Xavier — SOC Analyst Portfolio
 *
 * Fluxo de 5 telas:
 * 1. Impacto (IP + dados reais em choque)
 * 2. Consentimento (linguagem simples)
 * 3. Câmera (preview + captura de foto)
 * 4. Scanning (coleta de fingerprint)
 * 5. Revelação (cards em linguagem humana + score)
 */

const UI = (() => {

  // ─── STATE ──────────────────────────────────────────────────────
  let fpData = null;
  let geoData = null;

  // ─── UTILIDADES ─────────────────────────────────────────────────
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(id)?.classList.remove('hidden');
  }

  function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.add('hidden');
    });
  }

  function showPortfolio() {
    const p = document.getElementById('main-portfolio');
    if (!p) return;
    p.classList.remove('hidden-portfolio');
    p.classList.add('visible');
    requestAnimationFrame(() => {
      initScrollAnimations();
    });
  }

  function showToast(msg, duration = 4000) {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), duration);
  }

  // ─── TELA 1: IMPACTO ────────────────────────────────────────────

  async function initImpactScreen() {
    // Busca geolocalização via IP em paralelo
    geoData = await FingerprintEngine.getIPGeolocation();

    // IP em destaque
    const ipEl = document.getElementById('impact-ip');
    if (ipEl) ipEl.textContent = geoData.ip || '—';

    // Detectar dispositivo do UA
    const ua = navigator.userAgent;
    let device = 'Desktop';
    if (/iPhone/.test(ua)) device = 'iPhone';
    else if (/iPad/.test(ua)) device = 'iPad';
    else if (/Android.*Mobile/.test(ua)) {
      const m = ua.match(/Android.*?;\s*([^)]+)\)/);
      device = m ? m[1].trim() : 'Android';
    } else if (/Android/.test(ua)) device = 'Android Tablet';
    else if (/Mac OS X/.test(ua)) device = 'Mac';
    else if (/Windows/.test(ua)) device = 'Windows PC';
    else if (/Linux/.test(ua)) device = 'Linux';

    // Preencher itens de detalhe
    const cityEl = document.getElementById('impact-city');
    const deviceEl = document.getElementById('impact-device');
    const ispEl = document.getElementById('impact-isp');

    if (cityEl) {
      const loc = [geoData.city, geoData.region].filter(Boolean).join(', ') || 'Localização detectada';
      cityEl.querySelector('.impact-detail-text').textContent = loc;
    }
    if (deviceEl) {
      deviceEl.querySelector('.impact-detail-text').textContent = device;
    }
    if (ispEl) {
      ispEl.querySelector('.impact-detail-text').textContent = geoData.isp || 'Operadora detectada';
    }

    // Frase de choque personalizada
    const shockEl = document.getElementById('impact-shock');
    if (shockEl) {
      const city = geoData.city || 'sua cidade';
      const isp = geoData.isp || 'sua operadora';
      shockEl.textContent = `Você está em ${city}, usando um ${device}, na rede ${isp}. Você não nos disse nada disso.`;
    }

    document.getElementById('btn-enter')?.addEventListener('click', () => {
      showScreen('screen-consent');
    });
  }

  // ─── TELA 2: CONSENTIMENTO ─────────────────────────────────────

  function initConsentScreen() {
    document.getElementById('btn-accept')?.addEventListener('click', () => {
      showScreen('screen-camera');
      initCameraScreen();
    });

    document.getElementById('btn-decline')?.addEventListener('click', () => {
      hideAllScreens();
      showPortfolio();
      showToast('Modo limitado ativado. Fingerprint não coletado.');
    });
  }

  // ─── TELA 3: CÂMERA ─────────────────────────────────────────────

  function initCameraScreen() {
    const stateRequest = document.getElementById('cam-state-request');
    const statePreview = document.getElementById('cam-state-preview');
    const statePhoto = document.getElementById('cam-state-photo');
    const stateDenied = document.getElementById('cam-state-denied');
    const videoEl = document.getElementById('cam-video');
    const counterEl = document.getElementById('cam-counter');
    const photoContainer = document.getElementById('cam-photo-container');

    function goToScanning() {
      CameraEngine.stop();
      hideAllScreens();
      showScreen('screen-scanning');
      runScanning();
    }

    // Botão: ATIVAR CÂMERA
    document.getElementById('btn-cam-start')?.addEventListener('click', async () => {
      const result = await CameraEngine.request();

      if (!result.success) {
        // Sem câmera ou negado
        stateRequest.classList.add('hidden');
        stateDenied.classList.remove('hidden');
        return;
      }

      // Preview ao vivo
      stateRequest.classList.add('hidden');
      statePreview.classList.remove('hidden');
      videoEl.srcObject = result.stream;
      await videoEl.play().catch(() => { });

      // Contagem regressiva: 3s
      let count = 3;
      if (counterEl) counterEl.textContent = count;

      const barEl = document.getElementById('cam-countdown-bar');
      if (barEl) {
        barEl.style.transition = 'none';
        barEl.style.width = '100%';
        await sleep(50);
        barEl.style.transition = `width ${count}s linear`;
        barEl.style.width = '0%';
      }

      const interval = setInterval(() => {
        count--;
        if (counterEl) counterEl.textContent = count;
      }, 1000);

      await sleep(count * 1000 + 500);
      clearInterval(interval);

      // Captura foto
      const dataURL = CameraEngine.capturePhoto(videoEl);

      // Mostrar reveal
      statePreview.classList.add('hidden');
      statePhoto.classList.remove('hidden');

      if (dataURL && photoContainer) {
        CameraEngine.displayReveal(dataURL, photoContainer);
      } else {
        photoContainer.innerHTML = '<p style="color:var(--text-dim);font-size:0.85rem;text-align:center">Não foi possível capturar a imagem.</p>';
      }

      // Parar câmera após captura
      CameraEngine.stop();
    });

    // Botão: PULAR
    document.getElementById('btn-cam-skip-1')?.addEventListener('click', () => {
      CameraEngine.stop();
      goToScanning();
    });

    // Botão: CONTINUAR (após foto)
    document.getElementById('btn-cam-continue')?.addEventListener('click', () => {
      goToScanning();
    });

    // Botão: CONTINUAR (negado)
    document.getElementById('btn-cam-denied-continue')?.addEventListener('click', () => {
      goToScanning();
    });
  }

  // ─── TELA 4: SCANNING ──────────────────────────────────────────

  async function runScanning() {
    const logContainer = document.getElementById('scan-log');
    const progressBar = document.getElementById('scan-bar-fill');
    const percentEl = document.getElementById('scan-percent');

    function addLog(text, type = '') {
      if (!logContainer) return;
      const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      const line = document.createElement('div');
      line.className = 'scan-log-line';
      line.innerHTML = `<span class="scan-log-time">${time}</span><span class="scan-log-text ${type}">${text}</span>`;
      logContainer.appendChild(line);
      logContainer.scrollTop = logContainer.scrollHeight;
    }

    function updateProgress(label, pct) {
      if (progressBar) progressBar.style.width = pct + '%';
      if (percentEl) percentEl.textContent = pct + '%';
      addLog(label, pct === 100 ? 'ok' : '');
    }

    addLog('Iniciando análise...', '');

    fpData = await FingerprintEngine.collect(updateProgress);
    if (geoData) fpData.geo = geoData;

    addLog('✓ Análise concluída.', 'ok');

    await sleep(700);
    hideAllScreens();
    showPortfolio();

    // Renderizar após portfólio visível
    await sleep(300);
    renderRevelacao(fpData);

    // Scroll para seção de revelação
    setTimeout(() => {
      document.getElementById('revelation')?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  }

  // ─── TELA 5: REVELAÇÃO — CARDS ─────────────────────────────────

  function renderRevelacao(data) {
    if (!data) return;

    const cards = [];

    // 📍 Localização
    if (data.geo) {
      const loc = [data.geo.city, data.geo.region].filter(Boolean).join(', ') || 'Detectada';
      cards.push({
        emoji: '📍', risk: 'high', riskLabel: 'Exposto',
        title: `Você está em ${data.geo.city || 'sua cidade'} agora mesmo`,
        value: `${loc} · ${data.geo.isp || ''}`,
        explain: `<strong>Sem GPS, sem permissão.</strong> Seu endereço IP revela sua localização aproximada, cidade e operadora de internet. Sites de anúncios usam isso para exibir propagandas da sua cidade.<br><br><strong>Proteção:</strong> VPN esconde seu IP. Mas cuidado: o timezone do seu celular ainda pode te trair.`
      });
    }

    // 📱 Dispositivo
    const ua = data.ua;
    cards.push({
      emoji: '📱', risk: 'med', riskLabel: 'Visível',
      title: `Sabemos que você usa ${ua.browser} ${ua.browserVersion} no ${ua.os}`,
      value: `${ua.browser} ${ua.browserVersion} · ${ua.os} · ${ua.deviceType}`,
      explain: `<strong>Seu navegador se apresenta automaticamente.</strong> O User-Agent transmite nome e versão exata do browser, sistema operacional e tipo de dispositivo em <em>todas</em> as requisições que você faz na internet.<br><br><strong>Proteção:</strong> Brave e Firefox com configuração de privacidade randomizam o User-Agent.`
    });

    // 🔑 Impressão digital
    if (data.canvas) {
      const hash = data.canvas.hash !== 'blocked' ? data.canvas.hash : 'BLOQUEADO ✓';
      cards.push({
        emoji: '🔑', risk: data.canvas.hash !== 'blocked' ? 'high' : 'low',
        riskLabel: data.canvas.hash !== 'blocked' ? 'Crítico' : 'Protegido',
        title: data.canvas.hash !== 'blocked'
          ? 'Sua impressão digital invisível — única como a digital do dedo'
          : 'Sua impressão digital está bloqueada ✓',
        value: hash,
        explain: `<strong>Como funciona:</strong> O mesmo texto renderizado no canvas HTML5 produz pixels diferentes em cada dispositivo — GPU, driver e antialiasing criam variações únicas. Esse código te identifica em qualquer site, mesmo se apagar todos os cookies.<br><br><strong>Proteção:</strong> Brave bloqueia por padrão. Firefox com privacy.resistFingerprinting = true.`
      });
    }

    // 🎮 GPU
    if (data.webgl) {
      const renderer = data.webgl.renderer?.length > 60
        ? data.webgl.renderer.substring(0, 60) + '...'
        : (data.webgl.renderer || 'n/a');
      cards.push({
        emoji: '🎮', risk: 'high', riskLabel: 'Revelado',
        title: 'Conhecemos sua placa de vídeo — você nunca nos disse o modelo',
        value: renderer,
        explain: `<strong>WebGL expõe seu hardware.</strong> A extensão WEBGL_debug_renderer_info revela o modelo exato da sua GPU sem nenhuma permissão. Combinado com outros dados, reduz o grupo de usuários iguais a você a dezenas de milhares.<br><br><strong>Proteção:</strong> Brave e Firefox com resistência a fingerprinting mascaram esses valores.`
      });
    }

    // 🔊 Áudio
    if (data.audio) {
      cards.push({
        emoji: '🔊', risk: 'high', riskLabel: 'Capturado',
        title: 'Seu hardware de áudio gerou uma impressão digital — sem emitir som',
        value: data.audio.hash || 'n/a',
        explain: `<strong>Nenhum som foi reproduzido.</strong> A Web Audio API processa uma onda sonora em memória — diferenças no hardware de áudio produzem valores float únicos, convertidos em hash. Zero permissões pedidas, zero sons emitidos.<br><br><strong>Proteção:</strong> Firefox com privacy.resistFingerprinting. Brave aleatoriza por padrão.`
      });
    }

    // 🕵️ Incógnito
    if (data.incognito !== undefined) {
      const incognito = data.incognito?.likely;
      cards.push({
        emoji: '🕵️', risk: incognito ? 'low' : 'med',
        riskLabel: incognito ? 'Provável incógnito' : 'Modo normal',
        title: incognito
          ? 'Você parece estar em modo incógnito — mas isso não é anonimato'
          : 'Você não está em modo incógnito',
        value: data.incognito?.reason || 'Análise via Storage Quota API',
        explain: `<strong>Mito desmistificado:</strong> Modo incógnito não te torna anônimo para o site visitado. Canvas, WebGL e Audio Fingerprint funcionam normalmente em incógnito. O que o incógnito faz: não salva histórico local e limpa cookies ao fechar — só isso.`
      });
    }

    // 🛡️ AdBlock
    if (data.adblock !== undefined) {
      cards.push({
        emoji: '🛡️', risk: data.adblock ? 'low' : 'high',
        riskLabel: data.adblock ? 'Protegido' : 'Sem proteção',
        title: data.adblock
          ? 'Você tem AdBlock ativo — boa escolha'
          : 'Você não tem AdBlock — está exposto a rastreadores',
        value: data.adblock ? 'AdBlock detectado ✓' : 'Nenhum bloqueador encontrado',
        explain: `<strong>Como detectamos:</strong> Um elemento HTML com classes típicas de anúncio foi criado — se estava oculto, AdBlock está ativo.<br><br>${data.adblock ? '<strong>Continue assim:</strong> uBlock Origin é o melhor para privacidade.' : '<strong>Instale agora:</strong> uBlock Origin (Chrome/Firefox) bloqueia rastreadores de terceiros em todos os sites que você visita.'}`
      });
    }

    // 🤖 Bot
    if (data.automation) {
      cards.push({
        emoji: '🤖', risk: 'low', riskLabel: 'Info',
        title: data.automation.isBot
          ? `Detectamos sinais de automação — score: ${data.automation.score}%`
          : `Confirmado: você é humano (${data.automation.score || 0}% de chance de bot)`,
        value: data.automation.isBot
          ? `Sinais: ${data.automation.signals?.join(', ')}`
          : 'Nenhum sinal de bot detectado',
        explain: `<strong>Sites de e-commerce e bancos</strong> usam isso para bloquear bots. Analisamos: navigator.webdriver, plugins presentes, dimensões da janela e outros 6 sinais de automação.`
      });
    }

    // 📡 WebRTC
    if (data.webrtc?.localIPs?.length > 0) {
      cards.push({
        emoji: '📡', risk: 'high', riskLabel: 'Vazado',
        title: `Sua rede local vazou — mesmo com VPN isso pode acontecer`,
        value: data.webrtc.localIPs.join(', '),
        explain: `<strong>WebRTC ICE candidates</strong> revelam IPs da sua rede local — incluindo IPs que sua VPN deveria esconder. Faixas 192.168.x.x indicam rede doméstica; 10.x.x.x indica rede corporativa.<br><br><strong>Proteção:</strong> Extensão "WebRTC Leak Prevent" ou Firefox com media.peerconnection.enabled = false.`
      });
    }

    // 🔤 Fontes
    if (data.fonts) {
      cards.push({
        emoji: '🔤', risk: 'med', riskLabel: 'Mapeado',
        title: `Detectamos ${data.fonts.count} programas instalados pelo tamanho das fontes`,
        value: data.fonts.fonts?.slice(0, 6).join(', ') || 'n/a',
        explain: `<strong>Técnica de medição:</strong> Medimos a largura de texto renderizado — fontes instaladas (Word, Photoshop, Office) produzem larguras diferentes das fontes padrão. A combinação de fontes indica se seu computador é corporativo ou pessoal.<br><br><strong>Proteção:</strong> Tor Browser reporta fontes padrão para todos. Brave também mitiga.`
      });
    }

    // Dispositivos mídia
    if (data.media) {
      cards.push({
        emoji: '📷', risk: data.media.cameras > 0 ? 'med' : 'low',
        riskLabel: data.media.cameras > 0 ? 'Detectado' : 'Não detectado',
        title: `Sabemos que você tem ${data.media.cameras} câmera(s) e ${data.media.microphones} microfone(s)`,
        value: `${data.media.cameras} câmera(s) · ${data.media.microphones} microfone(s) · ${data.media.speakers} saída(s) de áudio`,
        explain: `<strong>Sem permissão especial.</strong> O navegador revela quantas câmeras e microfones estão disponíveis — informação usada para fingerprinting de hardware e perfil de dispositivo.<br><br><strong>Proteção:</strong> Tor Browser reporta dispositivos genéricos para todos os usuários.`
      });
    }

    // Renderizar cards
    const container = document.getElementById('fp-cards-container');
    if (!container) return;

    container.innerHTML = cards.map((c, i) => `
      <div class="reveal-card fade-in" style="transition-delay:${i * 0.07}s">
        <div class="reveal-card-header">
          <div class="reveal-card-emoji">${c.emoji}</div>
          <span class="reveal-risk-badge ${c.risk}">${c.riskLabel}</span>
        </div>
        <div class="reveal-card-title">${c.title}</div>
        <div class="reveal-card-value">${c.value}</div>
        <div class="reveal-card-explain">${c.explain}</div>
      </div>
    `).join('');

    // Score
    renderScore(data.trackability);

    // Animar fade-ins
    setTimeout(() => {
      document.querySelectorAll('#revelation .fade-in').forEach(el => el.classList.add('visible'));
    }, 200);
  }

  // ─── SCORE ──────────────────────────────────────────────────────

  function renderScore(trackability) {
    if (!trackability) return;
    const el = document.getElementById('trackability-score');
    if (!el) return;

    const { score, breakdown } = trackability;

    const color = score >= 70 ? 'var(--red)' : score >= 45 ? 'var(--orange)' : 'var(--green)';
    const phrase = score >= 70
      ? 'Você está mais exposto que a maioria dos usuários'
      : score >= 45
        ? 'Você tem exposição moderada — há algumas proteções ativas'
        : 'Bom trabalho — você está melhor protegido que a média';
    const label = score >= 70 ? 'ALTAMENTE RASTREÁVEL' : score >= 45 ? 'MODERADAMENTE EXPOSTO' : 'PARCIALMENTE PROTEGIDO';

    el.innerHTML = `
      <div class="score-section">
        <div class="fp-card-name" style="margin-bottom:1.5rem;font-size:0.65rem;letter-spacing:0.4em;color:var(--text-muted);text-transform:uppercase">
          SEU SCORE DE RASTREABILIDADE
        </div>
        <div class="score-layout">
          <div>
            <div class="score-big" style="color:${color}" id="score-counter">0</div>
            <div class="score-label">${label}</div>
            <div style="font-family:var(--font-display);font-size:0.7rem;color:${color};margin-top:0.3rem;font-style:italic">${phrase}</div>
          </div>
          <div class="score-breakdown">
            ${breakdown.map(b => `
              <div class="score-bar-item">
                <div class="score-bar-label">
                  <span>${b.label}</span>
                  <span style="color:${b.color}">${b.value} pts</span>
                </div>
                <div class="score-bar-track">
                  <div class="score-bar-fill" data-target="${Math.min(b.value * 4, 100)}"
                       style="background:${b.color};width:0%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="score-phrase">
          <strong>O que isso significa:</strong> Um score de ${score}/100 indica que seu perfil de navegador
          pode ser distinguido de outros usuários com ${score >= 70 ? 'muito alta' : score >= 45 ? 'moderada' : 'baixa'} probabilidade —
          mesmo sem cookies, mesmo com IP diferente, mesmo em modo incógnito.
          Plataformas de AdTech e sistemas antifraude usam técnicas similares ou mais sofisticadas.
        </div>
      </div>
    `;

    // Animar
    setTimeout(() => {
      animateCounter(document.getElementById('score-counter'), score, 1800);
      document.querySelectorAll('#trackability-score .score-bar-fill').forEach(bar => {
        bar.style.transition = 'width 1.5s cubic-bezier(0.4,0,0.2,1)';
        bar.style.width = (bar.dataset.target || '0') + '%';
      });
    }, 500);
  }

  function animateCounter(el, target, duration) {
    if (!el) return;
    const start = performance.now();
    function update(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ─── SCROLL ANIMATIONS ─────────────────────────────────────────

  function initScrollAnimations() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ─── INIT ────────────────────────────────────────────────────────

  function init() {
    initImpactScreen();
    initConsentScreen();
  }

  return { init, showToast };

})();

window.UI = UI;
