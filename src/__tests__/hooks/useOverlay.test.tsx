import { useOverlay, useAlert, useSnackbar, useBottomSheet, usePopOver, useModality, useLoader } from "../../model/useOverlay";
import { renderHook } from "@testing-library/react-hooks";

describe("useOverlay family", () => {
  it("Provider 없이 사용 시 에러를 던진다", () => {
    expect(renderHook(() => useOverlay()).result.error).toBeInstanceOf(Error);
    expect(renderHook(() => useAlert()).result.error).toBeInstanceOf(Error);
    expect(renderHook(() => useSnackbar()).result.error).toBeInstanceOf(Error);
    expect(renderHook(() => useBottomSheet()).result.error).toBeInstanceOf(Error);
    expect(renderHook(() => usePopOver()).result.error).toBeInstanceOf(Error);
    expect(renderHook(() => useModality()).result.error).toBeInstanceOf(Error);
    expect(renderHook(() => useLoader()).result.error).toBeInstanceOf(Error);
  });
});



