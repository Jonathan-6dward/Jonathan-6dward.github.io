eescrita completa seguindo o novo prompt. Foco em mobile-first (375px), linguagem de choque + educação para leigos, fluxo de 5 telas com geolocalização real e câmera que captura foto.

Proposed Changes
Novo Arquivo
[NEW] 
camera.js
CameraEngine.request() — solicita getUserMedia({video,audio})
CameraEngine.capturePhoto(stream) — captura frame como dataURL via canvas
CameraEngine.displayReveal(dataURL, container) — exibe foto com mensagem de choque
Fallback gracioso se negado (sem travar o fluxo)
Arquivos Modificados
[MODIFY] 
fingerprint.js
Adicionar getIPGeolocation() (ip-api.com/json) — retorna {ip, city, region, isp, country}
Exportar dados de geolocalização para uso na Tela 1
Integrar na coleta principal do 
collect()
[MODIFY] 
index.html
Reescrita completa das telas:

Tela	Conteúdo
1 — Impacto	IP grande + cidade + dispositivo + ISP + frase de choque personalizada + 1 botão
2 — Consentimento	Linguagem simples, lista sem jargão, botão "QUERO VER" + "Prefiro não"
3 — Câmera	Preview ao vivo → captura foto → exibe com legenda de choque
4 — Scanning	Barra de progresso + mensagens humanas ("Descobrindo onde você está...")
5 — Revelação	Cards coluna única (mobile), score colorido, botão proteção
Proteção	Seção educativa 3 níveis (Fácil/Médio/Avançado)
Portfólio	SOC, Research, Projetos, Sobre — mantidos
Adicionar <script src="js/camera.js"></script>

[MODIFY] 
main.css
Base mobile-first: tudo projetado para 375px, breakpoints para tablet/desktop
Botões mínimo 48px de altura (touch-friendly)
Hamburguer menu mobile (checkbox hack puro CSS)
Cards revelação: grid-template-columns: 1fr base, repeat(2,1fr) em ≥600px
Estilos câmera: preview 100% de largura, object-fit: cover, border cyan
Foto capturada: moldura vermelha pulsante + legenda de choque
Animações leves (sem filter: blur, sem transform pesado em mobile)
[MODIFY] 
ui.js
initImpactScreen()
: aguarda geolocalização IP e monta frase personalizada
initConsentScreen()
: botão "QUERO VER" → vai para Tela 3 (câmera)
initCameraScreen(): chama CameraEngine, exibe preview, captura foto, exibe reveal
runScanning()
: mensagens humanas no log de scan
renderFingerprintSection()
: linguagem de choque em todos os cards
renderTrackabilityScore()
: cor dinâmica + frase personalizada por faixa
Verification Plan
Fluxo completo local
xdg-open /home/anakyn/Documentos/Github/index.html
Tela 1 carrega com IP e cidade reais
Botão leva ao consentimento com linguagem simples
"QUERO VER" abre câmera do browser, captura foto, mostra legenda
Scan com mensagens em português coloquial
Cards com linguagem de choque + score colorido
Seção de proteção e portfólio visíveis abaixo
Push GitHub
git add -A && git commit -m "feat: redesign completo mobile-first com câmera e geolocalização" && git push