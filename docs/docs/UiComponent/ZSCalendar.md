# ZSCalendar

Skia 캔버스로 그리는 달력입니다. 좌우 스와이프로 달을 넘기고, 위아래로 끌거나 아래 리스트를 스크롤하면 월간↔주간이 이어서 전환됩니다. 달력의 점과 아젠다 리스트가 같은 `events` 배열 하나에서 나옵니다.

제스처를 쓰므로 `GestureHandlerRootView` 아래에 둡니다.

오늘 표시는 자정·앱 복귀 시 갱신하며 선택일과 보이는 달은 유지합니다.

## 기본 사용법

날짜는 전부 `'YYYY-MM-DD'` 로컬 문자열(`DateString`)입니다. timestamp를 쓰지 않아 타임존·서머타임에서 하루가 밀리지 않습니다. 형식이 잘못된 이벤트는 건너뛰고 개발 모드에서 경고합니다.

```tsx
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ZSCalendar, todayDateString, type CalendarEvent, type DateString } from '@0610studio/zs-ui';

type Memo = { title: string };

const today = todayDateString();
const EVENTS: CalendarEvent<Memo>[] = [
  { id: '1', date: today, color: '#D7B8FF', data: { title: '산책 30분' } },
  { id: '2', date: today, color: '#A7DBD1', data: { title: '아침 급여 45g' } },
];

export default function Screen() {
  const [selectedDate, setSelectedDate] = useState<DateString>(today);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ZSCalendar
        style={{ flex: 1 }}
        events={EVENTS}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
    </GestureHandlerRootView>
  );
}
```

`color`는 점 색, `data`는 리스트에서 그릴 페이로드이고 둘 다 생략할 수 있습니다. 선택 날짜를 화면에서 쓰지 않으면 `selectedDate`·`onDateChange`를 빼도 됩니다 — 내부 상태로 오늘부터 시작합니다.

### 선택한 날짜의 목록 붙이기

리스트를 `ZSCalendar`의 `children`으로 넣으면 `useCalendarAgenda()`가 인자 없이 선택한 날짜의 일정과 스크롤 바인딩을 받습니다.

```tsx
import { FlatList } from 'react-native';
import { ZSCalendar, ZSText, useCalendarAgenda } from '@0610studio/zs-ui';

function MemoList() {
  const { items, bindScroll } = useCalendarAgenda<Memo>();

  return (
    <FlatList
      {...bindScroll}
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ZSText variant="body2">{item.data?.title}</ZSText>}
    />
  );
}

<ZSCalendar<Memo>
  style={{ flex: 1 }}
  events={EVENTS}
  selectedDate={selectedDate}
  onDateChange={setSelectedDate}
>
  <MemoList />
</ZSCalendar>
```

