jest.mock('../../model/useStyleSheetCreate', () => ({
  useStyleSheetCreate: () => ({}),
}));

jest.mock('../../model/globalOverlay', () => ({
  GlobalOverlay: {},
}));
