# BottomSheet

화면을 떠나지 않고 짧은 선택·입력을 받을 때 시스템 시트에 React Native 콘텐츠를 띄웁니다. 입력이 여러 개인 화면 단위 작성·편집은 [formSheet 라우트](./start#화면-단위-모달--formsheet-라우트)를 쓰고, 그 라우트 안의 날짜·항목 고르기는 이 시트로 [라우트 위에](#formsheet--모달-라우트-위) 띄웁니다. 시트 안에서 다른 시트를 [겹쳐](#겹치기--시트-위-시트) 열 수도 있습니다.

| 플랫폼 | 구현 |
|--------|------|
| iOS | SwiftUI sheet(detent) — 시스템 재질(Liquid Glass), 그래버, 넓은 창에서 시스템 폭 |
| Android | Compose Material 3 `ModalBottomSheet` — 배경 `surface2`, 막 `backdrop` 32%, 넓은 창에서 최대 640dp 가운데, predictive back |

콘텐츠 위에서 누른 채 움직이거나 스크롤해도 시트는 늘어나거나 끌려 내려가지 않습니다. 시트를 끄는 곳은 맨 위 손잡이와 그 아래 [헤더 줄](#헤더--header--headerright)입니다.

| 플랫폼 | 콘텐츠 위 끌기 |
|--------|---------------|
| iOS | 콘텐츠를 네이티브 뷰로 감싸 시스템 시트 끌기가 콘텐츠 끌기에 반응하지 않습니다. 그래버 끌기·바깥 탭은 그대로이고 시트 안 스크롤·피커는 움직입니다 |
| Android | 콘텐츠를 네이티브 뷰로 감싸 콘텐츠 위 터치를 콘텐츠가 먼저 가져갑니다. 시트는 손잡이로만 끌어 단계를 옮기거나 닫고, 시트 안 스크롤·피커는 움직입니다. 손잡이는 Material 3와 같은 모양(32×4dp, 연한 회색)이고 탭해도 닫히거나 단계가 바뀌지 않습니다 |

## 기본 사용법

```tsx
import { View } from 'react-native';
import { ZSButton, ZSText, useOverlay } from '@0610studio/zs-ui';

function SortButton() {
  const { showBottomSheet, hideBottomSheet } = useOverlay();

  return (
    <ZSButton
      title="정렬"
      variant="outlined"
      onPress={() =>
        showBottomSheet({
          component: (
            <View style={{ gap: 12, paddingBottom: 24 }}>
              <ZSText variant="subtitle1">정렬 기준</ZSText>
              <ZSButton title="최신순" variant="text" onPress={hideBottomSheet} />
              <ZSButton title="이름순" variant="text" onPress={hideBottomSheet} />
            </View>
          ),
        })
      }
    />
  );
}
```

- `snapPoints`를 주지 않으면 시트 높이가 콘텐츠에 맞춰집니다.
- `showBottomSheet`는 먼저 키보드를 내립니다.
- 시트 안에 `ZSTextField`를 둘 수 있습니다. 시트 안 입력은 [ZSScreen](../UiComponent/ZSScreen#키보드-자동-스크롤)의 키보드 자동 스크롤 대상이 아닙니다.

## Props — `ShowBottomSheetProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `header` | `ReactNode` | `undefined` | 손잡이 아래 헤더 줄. 문자열이면 제목(h4)으로 그립니다. 헤더에서 끌어도 시트가 움직입니다 — [헤더](#헤더--header--headerright) |
| `headerRight` | `ReactNode` | `undefined` | 헤더 줄 오른쪽(버튼 등). 탭은 버튼이 받습니다 |
| `component` | `ReactNode` | Required | 시트에 넣을 콘텐츠 |
| `bottomComponent` | `ReactNode` | `undefined` | 시트 아래에 고정하는 영역(확인 버튼 등) — [하단 고정](#하단-고정--bottomcomponent) |
| `options` | `BottomSheetOptions` | `undefined` | 아래 표 |

### `BottomSheetOptions`

| 옵션 | Type | Default | 설명 |
|------|------|---------|------|
| `dismissible` | `boolean` | `true` | 손잡이 끌기·바깥 탭·뒤로가기로 닫기(시트가 겹쳐 있으면 맨 위 시트만). `false`여도 `hideBottomSheet()`로는 닫힙니다. Android는 `false`면 시트 끌기가 모두 꺼져 단계 사이로도 옮길 수 없습니다 |
| `onClose` | `() => void` | `undefined` | 어떤 경로로 닫히든 1회 호출됩니다. 아래 시트·라우트와 함께 닫혀도 불립니다. 닫힘 전환이 끝난 뒤라 여기서 다른 오버레이를 띄워도 됩니다 |
| `snapPoints` | ``Array<'half' \| 'full' \| `${number}%`>`` | `undefined` | 멈출 높이 — [높이](#높이--snappoints). 생략하면 콘텐츠 높이에 맞춥니다 |
| `contentPadding` | `number` | iOS `20` · Android `16` | 콘텐츠 좌우 여백. `0`이면 가장자리까지 채웁니다 |

`ShowBottomSheetProps`·`BottomSheetOptions` 타입을 내보냅니다.

## 헤더 — `header` · `headerRight`

제목을 `component` 안에 두면 끌기가 막혀 손잡이(48)에서만 시트를 끌 수 있습니다. 제목은 `header` 로 넘기면 손잡이 아래 헤더 줄(최소 높이 48)에 그려지고, 그 줄(오른쪽 버튼 밖)에서 끌면 시트가 늘어나거나 내려갑니다.

```tsx
showBottomSheet({
  options: { snapPoints: ['half', 'full'] },
  header: '정렬 기준',
  headerRight: <ZSButton title="초기화" variant="text" size="small" onPress={reset} />,
  component: <SortOptions />,
});
```

- 문자열 `header` 는 제목(h4, 굵게)으로 그리고 줄 전체를 스크린 리더 머리글로 읽습니다. 노드를 넘기면 그대로 그립니다.
- 헤더 줄 좌우 여백은 `contentPadding` 을 따르고, 헤더는 스크롤되는 본문 밖이라 본문을 스크롤해도 제자리에 있습니다.
- `headerRight` 의 버튼은 탭하면 버튼이 눌리고 시트는 움직이지 않습니다. 버튼 위에서 시작한 끌기로는 버튼이 눌리지 않습니다.

## 높이 — `snapPoints`

```tsx
showBottomSheet({
  options: { snapPoints: ['half', 'full'] },
  component: <FilterForm />,
});
```

`'half'`는 화면 높이 50%, `'full'`은 100%, `'40%'`처럼 비율도 줄 수 있습니다.

| 플랫폼 | 단계 |
|--------|------|
| iOS | 준 값마다 detent가 생기고 첫 번째 값으로 열립니다. 사용자가 끌어 단계를 옮깁니다 |
| Android | M3 시트는 절반·전체 두 단계뿐이라 값은 쓰지 않고 개수만 봅니다. 두 개 이상이면 절반으로 열려 전체까지 끌 수 있고, 하나면 전체 높이로 엽니다. 전체 높이는 상태 표시줄 아래에서 멈춥니다 |

## 하단 고정 — `bottomComponent`

[ZSScreen](../UiComponent/ZSScreen)의 `bottomComponent`처럼 확인 버튼을 시트 아래에 고정합니다.

```tsx
showBottomSheet({
  options: { snapPoints: ['half', 'full'] },
  component: (
    <ScrollView contentContainerStyle={{ gap: 12 }}>
      {regions.map((region) => <RegionRow key={region.id} region={region} />)}
    </ScrollView>
  ),
  bottomComponent: <ZSButton title="선택 완료" fullWidth onPress={hideBottomSheet} />,
});
```

| 시트 높이 | 배치 |
|----------|------|
| `snapPoints` 있음 | 본문이 남은 높이를 채우고 하단 영역은 단계를 옮겨도 시트 바닥에 붙습니다. 넘치는 본문은 잘리므로 긴 본문은 `component` 안에 `ScrollView`·`FlatList`를 둡니다 |
| 생략(콘텐츠 높이) | 본문 바로 아래에 옵니다 |

- 좌우 여백은 `contentPadding`을 따르고, 위·아래에 12씩 띄웁니다.
- 홈 인디케이터·내비게이션 바 위에 놓입니다. 시트 안 입력에 포커스하면 시트가 키보드 위로 올라가 하단 영역도 함께 보입니다.

## 닫기 — `dismissible` · `hideBottomSheet` · `onClose`

```tsx
const { showBottomSheet, hideBottomSheet } = useOverlay();

showBottomSheet({
  options: {
    dismissible: false,
    onClose: () => refetch(),
  },
  component: (
    <View style={{ gap: 16, paddingBottom: 24 }}>
      <ZSText variant="subtitle1">약관에 동의해 주세요</ZSText>
      <ZSButton title="동의" fullWidth onPress={hideBottomSheet} />
    </View>
  ),
});
```

- `dismissible: false`면 끌기·바깥 탭·Android 뒤로가기로 닫히지 않습니다(뒤로가기는 소비만 합니다). 콘텐츠 안 버튼에서 `hideBottomSheet()`를 부르세요.
- `hideBottomSheet()`는 맨 위 시트를 닫습니다. 시트가 열린 채 `showBottomSheet`를 다시 부르면 [위에 겹쳐](#겹치기--시트-위-시트) 뜹니다.
- 닫힘이 끝나면 시트 본문을 언마운트합니다. 본문의 구독·타이머는 effect 정리 함수에서 해제합니다.

## 겹치기 — 시트 위 시트

시트가 열린 채 `showBottomSheet`를 부르면 새 시트가 그 위에 뜨고 아래 시트는 그대로 남습니다. 위 시트를 닫으면 아래 시트로 돌아오며, 아래 시트의 입력·스크롤 위치가 유지됩니다.

```tsx
function SearchSheet() {
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  const [query, setQuery] = useState('');
  const [start, setStart] = useState(todayDateString());

  const pickStart = () =>
    showBottomSheet({
      header: '시작일',
      component: (
        <DatePicker
          value={start}
          onConfirm={(date) => {
            setStart(date);
            hideBottomSheet(); // 날짜 시트만 닫고 검색 시트로 돌아온다
          }}
        />
      ),
    });

  return (
    <View style={{ gap: 12 }}>
      <ZSTextField label="검색어" value={query} onChangeText={setQuery} />
      <ZSButton title={`시작일 ${start}`} variant="outlined" onPress={pickStart} />
    </View>
  );
}

showBottomSheet({ options: { snapPoints: ['full'] }, header: '기록 검색', component: <SearchSheet /> });
```

| 동작 | 결과 |
|------|------|
| `hideBottomSheet()` | 맨 위 시트만 닫습니다 |
| 바깥 탭 · 손잡이 끌기 · Android 뒤로가기 | 맨 위 시트만 닫습니다(그 시트의 `dismissible`을 따릅니다) |
| 아래 시트나 라우트가 먼저 닫힘 | 그 위 시트도 함께 닫히고, 위 시트부터 차례로 `onClose`가 불립니다 |

시트를 바꾸려면 `hideBottomSheet()` 뒤에 `showBottomSheet()`를 부릅니다. 앞 시트가 다 닫힌 뒤 새 시트가 뜹니다.

```tsx
hideBottomSheet();
showBottomSheet({ component: <NextStep /> });
```

## formSheet · 모달 라우트 위

expo-router Stack의 `presentation: 'formSheet'`·`'modal'` 화면 안에서 띄운 시트는 그 라우트 위에 뜹니다. 시트를 닫으면 라우트와 그 입력이 그대로 남습니다. 라우트마다 `OverlayProvider`를 따로 두지 않습니다.

```tsx
// app/_layout.tsx
<Stack.Screen name="search" options={{ presentation: 'formSheet', sheetAllowedDetents: [1], sheetGrabberVisible: true }} />

// app/search.tsx
function Search() {
  const { showBottomSheet, hideBottomSheet } = useOverlay();
  // 시작일을 누르면 날짜 시트가 검색 라우트 위에 뜬다
}
```

시트가 떠 있는 채 `router.back()` 등으로 라우트가 닫히면 시트도 함께 닫히고 `onClose`가 불립니다.

## 접근성

시스템 시트의 모달 포커스와 스크린 리더(VoiceOver·TalkBack) 동작을 따릅니다.

## 관련 문서

- [오버레이 개요](./start) — formSheet·모달 라우트
- [Alert](./Alert)
- [ZSMenu](../UiComponent/ZSMenu) — 동작 목록은 메뉴로
