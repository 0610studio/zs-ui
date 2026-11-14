import { useContext, useState, useSyncExternalStore, type ReactNode } from 'react';
import BottomSheet from '@expo/ui/community/bottom-sheet';
import { useVerticalBarEdgeIOS } from 'expo-status-bar';
import { LayoutContext, createValueStore } from '../layout/LayoutContext';
import type { BarAxis } from '../layout/types';
import { PresentationAnchor } from './PresentationAnchor';
import WindowBottomSheet from './WindowBottomSheet';

const defaultBarAxis = createValueStore<BarAxis>('horizontal', Object.is);

export interface IOSBottomSheetProps {
  open: boolean;
  snapPoints?: (string | number)[];
  dismissible: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function IOSBottomSheet({ open, snapPoints, dismissible, onClose, children }: IOSBottomSheetProps) {
  const axis = useContext(LayoutContext)?.barAxis ?? defaultBarAxis;
  const barAxis = useSyncExternalStore(axis.subscribe, axis.get, axis.get);
  const verticalBarEdge = useVerticalBarEdgeIOS();
  // UIKit page sheets re-enable Duo's vertical status capsule even when the
  // controller and SwiftUI content disable it. Keep horizontal bars by staying
  // in the app window. Choose once so folding cannot discard a form's state.
  const [inWindow] = useState(() => barAxis === 'horizontal' && verticalBarEdge !== null);
  if (inWindow) {
    return <WindowBottomSheet open={open} snapPoints={snapPoints} dismissible={dismissible} onClose={onClose}>{children}</WindowBottomSheet>;
  }
  return (
    <PresentationAnchor onDetach={onClose}>
      <BottomSheet index={open ? 0 : -1} snapPoints={snapPoints} enablePanDownToClose={dismissible} onClose={onClose}>
        {children}
      </BottomSheet>
    </PresentationAnchor>
  );
}
