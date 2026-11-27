/**
 * Android 메뉴 선택 체크 — zs-ui 가 싣는 벡터 drawable(`android/src/main/res/drawable/zs_ui_check.xml`)을 리소스 이름으로 가리킨다.
 * Expo UI `Icon` 이 이름을 리소스로 찾아 Compose 로 그린다.
 */
export const MENU_CHECK_ICON = { uri: 'zs_ui_check' } as const;

/** Compose `MenuDefaults.LeadingIconSize` — Expo UI 메뉴(`MenuView`)의 선택 체크와 같은 크기 */
export const MENU_CHECK_ICON_SIZE = 20;
