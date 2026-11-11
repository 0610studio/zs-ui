import { useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { ZSButton, ZSCard, ZSPressable, ZSScreen, ZSSegmentedControl, ZSSwitch, ZSText, useTheme, withOpacity, type ColorName, type ZSCardVariant } from '@0610studio/zs-ui';
import useLargeText from '../src/hooks/useLargeText';
import ScreenHeader from '../src/ui/ScreenHeader';
import AnimalPhoto from '../src/ui/kit/AnimalPhoto';
import ContentIcon from '../src/ui/kit/ContentIcon';
import { PAGE_CONTENT, RULE } from '../src/ui/kit/layout';
import { stickerToImg } from '../src/ui/barabom/stickers';

const SCREEN_BACKGROUNDS: { label: string; value: ColorName }[] = [
  { label: 'background', value: 'background' },
  { label: 'surface2', value: 'surface2' },
  { label: 'surface3', value: 'surface3' },
];

const VARIANTS: { variant: ZSCardVariant; caption: string }[] = [
  { variant: 'elevated', caption: '그림자로 띄운 면. 화면에서 따로 눈에 띄어야 할 묶음' },
  { variant: 'filled', caption: '배경보다 짙은 면. 그림자 없이 차분하게 묶을 때' },
  { variant: 'outlined', caption: '테두리만. 카드가 여러 장 이어질 때 가장 가볍다' },
];

const FRIENDS: { name: string; caption: string; sticker: ImageSourcePropType }[] = [
  { name: '치즈', caption: '고양이 · 3살 · 낮잠 대장', sticker: stickerToImg('heart') },
  { name: '보리', caption: '강아지 · 5살 · 산책을 좋아해요', sticker: stickerToImg('walk') },
  { name: '솜이', caption: '토끼 · 2살 · 당근보다 건초', sticker: stickerToImg('ply') },
];

const STATS = [
  { label: '산책', value: '2회' },
  { label: '사료', value: '3번' },
  { label: '몸무게', value: '4.2kg' },
  { label: '물', value: '250ml' },
];

function Group({ label, caption, children }: { label: string; caption?: string; children: React.ReactNode }) {
  return (
    <View style={styles.group}>
      <ZSText variant="caption" emphasized color="textSecondary" accessibilityRole="header">
        {label}
      </ZSText>
      {caption ? (
        <ZSText variant="caption" color="textSecondary">
          {caption}
        </ZSText>
      ) : null}
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

function RoundIconButton({ glyph, color, backgroundColor, ...props }: { glyph: string; color: ColorName; backgroundColor?: ColorName } & Pick<React.ComponentProps<typeof ZSPressable>, 'onPress' | 'accessibilityLabel' | 'accessibilityRole' | 'accessibilityState' | 'testID'>) {
  return (
    <ZSPressable {...props} radius="full" backgroundColor={backgroundColor} style={styles.iconButton}>
      <ZSText variant="subtitle1" color={color} maxFontSizeMultiplier={1.2} importantForAccessibility="no" accessibilityElementsHidden>
        {glyph}
      </ZSText>
    </ZSPressable>
  );
}

const MEDIA_HEIGHT = 160;

function MediaPhoto() {
  const [width, setWidth] = useState(0);
  return (
    <View style={styles.media} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 ? <AnimalPhoto kind="somi" width={width} height={MEDIA_HEIGHT} radius="none" accessibilityLabel="롭이어 토끼 사진" /> : null}
    </View>
  );
}

export default function ZSCardExample() {
  const { colors, mode } = useTheme();
  const large = useLargeText();
  const [screenBackground, setScreenBackground] = useState<ColorName>('background');
  const [lastPressed, setLastPressed] = useState('아직 없음');
  const [favorite, setFavorite] = useState(false);
  const [tipVisible, setTipVisible] = useState(true);
  const [walkReminder, setWalkReminder] = useState(true);

  return (
    <>
      <ScreenHeader title="ZSCard" background={colors[screenBackground]} />
      <ZSScreen backgroundColor={screenBackground} style={styles.container}>
        <Group label="화면 배경" caption="같은 카드를 다른 화면 배경 위에서 비교합니다">
          <ZSSegmentedControl options={SCREEN_BACKGROUNDS} value={screenBackground} onValueChange={setScreenBackground} accessibilityLabel="화면 배경" testID="card-screen-background" />
        </Group>

        <ZSText variant="body2" color="textSecondary" testID="card-last-pressed">
          {`최근에 누른 것: ${lastPressed}`}
        </ZSText>

        <Group label="변형 · variant">
          {VARIANTS.map(({ variant, caption }) => (
            <ZSCard key={variant} variant={variant} testID={`card-variant-${variant}`} contentStyle={styles.textStack}>
              <ZSText variant="subtitle1" emphasized>
                {variant}
              </ZSText>
              <ZSText variant="body2" color="textSecondary">
                {caption}
              </ZSText>
            </ZSCard>
          ))}
        </Group>

        <Group label="누를 수 있는 카드 · onPress" caption="내용 영역 전체가 버튼 하나입니다">
          {FRIENDS.map(({ name, caption, sticker }) => (
            <ZSCard key={name} onPress={() => setLastPressed(name)} accessibilityHint="친구 소개를 엽니다" testID={`card-friend-${name}`} contentStyle={styles.row}>
              <Image source={sticker} style={styles.avatar} accessibilityIgnoresInvertColors />
              <View style={styles.rowText}>
                <ZSText variant="subtitle1" emphasized>
                  {name}
                </ZSText>
                <ZSText variant="body2" color="textSecondary">
                  {caption}
                </ZSText>
              </View>
              <ZSText variant="h4" color="borderStrong" importantForAccessibility="no" accessibilityElementsHidden>
                ›
              </ZSText>
            </ZSCard>
          ))}
          <ZSCard variant="outlined" onLongPress={() => setLastPressed('길게 누른 카드')} testID="card-long-press" contentStyle={styles.textStack}>
            <ZSText variant="subtitle1" emphasized>
              길게 눌러 보세요
            </ZSText>
            <ZSText variant="body2" color="textSecondary">
              onLongPress 만 줘도 누를 수 있는 카드가 됩니다
            </ZSText>
          </ZSCard>
        </Group>

        <Group label="버튼이 있는 카드 · actions" caption="버튼 줄은 누름 영역 밖이라 버튼을 눌러도 카드가 눌리지 않고, 스크린 리더도 버튼을 따로 읽습니다">
          <ZSCard onPress={() => setLastPressed('봉사 카드')} accessibilityHint="모집 내용을 엽니다" testID="card-actions" contentStyle={styles.textStack}
            actions={
              <>
                <ZSButton title="공유" variant="text" onPress={() => setLastPressed('봉사 · 공유')} testID="card-actions-share" />
                <ZSButton title="신청하기" variant="tonal" onPress={() => setLastPressed('봉사 · 신청하기')} testID="card-actions-apply" />
              </>
            }
          >
            <ZSText variant="subtitle1" emphasized>
              보호소 산책 봉사
            </ZSText>
            <ZSText variant="body2" color="textSecondary">
              토요일 오전 10시 · 강아지 12마리와 함께 동네 공원 한 바퀴
            </ZSText>
          </ZSCard>
        </Group>

        <Group label="모서리 동작 · cornerAction" caption="그림 위 즐겨찾기, 글자 카드의 닫기처럼 아이콘 버튼 하나를 오른쪽 위에 둡니다">
          <ZSCard
            onPress={() => setLastPressed('오늘의 동물')}
            contentStyle={styles.flush}
            testID="card-media"
            cornerAction={
              <ZSPressable
                onPress={() => setFavorite((prev) => !prev)}
                accessibilityLabel="즐겨찾기"
                accessibilityRole="togglebutton"
                accessibilityState={{ checked: favorite }}
                radius="full"
                backgroundColor={withOpacity(mode === 'dark' ? colors.surface3 : colors.background, 0.8)}
                style={styles.iconButton}
                testID="card-media-favorite"
              >
                <ContentIcon name="heart" strokeWidth={2} color={colors.text} fill={favorite ? colors.primary : undefined} />
              </ZSPressable>
            }
          >
            <MediaPhoto />
            <View style={styles.mediaBody}>
              <ZSText variant="caption" color="textSecondary" emphasized>
                오늘의 동물
              </ZSText>
              <ZSText variant="h4" emphasized>
                롭이어 토끼
              </ZSText>
              <ZSText variant="body2" color="textSecondary">
                귀가 아래로 늘어진 토끼예요. 기분이 좋으면 제자리에서 몸을 비틀며 폴짝 뛰어요.
              </ZSText>
            </View>
          </ZSCard>

          {tipVisible ? (
            <ZSCard
              variant="filled"
              contentStyle={[styles.textStack, styles.cornerRoom]}
              testID="card-tip"
              cornerAction={<RoundIconButton glyph="✕" color="textSecondary" onPress={() => setTipVisible(false)} accessibilityLabel="도움말 닫기" testID="card-tip-close" />}
            >
              <ZSText variant="subtitle1" emphasized>
                산책 전에 발바닥을 확인해요
              </ZSText>
              <ZSText variant="body2" color="textSecondary">
                여름 한낮의 아스팔트는 생각보다 뜨거워요. 손등을 5초 대 보고 뜨거우면 그늘길로 가요.
              </ZSText>
            </ZSCard>
          ) : (
            <ZSButton title="닫은 도움말 다시 보기" variant="outlined" onPress={() => setTipVisible(true)} testID="card-tip-restore" />
          )}
        </Group>

        <Group label="누를 수 없는 카드 · 안에 컨트롤" caption="카드를 누를 수 없으면 버튼·스위치를 내용 어디에 둬도 됩니다">
          <ZSCard variant="outlined" contentStyle={styles.settings} testID="card-settings">
            <View style={styles.settingRow}>
              <View style={styles.rowText}>
                <ZSText variant="subtitle1">산책 알림</ZSText>
                <ZSText variant="body2" color="textSecondary">
                  매일 저녁 7시에 알려요
                </ZSText>
              </View>
              <ZSSwitch value={walkReminder} onValueChange={setWalkReminder} accessibilityLabel="산책 알림" />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <ZSButton title="알림 시간 바꾸기" variant="text" onPress={() => setLastPressed('알림 시간 바꾸기')} style={styles.inlineButton} />
          </ZSCard>
        </Group>

        <Group label="격자 · filled" caption="숫자 요약처럼 작은 묶음은 그림자 없는 filled 로 가볍게">
          {[STATS.slice(0, 2), STATS.slice(2)].map((row) => (
            <View key={row[0]?.label} style={[styles.gridRow, large && styles.gridStacked]}>
              {row.map(({ label, value }) => (
                <ZSCard key={label} variant="filled" radius="md" style={large ? null : styles.gridItem} contentStyle={styles.stat} testID={`card-stat-${label}`}>
                  <ZSText variant="caption" color="textSecondary">
                    {label}
                  </ZSText>
                  <ZSText variant="h3" emphasized>
                    {value}
                  </ZSText>
                </ZSCard>
              ))}
            </View>
          ))}
        </Group>

        <Group label="상태 · disabled" caption="그림자까지 함께 흐려지고, 카드와 actions 모두 눌리지 않습니다">
          <ZSCard
            onPress={() => setLastPressed('마감된 모집')}
            disabled
            testID="card-disabled"
            contentStyle={styles.textStack}
            actions={<ZSButton title="신청하기" variant="tonal" disabled onPress={() => setLastPressed('마감 · 신청하기')} />}
          >
            <ZSText variant="subtitle1" emphasized>
              고양이 입양 상담 · 마감
            </ZSText>
            <ZSText variant="body2" color="textSecondary">
              다음 상담은 다음 달 첫째 주에 열려요
            </ZSText>
          </ZSCard>
        </Group>

        <Group label="강조 · backgroundColor · radius" caption="강조 면은 primary + onPrimary 글자 — primaryContainer 면은 쓰지 않는다">
          <ZSCard backgroundColor="primary" radius="2xl" onPress={() => setLastPressed('새 친구 소식')} contentStyle={styles.row} testID="card-highlight">
            <Image source={stickerToImg('chek')} style={styles.avatar} accessibilityIgnoresInvertColors />
            <View style={styles.rowText}>
              <ZSText variant="subtitle1" emphasized color="onPrimary">
                새 친구가 도착했어요
              </ZSText>
              <ZSText variant="body2" color="onPrimary">
                아기 고슴도치 두 마리를 만나 보세요
              </ZSText>
            </View>
          </ZSCard>
        </Group>
      </ZSScreen>
    </>
  );
}

const styles = StyleSheet.create({
  container: { ...PAGE_CONTENT, gap: 28 },
  group: { width: '100%', gap: 6 },
  groupBody: { gap: 12, marginTop: 6 },
  textStack: { gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowText: { flex: 1, gap: 2 },
  avatar: { width: 48, height: 48 },
  flush: { padding: 0 },
  media: { height: MEDIA_HEIGHT },
  mediaBody: { padding: 16, gap: 4 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  cornerRoom: { paddingEnd: 52 },
  settings: { gap: 12 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { height: RULE },
  inlineButton: { alignSelf: 'flex-start', marginStart: -12 },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridStacked: { flexDirection: 'column' },
  gridItem: { flex: 1 },
  stat: { gap: 4, padding: 14 },
});
