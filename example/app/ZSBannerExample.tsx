import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { ZSButton, ZSScreen, ZSBanner, type ZSBannerStatus, type ZSBannerVariant } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

const KINDS: { status: ZSBannerStatus; message: string }[] = [
  { status: 'info', message: '새 기능이 추가되었습니다.' },
  { status: 'success', message: '예약이 확정되었습니다.' },
  { status: 'warning', message: '네트워크가 불안정합니다.' },
  { status: 'error', message: '사진을 올리지 못했습니다.' },
  { status: 'neutral', message: '지난 주 기록은 보관함으로 옮겨집니다.' },
];
const VARIANTS: ZSBannerVariant[] = ['tonal', 'outlined'];

export default function ZSBannerExample() {
  const [visible, setVisible] = useState(true);

  return (
    <>
      <ScreenHeader title="ZSBanner" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        {VARIANTS.map((variant) => (
          <Section key={variant} label={`variant="${variant}"`} surface="plain" gap={10}>
            {KINDS.map((kind) => (
              <ZSBanner key={kind.status} status={kind.status} variant={variant} message={kind.message} />
            ))}
          </Section>
        ))}

        <Section label="제목 · 동작 · 닫기" surface="plain" gap={10}>
          <ZSBanner
            status="error"
            title="사진 올리기 실패"
            message="사진 용량을 줄인 뒤 다시 시도해 주세요."
            action={{ label: '다시 시도', onPress: () => undefined }}
            visible={visible}
            onClose={() => setVisible(false)}
            testID="banner-closable"
          />
          {!visible ? <ZSButton title="다시 보이기" variant="tonal" onPress={() => setVisible(true)} testID="banner-reopen" /> : null}
          <ZSBanner status="info" icon={null} message="icon={null} — 아이콘 없이 텍스트만" />
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
});
