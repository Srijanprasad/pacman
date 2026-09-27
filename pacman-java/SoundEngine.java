/* ====================================================================
 * PAC-MAN DELUXE ARCADE - Procedural Audio Engine
 * 
 * Designed, Engineered & Developed by: Srijan Prasad
 * GitHub: https://github.com/Srijanprasad/pacman
 * ==================================================================== */

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.SourceDataLine;

public class SoundEngine {
    private static final int SAMPLE_RATE = 16000;
    private static boolean muted = false;
    private static final ExecutorService soundPool = Executors.newFixedThreadPool(2, r -> {
        Thread t = new Thread(r, "PacmanSoundThread");
        t.setDaemon(true);
        return t;
    });

    private static boolean chompHigh = false;

    public static void toggleMute() {
        muted = !muted;
    }

    public static boolean isMuted() {
        return muted;
    }

    public static void playChomp() {
        if (muted) return;
        soundPool.submit(() -> {
            try {
                int freq = chompHigh ? 480 : 330;
                chompHigh = !chompHigh;
                playTone(freq, 45, 0.45);
            } catch (Exception ignored) {}
        });
    }

    public static void playEnergizer() {
        if (muted) return;
        soundPool.submit(() -> {
            try {
                for (int i = 0; i < 3; i++) {
                    playTone(280 + (i * 80), 30, 0.4);
                }
            } catch (Exception ignored) {}
        });
    }

    public static void playEatGhost() {
        if (muted) return;
        soundPool.submit(() -> {
            try {
                int[] notes = {400, 550, 750, 1000};
                for (int note : notes) {
                    playTone(note, 40, 0.5);
                }
            } catch (Exception ignored) {}
        });
    }

    public static void playFruit() {
        if (muted) return;
        soundPool.submit(() -> {
            try {
                int[] notes = {523, 659, 784, 1046};
                for (int note : notes) {
                    playTone(note, 60, 0.5);
                }
            } catch (Exception ignored) {}
        });
    }

    public static void playDeath() {
        if (muted) return;
        soundPool.submit(() -> {
            try {
                for (int f = 600; f >= 120; f -= 35) {
                    playTone(f, 35, 0.5);
                }
            } catch (Exception ignored) {}
        });
    }

    public static void playLevelClear() {
        if (muted) return;
        soundPool.submit(() -> {
            try {
                int[] fanfare = {440, 554, 659, 880, 880, 1108};
                for (int note : fanfare) {
                    playTone(note, 80, 0.55);
                }
            } catch (Exception ignored) {}
        });
    }

    private static void playTone(int freq, int durationMs, double volume) {
        try {
            int numSamples = (int) ((durationMs / 1000.0) * SAMPLE_RATE);
            byte[] buffer = new byte[numSamples];

            for (int i = 0; i < numSamples; i++) {
                double time = i / (double) SAMPLE_RATE;
                // Generate square/triangle retro sound with decay envelope
                double envelope = 1.0 - ((double) i / numSamples);
                double angle = 2.0 * Math.PI * freq * time;
                double sample = Math.sin(angle) > 0 ? 1.0 : -1.0;
                buffer[i] = (byte) (sample * 127.0 * volume * envelope);
            }

            AudioFormat format = new AudioFormat(SAMPLE_RATE, 8, 1, true, false);
            SourceDataLine line = AudioSystem.getSourceDataLine(format);
            line.open(format, buffer.length);
            line.start();
            line.write(buffer, 0, buffer.length);
            line.drain();
            line.close();
        } catch (Exception ignored) {}
    }
}
