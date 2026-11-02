/**
 * High-End Cashier Register Sound Synthesizer (Web Audio API)
 * Simulates an authentic, crisp mechanical POS cash register drawer pop & metallic golden chime.
 * Runs 100% offline with zero external audio assets.
 */
export function playCashierChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // --- Part 1: Mechanical Register Latch "Tk" Click ---
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(320, now);
    clickOsc.frequency.exponentialRampToValueAtTime(80, now + 0.04);

    clickGain.gain.setValueAtTime(0.25, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    clickOsc.start(now);
    clickOsc.stop(now + 0.04);

    // --- Part 2: Dual Metallic Golden Bell Chime (Ka-Ching!) ---
    // Note 1: First bright bell ring at +35ms (C6: 1046 Hz)
    const bell1 = ctx.createOscillator();
    const bell1Gain = ctx.createGain();
    bell1.type = 'sine';
    bell1.frequency.setValueAtTime(987.77, now + 0.035); // B5
    bell1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    bell1Gain.gain.setValueAtTime(0.001, now);
    bell1Gain.gain.setValueAtTime(0.4, now + 0.035);
    bell1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    bell1.connect(bell1Gain);
    bell1Gain.connect(ctx.destination);

    bell1.start(now + 0.035);
    bell1.stop(now + 0.55);

    // Note 2: Harmonic shimmer bell ring at +70ms (B6: 1975 Hz & E7: 2637 Hz)
    const bell2 = ctx.createOscillator();
    const bell2Gain = ctx.createGain();
    bell2.type = 'sine';
    bell2.frequency.setValueAtTime(1975.53, now + 0.07);
    bell2.frequency.setValueAtTime(2637.02, now + 0.12);

    bell2Gain.gain.setValueAtTime(0.001, now);
    bell2Gain.gain.setValueAtTime(0.35, now + 0.07);
    bell2Gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    bell2.connect(bell2Gain);
    bell2Gain.connect(ctx.destination);

    bell2.start(now + 0.07);
    bell2.stop(now + 0.65);

    // Note 3: Sub-resonant metallic body sustain (~659 Hz - E5)
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'sine';
    bodyOsc.frequency.setValueAtTime(659.25, now + 0.04);

    bodyGain.gain.setValueAtTime(0.001, now);
    bodyGain.gain.setValueAtTime(0.2, now + 0.04);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    bodyOsc.connect(bodyGain);
    bodyGain.connect(ctx.destination);

    bodyOsc.start(now + 0.04);
    bodyOsc.stop(now + 0.45);

    // Clean close context
    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, 800);
  } catch (e) {
    console.warn('Audio playback not supported:', e);
  }
}
