import type { DisplayFeature } from '../../layout/types';
import { resolveWindowSheetFrame, resolveWindowSheetPane } from '../../overlay/windowSheetPane';

const foldAt = (x = 455.5, width = 40): DisplayFeature => ({
  type: 'fold', rect: { x, y: 0, width, height: 669 }, orientation: 'vertical', active: true, state: 'halfOpened',
});

describe('window sheet safe pane', () => {
  it('keeps all sheet content to one side of the Duo occluding hinge', () => {
    expect(resolveWindowSheetPane(951, foldAt())).toEqual({ left: 0, width: 455.5 });
  });

  it('chooses the larger pane when the fold is not centered', () => {
    expect(resolveWindowSheetPane(1000, foldAt(350))).toEqual({ left: 390, width: 610 });
    expect(resolveWindowSheetPane(1000, foldAt(600))).toEqual({ left: 0, width: 600 });
  });

  it('keeps full width without an active occluding vertical fold', () => {
    expect(resolveWindowSheetPane(951, null)).toBeNull();
    expect(resolveWindowSheetPane(951, { ...foldAt(), active: false, state: 'flat' })).toBeNull();
    expect(resolveWindowSheetPane(951, foldAt(475.5, 0))).toBeNull();
    expect(resolveWindowSheetPane(951, { ...foldAt(), orientation: 'horizontal' })).toBeNull();
  });

  it('clips a partially offscreen occlusion and ignores one outside the window', () => {
    expect(resolveWindowSheetPane(1000, foldAt(-10))).toEqual({ left: 30, width: 970 });
    expect(resolveWindowSheetPane(1000, foldAt(990))).toEqual({ left: 0, width: 990 });
    expect(resolveWindowSheetPane(1000, foldAt(1100))).toBeNull();
    expect(resolveWindowSheetPane(1000, foldAt(-50))).toBeNull();
  });

  it('ignores unusable observations rather than emitting invalid frame dimensions', () => {
    expect(resolveWindowSheetPane(0, foldAt())).toBeNull();
    expect(resolveWindowSheetPane(Number.NaN, foldAt())).toBeNull();
    expect(resolveWindowSheetPane(1000, foldAt(Number.NaN))).toBeNull();
    expect(resolveWindowSheetPane(1000, foldAt(0, Number.POSITIVE_INFINITY))).toBeNull();
    expect(resolveWindowSheetPane(1000, foldAt(0, 1000))).toBeNull();
  });
});

describe('window sheet frame with a max width', () => {
  it('centers a narrower sheet in the window', () => {
    expect(resolveWindowSheetFrame(951, null, 500)).toEqual({ left: 225.5, width: 500 });
  });

  it('centers it within the larger pane beside an occluding hinge', () => {
    expect(resolveWindowSheetFrame(1000, foldAt(350), 500)).toEqual({ left: 445, width: 500 });
    expect(resolveWindowSheetFrame(951, foldAt(), 400)).toEqual({ left: 27.75, width: 400 });
  });

  it('keeps the window or pane width when it is not wider than the max', () => {
    expect(resolveWindowSheetFrame(466, null, 500)).toBeNull();
    expect(resolveWindowSheetFrame(500, null, 500)).toBeNull();
    expect(resolveWindowSheetFrame(951, foldAt(), 500)).toEqual({ left: 0, width: 455.5 });
  });

  it('ignores a missing or unusable max width', () => {
    expect(resolveWindowSheetFrame(951, null)).toBeNull();
    expect(resolveWindowSheetFrame(951, foldAt())).toEqual({ left: 0, width: 455.5 });
    for (const maxWidth of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) expect(resolveWindowSheetFrame(951, null, maxWidth)).toBeNull();
    expect(resolveWindowSheetFrame(Number.NaN, null, 500)).toBeNull();
  });
});
