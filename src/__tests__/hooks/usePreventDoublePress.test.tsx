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

  it("첫 호출만 통과시키고 잠금 시간 안의 연속 호출은 막는다", async () => {
    const onPress = jest.fn();
    const { result } = await renderHook(() => usePreventDoublePress(onPress));

    await act(() => {
      result.current?.();
      result.current?.();
      result.current?.();
    });

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("잠금 시간이 지나면 다시 통과시킨다", async () => {
    const onPress = jest.fn();
    const { result } = await renderHook(() => usePreventDoublePress(onPress));

    await act(() => { result.current?.(); });
    now += PREVENT_DOUBLE_PRESS_INTERVAL - 1;
    await act(() => { result.current?.(); });
    expect(onPress).toHaveBeenCalledTimes(1);

    now += 1;
    await act(() => { result.current?.(); });
    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("interval 을 직접 지정할 수 있다", async () => {
    const onPress = jest.fn();
    const { result } = await renderHook(() => usePreventDoublePress(onPress, 500));

    await act(() => { result.current?.(); });
    now += 500;
    await act(() => { result.current?.(); });

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("interval 이 0이면 잠그지 않는다", async () => {
    const onPress = jest.fn();
    const { result } = await renderHook(() => usePreventDoublePress(onPress, 0));

    await act(() => {
      result.current?.();
      result.current?.();
    });

    expect(onPress).toHaveBeenCalledTimes(2);
  });

  it("호출 인자를 그대로 전달한다", async () => {
    const onPress = jest.fn();
    const { result } = await renderHook(() => usePreventDoublePress(onPress));

    await act(() => { result.current?.({ nativeEvent: { pageX: 1 } }); });

    expect(onPress).toHaveBeenCalledWith({ nativeEvent: { pageX: 1 } });
  });

  it("onPress 를 넘기지 않으면 undefined 를 돌려준다", async () => {
    const { result } = await renderHook(() => usePreventDoublePress(undefined));

    expect(result.current).toBeUndefined();
  });

  it("핸들러 identity 는 고정되고 최신 onPress 를 호출한다", async () => {
    const first = jest.fn();
    const second = jest.fn();
    const { result, rerender } = await renderHook(
      ({ handler }: { handler: () => void }) => usePreventDoublePress(handler),
      { initialProps: { handler: first } }
    );

    const initialHandler = result.current;
    await rerender({ handler: second });
    expect(result.current).toBe(initialHandler);

    await act(() => { result.current?.(); });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
