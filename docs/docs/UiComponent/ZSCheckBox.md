---
sidebar_position: 8
---

# ZSCheckBox

체크박스 컴포넌트입니다. 라벨과 우측 부가 요소를 함께 배치할 수 있어 약관 동의·설정 목록 행으로 바로 쓸 수 있습니다.

기본적으로 **부모 폭을 꽉 채우고**(`width: '100%'`) 체크 영역과 `moreComponent` 를 양 끝으로 정렬합니다.

## 기본 사용법

```tsx
import { ZSCheckBox } from '@0610studio/zs-ui';
import { useState } from 'react';

function MyForm() {
  const [checked, setChecked] = useState(false);

  return (
    <ZSCheckBox
      value={checked}
      onChange={setChecked}
      label="이용약관에 동의합니다"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `boolean` | Required | 체크 상태 |
| `onChange` | `(value: boolean) => void` | Required | 토글 시 다음 상태를 전달 |
| `size` | `number` | `18` | 체크 박스 한 변의 길이(px). 곡률·테두리 두께가 비율로 함께 조정됩니다 |
| `activeColor` | `string` | 테마 `primary.main` | 체크 상태의 배경·테두리 색 |
| `label` | `string` | `undefined` | 라벨 텍스트 |
| `labelStyle` | `ZSTextProps` | `undefined` | 라벨에 전달할 `ZSText` props (`typo`·`color` 등) |
| `labelComponent` | `React.ReactNode` | `undefined` | 라벨을 완전히 대체하는 커스텀 노드. 지정 시 `label`·`labelStyle` 은 무시됩니다 |
| `moreComponent` | `React.ReactNode` | `undefined` | 행 우측 끝에 배치되는 부가 요소. **press 영역 밖**이라 별도 동작을 붙일 수 있습니다 |
| `disabled` | `boolean` | `false` | 비활성화 (흐리게 표시되고 토글되지 않음) |
| `...props` | `ViewProps` | - | React Native `View`의 모든 기본 속성 |

## 특징

- **행 레이아웃 내장**: 체크박스 + 라벨은 좌측, `moreComponent` 는 우측 끝에 붙습니다
- **press 영역 분리**: 체크박스와 라벨만 토글 대상이고 `moreComponent` 는 제외되므로, "동의" 체크와 "약관 보기" 버튼을 한 행에 둘 수 있습니다
- **비율 스케일링**: `size` 를 바꾸면 곡률과 테두리 두께가 18px 기준 비율로 따라갑니다
- **접근성**: `checkbox` 역할과 `accessibilityState.checked` 를 부여합니다

## 예제

### 라벨 스타일 지정

```tsx
<ZSCheckBox
  value={checked}
  onChange={setChecked}
  label="필수 항목입니다"
  labelStyle={{ typo: 'body.3', color: 'secondary' }}
/>
```

### 약관 동의 행 (moreComponent 활용)

`moreComponent` 는 토글 영역 밖이므로 독립적인 버튼을 놓을 수 있습니다.

```tsx
<ZSCheckBox
  value={agreed}
  onChange={setAgreed}
  label="개인정보 처리방침 동의 (필수)"
  moreComponent={
    <Pressable onPress={openPolicy}>
      <ZSText typo="caption.1" color="secondary">보기</ZSText>
    </Pressable>
  }
/>
```

### 커스텀 라벨

여러 줄이나 강조가 섞인 라벨은 `labelComponent` 로 직접 구성합니다.

```tsx
<ZSCheckBox
  value={checked}
  onChange={setChecked}
  labelComponent={
    <View style={{ flex: 1 }}>
      <ZSText typo="body.2">마케팅 정보 수신</ZSText>
      <ZSText typo="caption.2" color="secondary">언제든 해제할 수 있습니다</ZSText>
    </View>
  }
/>
```

### 크기·색상 변경

```tsx
<ZSCheckBox value={checked} onChange={setChecked} size={24} label="큰 체크박스" />
<ZSCheckBox value={checked} onChange={setChecked} activeColor="#10B981" label="커스텀 색상" />
```

### 전체 동의 패턴

```tsx
const [items, setItems] = useState([false, false, false]);
const allChecked = items.every(Boolean);

<ZSCheckBox
  value={allChecked}
  onChange={(next) => setItems(items.map(() => next))}
  label="전체 동의"
  labelStyle={{ typo: 'subTitle.2' }}
/>
{items.map((checked, index) => (
  <ZSCheckBox
    key={index}
    value={checked}
    onChange={(next) => setItems(items.map((v, i) => (i === index ? next : v)))}
    label={`항목 ${index + 1}`}
  />
))}
```

> 부분 선택(indeterminate) 상태는 지원하지 않습니다. 전체 동의 체크박스는 위처럼 `every` 로 계산하세요.
