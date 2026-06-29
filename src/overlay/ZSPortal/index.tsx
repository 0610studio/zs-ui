import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Z_INDEX_VALUE } from '../../model/utils';

interface PortalContextType {
  registerPortal: (id: string, element: ReactNode) => void;
  unregisterPortal: (id: string) => void;
}

const PortalContext = createContext<PortalContextType | null>(null);

interface PortalProviderProps {
  children: ReactNode;
}

export const PortalProvider: React.FC<PortalProviderProps> = ({ children }) => {
  const [portals, setPortals] = useState<Map<string, ReactNode>>(new Map());

  const registerPortal = useCallback((id: string, element: ReactNode) => {
    setPortals(prev => {
      if (prev.get(id) === element) {
        return prev;
      }
      const newMap = new Map(prev);
      newMap.set(id, element);
      return newMap;
    });
  }, []);

  const unregisterPortal = useCallback((id: string) => {
    setPortals(prev => {
      if (!prev.has(id)) {
        return prev;
      }
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const contextValue = useMemo(
    () => ({ registerPortal, unregisterPortal }),
    [registerPortal, unregisterPortal]
  );

  return (
    <PortalContext.Provider value={contextValue}>
      {children}
      {Array.from(portals.entries()).map(([id, element]) => (
        <Animated.View entering={FadeInDown} exiting={FadeOutDown} key={id} style={styles.portalLayer}>
          {element}
        </Animated.View>
      ))}
    </PortalContext.Provider>
  );
};

const styles = StyleSheet.create({
  portalLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
    zIndex: Z_INDEX_VALUE.ABOVE_KEYBOARD,
  },
});

interface PortalProps {
  children: ReactNode;
  isFocused?: boolean;
}

export const ZSPortal: React.FC<PortalProps> = ({ children, isFocused = true }) => {
  const context = useContext(PortalContext);
  const [portalId] = useState(() => `portal_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    if (!context) return;
    if (isFocused) {
      context.registerPortal(portalId, children);
    } else {
      context.unregisterPortal(portalId);
    }
  }, [isFocused, children]);

  useEffect(() => {
    return () => {
      if (!context) return;
      context.unregisterPortal(portalId);
    };
  }, []);

  return null;
};
