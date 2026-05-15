/* ============================================
   Gemini Neural TTS Engine — Grant Assistant
   Voice: Zephyr (deep male, authoritative)
   Proxied via /.netlify/functions/gemini-tts
   ============================================ */

// Voice is dynamic — reads from localStorage (set by user picker or user-profiles.js)
// Falls back to Charon if nothing stored yet.
function _activeVoice() {
  return localStorage.getItem('grant-tts-voice') || 'Charon';
}

// Singleton AudioContext — created on first user gesture, reused forever.
// This is required because browsers block AudioContext after async gaps.
let _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _audioCtx;
}

// Prime the context on any user interaction so it's ready before async calls
['click', 'keydown', 'touchstart'].forEach(evt =>
  document.addEventListener(evt, () => {
    const ctx = _getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
  }, { passive: true })
);

const TTS = {
  speaking: false,
  muted: localStorage.getItem('grant-tts-muted') === 'true',
  queue: [],
  processing: false,

  /** Queue and play text */
  speak(text) {
    if (!text || TTS.muted) return;
    const clean = text.replace(/<[^>]*>/g, '').replace(/[*#_`]/g, '').trim();
    if (!clean) return;
    TTS.queue.push(clean);
    if (!TTS.processing) TTS.processQueue();
  },

  async processQueue() {
    if (TTS.queue.length === 0) { TTS.processing = false; return; }
    TTS.processing = true;
    TTS.speaking = true;
    TTS.updateAvatarState(true);

    const text = TTS.queue.shift();
    try {
      await TTS.generateAndPlay(text);
    } catch (e) {
      console.warn('TTS error:', e.message);
    }

    TTS.speaking = false;
    TTS.updateAvatarState(false);
    TTS.processQueue();
  },

  /** Call Gemini TTS proxy and play via Web Audio */
  async generateAndPlay(text) {
    const chunk = text.substring(0, 800);
    const resp = await fetch('/.netlify/functions/gemini-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payload: {
          contents: [{ parts: [{ text: chunk }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: _activeVoice() } }
            }
          }
        }
      })
    });

    if (!resp.ok) throw new Error(`TTS API ${resp.status}`);
    const data = await resp.json();
    const audioPart = data.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!audioPart) throw new Error('No audio data');

    await TTS.playLiveAudio(audioPart.inlineData);
  },

  /** PCM → WAV → Web Audio API playback using singleton AudioContext */
  playLiveAudio(inlineData) {
    return new Promise(async (resolve) => {
      const audioCtx = _getAudioCtx();
      if (audioCtx.state === 'suspended') await audioCtx.resume();

      const raw = atob(inlineData.data);
      const pcmBytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) pcmBytes[i] = raw.charCodeAt(i);

      const mime = inlineData.mimeType || '';
      const rateMatch = mime.match(/rate=(\d+)/);
      const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000;

      // Build WAV header (44 bytes)
      const dataSize = pcmBytes.length;
      const wavBuffer = new ArrayBuffer(44 + dataSize);
      const view = new DataView(wavBuffer);
      const writeStr = (off, s) => {
        for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
      };

      writeStr(0, 'RIFF');
      view.setUint32(4, 36 + dataSize, true);
      writeStr(8, 'WAVE');
      writeStr(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);      // PCM format
      view.setUint16(22, 1, true);      // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);      // block align
      view.setUint16(34, 16, true);     // bits per sample
      writeStr(36, 'data');
      view.setUint32(40, dataSize, true);
      new Uint8Array(wavBuffer, 44).set(pcmBytes);

      const audioBuffer = await audioCtx.decodeAudioData(wavBuffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = resolve;
      source.start();
    });
  },

  /** Stop current + clear queue + immediately cut audio */
  stop() {
    TTS.queue = [];
    TTS.speaking = false;
    TTS.processing = false;
    TTS.updateAvatarState(false);
    if (_audioCtx && _audioCtx.state === 'running') _audioCtx.suspend();
  },

  /** Toggle mute */
  toggleMute() {
    TTS.muted = !TTS.muted;
    localStorage.setItem('grant-tts-muted', TTS.muted);
    if (TTS.muted) TTS.stop();
    TTS.updateVoiceBadge();
  },

  isMuted() { return TTS.muted; },

  /** Update avatar speaking ring */
  updateAvatarState(speaking) {
    const wrap = document.querySelector('.avatar-img-wrap');
    if (wrap) wrap.classList.toggle('speaking', speaking);
  },

  /** Update voice badge icon */
  updateVoiceBadge() {
    document.querySelectorAll('.voice-badge').forEach(el => {
      el.textContent = TTS.muted ? '🔇' : '🔊';
    });
  }
};

// Global alias — avatar.js and chat.js reference GRANT_TTS
const GRANT_TTS = TTS;
