jest.mock("../context/OverlayContext", () => ({ OverlayProvider: ({ children }: any) => children }));
jest.mock("../context/ThemeContext", () => ({
  ThemeProvider: ({ children }: any) => children,
  useTheme: () => ({ palette: {} }),
}));
jest.mock("../overlay", () => ({
  AlertOverlay: () => null,
  BottomSheetOverlay: () => null,
  SnackbarNotify: () => null,
  useOverlay: () => ({}),
  PopOverButton: () => null,
  PopOverMenu: () => null,
  ZSPortal: () => null,
}));
jest.mock("../ui/ZSTextField/ui/ErrorComponent", () => () => null);
jest.mock("../ui/ZSContainer", () => () => null);
jest.mock("../ui/ZSPressable", () => () => null);
jest.mock("../ui/ZSText", () => () => null);
jest.mock("../ui/ZSTextField", () => () => null);
jest.mock("../ui/ZSRadioGroup", () => () => null);
jest.mock("../ui/ZSView", () => () => null);
jest.mock("../ui/atoms/AnimatedWrapper", () => () => null);
jest.mock("../ui/atoms/TextAtom", () => () => null);
jest.mock("../ui/ZSAboveKeyboard", () => () => null);

describe("index exports", () => {
  it("모든 주요 심볼을 export 한다", async () => {
    const mod = await import("../index");
    expect(mod).toHaveProperty("GlobalOverlay");
    expect(mod).toHaveProperty("useTheme");
    expect(mod).toHaveProperty("ThemeProvider");
    expect(mod).toHaveProperty("OverlayProvider");
    expect(mod).toHaveProperty("useFoldingState");
    expect(mod).toHaveProperty("themeFactory");
    expect(mod).toHaveProperty("ZSContainer");
    expect(mod).toHaveProperty("ZSText");
    expect(mod).toHaveProperty("ZSTextField");
    expect(mod).toHaveProperty("ZSRadioGroup");
    expect(mod).toHaveProperty("ZSPressable");
    expect(mod).toHaveProperty("ZSView");
    expect(mod).toHaveProperty("AnimatedWrapper");
    expect(mod).toHaveProperty("TextAtom");
    expect(mod).toHaveProperty("ErrorComponent");
    expect(mod).toHaveProperty("ZSAboveKeyboard");
    expect(mod).toHaveProperty("AlertOverlay");
    expect(mod).toHaveProperty("BottomSheetOverlay");
    expect(mod).toHaveProperty("SnackbarNotify");
    expect(mod).toHaveProperty("useOverlay");
    expect(mod).toHaveProperty("PopOverButton");
    expect(mod).toHaveProperty("PopOverMenu");
    expect(mod).toHaveProperty("ZSPortal");
  });
});


