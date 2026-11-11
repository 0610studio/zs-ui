# ZSText

테마의 글꼴 역할(`variant`)과 색 역할을 적용한 `Text`입니다.

## 기본 사용법

```tsx
import { ZSText } from '@0610studio/zs-ui';

<ZSText variant="h3" emphasized>오늘의 기록</ZSText>
<ZSText>본문은 기본값(body1, text)으로 충분합니다.</ZSText>
<ZSText variant="caption" color="textSecondary">마지막 수정 3분 전</ZSText>
```

## Props — `ZSTextProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `variant` | `TextVariant` | `'body1'` | [글꼴 역할](../Theme/typography) — iOS 텍스트 스타일(Dynamic Type), Android M3 type scale |
| `emphasized` | `boolean` | `false` | 강조 굵기(HIG emphasized·M3 Expressive emphasized) |
| `color` | `ColorName \| string` | `'text'` | [색 역할](../Theme/colors) 이름 또는 직접 지정한 색. 색 역할은 라이트·다크·고대비에 맞춰 바뀌고, 직접 지정한 색은 그대로입니다 |
| `maxFontSizeMultiplier` | `number` | 앱 상한 | 글자 확대 상한. 주지 않으면 [앱 상한](../Theme/typography#앱-전체-상한--maxfontsizemultiplier)(기본 2배)이고, 레이아웃이 깨지는 좁은 곳에서만 더 낮춥니다 |
| `...props` | `TextProps` | `undefined` | React Native `Text` 속성. `style`은 테마 스타일 위에 합쳐집니다 |

`ZSTextProps` 타입을 내보냅니다.

## 한국어 줄바꿈

iOS는 `lineBreakStrategyIOS="hangul-word"`가 기본이라 띄어쓰기(어절)에서 줄을 바꿉니다. React Native 기본처럼 글자 단위로 바꾸려면 prop으로 덮어씁니다.

```tsx
<ZSText lineBreakStrategyIOS="none">글자 단위로 줄을 바꿉니다</ZSText>
```

Android에는 단어 단위 줄바꿈 옵션이 없어 시스템 기본 그대로입니다. 줄 끝에서 단어가 잘리면 안 되는 짧은 문구는 문장을 줄이거나 `numberOfLines`로 다루세요.

## 관련 문서

- [글꼴 역할](../Theme/typography)
- [색 역할](../Theme/colors)
- [ZSBox](./ZSBox)
