import { act, renderHook } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useToday } from '../../../ui/ZSCalendar/hooks/useToday';

const pendingTimers = () => {
  jest.runAllTicks();
  return jest.getTimerCount();
};

const changeState = (state: string) => (AppState as unknown as { mockChange: (state: string) => void }).mockChange(state);

describe('달력의 오늘 날짜', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 15, 23, 59, 59, 900));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('로컬 날짜로 시작한다', async () => {
    const { result } = await renderHook(useToday);
    expect(result.current).toBe('2026-06-15');
  });

  it('자정을 넘기면 날짜를 갱신하고 다음 자정도 예약한다', async () => {
    const { result } = await renderHook(useToday);
    await act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('2026-06-16');
    await act(() => jest.advanceTimersByTime(24 * 60 * 60 * 1000));
    expect(result.current).toBe('2026-06-17');
  });

  it('백그라운드에서는 타이머를 멈추고 복귀 즉시 날짜를 갱신한다', async () => {
    const { result } = await renderHook(useToday);
    await act(() => changeState('background'));
    expect(pendingTimers()).toBe(0);
    jest.setSystemTime(new Date(2026, 5, 18, 9));
    await act(() => changeState('active'));
    expect(result.current).toBe('2026-06-18');
    expect(pendingTimers()).toBe(1);
  });

  it('백그라운드에서 마운트되면 복귀할 때 예약한다', async () => {
    jest.replaceProperty(AppState, 'currentState', 'background');
    const { result } = await renderHook(useToday);
    expect(pendingTimers()).toBe(0);
    jest.setSystemTime(new Date(2026, 5, 16, 9));
    await act(() => changeState('active'));
    expect(result.current).toBe('2026-06-16');
    expect(pendingTimers()).toBe(1);
  });

  it('언마운트하면 타이머와 복귀 구독을 해제한다', async () => {
    const { unmount } = await renderHook(useToday);
    expect(pendingTimers()).toBe(1);
    await unmount();
    expect(pendingTimers()).toBe(0);
    await act(() => changeState('active'));
    expect(pendingTimers()).toBe(0);
  });
});
