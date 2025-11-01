import { renderHook, act } from "@testing-library/react-hooks";
import useKeyboard from "../../model/useKeyboard";

const listeners: Record<string, Function> = {};

jest.mock("react-native", () => {
  return {
    Platform: { OS: "ios" },
    Keyboard: {
      addListener: (event: string, handler: Function) => {
        listeners[event] = handler;
        return { remove: () => { delete listeners[event]; } };
      },
    },
  };
});

describe("useKeyboard", () => {
  beforeEach(() => {
    Object.keys(listeners).forEach(key => delete listeners[key]);
  });

  it("키보드 show/hide 이벤트에 반응한다", () => {
    const { result, unmount } = renderHook(() => useKeyboard());

    act(() => {
      listeners["keyboardWillShow"]?.({ endCoordinates: { height: 250 } });
    });
    expect(result.current.isKeyboardVisible).toBe(true);
    expect(result.current.keyboardHeight).toBe(250);

    act(() => {
      listeners["keyboardWillHide"]?.();
    });
    expect(result.current.isKeyboardVisible).toBe(false);
    expect(result.current.keyboardHeight).toBe(0);

    unmount();
  });

  it("handleKeyboardShow 콜백을 호출한다", () => {
    const mockHandleKeyboardShow = jest.fn();
    const { unmount } = renderHook(() => useKeyboard({
      handleKeyboardShow: mockHandleKeyboardShow,
    }));

    act(() => {
      listeners["keyboardWillShow"]?.({ endCoordinates: { height: 250 } });
    });
    expect(mockHandleKeyboardShow).toHaveBeenCalledWith({ endCoordinates: { height: 250 } });

    unmount();
  });

  it("handleKeyboardHide 콜백을 호출한다", () => {
    const mockHandleKeyboardHide = jest.fn();
    const { unmount } = renderHook(() => useKeyboard({
      handleKeyboardHide: mockHandleKeyboardHide,
    }));

    act(() => {
      listeners["keyboardWillHide"]?.();
    });
    expect(mockHandleKeyboardHide).toHaveBeenCalled();

    unmount();
  });
});
