import React from "react";
import { OverlayContext, useOverlay } from "../../model/useOverlay";
import { renderHook } from "@testing-library/react-native";

describe("useOverlay", () => {
  it("Provider 없이 사용 시 에러를 던진다", async () => {
    await expect(renderHook(() => useOverlay())).rejects.toThrow(Error);
  });

  it("Provider가 있으면 context 값을 반환한다", async () => {
    const overlay = { showAlert: jest.fn() };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OverlayContext.Provider value={overlay as any}>
        {children}
      </OverlayContext.Provider>
    );

    const { result } = await renderHook(() => useOverlay(), { wrapper });

    expect(result.current).toBe(overlay);
  });
});
