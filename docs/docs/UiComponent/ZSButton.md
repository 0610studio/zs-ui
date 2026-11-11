# ZSButton

라벨이 있는 버튼입니다. 색은 버튼 색 타입(`variant`)과 팔레트 색(`color`)으로 고릅니다. 크기·색·모양(캡슐)은 두 플랫폼이 같고, 누름 반응만 플랫폼 관례를 따릅니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS | 캡슐 — 누르면 0.97배로 줄어든다 |
| Android | 캡슐 — 누르는 동안 버튼 모양 안에 ripple |

## 기본 사용법

```tsx
import { ZSButton } from '@0610studio/zs-ui';

<ZSButton title="저장" onPress={save} />
<ZSButton title="취소" variant="tonal" onPress={cancel} />
```

## Props — `ZSButtonProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `title` | `string` | Required | 라벨 |
| `onPress` | `() => void` | `undefined` | 누를 때. [ZSMenu](./ZSMenu) 트리거처럼 누름을 메뉴가 받으면 생략합니다 |
| `onLongPress` | `() => void` | `undefined` | 길게 누를 때 — 예: `ZSMenu openOnLongPress` 트리거 |
| `variant` | `ZSButtonVariant` | `'filled'` | `'filled' \| 'tonal' \| 'outlined' \| 'text'` — 강조 순서 |
| `color` | `PaletteColor` | `'primary'` | `'primary' \| 'secondary' \| 'tertiary' \| 'error' \| 'success' \| 'warning' \| 'info' \| 'neutral'`(회색) |
| `size` | `ZSButtonSize` | `'medium'` | `'small' \| 'medium' \| 'large'` |
| `icon` | `ImageSourcePropType \| ReactNode` | `undefined` | 라벨 앞 아이콘. 이미지 소스는 글자색으로 칠합니다 |
| `fullWidth` | `boolean` | `false` | 폭을 부모에 맞춥니다. `false`면 내용 폭(`alignSelf: 'flex-start'`) — [가로 행 안에 둘 때](#가로-행-안에-둘-때) |
| `loading` | `boolean` | `false` | 라벨 자리에 진행 표시를 겹쳐 두고 누를 수 없습니다. 버튼 폭·색은 그대로입니다(흐려지지 않습니다) — [상태](#상태) |
| `preventDoublePress` | `boolean` | `false` | 2초간 중복 실행 방지(결제·제출) |
| `disabled` | `boolean` | `false` | M3 비활성 색 — 컨테이너는 `text` 12%(`outlined`는 테두리만), 글자 `text` 38% |
| `maxFontSizeMultiplier` | `number` | 앱 상한 | 라벨 글자 확대 상한. 주지 않으면 [앱 상한](../Theme/typography#앱-전체-상한--maxfontsizemultiplier)(기본 2배)이고, 높이가 고정된 바(iOS 탭 바 액세서리·툴바)처럼 큰 글자에서 잘리는 곳에서만 낮춥니다 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | |
| `testID` | `string` | `undefined` | |
| `accessibilityLabel` | `string` | `title` | |

`ZSButtonProps`·`ZSButtonVariant`·`ZSButtonSize` 타입을 내보냅니다.

## variant

| variant | 컨테이너 | 글자·아이콘 |
|---------|---------|------|
| `filled` | `color` main (`primary`) | on (`onPrimary`) — 강조 굵기 |
| `tonal` | `color` container — 그 색의 파스텔 면(`primary`면 `primaryContainer`, `neutral`이면 회색) | `color` onContainer |
| `outlined` | 없음 + 회색 외곽선(`border`를 `text` 쪽으로 12% 옮긴 색) | `color="primary"`면 `text`, 그 밖은 `color` main |
| `text` | 없음 | `color="primary"`면 `text`, 그 밖은 `color` main |

`primary`는 채움 면에만 씁니다. 밝은 시드의 `primary`는 흰 바탕 위 글자로 읽히지 않아 `outlined`·`text`의 `primary` 버튼은 `text` 글자이고, `tonal`은 옅은 파스텔 면(`primaryContainer`) 위 `onPrimaryContainer` 글자입니다. 회색 버튼은 `color="neutral"`입니다([색 규칙](../Theme/colors#색-규칙--채움과-얇은-표시)). `error` 같은 상태 색은 글자로도 4.5:1을 넘어 그 색을 그대로 씁니다.

```tsx
<ZSButton title="삭제" color="error" onPress={remove} />
<ZSButton title="보관" variant="tonal" color="neutral" onPress={archive} />
<ZSButton title="초대" variant="tonal" onPress={invite} />
<ZSButton title="더 보기" variant="outlined" onPress={more} />
<ZSButton title="건너뛰기" variant="text" onPress={skip} />
```

## 크기와 모양

두 플랫폼 같은 값입니다(pt·dp).

| size | 높이 | 라벨 | 아이콘 | 좌우 여백 |
|------|------|------|-------|----------|
| `small` | 36 | `subtitle2` | 18 | 16 |
| `medium` | 48 | `subtitle2` | 20 | 20 |
| `large` | 56 | `subtitle1` | 22 | 24 |

`filled` 라벨은 강조 굵기입니다. `text` variant는 좌우 여백이 8 좁습니다(최소 12).

- 높이는 최소값입니다. 라벨은 한 줄이고, 글자 크기 설정이 커지면 버튼도 함께 커집니다.
- 작은 버튼도 터치 영역은 44pt·48dp를 채웁니다.

```tsx
<ZSButton title="공유" size="large" icon={require('./share.png')} onPress={share} />
```

### 가로 행 안에 둘 때

내용 폭 버튼은 `alignSelf: 'flex-start'`라 부모의 `alignItems: 'center'`가 듣지 않고 행 위쪽에 붙습니다. 세로 가운데에 두려면 `style`로 덮습니다.

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
  <ZSText style={{ flex: 1 }}>새 버전이 있습니다</ZSText>
  <ZSButton title="업데이트" size="small" variant="tonal" style={{ alignSelf: 'center' }} onPress={update} />
</View>
```

## 상태

`loading`이면 버튼 폭을 유지하며 라벨 자리에 진행 표시를 겹칩니다. `disabled`와 `loading` 모두 누름을 막습니다.

## 접근성

역할은 `button`, 이름은 `accessibilityLabel`(기본 `title`)입니다. `loading`이면 `busy`·`disabled`, `disabled`면 `disabled` 상태를 알립니다.

## 관련 문서

- [ZSPressable](./ZSPressable) — 라벨 없는 누름 영역
- [ZSMenu](./ZSMenu) — 버튼을 눌러 메뉴 열기
- [색 역할](../Theme/colors) — `getPaletteColors`
