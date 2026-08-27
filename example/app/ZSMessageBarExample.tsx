import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { ZSContainer, ZSMessageBar, ZSText, useTheme } from '@0610studio/zs-ui';
import Section from '../src/ui/kit/Section';
import CodeBlock from '../src/ui/kit/CodeBlock';

/** 폭 비교용 3종 — 안내 / 주의 / 오류 */
const KINDS = [
  {
    intent: 'information',
    title: '배송 예정일 안내',
    message: '주소를 입력하면 도착 예정일을 계산해 드려요.',
    short: '임시 저장했어요',
  },
  {
    intent: 'warning',
    title: '무료 체험이 곧 끝나요',
    message: '3일 뒤 자동으로 유료 전환됩니다. 언제든 해지할 수 있어요.',
    short: '네트워크가 불안정해요',
  },
  {
    intent: 'danger',
    title: '결제가 중단되었어요',
    message: '카드 유효기간이 만료되었습니다. 다른 카드로 다시 시도해 주세요.',
    short: '필수 항목입니다',
  },
] as const;

export default function ZSMessageBarExample() {
  const { palette } = useTheme();
  const [dismissed, setDismissed] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [notice, setNotice] = useState(true);

  return (
    <>
      <Stack.Screen options={{ title: 'ZSMessageBar' }} />
      <ZSContainer style={[styles.container, { backgroundColor: palette.background.layer2 }]}>
        <Section label="가로 꽉 채움 · 기본" gap={10}>
          {KINDS.map(kind => (
            <ZSMessageBar
              key={kind.intent}
              intent={kind.intent}
              title={kind.title}
              message={kind.message}
            />
          ))}
          <ZSText typo="caption.1" color="secondary">
            fullWidth 기본값(true) — 부모 폭을 채웁니다. 화면 상단 공지나 폼 전체 오류에 씁니다.
          </ZSText>
        </Section>

        <Section label="콘텐츠 맞춤 · fullWidth={false}" gap={10}>
          {KINDS.map(kind => (
            <ZSMessageBar
              key={kind.intent}
              intent={kind.intent}
              fullWidth={false}
              textSize="4"
              message={kind.short}
            />
          ))}
          <ZSText typo="caption.1" color="secondary">
            텍스트 길이만큼만 차지합니다. 입력 필드 아래 인라인 피드백처럼 짧은 문구에 씁니다.
          </ZSText>
        </Section>

        <Section label="콘텐츠 맞춤 · 가로 나열" gap={10}>
          <View style={styles.hugRow}>
            {KINDS.map(kind => (
              <ZSMessageBar
                key={kind.intent}
                intent={kind.intent}
                variant="stroke"
                fullWidth={false}
                textSize="5"
                message={kind.short}
              />
            ))}
          </View>
          <ZSText typo="caption.1" color="secondary">
            hug 상태라 flexWrap 부모 안에서 칩처럼 나란히 흐릅니다.
          </ZSText>
        </Section>

        <Section label="종류별 · 제목 없이 한 줄" gap={10}>
          {KINDS.map(kind => (
            <ZSMessageBar key={kind.intent} intent={kind.intent} message={kind.message} />
          ))}
          <ZSText typo="caption.1" color="secondary">
            title을 빼면 아이콘이 수직 중앙으로 정렬됩니다.
          </ZSText>
        </Section>

        <Section label="variant · 종류별 3종" gap={10}>
          {(['pastel', 'solid', 'stroke'] as const).map(variant => (
            <View key={variant} style={styles.variantGroup}>
              <ZSText typo="caption.1" color="secondary">{variant}</ZSText>
              {KINDS.map(kind => (
                <ZSMessageBar
                  key={kind.intent}
                  intent={kind.intent}
                  variant={variant}
                  textSize="4"
                  message={kind.short}
                />
              ))}
            </View>
          ))}
        </Section>

        <Section label="나머지 intent" gap={10}>
          <ZSMessageBar intent="success" message="예약이 확정되었습니다." />
          <ZSMessageBar intent="primary" message="새 버전이 준비되었습니다." />
          <ZSMessageBar intent="grey" message="지난 주 기록은 보관함으로 옮겨집니다." />
        </Section>

        <Section label="액션 · 닫기" gap={10}>
          <ZSMessageBar
            intent="danger"
            title="결제가 중단되었어요"
            message="카드 유효기간이 만료되었습니다."
            actionLabel="카드 변경하기"
            onAction={() => setActionCount(prev => prev + 1)}
            showClose
            onClose={() => setDismissed(true)}
          />
          <ZSText typo="caption.1" color="secondary">
            액션 호출 {actionCount}회 · {dismissed ? '닫기를 눌렀습니다' : '닫기 전'}
          </ZSText>
        </Section>

        <Section label="visible 제어" gap={10}>
          <ZSMessageBar
            intent="primary"
            variant="solid"
            message="공지를 닫아도 visible을 다시 true로 만들면 되돌아옵니다."
            visible={notice}
            showClose
            onClose={() => setNotice(false)}
          />
          <ZSMessageBar
            intent="grey"
            variant="stroke"
            icon={null}
            message={notice ? '위 공지가 열려 있습니다.' : '닫힌 공지를 다시 열어보세요.'}
            actionLabel={notice ? undefined : '공지 다시 열기'}
            onAction={() => setNotice(true)}
          />
        </Section>

        <Section label="아이콘 제어" gap={10}>
          <ZSMessageBar intent="information" message="intent 기본 아이콘" />
          <ZSMessageBar intent="information" icon={null} message="icon={null} — 아이콘 없이 텍스트만" />
          <ZSMessageBar
            intent="information"
            icon={<ZSText typo="subTitle.3">🎁</ZSText>}
            message="커스텀 노드를 아이콘 자리에 넣을 수 있어요."
          />
        </Section>

        <Section label="textSize · 1 / 3 / 6" gap={10}>
          {(['1', '3', '6'] as const).map(size => (
            <ZSMessageBar key={size} intent="grey" textSize={size} message={`textSize ${size}`} />
          ))}
        </Section>

        <CodeBlock
          code={`// 폭 전체 — 화면 공지 · 폼 전체 오류
<ZSMessageBar
  intent="warning"
  title="무료 체험이 곧 끝나요"
  message="3일 뒤 자동으로 유료 전환됩니다."
  actionLabel="플랜 보기"
  onAction={openPlans}
  showClose
/>

// 콘텐츠 맞춤 — 입력 필드 아래 인라인 피드백
<ZSMessageBar
  intent="danger"
  fullWidth={false}
  textSize="4"
  message="필수 항목입니다"
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
  hugRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variantGroup: {
    width: '100%',
    gap: 8,
  },
});
