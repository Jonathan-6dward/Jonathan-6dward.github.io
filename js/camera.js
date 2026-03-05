/**
 * CAMERA ENGINE
 * Jonathan Xavier — SOC Analyst Portfolio
 *
 * Gerencia acesso à câmera, captura de foto e exibição de reveal.
 * 100% local — nenhum dado enviado a servidores.
 */

const CameraEngine = (() => {

    let activeStream = null;

    // ─── REQUEST CAMERA ────────────────────────────────────────────
    /**
     * Solicita permissão de câmera + microfone ao navegador.
     * Retorna { success, stream, error }
     */
    async function request() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                return { success: false, error: 'not-supported', stream: null };
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                },
                audio: true
            });

            activeStream = stream;
            return { success: true, stream, error: null };

        } catch (e) {
            return {
                success: false,
                stream: null,
                error: e.name === 'NotAllowedError' ? 'denied' : e.message
            };
        }
    }

    // ─── CAPTURE PHOTO ─────────────────────────────────────────────
    /**
     * Captura um frame do elemento <video> como dataURL (JPEG).
     * Retorna a string base64 da imagem.
     */
    function capturePhoto(videoEl) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = videoEl.videoWidth || 640;
            canvas.height = videoEl.videoHeight || 480;
            const ctx = canvas.getContext('2d');
            // Espelhar horizontalmente (selfie natural)
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoEl, 0, 0);
            return canvas.toDataURL('image/jpeg', 0.92);
        } catch (e) {
            return null;
        }
    }

    // ─── STOP STREAM ───────────────────────────────────────────────
    function stop() {
        if (activeStream) {
            activeStream.getTracks().forEach(t => t.stop());
            activeStream = null;
        }
    }

    // ─── DISPLAY REVEAL ────────────────────────────────────────────
    /**
     * Mostra a foto capturada com mensagem de choque dentro de `container`.
     * container: elemento DOM onde o conteúdo será injetado.
     */
    function displayReveal(dataURL, container) {
        if (!container) return;
        container.innerHTML = `
      <div class="cam-photo-wrap">
        <div class="cam-photo-label-top">📷 FOTO CAPTURADA AGORA MESMO</div>
        <img src="${dataURL}" class="cam-photo-img" alt="Sua foto capturada">
        <div class="cam-photo-shock">
          <span class="cam-shock-icon">⚠️</span>
          <div>
            <strong>Esse site acabou de te fotografar.</strong><br>
            Sites maliciosos fazem exatamente isso — silenciosamente, sem você perceber.
            Quando você concede permissão de câmera em um site, qualquer frame pode ser
            capturado a qualquer momento.
          </div>
        </div>
        <div class="cam-photo-tip">
          💡 <strong>Como se proteger:</strong> Nunca conceda permissão de câmera a sites que não sejam videochamadas conhecidas.
          Use fita adesiva na câmera quando não estiver usando.
        </div>
      </div>
    `;
    }

    return { request, capturePhoto, stop, displayReveal };

})();

window.CameraEngine = CameraEngine;
