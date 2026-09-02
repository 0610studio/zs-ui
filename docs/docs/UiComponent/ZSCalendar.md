---
sidebar_position: 22
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSCalendar

Skia 캔버스 하나로 그리는 달력입니다. 좌우 스와이프로 달을 넘기고, 위아래로 끌거나 아래 리스트를 스크롤하면 월간↔주간이 이어서 전환됩니다. 달력의 점(dot)과 아젠다 리스트가 **같은 `events` 배열 하나**에서 파생됩니다.

:::info 준비물
`@shopify/react-native-skia`, `react-native-reanimated`, `react-native-worklets`, `react-native-gesture-handler` 가 peer 의존성으로 필요합니다. 앱 루트에 `GestureHandlerRootView` 와 `ThemeProvider` 가 있어야 합니다.
:::

:::warning 웹 미지원
`ZSCalendar` 는 **iOS · Android 전용**입니다. 그리드·페이저·전환이 전부 Skia 캔버스와 UI 스레드 제스처 위에 올라가 있어 웹에서는 같은 것을 만들 수 없습니다.

웹에서는 아무것도 렌더링하지 않고 개발 모드에서 한 번 경고합니다. `children` 도 함께 빠집니다 — 달력 컨텍스트 없이 남겨두면 그 안의 `useCalendarAgenda()` 가 곧바로 실패하기 때문입니다.

