import { extractStyle, Z_INDEX_VALUE, MAX_FOLDABLE_SINGLE_WIDTH } from "../../model/utils";

describe("extractStyle", () => {
  it("배열 스타일에서 지정 속성을 추출한다", () => {
    const style = [{ color: "red" }, { fontSize: 16 }];
    expect(extractStyle(style, "fontSize")).toBe(16);
    expect(extractStyle(style, "color")).toBe("red");
  });

  it("객체 스타일에서 지정 속성을 추출한다", () => {
    const style = { lineHeight: 22 } as const;
    expect(extractStyle(style, "lineHeight")).toBe(22);
  });

  it("해당 속성이 없으면 undefined를 반환한다", () => {
    const style = [{ color: "red" }];
    expect(extractStyle(style, "fontWeight")).toBeUndefined();
  });
});

describe("constants", () => {
  it("Z_INDEX_VALUE가 기대값을 가진다", () => {
    expect(Z_INDEX_VALUE.DEFAULT).toBe(8000);
    expect(Z_INDEX_VALUE.ALERT).toBe(8700);
    expect(Z_INDEX_VALUE.LOADING).toBe(8999);
  });

  it("MAX_FOLDABLE_SINGLE_WIDTH가 정의된다", () => {
    expect(MAX_FOLDABLE_SINGLE_WIDTH).toBeGreaterThan(0);
  });
});



