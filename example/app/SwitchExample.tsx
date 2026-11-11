import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ZSCheckbox, ZSScreen, ZSSwitch, ZSText } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import { PAGE_CONTENT, ROW_INSET } from '../src/ui/kit/layout';
import ScreenHeader from '../src/ui/ScreenHeader';

export default function SwitchExample() {
  const [wifi, setWifi] = useState(true);
  const [push, setPush] = useState(false);

  return (
    <>
      <ScreenHeader title="ZSSwitch" />
      <ZSScreen backgroundColor="background" style={styles.container}>
        {/* 행 여백은 스위치가 직접 갖는다(contentInset) — 누름 효과가 묶음 끝에서 끝까지 퍼진다 */}
        <Section label="목록 행" surface="list" flushRows>
          <ZSSwitch label="Wi-Fi" value={wifi} onValueChange={setWifi} contentInset={ROW_INSET} testID="switch-wifi" />
          <ZSSwitch label="푸시 알림" value={push} onValueChange={setPush} contentInset={ROW_INSET} testID="switch-push" />
          <ZSSwitch label="비활성" value onValueChange={() => undefined} contentInset={ROW_INSET} disabled />
        </Section>
        <ZSText variant="caption" color="textSecondary" testID="switch-state">{`Wi-Fi ${wifi ? '켬' : '끔'} · 푸시 ${push ? '켬' : '끔'}`}</ZSText>
        <Section label="라벨 없음" gap={12} direction="row">
          <ZSSwitch accessibilityLabel="Wi-Fi" value={wifi} onValueChange={setWifi} />
          <ZSSwitch accessibilityLabel="푸시 알림" value={push} onValueChange={setPush} />
        </Section>
        <Section label="비제어 · defaultValue" surface="list" flushRows>
          <ZSSwitch label="블루투스" defaultValue contentInset={ROW_INSET} testID="switch-uncontrolled" />
          <View style={styles.inset}>
            <ZSCheckbox label="자동 업데이트" defaultValue={false} testID="check-uncontrolled" />
          </View>
        </Section>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: PAGE_CONTENT,
  inset: { paddingHorizontal: ROW_INSET },
});
