import { appendPlaceholderDescriptors, appendPlaceholderRoutes } from '../../navigation/tabPlaceholders';

type Descriptor = { route: { key?: string; name: string }; options?: { title: string } };
const describeRoute = (route: { key: undefined; name: string }): Descriptor => ({ route, options: { title: route.name } });

describe('tabPlaceholders', () => {
  it('연 적 없는 탭의 descriptor 를 라우트 이름 key 로 채운다', () => {
    const descriptors = { 'feed-1': { route: { key: 'feed-1', name: 'feed' }, options: { title: 'feed' } } };
    const state = { index: 0, routeNames: ['feed', 'profile'], routes: [{ key: 'feed-1', name: 'feed' }] };
    expect(appendPlaceholderDescriptors(descriptors, state, describeRoute)).toEqual({
      ...descriptors,
      profile: { route: { key: undefined, name: 'profile' }, options: { title: 'profile' } },
    });
  });

  it('모든 탭이 있으면 descriptor 를 그대로 둔다', () => {
    const descriptors = { 'feed-1': { route: { key: 'feed-1', name: 'feed' } } };
    const state = { index: 0, routeNames: ['feed'], routes: [{ key: 'feed-1', name: 'feed' }] };
    expect(appendPlaceholderDescriptors(descriptors, state, describeRoute)).toBe(descriptors);
  });

  it('자리 표시 라우트를 선언 순서에 끼우고 index 는 초점 라우트를 따른다', () => {
    const state = { index: 0, routeNames: ['feed', 'profile'], routes: [{ key: 'profile-1', name: 'profile' }] };
    const descriptors = { feed: { route: { name: 'feed' } } };
    const result = appendPlaceholderRoutes(state, descriptors);
    expect(result.routes).toEqual([{ key: 'feed', name: 'feed' }, { key: 'profile-1', name: 'profile' }]);
    expect(result.index).toBe(1);
  });

  it('딥링크로 둘째 탭부터 열어 순서가 바뀌어도 선언 순서로 되돌린다', () => {
    const state = {
      index: 1,
      routeNames: ['feed', 'profile'],
      routes: [
        { key: 'profile-1', name: 'profile' },
        { key: 'feed-1', name: 'feed' },
      ],
    };
    const result = appendPlaceholderRoutes(state, {});
    expect(result.routes.map((route) => route.key)).toEqual(['feed-1', 'profile-1']);
    expect(result.index).toBe(0);
  });

  it('선언 순서대로 다 있으면 state 를 그대로 둔다', () => {
    const state = { index: 0, routeNames: ['feed'], routes: [{ key: 'feed-1', name: 'feed' }] };
    expect(appendPlaceholderRoutes(state, {})).toBe(state);
  });
});
