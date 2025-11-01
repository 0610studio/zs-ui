import React from "react";
import { renderHook, act } from "@testing-library/react-hooks";
import useFoldingState from "../../model/useFoldingState";

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
});



