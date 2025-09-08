import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

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
      // 동일한 요소가 이미 등록되어 있다면 업데이트하지 않음
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
      // 해당 ID가 존재하지 않으면 상태를 변경하지 않음
      if (!prev.has(id)) {
        return prev;
      }
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  return (
    <PortalContext.Provider value={{ registerPortal, unregisterPortal }}>
      {children}
      {Array.from(portals.entries()).map(([id, element]) => (
        <Animated.View entering={FadeInDown} exiting={FadeOutDown} key={id} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'box-none' }}>
          {element}
        </Animated.View>
      ))}
    </PortalContext.Provider>
  );
};

// ------------------------------------------------------------------------------------------------

interface PortalProps {
  children: ReactNode;
  isFocused?: boolean;
}

export const ZSPortal: React.FC<PortalProps> = ({ children, isFocused = true }) => {
  const context = useContext(PortalContext);
  const [portalId] = useState(() => `portal_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    if (context) {
      if (isFocused) {
        context.registerPortal(portalId, children);
      } else {
        context.unregisterPortal(portalId);
      }
    }
  }, [children]);

  return null;
};
