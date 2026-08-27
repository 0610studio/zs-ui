import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSSegmented, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

const PERIOD_OPTIONS = ['일간', '주간', '월간', '연간'];
const TAB_OPTIONS = ['홈', '검색', '알림'];

export default function ZSSegmentedExample() {
  const { palette } = useTheme();
  const [basicIndex, setBasicIndex] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [controlledIndex, setControlledIndex] = useState(1);

  return (
    <>
      <Stack.Screen options={{ title: 'ZSSegmented' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="기본 · 2개 세그먼트" gap={10}>
          <ZSSegmented
            options={['산책', '간식']}
            onChange={setBasicIndex}
          />
          <ZSText typo="caption.1" color="secondary">
            선택된 인덱스: {basicIndex}
          </ZSText>
        </Section>

        <Section label="탭처럼 사용 · 콘텐츠 전환" gap={14}>
          <ZSSegmented
            options={TAB_OPTIONS}
            onChange={setTabIndex}
          />
          <View style={[styles.tabContent, { backgroundColor: palette.background.layer2 }]}>
            <ZSText typo="subTitle.2">{TAB_OPTIONS[tabIndex]} 화면</ZSText>
            <ZSText typo="caption.1" color="secondary">
              세그먼트 선택에 따라 콘텐츠가 전환됩니다.
            </ZSText>
          </View>
        </Section>

        <Section label="4개 세그먼트 · 제어 모드" gap={10}>
          <ZSSegmented
            options={PERIOD_OPTIONS}
            selectedIndex={controlledIndex}
            onChange={setControlledIndex}
          />
          <ZSText typo="caption.1" color="secondary">
            selectedIndex를 넘기면 외부 상태로 제어됩니다. ({PERIOD_OPTIONS[controlledIndex]})
          </ZSText>
        </Section>

        <Section label="textSize · 1 ~ 6" gap={14}>
          {(['1', '3', '6'] as const).map((size) => (
            <View key={size} style={styles.sizeRow}>
              <ZSText typo="caption.1" color="secondary" style={styles.sizeLabel}>
                textSize=&quot;{size}&quot;
              </ZSText>
              <ZSSegmented
                style={styles.sizeControl}
                options={['왼쪽', '오른쪽']}
                textSize={size}
                containerHeight={size === '1' ? 48 : size === '3' ? 40 : 32}
              />
            </View>
          ))}
        </Section>

        <Section label="긴 라벨 · 말줄임 처리" gap={14}>
          <ZSSegmented
            options={['아주 길어서 잘리는 세그먼트 라벨', '짧은 라벨']}
          />
          <ZSSegmented
            options={['전체보기', '예방접종 완료한 아이만 보기', '입양가능', '치료중']}
          />
          <ZSText typo="caption.1" color="secondary">
            세그먼트 폭은 개수로 균등 분할되고, 폭을 넘는 라벨은 한 줄 말줄임(…) 처리됩니다.
          </ZSText>
        </Section>

        <Section label="fullWidth={false} · 콘텐츠 폭 맞춤" gap={14}>
          <ZSSegmented fullWidth={false} options={['ON', 'OFF']} />
          <ZSSegmented fullWidth={false} options={['산책', '간식']} textSize="5" containerHeight={32} />
          <ZSSegmented fullWidth={false} options={['오늘', '이번 주', '최근 30일']} textSize="1" containerHeight={48} />
          <ZSText typo="caption.1" color="secondary">
            가장 긴 라벨과 글자 크기에 맞춰 전체 폭이 동적으로 결정됩니다.
          </ZSText>
        </Section>

        <Section label="커스텀 · 색상 / 높이 / 비활성" gap={14}>
          <ZSSegmented
            options={['라이트', '다크', '시스템']}
            containerHeight={48}
            textSize="3"
            trackColor={palette.primary[10]}
            thumbColor={palette.primary.main}
          />
          <ZSSegmented
            options={['수정', '삭제']}
            disabled
          />
        </Section>

        <CodeBlock
          code={`<ZSSegmented
  options={['일간', '주간', '월간', '연간']}
  initialIndex={0}
  onChange={(index) => setIndex(index)}
  containerHeight={40}
  textSize="2"
/>`}
        />
      </ZSContainer>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
    paddingTop: 24,
    paddingBottom: 48,
    paddingHorizontal: 20,
  },
  tabContent: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  sizeRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeLabel: {
    width: 86,
  },
  sizeControl: {
    flex: 1,
  },
});
