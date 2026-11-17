import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { I18nManager, StyleSheet, Text } from 'react-native';
import * as GestureHandler from 'react-native-gesture-handler';
import ZSSegmentedPages from '../../ui/ZSSegmentedPages';
import type { MockGesture } from '../__mocks__/react-native-gesture-handler';

const OPTIONS = [{ value: 'day' }, { value: 'week' }, { value: 'month' }];
const WIDTH = 300;

const pages = (value: string, props: Partial<React.ComponentProps<typeof ZSSegmentedPages>> = {}) => (
  <ZSSegmentedPages options={OPTIONS} value={value} renderPage={(page) => <Text>{`page:${page}`}</Text>} testID="pages" {...props} />
);
const layout = () => fireEvent(screen.getByTestId('pages'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: WIDTH, height: 500 } } });
const page = (value: string) => screen.getByTestId(`pages-page-${value}`, { includeHiddenElements: true });
const text = (value: string) => screen.queryByText(value, { includeHiddenElements: true });
const trackX = () => {
  const track = page('day').parent!;
  return (StyleSheet.flatten(track.props.style).transform as { translateX: number }[])[0]!.translateX;
};

describe('ZSSegmentedPages', () => {
  it('폭을 재기 전에는 아무 페이지도 그리지 않고, 재면 지금 페이지만 그린다', async () => {
    await render(pages('day'));
    expect(screen.queryByText('page:day')).toBeNull();
    await act(layout);
    expect(text('page:day')).toBeTruthy();
    expect(text('page:week')).toBeNull();
    expect(StyleSheet.flatten(page('day').props.style).width).toBe(WIDTH);
  });

  it('value 가 바뀌면 새 페이지를 같은 렌더에서 그리고, 연 페이지는 붙여 둔다(스크롤·상태 유지)', async () => {
    await render(pages('day'));
    await act(layout);
    await screen.rerender(pages('month'));
    expect(text('page:month')).toBeTruthy();
    expect(text('page:day')).toBeTruthy();
    expect(text('page:week')).toBeNull();
  });

  it('지금 페이지만 누를 수 있고 스크린 리더에 보인다', async () => {
    await render(pages('week'));
    await act(layout);
    expect(page('week').props).toMatchObject({ pointerEvents: 'auto', accessibilityElementsHidden: false, importantForAccessibility: 'auto' });
    expect(page('day').props).toMatchObject({ pointerEvents: 'none', accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' });
  });

  it('고른 페이지 자리로 가로로 옮긴다 — 처음엔 바로, 그 뒤엔 spring', async () => {
    await render(pages('week'));
    await act(layout);
    await screen.rerender(pages('week'));
    expect(trackX()).toBe(-WIDTH);
    await screen.rerender(pages('month'));
    await screen.rerender(pages('month'));
    expect(trackX()).toBe(-2 * WIDTH);
  });

  it('오른쪽에서 왼쪽으로 읽는 언어는 반대로 옮긴다', async () => {
    const original = I18nManager.isRTL;
    Object.defineProperty(I18nManager, 'isRTL', { value: true, configurable: true });
    try {
      await render(pages('week'));
      await act(layout);
      await screen.rerender(pages('week'));
      expect(trackX()).toBe(WIDTH);
    } finally {
      Object.defineProperty(I18nManager, 'isRTL', { value: original, configurable: true });
    }
  });

  it('접기·펼치기로 폭이 바뀌어도 고른 페이지와 이미 연 페이지 상태를 유지한다', async () => {
    await render(pages('day'));
    await act(layout);
    await screen.rerender(pages('month'));
    for (const width of [700, 320, 300]) {
      await fireEvent(screen.getByTestId('pages'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: 500 } } });
      await screen.rerender(pages('month'));
      expect(trackX()).toBe(-2 * width);
      expect(StyleSheet.flatten(page('month').props.style).width).toBe(width);
      expect(text('page:day')).toBeTruthy();
      expect(text('page:month')).toBeTruthy();
    }
  });

  describe('swipeEnabled', () => {
    let pan: jest.SpyInstance;
    const lastPan = () => (pan.mock.results.at(-1)?.value as MockGesture).__config;

    beforeEach(() => {
      pan = jest.spyOn(GestureHandler, 'usePanGesture');
    });
    afterEach(() => pan.mockRestore());

    it('기본은 스와이프가 꺼져 있다', async () => {
      await render(pages('day'));
      await act(layout);
      expect(screen.queryByTestId('gesture-detector')).toBeNull();
      expect(lastPan().enabled).toBe(false);
    });

    it('켜면 넘긴 거리·속도로 이웃 페이지를 고른다 — 첫·끝 밖으로는 넘기지 않는다', async () => {
      const onValueChange = jest.fn();
      await render(pages('week', { swipeEnabled: true, onValueChange }));
      await act(layout);
      expect(screen.getByTestId('gesture-detector')).toBeTruthy();
      expect(lastPan()).toMatchObject({ enabled: true, activeOffsetX: [-12, 12], failOffsetY: [-16, 16] });

      // 부모가 고른 값을 다시 넘겨주는 제어 컴포넌트처럼 매번 다시 그린다
      const swipe = async (from: string, translationX: number, velocityX: number) => {
        await screen.rerender(pages(from, { swipeEnabled: true, onValueChange }));
        const config = lastPan();
        await act(() => {
          config.onActivate();
          config.onUpdate({ translationX });
          config.onDeactivate({ translationX, velocityX });
        });
      };

      await swipe('week', -WIDTH * 0.4, 0);
      expect(onValueChange).toHaveBeenLastCalledWith('month', 2);
      await swipe('week', 30, 800);
      expect(onValueChange).toHaveBeenLastCalledWith('day', 0);
      onValueChange.mockClear();
      await swipe('week', -20, 0);
      expect(onValueChange).not.toHaveBeenCalled();
      // 부모가 값을 바꾸지 않으면 지금 페이지 자리로 돌아간다
      await screen.rerender(pages('week', { swipeEnabled: true, onValueChange }));
      expect(trackX()).toBe(-WIDTH);
    });

    it('마지막 onUpdate 가 손 뗀 위치보다 덜 끌렸어도 끝 이벤트의 이동량으로 넘긴다', async () => {
      const onValueChange = jest.fn();
      await render(pages('week', { swipeEnabled: true, onValueChange }));
      await act(layout);
      const config = lastPan();
      await act(() => {
        config.onActivate();
        config.onUpdate({ translationX: -WIDTH * 0.1 });
        config.onDeactivate({ translationX: -WIDTH * 0.4, velocityX: 0 });
      });
      expect(onValueChange).toHaveBeenLastCalledWith('month', 2);
    });

    it('끝 페이지에서 더 밀어도 그대로다', async () => {
      const onValueChange = jest.fn();
      await render(pages('month', { swipeEnabled: true, onValueChange }));
      await act(layout);
      const config = lastPan();
      await act(() => {
        config.onActivate();
        config.onUpdate({ translationX: -WIDTH });
        config.onDeactivate({ translationX: -WIDTH, velocityX: -900 });
      });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it('끌던 도중 접고 펴면 옛 손짓을 버린다 — 원래 폭으로 돌아와도 마지막 이벤트는 무시한다', async () => {
      const onValueChange = jest.fn();
      const props = { swipeEnabled: true, onValueChange };
      await render(pages('week', props));
      await act(layout);
      const stale = lastPan();
      await act(() => {
        stale.onActivate();
        stale.onUpdate({ translationX: -100 });
      });
      for (const width of [700, WIDTH]) {
        await fireEvent(screen.getByTestId('pages'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height: 500 } } });
        await screen.rerender(pages('week', props));
      }
      await act(() => {
        stale.onUpdate({ translationX: -250 });
        stale.onDeactivate({ translationX: -250, velocityX: -900 });
      });
      await screen.rerender(pages('week', props));
      expect(trackX()).toBe(-WIDTH);
      expect(onValueChange).not.toHaveBeenCalled();
      const current = lastPan();
      await act(() => {
        current.onActivate();
        current.onDeactivate({ translationX: -150, velocityX: 0 });
      });
      expect(onValueChange).toHaveBeenLastCalledWith('month', 2);
    });
  });
});
