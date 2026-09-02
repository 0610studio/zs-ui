import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { BackHandler, type NativeEventSubscription } from 'react-native';

/** back 처리 우선순위 — 숫자가 클수록 먼저 처리된다. */
export const BackPriority = {
  SCREEN: 0,
  SHEET: 10,
  OVERLAY: 20,
  LOADER: 30,
} as const;

export type BackHandlerCallback = () => boolean;

type BackHandlerEntry = {
  priority: number;
  seq: number;
  callback: BackHandlerCallback;
};

export type BackHandlerRegistry = {
  register: (priority: number, callback: BackHandlerCallback) => number;
  unregister: (id: number) => void;
};

export const BackHandlerContext = createContext<BackHandlerRegistry | null>(null);

export function BackHandlerProvider({ children }: { children: ReactNode }) {
  const entriesRef = useRef<Map<number, BackHandlerEntry>>(new Map());
  const idRef = useRef(0);
  const seqRef = useRef(0);
  const subscriptionRef = useRef<NativeEventSubscription | null>(null);

  const registry = useMemo<BackHandlerRegistry>(() => {
    const dispatch = (): boolean => {
      const ordered = [...entriesRef.current.values()].sort(
        (a, b) => b.priority - a.priority || b.seq - a.seq
      );
      for (const entry of ordered) {
        if (entry.callback()) {
          return true;
        }
      }
      return false;
    };

    return {
      register: (priority, callback) => {
        const id = idRef.current;
        idRef.current += 1;
        seqRef.current += 1;
        entriesRef.current.set(id, { priority, seq: seqRef.current, callback });
        // 맨 뒤로 재등록해 나중에 붙는 React Navigation 의 back 리스너보다 LIFO 에서 우선하게 한다
        subscriptionRef.current?.remove();
        subscriptionRef.current = BackHandler.addEventListener('hardwareBackPress', dispatch);
        return id;
      },
      unregister: (id) => {
        entriesRef.current.delete(id);
        if (entriesRef.current.size === 0 && subscriptionRef.current != null) {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
        }
      },
    };
  }, []);

  useEffect(
    () => () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    },
    []
  );

  return <BackHandlerContext.Provider value={registry}>{children}</BackHandlerContext.Provider>;
}

let hasWarnedNoProvider = false;

interface UseBackHandlerOptions {
  enabled?: boolean;
  priority?: number;
}

/** callback 이 true 를 반환하면 back 을 소비한다. OverlayProvider 내부에서만 쓴다. */
export function useBackHandler(
  callback: BackHandlerCallback,
  options: UseBackHandlerOptions = {}
): void {
  const { enabled = true, priority = BackPriority.SCREEN } = options;

  const registry = useContext(BackHandlerContext);
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    if (registry == null) {
      if (__DEV__ && !hasWarnedNoProvider) {
        hasWarnedNoProvider = true;
        console.warn(
          'useBackHandler: BackHandlerProvider가 없어 뒤로가기 핸들러가 무시됩니다. 앱 루트에 OverlayProvider를 마운트하세요.'
        );
      }
      return;
    }
    const id = registry.register(priority, () => callbackRef.current());
    return () => registry.unregister(id);
  }, [enabled, priority, registry]);
}
