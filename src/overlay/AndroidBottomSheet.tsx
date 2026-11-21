import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, VirtualizedList, useWindowDimensions } from 'react-native';
import { ModalBottomSheet, RNHostView, type ModalBottomSheetRef } from '@expo/ui/jetpack-compose';
import { width as widthModifier } from '@expo/ui/jetpack-compose/modifiers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeHost } from '../native/NativeHost';
import { useComposeColors } from '../native/composeColors';
import { useTheme } from '../context/ThemeContext';

export interface AndroidBottomSheetProps {
  open: boolean;
  snapPoints?: (string | number)[];
  dismissible: boolean;
  containerColor?: string;
  /** dp. M3 centers the sheet; a narrower window keeps the window width */
  maxWidth?: number;
  onClose: () => void;
  children: ReactNode;
}

const VirtualizedListContext = VirtualizedList.contextType;

function ScrollContextReset({ children }: { children: ReactNode }) {
  return (
    <VirtualizedListContext.Provider value={null}>
      <ScrollView.Context.Provider value={null}>{children}</ScrollView.Context.Provider>
    </VirtualizedListContext.Provider>
  );
}

export default function AndroidBottomSheet({ open, snapPoints, dismissible, containerColor, maxWidth, onClose, children }: AndroidBottomSheetProps) {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const composeColors = useComposeColors();
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const [mounted, setMounted] = useState(open);
  const [generation, setGeneration] = useState(0);
  const generationRef = useRef(0);
  const closedRef = useRef(!open);
  const hidingRef = useRef(false);
  const mountedRef = useRef(mounted);
  mountedRef.current = mounted;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const close = useCallback((sheetGeneration: number) => {
    if (sheetGeneration !== generationRef.current || closedRef.current) return;
    closedRef.current = true;
    hidingRef.current = false;
    setMounted(false);
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (open) {
      if (hidingRef.current || !mountedRef.current) {
        hidingRef.current = false;
        generationRef.current += 1;
        setGeneration(generationRef.current);
      }
      closedRef.current = false;
      setMounted(true);
      return;
    }
    if (!mountedRef.current || closedRef.current) return;
    hidingRef.current = true;
    const sheetGeneration = generationRef.current;
    const finish = () => {
      if (hidingRef.current) close(sheetGeneration);
    };
    const sheet = sheetRef.current;
    if (sheet) sheet.hide().then(finish, finish);
    else finish();
  }, [open, close]);

  if (!mounted) return null;

  const multipleSnapPoints = (snapPoints?.length ?? 0) > 1;
  const fitToContents = !snapPoints || snapPoints.length === 0;
  const sheetGeneration = generation;
  // Applied before M3's own widthIn(max = 640.dp): the preferred width still yields to a narrower window
  const modifiers = maxWidth !== undefined && Number.isFinite(maxWidth) && maxWidth > 0 ? [widthModifier(maxWidth)] : undefined;

  return (
    <NativeHost style={[styles.anchor, { width }]} pointerEvents="none">
      <ModalBottomSheet
        key={generation}
        ref={sheetRef}
        onDismissRequest={() => close(sheetGeneration)}
        skipPartiallyExpanded={!multipleSnapPoints}
        sheetGesturesEnabled={dismissible}
        showDragHandle={false}
        containerColor={containerColor}
        modifiers={modifiers}
        contentColor={composeColors.bottomSheet.contentColor}
        scrimColor={composeColors.bottomSheet.scrimColor}
        properties={{ shouldDismissOnBackPress: dismissible, shouldDismissOnClickOutside: dismissible }}
      >
        {fitToContents ? (
          <RNHostView matchContents={{ vertical: true }}>
            <View>
              <DragHandle />
              <ScrollContextReset>{children}</ScrollContextReset>
            </View>
          </RNHostView>
        ) : (
          <RNHostView matchContents={{ vertical: true }}>
            <View style={{ height: height - top - bottom }}>
              <DragHandle />
              <ScrollContextReset>{children}</ScrollContextReset>
            </View>
          </RNHostView>
        )}
      </ModalBottomSheet>
    </NativeHost>
  );
}

function DragHandle() {
  const { colors } = useTheme();
  return (
    <View style={styles.handleArea} testID="zs-bottom-sheet-handle">
      <View style={[styles.handle, { backgroundColor: colors.surface5 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  handleArea: { height: 48, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 32, height: 4, borderRadius: 2 },
  anchor: { position: 'absolute' },
});