`{...bindScroll}`은 세 핸들러(`onScroll`·`onScrollEndDrag`·`onMomentumScrollEnd`)와 `scrollEventThrottle` 묶음이라 그대로 펼쳐 넣습니다. 넣으면 리스트 스크롤이 [월간↔주간 전환](#월간주간-전환)을 함께 구동합니다. 스크롤 연동이 필요 없으면 `items`만 씁니다.

## Props — `ZSCalendarProps`

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| `events` | `readonly CalendarEvent<T>[]` | `undefined` | 달력 점과 리스트가 공유하는 단일 소스 — [`CalendarEvent`](#calendarevent). 생략하면 일정이 없는 달력입니다 |
| `eventDisplay` | `'dot' \| 'label'` | `'dot'` | 날짜 칸의 이벤트 표시. `'label'`은 색 배경 칩과 한 줄 문구를 쌓습니다 — [날짜 칸에 기록 표시](#날짜-칸에-기록-표시하기-label) |
| `onVisibleRangeChange` | `(range: DateRange) => void` | `undefined` | 앞뒤 한 페이지를 포함한 표시 범위 — [데이터 미리 받기](#데이터-미리-받기) |
| `selectedDate` | `DateString \| null` | `undefined` | 선택된 날짜 — 제어 |
| `defaultSelectedDate` | `DateString \| null` | 오늘 | 선택된 날짜 — 비제어 초기값. `null`이어도 오늘로 시작합니다. 선택 없이 시작하려면 제어 `selectedDate={null}`을 씁니다 |
| `onDateChange` | `(date: DateString) => void` | `undefined` | 날짜를 탭했을 때 |
| `visibleMonth` | `DateString` | `undefined` | 표시 중인 달 — 제어. 그 달 1일로 맞춥니다 |
| `defaultVisibleMonth` | `DateString` | 이번 달 | 표시 중인 달 — 비제어 초기값 |
| `onMonthChange` | `(month: DateString) => void` | `undefined` | 스와이프·헤더 화살표로 달이 바뀌었을 때 |
| `mode` | `CalendarMode`(`'week' \| 'month'`) | `undefined` | 보기 모드 — 제어. 바꾸면 전환 애니메이션이 재생됩니다 |
| `defaultMode` | `CalendarMode` | `'month'` | 보기 모드 — 비제어 초기값 |
| `onModeChange` | `(mode: CalendarMode) => void` | `undefined` | 전환이 끝까지(완전히 펼치거나 접힘) 갔을 때만 호출됩니다 |
| `theme` | `CalendarThemeOverride` | 색 역할에서 파생 | 색 토큰 일부 덮어쓰기 — [theme](#theme) |
| `fonts` | `CalendarFontSources`(`{ regular?, bold? }`) | `undefined` | 날짜 숫자 글꼴 파일 — [커스텀 폰트](#커스텀-폰트) |
| `firstDayOfWeek` | `0 \| 1` | `0` | 0=일요일, 1=월요일 시작 |
| `locale` | `'ko' \| 'en' \| CalendarLocaleStrings` | `'ko'` | 요일·월 제목·접근성 라벨·스크린 리더 안내 언어 — [국제화](#국제화) |
| `maxContentWidth` | `number \| false` | `false` | 넓은 창에서 그리드와 기본 헤더의 최대 폭. 기본은 부모 폭을 채우고, 숫자를 주면 넘을 때 둘 다 같은 열로 가운데 정렬합니다(`renderHeader` 헤더는 전폭) |
| `renderHeader` | `(ctx: CalendarHeaderContext) => ReactNode` | 기본 헤더 | 헤더를 통째로 교체 — [커스텀 헤더](#커스텀-헤더) |
| `onTitlePress` | `() => void` | `undefined` | 헤더 연월을 눌렀을 때(날짜 선택 시트 등) |
| `enableModeTransition` | `boolean` | `true` | `false`면 현재 `mode`에 고정 — 팬도 리스트 스크롤도 전환하지 않습니다 |
| `enableScrollModeTransition` | `boolean` | `true` | `false`면 아젠다 리스트 스크롤이 전환하지 않습니다. 팬 제스처는 그대로 |
| `announceChanges` | `boolean` | `true` | 월 이동·모드 전환을 스크린 리더로 안내 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `children` | `ReactNode` | `undefined` | 달력 아래에 그립니다. `useCalendarAgenda()`는 여기서만 인자 없이 동작합니다 |
| `testID` | `string` | `undefined` | 컨테이너 testID |

`events`는 `useMemo`로 감싸거나 받아온 데이터를 누적해 같은 참조를 유지하세요. 렌더마다 새 배열이면 미리 그려 둔 페이지를 매번 다시 그립니다.

`ZSCalendarProps`·`CalendarHeaderContext`·`CalendarEvent`·`CalendarEventDisplay`·`CalendarMode`·`CalendarTheme`·`CalendarThemeOverride`·`CalendarFontSources`·`CalendarLocaleCode`·`CalendarLocaleStrings`·`CalendarAgenda`·`CalendarAgendaOptions`·`CalendarScrollBinding`·`DateRange`·`DateString`·`EventIndex`·`FirstDayOfWeek` 타입을 내보냅니다.

### `CalendarEvent`

```tsx
type CalendarEvent<T = unknown> = {
  id: string;
  date: DateString;
  color?: string;
  label?: string;
  textColor?: string;
  data?: T;
};
```

같은 날짜에 여러 건이면 색마다 점을 하나씩 찍고(같은 색은 하나로 합칩니다), 한 줄이 차면 두 줄까지 감싸고 그 이상은 자릅니다.

### `useCalendarAgenda`

```tsx
function useCalendarAgenda<T>(options?: {
  index?: EventIndex<T>;
  selectedDate?: DateString | null;
}): {
  items: ReadonlyArray<CalendarEvent<T>>;
  bindScroll: CalendarScrollBinding;
};
```

`ZSCalendar` 밖에서는 `index`와 `selectedDate`를 직접 넘깁니다. 이때 `bindScroll`은 아무 일도 하지 않습니다.

```tsx
const { items } = useCalendarAgenda({ index: buildEventIndex(events), selectedDate });
```

훅은 하루치만 다룹니다. 여러 날을 이어서 보여 주려면 `eventsInRange`로 직접 뽑습니다.

```tsx
const items = eventsInRange(index, { startDate: selected, endDate: addMonths(selected, 1) });
```

## 월간↔주간 전환

위아래로 끌거나 `bindScroll`을 넣은 리스트를 스크롤하면 전환됩니다. 어느 지점에서 손을 떼도 가까운 쪽으로 마저 전환됩니다.

- 리스트를 스크롤하는 동안에는 접히기만 하고, 다시 펼쳐지는 것은 리스트가 맨 위에서 완전히 멈춘 뒤입니다.
- 접힘 거리만큼 스크롤할 여유가 없는 짧은 목록은 전환하지 않습니다. 맨 위를 벗어난 적 없는 스크롤도 전환하지 않습니다.
- 주간에서는 좌우 스와이프가 한 주씩 넘기고, 헤더 제목은 그 주의 과반이 속한 달입니다. 접힌 직후의 주는 떠나온 달을 그대로 씁니다.
- 접혔을 때 남는 주는 선택일이 보고 있는 달에 있으면 그 주, 아니면 그 달의 첫 주입니다. 선택은 그대로 유지됩니다.

## 날짜 칸에 기록 표시하기 (label)

세로가 넉넉한 화면(폴더블 펼침·iPad에서 달력만 한 pane을 쓸 때)은 점 대신 기록을 칸 안에 바로 보여 줄 수 있습니다. `eventDisplay="label"`이면 이벤트마다 `color` 배경 칩에 `label`을 한 줄로 쌓고, 넘치는 문구는 말줄임(…), 칸에 다 못 넣는 건수는 마지막 줄에 `+n`으로 표시합니다.

```tsx
const events = useMemo(
  () => diaries.map((d) => ({ id: d.id, date: d.date, color: d.categoryColor, label: d.memo.split('\n')[0] || d.categoryName, data: d })),
  [diaries],
);

<ZSCalendar
  style={{ flex: 1 }}
  events={events}
  eventDisplay="label"
  enableModeTransition={false}
/>
```

- 행 높이는 헤더 아래 남는 높이를 보이는 달의 주 수로 나눕니다. 칩 두 줄이 들어가는 높이보다 낮아지지 않고, 행당 180을 넘지 않습니다.
- `mode="week"` + `enableModeTransition={false}`면 한 주가 높이를 다 채웁니다 — 테이블탑 위 pane처럼 낮은 영역에서 씁니다. 높이 판단은 [usePaneLayout](../Layout/ZSPaneLayout#usepanelayout)의 `heightClass`로 합니다.
- 칩 글자는 한글·이모지가 시스템 폰트로 대체되고, 서체는 날짜 숫자와 같습니다([커스텀 폰트](#커스텀-폰트)).
- 선택 카드와 오늘 원은 날짜 숫자만 감쌉니다. 접근성 라벨은 `'dot'`과 같습니다.
- 칩 글자는 칩 색과 대비가 큰 쪽(`text`·`textInverse`)이고, 둘 다 4.5:1이 안 되면 검정·흰색입니다.
- `children`(아래 아젠다)과 함께 쓰면 그리드와 `children`이 남는 높이를 나눠 갖습니다. 아젠다는 옆 pane에 두는 쪽을 권합니다 — 아래 2-pane 레시피.

## 넓은 창: 캘린더 | 아젠다 2-pane

[ZSPaneLayout](../Layout/ZSPaneLayout)의 한 pane에 달력, 다른 pane에 아젠다를 둡니다. 선택일과 이벤트 인덱스는 부모 화면에서 관리합니다. 달력 밖의 아젠다는 `useCalendarAgenda({ index, selectedDate })`로 조회합니다. 1단에서는 달력 `children`에 목록을 넣어 스크롤 전환을 연결합니다.

## 데이터 미리 받기

`onVisibleRangeChange`는 앞뒤 한 페이지까지 포함한 날짜 범위를 알려 줍니다. 이 범위만 받아 두면 스와이프가 끝나는 순간 도착한 달에 점이 이미 찍혀 있습니다. 받아온 데이터는 누적해 두세요.

```tsx
<ZSCalendar
  events={events}
  onVisibleRangeChange={({ startDate, endDate }) => prefetch(startDate, endDate)}
/>
```

## theme

기본값은 전부 `useTheme()` 색 역할에서 나오므로 다크 모드·고대비를 따로 처리할 필요가 없습니다. 아래 토큰만 일부 덮어씁니다.

| 토큰 | 기본값 |
|------|--------|
| `background` | `'transparent'` |
| `dayText` | `text` |
| `outsideDayText` | `text` 38%(M3 비활성 콘텐츠) |
| `sundayText` / `saturdayText` | `error` / `dayText`(본문색) |
| `selectedText` | `primaryMark`(주색 표시색) |
| `todayText` | `text` |
| `weekdayText` | `textSecondary` |
| `dotColor` | `textSecondary` — `color` 없는 이벤트의 점·칩 |

```tsx
<ZSCalendar theme={{ selectedText: '#111827', todayText: '#F59E0B' }} />
```

선택일은 카드와 굵은 숫자로, 오늘은 회색 원과 굵은 숫자로 표시합니다. 선택일이 오늘이면 선택 카드만 표시합니다. 카드·원 배경은 테마에서 정하며 `theme`으로 바꾸지 않습니다.

## 국제화

한국어(기본)와 영어가 내장돼 있습니다. `locale` 하나로 요일, 월 제목, 헤더 화살표와 날짜 칸의 접근성 라벨, 월 이동·모드 전환 스크린 리더 안내가 함께 바뀝니다.

```tsx
<ZSCalendar locale="en" firstDayOfWeek={1} />
```

기기 언어를 따르려면 앱에서 판별해(`expo-localization` 등) 넘깁니다.

일부만 바꿀 때는 내장 묶음을 펼치고 필요한 것만 덮어써 넘깁니다. `weekdays`는 항상 일요일부터 넘깁니다 — `firstDayOfWeek`에 맞춰 내부에서 회전합니다.

```tsx
import { CALENDAR_LOCALES } from '@0610studio/zs-ui';

const locale = { ...CALENDAR_LOCALES.en, weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] };
<ZSCalendar locale={locale} />
```

다른 언어는 `CalendarLocaleStrings` 전체를 만들어 넘깁니다.

## 커스텀 폰트

Skia는 React Native `fontFamily` 이름을 쓰지 못하고 글꼴 파일이 필요합니다. 날짜 숫자는 달력의 `fonts`, 없으면 [ThemeProvider](../Provider/ThemeProvider) `fontAssets`에서 400(보통)·700(선택)에 가장 가까운 파일, 그것도 없으면 시스템 폰트를 씁니다. 앱이 `fontAssets`를 넘겼다면 달력마다 다시 줄 필요가 없고, 달력만 다른 글꼴을 쓸 때 `fonts`를 줍니다.

```tsx
<ZSCalendar
  fonts={{
    regular: require('./assets/Pretendard-Regular.otf'),
    bold: require('./assets/Pretendard-Bold.otf'),
  }}
/>
```

요일 머리글과 헤더는 일반 텍스트라 `ThemeProvider` `fonts`를 따릅니다.

## 커스텀 헤더

`renderHeader`는 헤더 영역을 통째로 넘겨받습니다. `CalendarHeaderContext`에 보이는 달(`visibleMonth`)과 이동 콜백(`onPrev`·`onNext`·`onTitlePress`)이 있어 기본 헤더와 같은 동작을 유지하면서 모양만 바꿀 수 있습니다. 제목 문구는 `CALENDAR_LOCALES[locale].monthTitle(year, month)`로 만듭니다.

커스텀 헤더는 달력 전폭을 받습니다. `maxContentWidth`로 그리드 열을 좁혔다면 헤더에 `width: '100%'`·`maxWidth`·`alignSelf: 'center'`를 직접 줍니다.

```tsx
import type { CalendarHeaderContext } from '@0610studio/zs-ui';

const renderHeader = useCallback(
  (ctx: CalendarHeaderContext) => <MyHeader {...ctx} />,
  [],
);

<ZSCalendar renderHeader={renderHeader} onTitlePress={openSheet} />
```

## 접근성

- 캔버스 위에 날짜마다 투명한 버튼이 겹쳐 있어 스크린 리더가 하나씩 읽습니다(예: `"9월 11일, 일정 2건, 선택됨"`). 화면 밖 앞뒤 페이지는 읽히지 않습니다.
- 칸이 작아도 터치 영역은 44pt 이상입니다. 칸끼리 빈틈없이 붙어 있어 이보다 넓히지 않습니다(넓히면 이웃 칸과 겹치기만 하고 격자 스와이프를 방해합니다).
- 기본 헤더 버튼의 터치 영역은 iOS 44pt·Android 48dp입니다.
- `label` 칩 글자는 `textColor`를 주지 않으면 칩 배경과 4.5:1 이상입니다.
- 달을 넘기거나 모드가 바뀌면 음성으로 안내합니다(`announceChanges`).
- 시스템 글자 크기(iOS Dynamic Type·Android 글자 크기)를 앱 상한([`maxFontSizeMultiplier`](../Theme/typography#앱-전체-상한--maxfontsizemultiplier)) 안에서 따릅니다. 칸 폭이 7등분으로 고정이라 날짜 숫자는 0.85~1.5배, 칩 글자는 0.85~1.3배, 요일 머리글은 1.4배까지 바뀌고, 행 높이는 숫자·오늘 원·점이 들어가게 늘어납니다.

## 함께 공개된 유틸

`events` 파이프라인을 직접 짤 때 달력과 같은 규칙을 쓰도록 날짜·인덱스 유틸을 함께 내보냅니다. 외부 날짜 라이브러리 없이 정수 연산만 씁니다.

| 함수 | 설명 |
|------|------|
| `todayDateString()` | 로컬 기준 오늘 |
| `addDays` · `addMonths` | 서머타임에 안전한 날짜 이동. `addMonths`는 없는 일자를 말일로 맞춥니다(1/31 + 1개월 = 2/28) |
| `startOfMonth` | 그 달 1일 — `visibleMonth`를 맞추는 규칙과 같습니다 |
| `isValidDateString` · `compareDate` | 검증·비교 |
| `buildEventIndex` · `getEventsOn` · `eventsInRange` | 이벤트 인덱스 조회·구간 평탄화 |
| `CALENDAR_LOCALES` | 내장 문자열 묶음 — 커스텀 `locale`의 바탕 |

## 관련 문서

- [ThemeProvider](../Provider/ThemeProvider) — `fontAssets`로 날짜 숫자 글꼴 지정
- [BottomSheet](../OverlayComponent/BottomSheet) — 헤더 연월 탭에서 여는 날짜 선택 시트
- [ZSPaneLayout](../Layout/ZSPaneLayout) — 캘린더 | 아젠다 2-pane
