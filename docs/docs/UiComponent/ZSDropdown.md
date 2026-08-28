---
sidebar_position: 5
---

import LocalPlayground from '@site/src/components/LocalPlayground';

# ZSDropdown

선택형 입력 필드입니다. [ZSTextField](./ZSTextField.md) 표면 위에 carret 을 얹어 "눌러서 고르는 입력" 을 표현합니다.

선택 값(`value`)과 선택 UI(`children`)는 **외부가 소유합니다**. 이 컴포넌트는 표면과 트리거만 담당하므로, 실제 선택은 바텀시트·모달 등 원하는 방식으로 구성하면 됩니다.

<LocalPlayground example="ZSDropdown" height={720} />

## 기본 사용법

```tsx
import { ZSDropdown, useOverlay } from '@0610studio/zs-ui';
import { useState } from 'react';

function MyForm() {
  const { showBottomSheet, hideOverlay } = useOverlay();
  const [domain, setDomain] = useState('');

  const openSheet = () => {
    showBottomSheet({
      options: { height: 'auto' },
      component: (
        <SelectList
          onSelect={(value) => {
            setDomain(value);
            hideOverlay('bottomSheet');
          }}
        />
      ),
    });
  };

  return <ZSDropdown label="이메일 도메인" value={domain} onPress={openSheet} />;
}
```

## 두 가지 모드

`onChangeText` 전달 여부로 모드가 갈립니다.

| | 표시 전용 (`onChangeText` 미전달) | 입력형 (`onChangeText` 전달) |
|---|---|---|
| 타이핑 | 불가 (`editable={false}`) | 가능 |
| press 대상 | **필드 전체** | carret 만 |
| 키보드 | 뜨지 않음 | 포커스 시 뜸 |
| 용도 | 목록에서만 고르는 값 | 직접입력 + 선택 병행 |

표시 전용은 필드를 `pointerEvents="none"` 로 감싸 포커스를 차단하므로, 탭하면 키보드 없이 `onPress` 만 호출됩니다.

```tsx
{/* 표시 전용 */}
<ZSDropdown label="지역" value={city} onPress={openSheet} />

{/* 입력형 — carret 을 눌러야 시트가 열린다 */}
<ZSDropdown label="지역" value={city} onChangeText={setCity} onPress={openSheet} />
```

## Props

`ZSTextField` 의 props 를 그대로 받습니다 (`value`·`onChangeText`·`errorMessage` 는 아래 정의가 우선).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPress` | `() => void` | Required | carret 또는 필드를 눌렀을 때 호출 — 보통 바텀시트를 엽니다 |
| `value` | `string` | `''` | 선택된 값 |
| `onChangeText` | `(text: string) => void` | `undefined` | 전달하면 입력형이 됩니다 (위 표 참조) |
| `expanded` | `boolean` | `false` | 열림 상태. `true`면 carret 이 180° 뒤집힙니다 |
| `status` | `'default' \| 'error'` | `'default'` | 입력 상태 |
| `errorMessage` | `string` | `undefined` | `status='error'` 일 때 필드 아래 표시할 메시지 |
| `chevron` | `React.ReactNode` | `SvgChevronDown` | carret 커스텀 요소 |
| `containerStyle` | `StyleProp<ViewStyle>` | `undefined` | 필드 + 에러 메시지를 감싸는 컨테이너 스타일 |
| `children` | `React.ReactNode` | `undefined` | 필드 뒤에 함께 렌더할 요소 (인라인 시트 등) |
| `label` | `string` | `'Placeholder'` | 플로팅 라벨 |
| `boxStyle` | `'outline' \| 'underline' \| 'inbox'` | `'outline'` | 필드 스타일 |
| `disabled` | `boolean` | `false` | 필드·carret 모두 비활성화 |

그 밖의 `ZSTextField` props(`typo`·`borderRadius`·`focusColor`·`textInputProps` 등)는 그대로 전달됩니다.

## 특징

- **carret 자동 배치**: 입력형에서는 값 삭제 버튼과 겹치지 않도록 carret 이 왼쪽으로 물러나고, 그만큼 입력 우측 여백이 확보됩니다
- **에러 메시지 위치 보정**: 에러 메시지를 `ZSDropdown` 이 직접 렌더하므로 carret 의 세로 중앙 정렬이 에러 영역에 밀리지 않습니다
- **열림 상태 표현**: `expanded` 로 carret 회전을 제어합니다 (150ms)
- **접근성**: press 대상에 `button` 역할과 `accessibilityState.expanded` 를 부여합니다

## 예제

### 필수 값 검증

```tsx
<ZSDropdown
  label="지역 (필수)"
  value={city}
  status={city ? 'default' : 'error'}
  errorMessage="지역을 선택해주세요."
  onPress={openSheet}
/>
```

### 열림 상태 표시

시트를 열 때 `expanded` 를 켜고 닫힐 때 되돌리면 carret 이 방향을 따릅니다.

```tsx
const [expanded, setExpanded] = useState(false);

const openSheet = () => {
  setExpanded(true);
  showBottomSheet({
    options: { height: 'auto', onClose: () => setExpanded(false) },
    component: <SelectList onSelect={handleSelect} />,
  });
};

<ZSDropdown label="지역" value={city} expanded={expanded} onPress={openSheet} />
```

> `BottomSheetOptions` 의 `onClose` 는 닫힘 경로(버튼·배경 터치·드래그·뒤로가기)에 상관없이 1회 호출되므로 `expanded` 를 되돌리기에 적합합니다.

### boxStyle 변경

```tsx
<ZSDropdown label="outline" value={city} onPress={openSheet} />
<ZSDropdown label="inbox" boxStyle="inbox" value={city} onPress={openSheet} />
<ZSDropdown label="underline" boxStyle="underline" value={city} onPress={openSheet} />
```

### carret 교체

```tsx
<ZSDropdown
  label="지역"
  value={city}
  chevron={<MyIcon size={20} />}
  onPress={openSheet}
/>
```

### 직접입력 + 선택 병행

이메일 도메인처럼 목록에 없는 값도 입력받아야 할 때 사용합니다.

```tsx
<ZSDropdown
  label="이메일 도메인"
  value={domain}
  onChangeText={setDomain}
  onPress={openSheet}
/>
```
