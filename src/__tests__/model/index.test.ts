jest.mock('../../model/useStyleSheetCreate', () => ({
  useStyleSheetCreate: () => ({}),
}));

jest.mock('../../model/globalOverlay', () => ({
  GlobalOverlay: {},
}));

describe('model test setup', () => {
  it('loads model mocks', () => {
    expect(true).toBe(true);
  });
});
