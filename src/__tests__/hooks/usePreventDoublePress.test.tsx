import { renderHook, act } from "@testing-library/react-native";
import { usePreventDoublePress, PREVENT_DOUBLE_PRESS_INTERVAL } from "../../model/usePreventDoublePress";

describe("usePreventDoublePress", () => {
  let now = 0;

  beforeEach(() => {
    now = 1_000_000;
    jest.spyOn(Date, "now").mockImplementation(() => now);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("첫 호출만 통과시키고 잠금 시간 안의 연속 호출은 막는다", () => {
    const onPress = jest.fn();
    const { result } = renderHook(() => usePreventDoublePress(onPress));

    act(() => {
      result.current?.();
      result.current?.();
      result.current?.();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("잠금 시간이 지나면 다시 통과시킨다", () => {
    const onPress = jest.fn();
    const { result } = renderHook(() => usePreventDoublePress(onPress));

    act(() => { result.current?.(); });
    now += PREVENT_DOUBLE_PRESS_INTERVAL - 1;
    act(() => { result.current?.(); });
    expect(onPress).toHaveBeenCalledTimes(1);

    now += 1;
    act(() => { result.current?.(); });
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("interval 을 직접 지정할 수 있다", () => {
    const onPress = jest.fn();
    const { result } = renderHook(() => usePreventDoublePress(onPress, 500));

    act(() => { result.current?.(); });
    now += 500;
    act(() => { result.current?.(); });

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("interval 이 0이면 잠그지 않는다", () => {
    const onPress = jest.fn();
    const { result } = renderHook(() => usePreventDoublePress(onPress, 0));

    act(() => {
      result.current?.();
      result.current?.();
    });

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("호출 인자를 그대로 전달한다", () => {
    const onPress = jest.fn();
    const { result } = renderHook(() => usePreventDoublePress(onPress));

    act(() => { result.current?.({ nativeEvent: { pageX: 1 } }); });

    expect(onPress).toHaveBeenCalledWith({ nativeEvent: { pageX: 1 } });
  });

  it("onPress 를 넘기지 않으면 undefined 를 돌려준다", () => {
    const { result } = renderHook(() => usePreventDoublePress(undefined));

    expect(result.current).toBeUndefined();
  });

  it("핸들러 identity 는 고정되고 최신 onPress 를 호출한다", () => {
    const first = jest.fn();
    const second = jest.fn();
    const { result, rerender } = renderHook(
      ({ handler }) => usePreventDoublePress(handler),
      { initialProps: { handler: first } }
    );

    const initialHandler = result.current;
    rerender({ handler: second });
    expect(result.current).toBe(initialHandler);

    act(() => { result.current?.(); });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
