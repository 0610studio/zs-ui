# useDisplayFeatures · useDevicePosture

`useDisplayFeatures`는 화면의 접힘선(폴더블 힌지)과 카메라 같은 가림 영역을, `useDevicePosture`는 기기 자세(책·테이블탑 등)와 힌지 각도를 반환합니다. 값이 오는 기기·빌드 조건은 [LayoutProvider 요구 사항](./LayoutProvider#요구-사항)을 보세요.

## useDisplayFeatures

```tsx
import { useDisplayFeatures } from '@0610studio/zs-ui';

function Screen() {
  const { fold } = useDisplayFeatures();
  const splitAt = fold?.active && fold.orientation === 'vertical' ? fold.rect.x : null;
}
```

### 반환값 — `DisplayFeatures`

| 필드 | Type | 설명 |
|------|------|------|
| `fold` | `DisplayFeature \| null` | 접힘선·힌지. 접힘선이 없는 창(일반 기기·접힌 커버 화면)은 `null` |
| `occlusions` | `DisplayFeature[]` | 카메라 등 가림 영역. iOS(아이폰 듀오)만 보냅니다 |

### `DisplayFeature`

| 필드 | Type | 설명 |
|------|------|------|
| `type` | `'fold' \| 'occlusion'` | 접힘선 또는 가림 영역 |
| `rect` | `{ x, y, width, height }` | LayoutProvider 루트 좌표(pt·dp). iOS는 터치 대상이 피할 여백을 포함해 평평할 때도 두께가 있고, Android의 평평한 접힘선은 두께가 0일 수 있습니다 |
| `orientation` | `'vertical' \| 'horizontal'` | `vertical`은 좌우로 나눔(책), `horizontal`은 위아래(테이블탑) |
| `active` | `boolean` | 지금 화면을 실제로 가르는지 — iOS reserved region `isActive`(일부만 접음), Android `isSeparating`(반쯤 접힘·힌지가 가림) |
| `state` | `DisplayFeatureState` | `'flat' \| 'halfOpened' \| 'unknown'`. 가림 영역은 `'unknown'` |

`DisplayFeature`·`DisplayFeatures`·`DisplayFeatureState` 타입을 내보냅니다.

레이아웃 판단 기준은 `active`입니다. 화면을 실제로 가를 때만 접힘선을 경계로 쓰고, 평평하게 펼친 화면은 일반 넓은 창 규칙을 따릅니다. zs-ui의 접힘선 대응은 [ZSPaneLayout 분할 규칙](./ZSPaneLayout#분할-규칙)과 [ZSTabNavigator](../Navigation/ZSTabNavigator#바--레일--navigationmode-auto)(Android 테이블탑이면 하단 바)에 있고, 시트·메뉴는 시스템이 접힘선을 피해 배치합니다.

## useDevicePosture

```tsx
import { useDevicePosture } from '@0610studio/zs-ui';

function Player() {
  const { posture } = useDevicePosture();
  return <Video showControlsHint={posture === 'tabletop'} />;
}
```

레이아웃은 `useWindowLayout`·`useDisplayFeatures`로 판단하고, 자세 값은 애니메이션·인터랙션 효과에 사용합니다.

### 반환값 — `DevicePosture`

| 필드 | Type | 설명 |
|------|------|------|
| `posture` | `DevicePostureName` | `'closed' \| 'book' \| 'tabletop' \| 'flat' \| 'unknown'` |
| `hingeAngle` | `number \| null` | 힌지 각도(도, 0 = 닫힘 · 180 = 평평함). 힌지 값이 없으면 `null`. 갱신 빈도·정밀도는 시스템이 정합니다 |

`DevicePosture`·`DevicePostureName` 타입을 내보냅니다.

| 자세 | iOS(아이폰 듀오 힌지 상태) | Android(Jetpack WindowManager) |
|------|--------------------------|-------------------------------|
| `closed` | 닫힘 | 없음 — 공개 SDK로 접힌 상태를 알 수 없어 커버 화면은 `unknown` |
| `flat` | 완전히 펼침 | 평평함 |
| `book` · `tabletop` | 반쯤 열림 — 접힘선 방향이 세로면 `book`, 가로면 `tabletop` | 반쯤 접힘 — 접힘선 방향이 세로면 `book`, 가로면 `tabletop` |
| `unknown` | 반쯤 열렸는데 접힘선 방향을 알 수 없을 때 | 접힌 커버 화면 등 |

`unknown`이어도 힌지 값이 있으면 `hingeAngle`은 옵니다. zs-ui는 각도 임계값이나 기기 형태로 자세를 추측하지 않습니다.

## 관련 문서

- [LayoutProvider](./LayoutProvider) — 요구 사항·구독 범위
- [ZSPaneLayout](./ZSPaneLayout) — 접힘선 경계 분할
