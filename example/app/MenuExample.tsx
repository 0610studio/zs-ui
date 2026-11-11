import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { ZSButton, ZSScreen, ZSMenu, ZSText, radiusStyle, useTheme, type ZSMenuItem } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const ITEMS: ZSMenuItem[] = [
  { key: 'edit', label: '편집', icon: { sf: 'pencil' } },
  { key: 'share', label: '공유', icon: { sf: 'square.and.arrow.up' } },
  { key: 'delete', label: '삭제', icon: { sf: 'trash' }, destructive: true },
];

export default function MenuExample() {
  const { colors } = useTheme();
  const [last, setLast] = useState('없음');
  const [pinned, setPinned] = useState(false);
  const items = Platform.OS === 'ios' ? ITEMS : ITEMS.map(({ icon: _icon, ...item }) => item);

  return (
    <>
      <ScreenHeader title="Menu" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        <Section label="탭해서 열기" surface="plain" direction="row" gap={12} style={styles.menuRow}>
          <ZSMenu
            items={[{ key: 'pin', label: '상단 고정', checked: pinned }]}
            onSelect={() => {
              setPinned((value) => !value);
              setLast('pin');
            }}
            testID="menu-toggle"
          >
            <ZSButton title={pinned ? '고정됨' : '고정 안 됨'} variant="tonal" />
          </ZSMenu>
          <ZSMenu items={items} onSelect={setLast} style={styles.trailing} testID="menu-trailing">
            <ZSButton title="더 보기" variant="outlined" />
          </ZSMenu>
        </Section>
        <Section label="길게 눌러 열기 (iOS ContextMenu)" surface="plain" gap={12}>
          <ZSMenu items={items} onSelect={setLast} openOnLongPress testID="menu-long-press">
            <View style={[styles.card, radiusStyle('xl'), { backgroundColor: colors.surface2 }]}>
              <ZSText variant="body1">길게 누르세요</ZSText>
            </View>
          </ZSMenu>
        </Section>
        <ZSText variant="caption" color="textSecondary" testID="menu-last">
          {`선택: ${last}`}
        </ZSText>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  card: { padding: 24, alignItems: 'center' },
  menuRow: { alignItems: 'center' },
  trailing: { marginStart: 'auto' },
});
