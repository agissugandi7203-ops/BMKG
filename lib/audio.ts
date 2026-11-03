// Audio Alert Synthesizer via Web Audio API (No external MP3 files required)

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

export async function unlockAudioContext(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  // Play subtle 50ms confirmation pip
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
    return true;
  } catch (e) {
    return false;
  }
}

export function playEmergencySiren(durationSec = 3.5) {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Modulate pitch up and down (800Hz <-> 1200Hz)
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.linearRampToValueAtTime(1250, now + 0.5);
    osc.frequency.linearRampToValueAtTime(800, now + 1.0);
    osc.frequency.linearRampToValueAtTime(1250, now + 1.5);
    osc.frequency.linearRampToValueAtTime(800, now + 2.0);
    osc.frequency.linearRampToValueAtTime(1250, now + 2.5);
    osc.frequency.linearRampToValueAtTime(800, now + 3.0);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + durationSec);
  } catch (err) {
    console.warn('[Audio] Failed to play siren:', err);
  }
}

export function playNotificationChime() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === 'suspended') return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.15); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  } catch (err) {
    console.warn('[Audio] Failed to play chime:', err);
  }
}
