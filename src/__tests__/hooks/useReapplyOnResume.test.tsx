import { renderHook } from "@testing-library/react-native";
import { forceSharedValue, useReapplyOnResume } from "../../model/useReapplyOnResume";

let mockAppStateListener: ((state: string) => void) | undefined;
const mockAppStateRemove = jest.fn();

jest.mock("react-native", () => ({
  AppState: {
    currentState: "active",
    addEventListener: jest.fn((_event, listener) => {
      mockAppStateListener = listener;
      return { remove: mockAppStateRemove };
    }),
  },
}));

describe("useReapplyOnResume", () => {
  beforeEach(() => {
    mockAppStateListener = undefined;
    mockAppStateRemove.mockClear();
  });

  it("background 에서 active 로 돌아오면 reapply 를 부른다", () => {
    const reapply = jest.fn();
    renderHook(() => useReapplyOnResume(true, reapply));

    mockAppStateListener?.("background");
    expect(reapply).not.toHaveBeenCalled();
    mockAppStateListener?.("active");
    expect(reapply).toHaveBeenCalledTimes(1);
  });

  it("background → inactive → active 로 돌아와도 한 번 부른다", () => {
    const reapply = jest.fn();
    renderHook(() => useReapplyOnResume(true, reapply));

    mockAppStateListener?.("background");
    mockAppStateListener?.("inactive");
    mockAppStateListener?.("active");
    expect(reapply).toHaveBeenCalledTimes(1);
    mockAppStateListener?.("inactive");
    mockAppStateListener?.("active");
    expect(reapply).toHaveBeenCalledTimes(1);
  });

  it("background 를 거치지 않은 inactive → active 면 부르지 않는다", () => {
    const reapply = jest.fn();
    renderHook(() => useReapplyOnResume(true, reapply));

    mockAppStateListener?.("inactive");
    mockAppStateListener?.("active");
    expect(reapply).not.toHaveBeenCalled();
  });

  it("enabled 가 false 면 구독하지 않고, false 로 바뀌면 구독을 푼다", () => {
    const reapply = jest.fn();
    const { rerender } = renderHook(({ enabled }) => useReapplyOnResume(enabled, reapply), {
      initialProps: { enabled: false },
    });
    expect(mockAppStateListener).toBeUndefined();

    rerender({ enabled: true });
    expect(mockAppStateListener).toBeDefined();
    rerender({ enabled: false });
    expect(mockAppStateRemove).toHaveBeenCalledTimes(1);
  });

  it("최신 reapply 를 부른다", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(({ fn }) => useReapplyOnResume(true, fn), {
      initialProps: { fn: first },
    });
    rerender({ fn: second });

    mockAppStateListener?.("background");
    mockAppStateListener?.("active");
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe("forceSharedValue", () => {
  it("값이 같아도 강제로(forceUpdate) 다시 넣는다", () => {
    let value = 64;
    const modify = jest.fn((modifier: (v: number) => number, _force: boolean) => {
      value = modifier(value);
    });
    const sharedValue = { value, modify } as any;

    forceSharedValue(sharedValue, 10);
    expect(modify).toHaveBeenLastCalledWith(expect.any(Function), true);
    expect(value).toBe(10);

    forceSharedValue(sharedValue);
    expect(value).toBe(10);
  });
});
