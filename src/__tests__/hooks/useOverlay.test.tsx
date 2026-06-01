import React from "react";
import {
  AlertContext,
  BottomSheetContext,
  LoaderContext,
  ModalityContext,
  OverlayContext,
  PopOverContext,
  SnackbarContext,
  useAlert,
  useBottomSheet,
  useLoader,
  useModality,
  useOverlay,
  usePopOver,
  useSnackbar
} from "../../model/useOverlay";
import { renderHook } from "@testing-library/react-native";

describe("useOverlay family", () => {
  it("Provider 없이 사용 시 에러를 던진다", () => {
    expect(() => renderHook(() => useOverlay())).toThrow(Error);
    expect(() => renderHook(() => useAlert())).toThrow(Error);
    expect(() => renderHook(() => useSnackbar())).toThrow(Error);
    expect(() => renderHook(() => useBottomSheet())).toThrow(Error);
    expect(() => renderHook(() => usePopOver())).toThrow(Error);
    expect(() => renderHook(() => useModality())).toThrow(Error);
    expect(() => renderHook(() => useLoader())).toThrow(Error);
  });

  it("Provider가 있으면 context 값을 반환한다", () => {
    const overlay = { showAlert: jest.fn() };
    const alert = { alertVisible: false };
    const snackbar = { snackbarVisible: false };
    const bottomSheet = { bottomSheetVisible: false };
    const popOver = { popOverVisible: false };
    const modality = { modalityVisible: false };
    const loader = { loaderVisible: false };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <OverlayContext.Provider value={overlay as any}>
        <AlertContext.Provider value={alert as any}>
          <SnackbarContext.Provider value={snackbar as any}>
            <BottomSheetContext.Provider value={bottomSheet as any}>
              <PopOverContext.Provider value={popOver as any}>
                <ModalityContext.Provider value={modality as any}>
                  <LoaderContext.Provider value={loader as any}>
                    {children}
                  </LoaderContext.Provider>
                </ModalityContext.Provider>
              </PopOverContext.Provider>
            </BottomSheetContext.Provider>
          </SnackbarContext.Provider>
        </AlertContext.Provider>
      </OverlayContext.Provider>
    );

    const { result } = renderHook(() => ({
      overlay: useOverlay(),
      alert: useAlert(),
      snackbar: useSnackbar(),
      bottomSheet: useBottomSheet(),
      popOver: usePopOver(),
      modality: useModality(),
      loader: useLoader(),
    }), { wrapper });

    expect(result.current.overlay).toBe(overlay);
    expect(result.current.alert).toBe(alert);
    expect(result.current.snackbar).toBe(snackbar);
    expect(result.current.bottomSheet).toBe(bottomSheet);
    expect(result.current.popOver).toBe(popOver);
    expect(result.current.modality).toBe(modality);
    expect(result.current.loader).toBe(loader);
  });
});

