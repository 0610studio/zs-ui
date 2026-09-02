import { useCallback, useEffect, useRef, useState } from 'react';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export interface FpsSample {
  ui: number;
  js: number;
  /** reset 이후 가장 낮았던 1초 창 */
  uiMin: number;
  jsMin: number;
}

const WINDOW_MS = 1000;

/**
 * 1초 창마다 UI·JS 스레드 프레임 수를 센다 — 데모·e2e 성능 계측용.
 * UI 쪽은 Reanimated 프레임 콜백(UI 런타임), JS 쪽은 requestAnimationFrame 으로 각 스레드가 실제로 돈 프레임만 잡힌다.
 */
export function useFpsProbe(enabled: boolean): { sample: FpsSample; reset: () => void } {
  const [sample, setSample] = useState<FpsSample>({ ui: 0, js: 0, uiMin: 0, jsMin: 0 });
  const uiMinRef = useRef(Number.POSITIVE_INFINITY);
  const jsMinRef = useRef(Number.POSITIVE_INFINITY);

  const reportUi = useCallback((fps: number) => {
    uiMinRef.current = Math.min(uiMinRef.current, fps);
    setSample((prev) => ({ ...prev, ui: fps, uiMin: uiMinRef.current }));
  }, []);
  const reportJs = useCallback((fps: number) => {
    jsMinRef.current = Math.min(jsMinRef.current, fps);
    setSample((prev) => ({ ...prev, js: fps, jsMin: jsMinRef.current }));
  }, []);

  const uiFrames = useSharedValue(0);
  const uiWindowStart = useSharedValue(0);
  useFrameCallback((frame) => {
    'worklet';
    const now = frame.timestamp;
    if (uiWindowStart.value === 0) {
      uiWindowStart.value = now;
      return;
    }
    uiFrames.value += 1;
    const elapsed = now - uiWindowStart.value;
    if (elapsed >= WINDOW_MS) {
      scheduleOnRN(reportUi, Math.round((uiFrames.value * 1000) / elapsed));
      uiFrames.value = 0;
      uiWindowStart.value = now;
    }
  }, enabled);

  useEffect(() => {
    if (!enabled) return undefined;
    let frames = 0;
    let windowStart = 0;
    let handle = 0;
    const tick = (now: number) => {
      if (windowStart === 0) {
        windowStart = now;
      } else {
        frames += 1;
        const elapsed = now - windowStart;
        if (elapsed >= WINDOW_MS) {
          reportJs(Math.round((frames * 1000) / elapsed));
          frames = 0;
          windowStart = now;
        }
      }
      handle = requestAnimationFrame(tick);
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [enabled, reportJs]);

  const reset = useCallback(() => {
    uiMinRef.current = Number.POSITIVE_INFINITY;
    jsMinRef.current = Number.POSITIVE_INFINITY;
    setSample((prev) => ({ ...prev, uiMin: 0, jsMin: 0 }));
  }, []);

  return { sample, reset };
}
