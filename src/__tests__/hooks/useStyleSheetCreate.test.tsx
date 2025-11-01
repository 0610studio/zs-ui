import { renderHook } from "@testing-library/react-hooks";
import { useStyleSheetCreate } from "../../model/useStyleSheetCreate";

jest.mock("../../context/ThemeContext", () => {
  return {
    useTheme: () => ({
      palette: { primary: { base: "#000000" } } as any,
    }),
  };
});

describe("useStyleSheetCreate", () => {
  it("Theme palette를 받아 스타일을 생성한다", () => {
    const { result } = renderHook(() =>
      useStyleSheetCreate((palette: any) => ({
        color: palette.primary?.base ?? "#000000",
      }))
    );
    expect(result.current).toEqual({ color: "#000000" });
  });
});



