import { renderHook, act } from "@testing-library/react-native";
import useFoldingState from "../../model/useFoldingState";
import ZsUiModule from "../../ZsUiModule";

jest.mock("react-native", () => {
  return {
    Platform: { OS: "android" },
    Dimensions: {
      get: () => ({ width: 400 }),
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
  it("안드로이드에서 네이티브 폴딩 정보를 반영한다", async () => {
    const { result } = renderHook(() => useFoldingState());
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(result.current.width).toBe(700);
    expect(result.current.foldingState).toBe("unfolded");
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

