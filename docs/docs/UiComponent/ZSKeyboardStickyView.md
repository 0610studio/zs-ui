# ZSKeyboardStickyView

키보드 바로 위에 붙어 따라다니는 전송 바·툴바·CTA를 만듭니다. 화면 아래에 `position: 'absolute'`로 붙고, 키보드가 보이면 키보드 높이만큼(iOS는 하단 safe area를 뺀 만큼) 아래 여백을 둬 키보드 위로 올라옵니다. 입력이 키보드에 가리지 않게만 하려면 [ZSScreen](./ZSScreen#키보드-자동-스크롤)의 자동 스크롤로 충분합니다.

`OverlayProvider` 없이 동작하고, 창 크기를 읽으므로 [LayoutProvider](../Layout/LayoutProvider) 아래에 둡니다.

## 기본 사용법

```tsx
import { ZSButton, ZSKeyboardStickyView, ZSScreen, ZSTextField } from '@0610studio/zs-ui';

function NameScreen() {
  return (
    <ZSScreen
      bottomComponent={
        <ZSKeyboardStickyView>
          <ZSButton title="다음" fullWidth onPress={next} />
        </ZSKeyboardStickyView>
      }
    >
      <ZSTextField label="이름" value={name} onChangeText={setName} />
    </ZSScreen>
  );
}
```

## Props — `ZSKeyboardStickyViewProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `children` | `React.ReactNode` | Required | 키보드 위에 표시할 컴포넌트 |
| `keyboardShowOffset` | `number` | `0` | 키보드 표시 시 추가 하단 여백(pt·dp). Android 10(API 29) 이하는 시스템 `adjustResize`가 올려 주므로 이 값을 쓰지 않습니다 |
| `keyboardHideOffset` | `number` | `0` | 키보드 숨김 시 하단 여백(pt·dp) |
| `showOnlyKeyboardVisible` | `boolean` | `false` | 키보드가 열렸을 때만 표시 |
| `backgroundColor` | `ColorName \| string` | `undefined` | 내용 영역 배경색(키보드 여백 포함) — 색 역할 이름 또는 직접 지정한 색 |
| `maxContentWidth` | `'readable' \| number \| 'none'` | `'none'` | 넓은 창에서 내용 최대 폭. `position: 'absolute'`라 감싼 뷰의 폭 제한을 받지 않으므로, 화면([ZSScreen](./ZSScreen#넓은-창-폭))과 같은 값을 줍니다 |
| `onLayout` | `(event: LayoutChangeEvent) => void` | `undefined` | 루트 뷰 레이아웃 콜백. 높이에 키보드 여백(`paddingBottom`)이 포함됩니다 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 루트 뷰 스타일. 내부 배치(`position: 'absolute'`·`left`·`right`·`bottom`) 위에 합쳐집니다 |
| `...props` | `ViewProps` | `undefined` | React Native `View` 기본 속성 |

`ZSKeyboardStickyViewProps` 타입을 내보냅니다.

## ZSScreen과 함께 쓰기

- [ZSScreen](./ZSScreen) `bottomComponent` 자리에 두면 하단 inset 위에서 끝나, Android 스크린 리더(TalkBack)가 닿을 수 있는 범위에 놓입니다.
- `position: 'absolute'`라 본문을 밀어내지 않습니다. 본문 끝에 CTA 높이만큼 여백을 두고, 포커스 입력이 CTA에 가리지 않도록 `keyboardScrollExtraOffset`에 CTA 높이를 더합니다. CTA 높이는 안쪽 뷰에서 잽니다 — `ZSKeyboardStickyView`의 `onLayout`은 키보드 여백까지 포함합니다.

```tsx
const [ctaHeight, setCtaHeight] = useState(0);

<ZSScreen
  keyboardScrollExtraOffset={ctaHeight + 16}
  bottomComponent={
    <ZSKeyboardStickyView>
      <View onLayout={(event) => setCtaHeight(event.nativeEvent.layout.height)}>
        <ZSButton title="다음" fullWidth onPress={next} />
      </View>
    </ZSKeyboardStickyView>
  }
>
  <ZSTextField label="이름" value={name} onChangeText={setName} />
  <View style={{ height: ctaHeight }} />
</ZSScreen>
```

## 관련 문서

- [ZSScreen](./ZSScreen) — 화면 레이아웃·키보드 자동 스크롤
