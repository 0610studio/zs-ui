import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

// jest 는 .web 확장자를 먼저 해석한다 — 이 파일은 그 기본 해석(웹 진입점)을 그대로 검증한다.
import ZSCalendar from '../../../ui/ZSCalendar';

describe('ZSCalendar 웹 미지원 진입점', () => {
  // warnWebUnsupported 는 모듈 단위로 1회만 경고하므로, 첫 렌더에서 함께 확인한다
  it('아무것도 렌더하지 않고 개발 모드에서 한 번만 경고한다', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const { toJSON } = render(<ZSCalendar defaultVisibleMonth="2026-09-01" testID="calendar" />);
    expect(toJSON()).toBeNull();
    expect(screen.queryByTestId('calendar')).toBeNull();
    expect(screen.queryByTestId('skia-canvas')).toBeNull();

    const first = warn.mock.calls.filter((call) => String(call[0]).includes('ZSCalendar'));
    expect(first).toHaveLength(1);
    expect(String(first[0]?.[0])).toContain('웹을 지원하지 않습니다');

    // 두 번째 마운트에서는 더 이상 경고하지 않는다
    render(<ZSCalendar defaultVisibleMonth="2026-10-01" />);
    expect(warn.mock.calls.filter((call) => String(call[0]).includes('ZSCalendar'))).toHaveLength(1);
    warn.mockRestore();
  });

  it('children 도 함께 빠진다 — 컨텍스트 없이 남으면 useCalendarAgenda 가 실패한다', () => {
    render(
      <ZSCalendar defaultVisibleMonth="2026-09-01">
        <Text testID="agenda-child">목록</Text>
      </ZSCalendar>,
    );

    expect(screen.queryByTestId('agenda-child')).toBeNull();
  });
});