웹 빌드가 깨지지는 않으니, 웹도 함께 지원하는 앱이라면 `Platform.OS` 로 갈라 다른 UI를 두세요. [함께 공개된 유틸](#함께-공개된-유틸)과 `useCalendarAgenda({ index, selectedDate })` 는 Skia 를 건드리지 않으므로 웹에서도 그대로 씁니다.
:::

<LocalPlayground example="ZSCalendar" />

## 기본 사용법

필요한 것은 **일정 배열 하나와 선택 날짜 상태 하나**입니다. 나머지는 기본값으로 동작합니다.

### 일정 배열 만들기

날짜는 전부 `'YYYY-MM-DD'` 로컬 문자열(`DateString`)입니다. timestamp 를 쓰지 않아 타임존·서머타임에서 하루가 밀리지 않습니다.

```tsx
import { todayDateString, type CalendarEvent, type DateString } from '@0610studio/zs-ui';

type Memo = { title: string };

const today = todayDateString();
const EVENTS: CalendarEvent<Memo>[] = [
  { id: '1', date: today, color: '#D7B8FF', data: { title: '산책 30분' } },
  { id: '2', date: today, color: '#A7DBD1', data: { title: '아침 급여 45g' } },
];
```

`color` 는 달력에 찍히는 점 색이고, `data` 는 리스트에서 그릴 페이로드입니다. 둘 다 생략할 수 있습니다.

### 달력 놓기

```tsx
import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ZSCalendar, type DateString } from '@0610studio/zs-ui';

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

여기까지로 헤더·요일 줄·월간 그리드·좌우 스와이프·월↔주 전환이 모두 동작합니다. 선택 날짜를 화면에서 쓸 일이 없다면 `selectedDate` · `onDateChange` 도 빼도 됩니다 — 내부 상태로 오늘부터 시작합니다.

### 선택한 날짜의 목록 붙이기 (선택)

리스트를 `ZSCalendar` 의 **children** 으로 넣으면 `useCalendarAgenda()` 가 인자 없이 선택한 날짜의 일정과 스크롤 바인딩을 받습니다. 날짜별로 데이터를 다시 묶거나 상태를 따로 들고 있을 필요가 없습니다.

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
      renderItem={({ item }) => <ZSText typo="body.3">{item.data?.title}</ZSText>}
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

`{...bindScroll}` 은 세 핸들러(`onScroll` · `onScrollEndDrag` · `onMomentumScrollEnd`)가 한 묶음이라 그대로 펼쳐 넣어야 합니다. 이걸 넣으면 리스트 스크롤이 월간↔주간 전환을 함께 구동합니다 ([규칙](#리스트-스크롤로-접기)). 스크롤 연동이 필요 없으면 `bindScroll` 없이 `items` 만 써도 됩니다.

전체 코드는 `example/app/ZSCalendarExample.tsx` 에 있습니다.

## 자주 쓰는 옵션

기본 구성에서 한두 개만 더 얹고 싶을 때 먼저 보는 것들입니다.

```tsx
<ZSCalendar
  events={events}
  locale="en"              // 요일·월 제목·접근성 라벨을 영어로
  firstDayOfWeek={1}       // 월요일 시작
  enableModeTransition={false} // 월간 고정 (주간 전환 끔)
  maxContentWidth={false}  // 태블릿에서 폭 제한 없이 채우기
  onTitlePress={openDatePicker} // 헤더 연월 탭 → 날짜 선택 시트 등
/>
```

| 하고 싶은 것 | 옵션 |
|---|---|
| 언어 바꾸기 | `locale="en"` · [국제화](#국제화) |
| 주 시작 요일 | `firstDayOfWeek={1}` |
| 색만 조금 손보기 | `calendarTheme` · [토큰 표](#calendartheme) |
| 월간 고정 | `enableModeTransition={false}` |
| 리스트 스크롤 전환만 끄기 | `enableScrollModeTransition={false}` |
| 다른 달 데이터 미리 받기 | `onVisibleRangeChange` · [데이터 미리 받기](#데이터-미리-받기) |
| 헤더를 통째로 교체 | `renderHeader` |
| 앱 글꼴로 날짜 숫자 그리기 | `ThemeProvider` 의 `themeFontAssets` 또는 `fonts` |

커스텀 헤더·바텀시트 날짜 선택기·prefetch·오류 재시도까지 붙인 화면은 `example/app/ZSCalendarAdvancedExample.tsx` 에 있습니다.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `CalendarEvent<T>[]` | `[]` | 달력 점과 리스트가 공유하는 단일 소스 |
| `onVisibleRangeChange` | `(range: DateRange) => void` | `undefined` | 앞뒤 1페이지를 포함한 표시 범위 (prefetch 힌트) |
| `selectedDate` | `DateString \| null` | - | 선택된 날짜 (controlled) |
| `defaultSelectedDate` | `DateString \| null` | 오늘 | 선택된 날짜 초기값 (uncontrolled) |
| `onDateChange` | `(date: DateString) => void` | `undefined` | 날짜를 탭했을 때 |
| `visibleMonth` | `DateString` | - | 표시 중인 달 (controlled). 해당 월 1일로 정규화됩니다 |
| `defaultVisibleMonth` | `DateString` | 이번 달 | 표시 중인 달 초기값 (uncontrolled) |
| `onMonthChange` | `(month: DateString) => void` | `undefined` | 스와이프·헤더 화살표로 달이 바뀌었을 때 |
| `mode` | `'week' \| 'month'` | - | 보기 모드 (controlled) |
| `defaultMode` | `'week' \| 'month'` | `'month'` | 보기 모드 초기값 (uncontrolled) |
| `onModeChange` | `(mode) => void` | `undefined` | 전환이 양 끝(0 또는 1)에 도달했을 때만 호출됩니다 |
| `calendarTheme` | `CalendarThemeOverride` | 테마 팔레트에서 파생 | 색 토큰 부분 오버라이드 |
| `fonts` | `{ regular?, bold? }` | `undefined` | 날짜 숫자 폰트 파일. 미주입 시 `ThemeProvider` 의 `themeFontAssets`(400·700), 그것도 없으면 시스템 폰트 |
| `firstDayOfWeek` | `0 \| 1` | `0` | 0=일요일, 1=월요일 시작 |
| `locale` | `'ko' \| 'en' \| CalendarLocaleStrings` | `'ko'` | 요일·월 제목·접근성 라벨·스크린리더 안내 언어 |
| `labels` | `CalendarLabels` | locale 을 따름 | locale 위에 요일 라벨·월 제목만 덮어쓴다 |
| `maxContentWidth` | `number \| false` | `520` | 태블릿에서 그리드 최대 폭. 넘으면 가운데 정렬 |
| `renderHeader` | `(ctx: CalendarHeaderContext) => ReactNode` | 기본 헤더 | 헤더를 통째로 교체 |
| `onTitlePress` | `() => void` | `undefined` | 제목을 눌렀을 때 (날짜 선택 시트 등) |
| `enableModeTransition` | `boolean` | `true` | `false` 면 월간 고정 — 팬도 리스트 스크롤도 전환하지 않음 |
| `enableScrollModeTransition` | `boolean` | `true` | `false` 면 아젠다 리스트 스크롤이 월간↔주간을 바꾸지 않음. 팬 제스처는 그대로 |
| `announceChanges` | `boolean` | `true` | 월 이동·모드 전환을 스크린리더에 안내 |
| `style` | `StyleProp<ViewStyle>` | `undefined` | 컨테이너 추가 스타일 |
| `children` | `ReactNode` | `undefined` | 달력 아래, Provider 안에 렌더됩니다. `useCalendarAgenda()` 는 여기서만 인자 없이 동작합니다 |
| `testID` | `string` | `undefined` | 컨테이너 testID |

## 특징

- **단일 데이터 소스**: 달력 점과 아젠다 리스트가 같은 `events` 인덱스를 조회하므로 날짜별로 데이터를 다시 묶을 필요가 없습니다
- **로컬 날짜 문자열**: 모든 날짜가 `'YYYY-MM-DD'` 이고 timestamp 를 쓰지 않아 타임존·서머타임에서 하루가 밀리지 않습니다. 형식이 잘못된 이벤트는 조용히 건너뛰고 개발 모드에서 한 번 경고합니다
- **제어·비제어 양쪽 지원**: `selectedDate` · `visibleMonth` · `mode` 는 값을 넘기면 부모가 소유하고, `default*` 만 넘기면 내부 상태로 동작합니다. `mode` 를 밖에서 바꾸면 같은 스프링으로 전환 애니메이션이 재생됩니다
- **전환이 끝난 뒤에만 알림**: `onModeChange` 는 전환이 양 끝(0 또는 1)에 도달했을 때만 호출됩니다 — 중간 값에서 알리면 소비자 상태가 전환 도중에 흔들립니다
- **참조 안정성이 곧 성능**: 렌더마다 `events` 배열을 새로 만들면 내부 캐시가 통째로 버려져 매번 세 페이지를 다시 그립니다. `useMemo` 로 감싸거나 받아온 데이터를 누적하세요
- **컨텍스트 기반 아젠다**: `useCalendarAgenda()` 를 인자 없이 쓰는 곳은 `ZSCalendar` 의 children 안입니다. 밖에서는 `index` 와 `selectedDate` 를 직접 넘깁니다

## CalendarEvent

```ts
type CalendarEvent<T = unknown> = {
  id: string;
  date: DateString; // 'YYYY-MM-DD' (로컬 기준)
  color?: string;   // 점 색. 미지정 시 팔레트 primary
  data?: T;         // 리스트 렌더링에 쓸 페이로드
};
```

같은 날짜에 여러 건이 있으면 색마다 점을 하나씩 찍습니다(같은 색은 하나로 합칩니다). 한 줄이 차면 다음 줄로 감싸 두 줄까지 보이고 그 이상은 자릅니다. 개수 상한은 따로 없고 두 줄에 들어가는 만큼입니다(한 줄 개수는 셀 폭에 따라 5~7개, 태블릿은 더 많이).

## useCalendarAgenda

```ts
function useCalendarAgenda<T>(options?: {
  index?: EventIndex<T>;            // 생략 시 <ZSCalendar> 컨텍스트
  selectedDate?: DateString | null; // 생략 시 <ZSCalendar> 의 선택일
}): {
  items: ReadonlyArray<CalendarEvent<T>>;  // 선택한 하루의 일정, 들어온 순서 그대로
  bindScroll: CalendarScrollBinding;
};
```

`ZSCalendar` 밖에서 쓰려면 `index` 와 `selectedDate` 를 직접 넘깁니다. 이 경우 `bindScroll` 은 아무 일도 하지 않는 빈 바인딩입니다.

```tsx
const { items } = useCalendarAgenda({ index: buildEventIndex(events), selectedDate });
```

훅은 **하루치만** 다룹니다. 여러 날을 이어서 보여주고 싶다면 `eventsInRange` 로 직접 뽑으세요.

```tsx
const items = eventsInRange(index, { startDate: selected, endDate: addMonths(selected, 1) });
```

한때 훅에 이어보기 옵션이 있었지만 뺐습니다. 목록 길이가 보기 모드에 따라 흔들리면(월간 3개월 → 주간 3주) 콘텐츠가 뷰포트보다 짧아지는 순간 스크롤이 0 으로 되감기고, 아래의 접기 규칙과 부딪혔기 때문입니다. 범위를 정하는 책임은 소비자에게 두는 편이 예측 가능합니다.

### 리스트 스크롤로 접기

`bindScroll` 을 넣으면 리스트 스크롤이 월간↔주간 전환을 구동합니다. 규칙은 네 가지입니다.

- 스크롤하는 동안에는 **접히기만** 합니다. 되돌아오는 도중에 달력이 같이 자라면 리스트 뷰포트가 줄면서 손가락 아래에서 서로 밀어내는 것처럼 보입니다.
- 다시 펼쳐지는 것은 리스트가 **맨 위에서 완전히 멈춘 뒤**입니다 (`onScrollEndDrag` · `onMomentumScrollEnd`).
- 리스트에 **접힘 거리만큼 스크롤할 여유가 없으면** 스크롤은 전환을 건드리지 않습니다. 짧은 목록을 당기거나 바운스해도 달력은 그대로입니다.
- 맨 위를 한 번도 벗어난 적이 없으면 아무것도 하지 않습니다 — 위아래 팬으로 접어둔 달력이 리스트를 스치기만 해도 펼쳐지는 것을 막습니다.

## 데이터 미리 받기

`onVisibleRangeChange` 는 **앞뒤 한 페이지까지 포함한** 날짜 범위를 알려줍니다. 이 범위만 받아두면 스와이프가 끝나는 순간 도착한 달에 점이 이미 찍혀 있습니다.

```tsx
<ZSCalendar
  events={events}
  onVisibleRangeChange={({ startDate, endDate }) => prefetch(startDate, endDate)}
/>
```

받아온 데이터는 누적해 두세요. 페이지마다 배열을 새로 만들면 내부 캐시가 버려집니다.

## calendarTheme

기본값은 전부 `useTheme()` 팔레트에서 나오므로 다크 모드를 따로 처리할 필요가 없습니다. 아래 토큰만 부분적으로 덮어씁니다.

| 토큰 | 기본값 |
|------|--------|
| `background` | `'transparent'` |
| `dayText` | `text.base` |
| `outsideDayText` | `text.disabled` |
| `sundayText` / `saturdayText` | `danger[50]` / `information[50]` |
| `selectedText` | `primary.main` |
| `todayText` | `text.base` |
| `weekdayText` | `text.secondary` |
| `dotColor` | `primary.main` |

```tsx
<ZSCalendar calendarTheme={{ selectedText: '#111827', todayText: '#F59E0B' }} />
```

선택한 날짜는 숫자와 점을 함께 감싸는 둥근 카드로 띄웁니다. 카드는 라이트에서 배경색(`background.base`) 그대로이고 아래로 옅은 그림자가 떨어져 떠 보입니다. 다크에서는 그림자가 묻히므로 `grey[20]` 으로 띄웁니다. 오늘은 글자색을 4% 만 깐 옅은 원으로 표시합니다. 카드색과 오늘 원 색은 팔레트에서 나오며 토큰으로 바꾸지 않습니다.

## 국제화

한국어와 영어가 내장돼 있습니다. `locale` 하나로 요일, 월 제목, 헤더 화살표와 날짜 셀의 접근성 라벨, 월 이동·모드 전환 스크린리더 안내가 함께 바뀝니다.

```tsx
<ZSCalendar locale="en" firstDayOfWeek={1} />
// 헤더 "September 2026", 셀 라벨 "September 3, 2 events, selected", 안내 "Week view"
```

기본은 한국어입니다. 기기 언어를 따르려면 앱에서 판별해 넘기세요.

```tsx
import { getLocales } from 'expo-localization';

const locale = getLocales()[0]?.languageCode === 'ko' ? 'ko' : 'en';
<ZSCalendar locale={locale} />
```

요일·월 제목만 바꿀 때는 `labels` 를 씁니다. `labels.weekdays` 는 **항상 일요일부터** 넘기면 됩니다 — `firstDayOfWeek` 에 맞춰 내부에서 회전합니다.

다른 언어는 `CALENDAR_LOCALES` 를 바탕으로 문자열 묶음을 통째로 만들어 넘깁니다.

```tsx
import { CALENDAR_LOCALES, type CalendarLocaleStrings } from '@0610studio/zs-ui';

const ja: CalendarLocaleStrings = {
  ...CALENDAR_LOCALES.en,
  weekdays: ['日', '月', '火', '水', '木', '金', '土'],
  monthTitle: (year, month) => `${year}年${month}月`,
  prevMonth: '前の月',
  nextMonth: '次の月',
  cellLabel: (date, count, selected) => `${Number(date.slice(5, 7))}月${Number(date.slice(8, 10))}日${count ? `、予定${count}件` : ''}${selected ? '、選択中' : ''}`,
  monthView: '月表示',
  weekView: '週表示',
};

<ZSCalendar locale={ja} />
```

달력 밖에서(커스텀 헤더 등) 같은 문자열을 쓰려면 `resolveCalendarLocale(locale, labels)` 로 달력과 동일하게 해석된 묶음을 받습니다.

```tsx
import { resolveCalendarLocale } from '@0610studio/zs-ui';

const strings = resolveCalendarLocale('en');
strings.monthTitle(2026, 9); // 'September 2026'
```

## 커스텀 폰트

Skia 는 React Native 의 `fontFamily` 문자열을 그대로 쓰지 못합니다. 앱이 `ThemeProvider` 에 `themeFontAssets` 를 넘겼으면 날짜 숫자는 자동으로 그 400(보통)·700(선택) 파일을 씁니다 — 달력마다 다시 주입할 필요가 없습니다. 아무것도 없으면 시스템 폰트로 동작하고, 달력만 다른 글꼴을 쓰고 싶을 때 `fonts` 로 덮어씁니다.

```tsx
<ZSCalendar
  fonts={{
    regular: require('./assets/Pretendard-Regular.otf'),
    bold: require('./assets/Pretendard-Bold.otf'),
  }}
/>
```

요일 라벨과 헤더는 Skia 가 아니라 일반 텍스트라 `ThemeProvider` 의 `themeFonts` 를 그대로 따릅니다.

## 커스텀 헤더

`renderHeader` 는 헤더 영역을 통째로 넘겨받습니다. 컨텍스트에 현재 제목·달·모드와 이동 콜백이 들어 있어 기본 헤더와 같은 동작을 유지하면서 모양만 바꿀 수 있습니다.

```tsx
import type { CalendarHeaderContext } from '@0610studio/zs-ui';

const renderHeader = useCallback(
  (ctx: CalendarHeaderContext) => <MyHeader {...ctx} />,
  [],
);

<ZSCalendar renderHeader={renderHeader} onTitlePress={openSheet} />
```

## 동작 원리

props 를 고를 때 판단이 쉬워지는 배경입니다.

**그리드는 캔버스 한 장입니다.** 날짜 셀마다 뷰를 만들면 월간 42칸에 250개 넘는 네이티브 뷰가 페이지마다 생겼다 사라집니다. 여기서는 한 페이지를 `SkPicture` 로 한 번 기록해두고 재생만 합니다. 스와이프 중에는 새로 그리는 일도 JS 스레드 작업도 없고, 스냅이 끝난 뒤에 새로 들어온 이웃 페이지 한 장만 기록합니다. 대신 캔버스는 스크린리더가 읽지 못하므로 그 위에 투명한 버튼을 날짜 수만큼 겹쳐 둡니다.

**앞뒤 페이지를 진짜로 그려둡니다.** 좌우 양옆 페이지를 비워두면 스와이프가 끝난 뒤에야 그리기 시작해 빈 화면이나 스피너가 스칩니다. 3장을 모두 그려두고 캔버스를 통째로 밀기 때문에, 손을 떼는 순간 도착한 페이지가 이미 완성되어 있습니다. 이때 필요한 데이터를 알려주는 게 [`onVisibleRangeChange`](#데이터-미리-받기) 입니다.

**월간↔주간은 `progress` 값 하나가 전부입니다.** 임계값을 넘으면 스냅하는 방식이 아니라, 제스처가 0(주간)↔1(월간) 사이를 직접 끕니다. 어느 지점에서 손을 떼도 가까운 쪽으로 이어지고, 중간에서 멈춰 있는 상태가 남지 않습니다.

**레이아웃 기준은 컨테이너 `onLayout` 폭 하나뿐입니다.** `Dimensions` 를 앱 시작 시 읽어두는 방식이 아니라서 폴더블 펼침·회전·split view 가 별도 처리 없이 반영됩니다.

### 페이지 단위

좌우 스와이프가 넘기는 한 장은 보기 모드를 따라갑니다.

| 모드 | 한 장 | 헤더 제목 |
|------|-------|-----------|
| 월간 | 한 달 | 그 달 |
| 주간 | 한 주 | 그 주의 과반이 속한 달 |

접었다 펴는 동안에는 월 그리드가 있어야 하므로 내부적으로 월 단위로 돌아갔다가, 완전히 접히는 순간 주 단위로 갈아탑니다. 화면에 보이는 주는 그대로이고 페이지 번호만 다시 매겨지므로 전환 지점에서 그림이 움직이지 않습니다.

접혀 있을 때 남는 주는 선택된 날짜가 속한 주입니다. 선택일이 보이는 달 밖이면(달만 넘겨본 경우) 그 달의 첫 주가 남습니다.

주간에서 달 경계에 걸친 주는 **과반이 속한 달**을 기준으로 삼습니다. 그렇게 고른 달의 그리드에는 그 주가 반드시 한 행으로 들어 있어, 다시 펼쳤을 때 같은 주가 제자리에 남습니다.

## 접근성

- 캔버스 위에 날짜마다 투명한 버튼이 겹쳐 있어 스크린리더가 하나씩 읽습니다 (예: `"9월 11일, 일정 2건, 선택됨"`).
- 앞뒤 페이지는 미리 그려두지만 접근성 트리와 터치에서는 빠져 있습니다 — 화면 밖 날짜가 읽히거나 경계 주가 두 번 읽히지 않습니다.
- 셀이 44pt 보다 작아져도 `hitSlop` 으로 최소 44pt 터치를 보장합니다.
- 달을 넘기거나 모드가 바뀌면 음성으로 안내합니다 (`announceChanges`).

## 함께 공개된 유틸

`events` 파이프라인을 직접 구성할 때 캘린더와 같은 규칙을 쓰도록 날짜 엔진과 인덱스 유틸도 함께 내보냅니다. 외부 날짜 라이브러리 없이 정수 연산만 사용합니다.

| 함수 | 설명 |
|------|------|
| `todayDateString()` | 로컬 기준 오늘 |
| `addDays` · `addMonths` · `diffDays` · `monthsBetween` · `weeksBetween` | 서머타임에 안전한 날짜 이동·차이 |
| `startOfMonth` · `endOfMonth` · `startOfWeek` · `endOfWeek` | 경계 계산 |
| `weeksInMonth` · `buildMonthMatrix` | 월 그리드 (4~6주) |
| `monthOfWeek` | 한 주가 속한 달 (과반 기준) |
| `buildEventIndex` · `getEventsOn` · `countEventsOn` · `eventsInRange` | 이벤트 인덱스 O(1) 조회 |
| `visibleRangeOf` | 앞뒤 페이지를 포함한 표시 범위 |
| `isValidDateString` · `compareDate` · `isSameMonth` · `daysInMonth` · `toDateString` | 검증·비교 |
| `CALENDAR_LOCALES` · `resolveCalendarLocale` | 내장 문자열 묶음과 그 해석 |

## 관련 문서

- [ThemeProvider](../Provider/ThemeProvider.md) — `themeFontAssets` 로 날짜 숫자 글꼴 지정
- [BottomSheet](../OverlayComponent/BottomSheet.md) — 헤더 연월 탭에서 여는 날짜 선택 시트
- [ZSText](./ZSText.md) — 아젠다 항목 텍스트
