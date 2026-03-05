/**
 * UI CONTROLLER
 * Jonathan Xavier — SOC Analyst Portfolio
 * Gerencia fluxo de telas, renderização de dados e animações
 */

const UI = (() => {

  // ─── STATE ────────────────────────────────────────────────────
  let fpData = null;
  let userConsented = false;

  // ─── SCREEN TRANSITIONS ───────────────────────────────────────

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) {
      target.classList.remove('hidden');
    }
  }

  function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.add('hidden');
      setTimeout(() => { s.style.display = 'none'; }, 800);
    });
  }

  function showPortfolio() {
    const portfolio = document.getElementById('main-portfolio');
    if (!portfolio) return;
    portfolio.style.display = 'block';
    setTimeout(() => portfolio.classList.add('visible'), 50);
    initScrollAnimations();
    initTerminalAnimation();
  }

  // ─── SCREEN 1: IMPACT ─────────────────────────────────────────

  async function initImpactScreen() {
    // Tentar obter IP público via API aberta
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) });
      const { ip } = await res.json();
      const ipEl = document.getElementById('impact-ip');
      if (ipEl) ipEl.textContent = ip;
    } catch {
      const ipEl = document.getElementById('impact-ip');
      if (ipEl) ipEl.textContent = 'Coletando...';
    }

    document.getElementById('btn-enter')?.addEventListener('click', () => {
      showScreen('screen-consent');
    });
  }

  // ─── SCREEN 2: CONSENT ────────────────────────────────────────

  function initConsentScreen() {
    document.getElementById('btn-accept')?.addEventListener('click', async () => {
      userConsented = true;
      showScreen('screen-scanning');
      await runScanning();
    });

    document.getElementById('btn-decline')?.addEventListener('click', () => {
      // Com declínio: mostra portfólio sem a seção de fingerprint revelada
      hideAllScreens();
      showPortfolio();
      showToast('Modo limitado ativado. Fingerprint não coletado.');
    });
  }

  // ─── SCREEN 3.5: BROWSER PERMISSIONS ───────────────────────────

  function initCameraPermissionScreen() {
    document.getElementById('btn-cam-allow')?.addEventListener('click', async () => {
      // 1. Ocultar tela de permissão PRIMEIRO
      hideAllScreens();

      // 2. Solicitar permissões ao navegador
      const result = await FingerprintEngine.requestCameraPermission();

      if (result.success) {
        showToast('✓ Permissões concedidas. Câmera e microfone ativos.');
        // 3. Exibir stream e aguardar o modal fechar antes de continuar
        await displayAndAwaitCameraStream(result.stream);
      } else {
        showToast('✕ Permissão negada pelo navegador. Continuando sem câmera.');
      }

      // 4. Só então exibir o portfólio
      showPortfolio();
    });

    document.getElementById('btn-cam-deny')?.addEventListener('click', () => {
      // Pular: ocultar e exibir portfólio diretamente
      hideAllScreens();
      showPortfolio();
    });
  }

  function displayAndAwaitCameraStream(stream) {
    return new Promise(resolve => {
      const DURATION = 10000; // 10 segundos

      // Wrapper principal
      const modal = document.createElement('div');
      modal.id = 'cam-preview-modal';
      modal.style.cssText = [
        'position:fixed;inset:0;z-index:9999',
        'background:rgba(0,0,0,0.93)',
        'display:flex;align-items:center;justify-content:center',
        'flex-direction:column;gap:1.25rem',
        'padding:1.5rem',
      ].join(';');

      // Label topo
      const label = document.createElement('div');
      label.style.cssText = 'font-size:0.65rem;letter-spacing:0.4em;color:var(--cyan);text-transform:uppercase';
      label.textContent = '🔒 Stream Local — Nenhum dado transmitido';

      // Vídeo
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      video.style.cssText = [
        'width:min(640px,90vw)',
        'border:2px solid var(--cyan)',
        'border-radius:4px',
        'box-shadow:0 0 40px rgba(0,212,255,0.25)',
        'display:block',
      ].join(';');

      // Barra de contagem regressiva
      const progressWrap = document.createElement('div');
      progressWrap.style.cssText = 'width:min(640px,90vw);height:3px;background:var(--muted);border-radius:2px;overflow:hidden';
      const progressBar = document.createElement('div');
      progressBar.style.cssText = 'height:100%;width:100%;background:var(--cyan);transition:width linear';
      progressWrap.appendChild(progressBar);

      // Botão fechar
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕ FECHAR CÂMERA';
      closeBtn.style.cssText = [
        'padding:0.75rem 2rem',
        'background:transparent',
        'border:1px solid var(--cyan)',
        'color:var(--cyan)',
        'font-family:var(--font-mono)',
        'font-size:0.78rem',
        'cursor:pointer',
        'text-transform:uppercase',
        'letter-spacing:0.15em',
        'transition:background 0.2s,color 0.2s',
      ].join(';');
      closeBtn.onmouseenter = () => { closeBtn.style.background = 'var(--cyan)'; closeBtn.style.color = 'var(--black)'; };
      closeBtn.onmouseleave = () => { closeBtn.style.background = 'transparent'; closeBtn.style.color = 'var(--cyan)'; };

      let rafId = null;
      let timerStart = null;

      const closeModal = () => {
        if (!modal.parentNode) return;
        cancelAnimationFrame(rafId);
        stream.getTracks().forEach(t => t.stop());
        modal.remove();
        resolve();
      };

      // Animar barra de progresso via RAF
      const animateBar = (ts) => {
        if (!timerStart) timerStart = ts;
        const elapsed = ts - timerStart;
        const remaining = Math.max(0, 1 - elapsed / DURATION);
        progressBar.style.width = (remaining * 100) + '%';
        if (elapsed < DURATION) {
          rafId = requestAnimationFrame(animateBar);
        } else {
          showToast('Câmera encerrada automaticamente.');
          closeModal();
        }
      };
      rafId = requestAnimationFrame(animateBar);

      closeBtn.onclick = closeModal;

      modal.appendChild(label);
      modal.appendChild(video);
      modal.appendChild(progressWrap);
      modal.appendChild(closeBtn);
      document.body.appendChild(modal);
    });
  }

  // ─── SCREEN 3: SCANNING ───────────────────────────────────────

  async function runScanning() {
    const logContainer = document.getElementById('scan-log');
    const progressBar = document.getElementById('scan-bar-fill');
    const percentEl = document.getElementById('scan-percent');

    function addLog(text, type = '') {
      if (!logContainer) return;
      const time = new Date().toLocaleTimeString('pt-BR', { hour12: false });
      const line = document.createElement('div');
      line.className = 'scan-log-line';
      line.innerHTML = `
        <span class="scan-log-time">${time}</span>
        <span class="scan-log-text ${type}">${text}</span>
      `;
      logContainer.appendChild(line);
      logContainer.scrollTop = logContainer.scrollHeight;
    }

    function updateProgress(label, pct) {
      if (progressBar) progressBar.style.width = pct + '%';
      if (percentEl) percentEl.textContent = pct + '%';
      addLog(label, pct === 100 ? 'ok' : '');
    }

    addLog('Iniciando análise de ambiente...', '');
    addLog('Consentimento registrado ✓', 'ok');

    fpData = await FingerprintEngine.collect(updateProgress);

    addLog('Fingerprint ID gerado com sucesso.', 'ok');
    addLog('Renderizando painel de revelação...', '');

    await sleep(600);
    renderFingerprintSection(fpData);

    // Sempre mostrar tela de permissões do navegador antes do portfólio
    showScreen('screen-camera-permission');
    initCameraPermissionScreen();

    // Scroll para a seção de fingerprint após reveal
    setTimeout(() => {
      document.getElementById('fingerprint')?.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ─── FINGERPRINT RENDER ───────────────────────────────────────

  function renderFingerprintSection(data) {
    if (!data) return;

    const cards = [
      {
        icon: '🖥️',
        name: 'Navegador Detectado',
        value: `${data.ua.browser} ${data.ua.browserVersion}`,
        risk: 'med',
        riskLabel: 'Médio',
        detail: `<strong>Por que importa:</strong> A versão exata do browser revela patches instalados, vulnerabilidades conhecidas e, combinada com outros sinais, compõe um identificador único. Sites de tracking correlacionam browser + OS + timezone para criar perfis persistentes.<br><br><strong>Proteção:</strong> Use versões atualizadas. Brave ou Firefox com resistência a fingerprinting alteram esses valores.`
      },
      {
        icon: '💻',
        name: 'Sistema Operacional',
        value: `${data.ua.os} · ${data.ua.deviceType}`,
        risk: 'med',
        riskLabel: 'Médio',
        detail: `<strong>Por que importa:</strong> O SO distingue perfis pessoais de corporativos. Windows 11 + Chrome em fuso horário de São Paulo + GPU NVIDIA já reduz o universo de usuários drasticamente.<br><br><strong>Proteção:</strong> VMs com OS padronizados dificultam correlação. Tor Browser usa um SO fingerprint padrão para todos os usuários.`
      },
      {
        icon: '🎨',
        name: 'Canvas Fingerprint',
        value: data.canvas?.hash !== 'blocked' ? data.canvas?.hash : 'BLOQUEADO ✓',
        risk: 'high',
        riskLabel: 'Alto',
        detail: `<strong>Como funciona:</strong> O mesmo texto renderizado em canvas HTML5 produz pixels diferentes em cada dispositivo — GPU, driver gráfico, antialiasing e subpixel rendering criam variações únicas.<br><br><strong>Por que é crítico:</strong> Identificador altamente estável, funciona em modo incógnito, não é afetado por limpeza de cookies ou VPN.<br><br><strong>Proteção:</strong> Brave bloqueia por padrão (aleatoriza). Firefox com "privacy.resistFingerprinting = true".`
      },
      {
        icon: '🔊',
        name: 'Audio Fingerprint',
        value: data.audio?.hash || 'n/a',
        risk: 'high',
        riskLabel: 'Alto',
        detail: `<strong>Nenhum som foi reproduzido.</strong> A Web Audio API processa uma onda sonora em memória — diferenças no hardware de áudio (DynamicsCompressor, DSP do dispositivo) produzem valores float ligeiramente diferentes, que são convertidos em hash.<br><br><strong>Por que choca:</strong> Zero permissões pedidas, zero sons emitidos, fingerprint único gerado silenciosamente.<br><br><strong>Proteção:</strong> Firefox com "privacy.resistFingerprinting". Brave aleatoriza por padrão.`
      },
      {
        icon: '🎮',
        name: 'GPU — WebGL Renderer',
        value: data.webgl?.renderer?.length > 50
          ? data.webgl.renderer.substring(0, 50) + '...'
          : (data.webgl?.renderer || 'n/a'),
        risk: 'high',
        riskLabel: 'Alto',
        detail: `<strong>Modelo exato de GPU revelado sem permissão.</strong> A extensão WEBGL_debug_renderer_info expõe fabricante e modelo completo da GPU — informação normalmente restrita a aplicações instaladas.<br><br><strong>Impacto:</strong> GPU + driver version → reduz universo de usuários a dezenas de milhar. Funciona em VMs (revela GPU virtualizada ou host).<br><br><strong>Proteção:</strong> Brave e Firefox com resistência a fingerprinting mascaram esses valores.`
      },
      {
        icon: '🌍',
        name: 'Fuso Horário + Idioma',
        value: `${data.locale?.timezone} · ${data.locale?.locale}`,
        risk: 'med',
        riskLabel: 'Médio',
        detail: `<strong>Localização sem GPS.</strong> Timezone + idioma + formato de data combinados revelam país, região e cultura do usuário com precisão alta.<br><br><strong>Atenção com VPN:</strong> Uma VPN muda seu IP para outro país, mas seu navegador continua reportando timezone local — contradição que detectores de fraude identificam imediatamente.<br><br><strong>Proteção:</strong> Configurar timezone do SO para UTC ou usar Tor Browser.`
      },
      {
        icon: '🖥️',
        name: 'Resolução de Tela',
        value: `${data.screen?.width}×${data.screen?.height} · ${data.screen?.pixelRatio}x DPR`,
        risk: 'low',
        riskLabel: 'Baixo',
        detail: `<strong>Resolução + devicePixelRatio</strong> identificam classe de dispositivo (notebook, desktop, retina display, mobile 4K). A combinação resolução + DPR reduz o grupo de usuários similares significativamente.<br><br><strong>Dado curioso:</strong> O DPR (Device Pixel Ratio) é um forte indicador de monitores Apple Retina, celulares high-end e configurações de acessibilidade.`
      },
      {
        icon: '⚙️',
        name: 'Hardware',
        value: `${data.hardware?.cpuCores} cores · ${data.hardware?.memory}`,
        risk: 'med',
        riskLabel: 'Médio',
        detail: `<strong>navigator.hardwareConcurrency</strong> revela número de threads do CPU — distingue servidores, desktops gamer e notebooks de entrada. <strong>navigator.deviceMemory</strong> reporta RAM em potências de 2 (0.25 até 8 GB).<br><br><strong>Impacto profissional:</strong> 16 cores + 8GB + GPU NVIDIA + Windows 11 = perfil de desenvolvedor/analista de segurança altamente específico.`
      },
      {
        icon: '🛡️',
        name: 'AdBlock Detectado',
        value: data.adblock ? '⚠️ AdBlock ATIVO' : '✗ Sem AdBlock',
        risk: data.adblock ? 'low' : 'high',
        riskLabel: data.adblock ? 'Baixo' : 'Alto',
        detail: `<strong>Como funciona:</strong> Um elemento HTML com classes típicas de anúncio (adsbox, pub_300x250, banner-ad) é criado — se estiver oculto/removido, AdBlock está ativo.<br><br><strong>Por que importa:</strong> Usuários sem AdBlock estão expostos a tracking scripts de terceiros em praticamente todos os sites. Sem AdBlock, pixel trackers e beacons coletam comportamento em tempo real.<br><br><strong>Recomendação:</strong> uBlock Origin + Privacy Badger.`
      },
      {
        icon: '🕵️',
        name: 'Modo Incógnito',
        value: data.incognito?.likely ? '⚠️ Provável incógnito' : '✓ Modo normal',
        risk: data.incognito?.likely ? 'low' : 'med',
        riskLabel: data.incognito?.likely ? 'Baixo' : 'Médio',
        detail: `<strong>Método:</strong> Storage Quota API — modo incógnito limita quota de armazenamento a ~120MB no Chrome. <strong>Ilusão importante:</strong> Modo incógnito NÃO impede fingerprinting — Canvas, WebGL e Audio FP funcionam normalmente em incógnito.<br><br><strong>O que incógnito realmente faz:</strong> Não salva histórico local e limpa cookies ao fechar. Não te torna anônimo para o site visitado.`
      },
      {
        icon: '🤖',
        name: 'Automação/Bot',
        value: data.automation?.isBot ? `⚠️ Score: ${data.automation.score}%` : `✓ Humano (${data.automation?.score || 0}% bot score)`,
        risk: 'low',
        riskLabel: 'Info',
        detail: `<strong>Sinais analisados:</strong> navigator.webdriver, window.callPhantom, ChromeDriver artifacts, ausência de plugins, dimensões de janela headless padrão.<br><br><strong>Aplicação defensiva:</strong> Sites protegem formulários, logins e checkout detectando automação. Atacantes usam Puppeteer com plugins de evasão (puppeteer-extra-plugin-stealth) para contornar essas checagens.`
      },
      {
        icon: '🔤',
        name: 'Fontes Detectadas',
        value: `${data.fonts?.count || 0} fontes identificadas`,
        risk: 'med',
        riskLabel: 'Médio',
        detail: `<strong>Fontes detectadas:</strong> ${data.fonts?.fonts?.slice(0, 8).join(', ') || 'n/a'}<br><br><strong>Como funciona:</strong> Mede a largura de texto renderizado em cada fonte — se difere da fonte fallback padrão, a fonte está instalada.<br><br><strong>Por que é poderoso:</strong> A combinação de fontes corporativas (Calibri, Cambria) vs pessoais (Comic Sans, Impact) identifica com precisão ambiente corporativo ou pessoal, e às vezes software específico instalado (Adobe, Microsoft Office).`
      }
    ];

    // Adicionar WebRTC se IPs encontrados
    if (data.webrtc?.localIPs?.length > 0) {
      cards.push({
        icon: '📡',
        name: 'WebRTC — IP Local',
        value: data.webrtc.localIPs.join(', '),
        risk: 'high',
        riskLabel: 'Alto',
        detail: `<strong>⚠️ IP LOCAL VAZADO via WebRTC.</strong> Mesmo com VPN ativa, o protocolo WebRTC pode revelar seu IP local real através de ICE candidates.<br><br><strong>Impacto:</strong> Revela faixa de rede interna (192.168.x.x, 10.x.x.x), indicando se está em rede doméstica, corporativa ou de ISP.<br><br><strong>Proteção:</strong> Extensão WebRTC Leak Prevent, Firefox: media.peerconnection.enabled = false, ou usar Tor Browser.`
      });
    }

    // Adicionar dispositivos de mídia (câmera/microfone)
    if (data.media) {
      cards.push({
        icon: '📹',
        name: 'Dispositivos de Mídia',
        value: `${data.media.cameras || 0} câmera(s) · ${data.media.microphones || 0} microfone(s)`,
        risk: data.media.cameras > 0 || data.media.microphones > 0 ? 'med' : 'low',
        riskLabel: data.media.cameras > 0 || data.media.microphones > 0 ? 'Médio' : 'Baixo',
        detail: `<strong>Dispositivos detectados sem permissão.</strong> O navegador revela quantas câmeras e microfones estão disponíveis — informação usada para fingerprinting de hardware.<br><br><strong>Detalhes:</strong> ${data.media.totalDevices || 0} dispositivo(s) no total, ${data.media.speakers || 0} saída(s) de áudio.<br><br><strong>Proteção:</strong> Navegadores como Tor Browser reportam dispositivos genéricos para todos os usuários.`
      });
    }

    // Adicionar presença em redes sociais
    if (data.social) {
      const socialDetails = [];
      if (data.social.possibleName) {
        socialDetails.push(`<strong>Nome possível detectado:</strong> ${data.social.possibleName}`);
      }
      if (data.social.possibleEmail) {
        socialDetails.push(`<strong>Email detectado:</strong> ${data.social.possibleEmail}`);
      }
      if (data.social.detectedProfiles.length > 0) {
        const networks = data.social.detectedProfiles.map(p => p.network).join(', ');
        socialDetails.push(`<strong>Sessões ativas detectadas:</strong> ${networks}`);
      }
      if (data.social.methods.length > 0) {
        socialDetails.push(`<strong>Métodos:</strong> ${data.social.methods.join('; ')}`);
      }

      cards.push({
        icon: '🌐',
        name: 'Presença em Redes Sociais',
        value: data.social.detectedProfiles.length > 0
          ? `${data.social.detectedProfiles.length} rede(s) detectada(s)`
          : (data.social.possibleName ? `Nome: ${data.social.possibleName}` : 'Nenhuma detecção'),
        risk: data.social.detectedProfiles.length > 0 || data.social.possibleName ? 'high' : 'low',
        riskLabel: data.social.detectedProfiles.length > 0 || data.social.possibleName ? 'Alto' : 'Baixo',
        detail: socialDetails.length > 0
          ? socialDetails.join('<br><br>')
          : `<strong>Nenhuma informação pessoal detectada.</strong> Seu navegador está bem configurado contra vazamento de dados pessoais via técnicas de fingerprinting.`
      });
    }

    const container = document.getElementById('fp-cards-container');
    if (!container) return;

    container.innerHTML = cards.map((c, i) => `
      <div class="fp-card fade-in" style="transition-delay: ${i * 0.08}s">
        <div class="fp-card-header">
          <div class="fp-card-icon">${c.icon}</div>
          <span class="fp-card-risk ${c.risk}">${c.riskLabel}</span>
        </div>
        <div class="fp-card-name">${c.name}</div>
        <div class="fp-card-value">${c.value}</div>
        <div class="fp-card-detail">${c.detail}</div>
      </div>
    `).join('');

    // Score
    renderTrackabilityScore(data.trackability);

    // Ativar animações
    setTimeout(() => {
      document.querySelectorAll('#fingerprint .fade-in').forEach(el => {
        el.classList.add('visible');
      });
    }, 300);
  }

  function renderTrackabilityScore(trackability) {
    if (!trackability) return;
    const el = document.getElementById('trackability-score');
    if (!el) return;

    const { score, breakdown } = trackability;
    const scoreLabel = score >= 80 ? 'ALTAMENTE RASTREÁVEL' : score >= 50 ? 'MODERADAMENTE RASTREÁVEL' : 'PARCIALMENTE PROTEGIDO';
    const scoreColor = score >= 80 ? 'var(--red)' : score >= 50 ? 'var(--orange)' : 'var(--yellow)';

    el.innerHTML = `
      <div class="fp-score-section">
        <div class="fp-card-name" style="margin-bottom:1.5rem">SCORE DE RASTREABILIDADE ESTIMADO</div>
        <div class="score-display">
          <div>
            <div class="score-number" style="color:${scoreColor}" id="score-counter">0</div>
            <div class="score-label">${scoreLabel}</div>
          </div>
          <div class="score-breakdown">
            ${breakdown.map(b => `
              <div class="score-bar-item">
                <div class="score-bar-label">
                  <span>${b.label}</span>
                  <span>${b.value} pts</span>
                </div>
                <div class="score-bar-track">
                  <div class="score-bar-fill" data-target="${b.value * 4}"
                       style="background:${b.color};width:0%"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--border);font-size:0.78rem;color:var(--text-muted);line-height:1.8">
          <strong style="color:var(--orange)">O que esse score significa:</strong> Este é um score estimado de unicidade digital com base nos sinais coletados nesta sessão. 
          Um score de ${score}/100 indica que seu perfil de navegador pode ser distinguido de outros usuários com 
          ${score >= 80 ? 'muito alta' : score >= 50 ? 'moderada' : 'baixa'} probabilidade — mesmo sem cookies, mesmo com IP diferente, mesmo em modo incógnito.
          Plataformas de AdTech e sistemas antifraude usam técnicas similares ou mais sofisticadas em produção.
        </div>
      </div>
    `;

    // Animar contador
    setTimeout(() => {
      animateCounter(document.getElementById('score-counter'), score, 1500);
      document.querySelectorAll('.score-bar-fill').forEach(bar => {
        const target = parseInt(bar.dataset.target);
        bar.style.width = Math.min(target, 100) + '%';
      });
    }, 400);
  }

  function animateCounter(el, target, duration) {
    if (!el) return;
    const start = performance.now();
    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ─── TERMINAL ANIMATION ───────────────────────────────────────

  function initTerminalAnimation() {
    const lines = [
      { type: 'cmd', text: 'whoami' },
      { type: 'out', text: 'jonathan.xavier@soc-workstation' },
      { type: 'cmd', text: 'cat /etc/role' },
      { type: 'out', text: 'SOC Analyst N1 | Blue Team | Azure Security' },
      { type: 'cmd', text: 'sentinel --query "SecurityAlert | top 5"' },
      { type: 'key', text: 'TimeGenerated', val: '2025-03-05T03:14:00Z' },
      { type: 'key', text: 'AlertName', val: 'Impossible Travel Detected', valClass: 'crit' },
      { type: 'key', text: 'Severity', val: 'High', valClass: 'warn' },
      { type: 'key', text: 'TacticName', val: 'T1078 - Valid Accounts' },
      { type: 'cmd', text: 'mitre-map --tcode T1078' },
      { type: 'out', text: '→ Tactic: Initial Access' },
      { type: 'out', text: '→ Sub-technique: T1078.004 - Cloud Accounts' },
      { type: 'cmd', text: 'playbook run --incident INC-2025-0314' },
      { type: 'out', text: '✓ Contention initiated — account suspended', cls: 'ok' },
      { type: 'out', text: '✓ IR ticket #2025-0314 created', cls: 'ok' },
    ];

    const body = document.getElementById('terminal-lines');
    if (!body) return;

    let i = 0;
    function addLine() {
      if (i >= lines.length) return;
      const l = lines[i++];
      const div = document.createElement('div');
      div.className = 't-line';

      if (l.type === 'cmd') {
        div.innerHTML = `<span class="t-prompt">jonathan@soc:~$</span> <span class="t-cmd">${l.text}</span>`;
      } else if (l.type === 'key') {
        div.innerHTML = `<span class="t-output"><span class="t-key">${l.text}:</span> <span class="t-val ${l.valClass || ''}">${l.val}</span></span>`;
      } else {
        div.innerHTML = `<span class="t-output ${l.cls || ''}">${l.text}</span>`;
      }

      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      setTimeout(addLine, l.type === 'cmd' ? 600 : 250);
    }

    setTimeout(addLine, 800);
  }

  // ─── SCROLL ANIMATIONS ────────────────────────────────────────

  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  // ─── TOAST ────────────────────────────────────────────────────

  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  // ─── INIT ─────────────────────────────────────────────────────

  function init() {
    initImpactScreen();
    initConsentScreen();
  }

  return { init, showToast };
})();

window.UI = UI;
