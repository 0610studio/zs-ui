import { useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import BottomSheet from '@expo/ui/community/bottom-sheet';
import { frame, presentationSizing } from '@expo/ui/swift-ui/modifiers';
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
  /** pt. Narrower windows keep their own width */
  maxWidth?: number;
  onClose: () => void;
  children: ReactNode;
}

export default function IOSBottomSheet({ open, snapPoints, dismissible, maxWidth, onClose, children }: IOSBottomSheetProps) {
  const axis = useContext(LayoutContext)?.barAxis ?? defaultBarAxis;
  const barAxis = useSyncExternalStore(axis.subscribe, axis.get, axis.get);
  const verticalBarEdge = useVerticalBarEdgeIOS();
  const sized = maxWidth !== undefined && Number.isFinite(maxWidth) && maxWidth > 0;
  const fitToContents = !snapPoints || snapPoints.length === 0;
  // bottomSheetMaxWidth: an ideal width that presentationSizing fits horizontally (iOS 18+), so regular-width
  // windows (iPad, unfolded Duo) narrow the form sheet. The frame shrinks to a narrower proposal, so compact
  // windows keep the system width. The community sheet applies these after its own modifiers.
  const modifiers = useMemo(() => (sized ? [
    frame({ idealWidth: maxWidth, maxWidth }),
    presentationSizing('automatic', { fitted: { horizontal: true, vertical: fitToContents } }),
  ] : undefined), [sized, maxWidth, fitToContents]);
  // UIKit page sheets re-enable Duo's vertical status capsule even when the
  // controller and SwiftUI content disable it. Keep horizontal bars by staying
  // in the app window. Choose once so folding cannot discard a form's state.
  const [inWindow] = useState(() => barAxis === 'horizontal' && verticalBarEdge !== null);
  if (inWindow) {
    return <WindowBottomSheet open={open} snapPoints={snapPoints} dismissible={dismissible} maxWidth={maxWidth} onClose={onClose}>{children}</WindowBottomSheet>;
  }
  return (
    <PresentationAnchor onDetach={onClose}>
      <BottomSheet index={open ? 0 : -1} snapPoints={snapPoints} enablePanDownToClose={dismissible} onClose={onClose} modifiers={modifiers}>
        {children}
      </BottomSheet>
    </PresentationAnchor>
  );
}
