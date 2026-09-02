import { useEffect } from 'react';
import { warnWebUnsupported } from '../../model/webUnsupported';
import type { ZSCalendarProps } from './ZSCalendar';

/**
 * 웹 미지원. 네이티브 구현을 그대로 두면 import 만으로 CanvasKit 로딩이 시작돼
 * 웹 빌드가 죽으므로, 모듈 경계에서 끊고 아무것도 렌더하지 않는다.
 * children 도 함께 빠진다 — 컨텍스트 없이 남으면 useCalendarAgenda 가 실패한다.
 */
function ZSCalendarWeb<T = unknown>(_props: ZSCalendarProps<T>) {
  useEffect(() => {
    warnWebUnsupported('ZSCalendar');
  }, []);

  return null;
}

export default ZSCalendarWeb;
export type { ZSCalendarProps } from './ZSCalendar';
export type { CalendarHeaderContext } from './ZSCalendar';
