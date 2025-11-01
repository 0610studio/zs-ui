import { GlobalOverlay } from "../../model/globalOverlay";
import { setGlobalOverlayRef } from "../../model/globalOverlay";

describe("GlobalOverlay", () => {
  it("ref 미설정 시 에러를 던진다", () => {
    expect(() => GlobalOverlay.showAlert({ title: "t" })).toThrow();
    expect(() => GlobalOverlay.showSnackBar({ message: "m" })).toThrow();
    expect(() => GlobalOverlay.showBottomSheet({ component: null as any })).toThrow();
    expect(() => GlobalOverlay.showPopOverMenu({ px: 0, py: 0, component: null as any })).toThrow();
    expect(() => GlobalOverlay.showModality({ component: null as any })).toThrow();
    expect(() => GlobalOverlay.showLoader()).toThrow();
    expect(() => GlobalOverlay.hideOverlay("all")).toThrow();
  });

  it("ref 설정 후 내부 메서드로 위임한다", () => {
    const ref = {
      showAlert: jest.fn(),
      showSnackBar: jest.fn(),
      showBottomSheet: jest.fn(),
      showPopOverMenu: jest.fn(),
      showModality: jest.fn(),
      showLoader: jest.fn(),
      hideOverlay: jest.fn(),
    } as any;
    setGlobalOverlayRef(ref);

    GlobalOverlay.showAlert({ title: "t" });
    GlobalOverlay.showSnackBar({ message: "m" });
    GlobalOverlay.showBottomSheet({ component: null as any });
    GlobalOverlay.showPopOverMenu({ px: 0, py: 0, component: null as any });
    GlobalOverlay.showModality({ component: null as any });
    GlobalOverlay.showLoader();
    GlobalOverlay.hideOverlay("all");

    expect(ref.showAlert).toHaveBeenCalled();
    expect(ref.showSnackBar).toHaveBeenCalled();
    expect(ref.showBottomSheet).toHaveBeenCalled();
    expect(ref.showPopOverMenu).toHaveBeenCalled();
    expect(ref.showModality).toHaveBeenCalled();
    expect(ref.showLoader).toHaveBeenCalled();
    expect(ref.hideOverlay).toHaveBeenCalledWith("all");

    setGlobalOverlayRef(null);
  });
});



