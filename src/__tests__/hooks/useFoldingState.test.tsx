import { renderHook, act } from "@testing-library/react-native";
import useFoldingState from "../../model/useFoldingState";
import ZsUiModule from "../../ZsUiModule";

let mockDimensionsChangeListener: ((event: { window: { width: number } }) => void) | undefined;
const mockDimensionsRemove = jest.fn();

jest.mock("react-native", () => {
  return {
    Platform: { OS: "android" },
    Dimensions: {
      get: () => ({ width: 400 }),
      addEventListener: jest.fn((_event, listener) => {
        mockDimensionsChangeListener = listener;
        return { remove: mockDimensionsRemove };
      }),
    },
  };
});

jest.mock("../../ZsUiModule", () => ({
  __esModule: true,
  default: {
    getFoldingFeature: jest.fn().mockResolvedValue({ width: 700, foldingFeature: true }),
  },
}));

describe("useFoldingState", () => {
  beforeEach(() => {
    mockDimensionsChangeListener = undefined;
    mockDimensionsRemove.mockClear();
    (ZsUiModule.getFoldingFeature as jest.Mock).mockResolvedValue({ width: 700, foldingFeature: true });
  });

  it("안드로이드에서 네이티브 폴딩 정보를 반영한다", async () => {
    const { result } = renderHook(() => useFoldingState());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(result.current.width).toBe(700);
    expect(result.current.foldingState).toBe("unfolded");
  });

  it("화면 크기 변경 시 네이티브 폴딩 정보를 다시 조회한다", async () => {
    const { result, unmount } = renderHook(() => useFoldingState());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    (ZsUiModule.getFoldingFeature as jest.Mock).mockResolvedValueOnce({
      width: 420,
      foldingFeature: null,
    });

    await act(async () => {
      mockDimensionsChangeListener?.({ window: { width: 420 } });
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.width).toBe(420);
    expect(result.current.foldingState).toBe("folded");
    expect(ZsUiModule.getFoldingFeature).toHaveBeenCalledTimes(2);

    unmount();
    expect(mockDimensionsRemove).toHaveBeenCalledTimes(1);
  });

  it("네이티브 폴딩 정보 호출 실패를 기록한다", async () => {
    const error = new Error("native failure");
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (ZsUiModule.getFoldingFeature as jest.Mock).mockRejectedValueOnce(error);

    renderHook(() => useFoldingState());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(consoleSpy).toHaveBeenCalledWith("getFoldingFeature 호출 실패:", error);
    consoleSpy.mockRestore();
  });
});
