import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ScrollView, View, VirtualizedList, useWindowDimensions } from 'react-native';
import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui';
import {
  frame,
  interactiveDismissDisabled,
  presentationDetents,
  presentationDragIndicator,
  presentationSizing,
  type PresentationDetent,
} from '@expo/ui/swift-ui/modifiers';

const VirtualizedListContext = VirtualizedList.contextType;

export interface IOSSizedSheetProps {
  open: boolean;
  snapPoints?: (string | number)[];
  dismissible: boolean;
  /** pt — the sheet's ideal width. Regular-width windows (iPad, unfolded Duo) fit the form sheet to it */
  maxWidth: number;
  onClose: () => void;
  children: ReactNode;
}

const toDetent = (point: string | number): PresentationDetent => (
  typeof point === 'string' && point.endsWith('%') ? { fraction: Number.parseFloat(point) / 100 } : { height: Number(typeof point === 'string' ? Number.parseFloat(point) : point) }
);

/**
 * The SwiftUI system sheet with a width, for `OverlayProvider bottomSheetMaxWidth`.
 * `@expo/ui` community BottomSheet leaves the width to the system (an iPad form sheet is ~580pt) and takes no modifiers,
 * so this composes the same sheet and adds an ideal width that `presentationSizing` fits horizontally (iOS 18+).
 * The frame shrinks to a narrower proposal, so compact windows keep the system width, including inset iOS 26 sheets.
 */
export default function IOSSizedSheet({ open, snapPoints, dismissible, maxWidth, onClose, children }: IOSSizedSheetProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [presented, setPresented] = useState(open);
  const closedRef = useRef(!open);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (open) closedRef.current = false;
    setPresented(open);
  }, [open]);

  // SwiftUI sends onDismiss after the dismissal transition, so the caller may present again from onClose
  const dismissed = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    onCloseRef.current();
  }, []);
  const presentedChange = useCallback((next: boolean) => {
    if (!next) setPresented(false);
  }, []);

  const fitToContents = !snapPoints || snapPoints.length === 0;
  const modifiers = useMemo(() => [
    frame({ idealWidth: maxWidth, maxWidth }),
    presentationSizing('automatic', { fitted: { horizontal: true, vertical: fitToContents } }),
    ...(fitToContents ? [] : [presentationDetents(snapPoints.map(toDetent))]),
    presentationDragIndicator('visible'),
    interactiveDismissDisabled(!dismissible),
  ], [maxWidth, fitToContents, snapPoints, dismissible]);

  // RN measures within the Host before SwiftUI reports the sheet width, so start from the width the sheet will take
  const hostWidth = Math.min(maxWidth, windowWidth);
  return (
    <Host style={{ position: 'absolute', width: hostWidth }} pointerEvents="none">
      <BottomSheet isPresented={presented} onIsPresentedChange={presentedChange} onDismiss={dismissed} fitToContents={fitToContents}>
        <Group modifiers={modifiers}>
          <RNHostView matchContents={fitToContents ? { vertical: true } : false} boundedByHost={fitToContents}>
            {/* Same top gap below the system drag indicator as the community sheet */}
            <View style={fitToContents ? { paddingTop: 16 } : { flexGrow: 1, height: 0, paddingTop: 16 }}>
              <VirtualizedListContext.Provider value={null}>
                <ScrollView.Context.Provider value={null}>{children}</ScrollView.Context.Provider>
              </VirtualizedListContext.Provider>
            </View>
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  );
}
