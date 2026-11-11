interface TabRoute {
  key: string;
  name: string;
  params?: object;
}

interface TabState {
  index: number;
  routeNames: string[];
  routes: TabRoute[];
}

interface PlaceholderDescriptor {
  route: { key?: string; name: string; params?: object };
}

type Describe<D> = (route: { key: undefined; name: string }) => D;

function missingRouteNames(state: TabState): string[] {
  return state.routeNames.filter((name) => !state.routes.some((route) => route.name === name));
}

export function appendPlaceholderDescriptors<D extends PlaceholderDescriptor, M extends Record<string, D>>(
  descriptors: M,
  state: TabState,
  describe: Describe<D>,
): M {
  const missing = missingRouteNames(state);
  if (missing.length === 0) return descriptors;
  const placeholders: Record<string, D> = {};
  missing.forEach((name) => {
    placeholders[name] = describe({ key: undefined, name });
  });
  return { ...descriptors, ...placeholders };
}

export function appendPlaceholderRoutes<S extends TabState>(state: S, descriptors: Record<string, PlaceholderDescriptor>): S {
  const ordered = state.routeNames.every((name, index) => state.routes[index]?.name === name);
  if (ordered && state.routes.length === state.routeNames.length) return state;
  const focusedKey = state.routes[state.index]?.key;
  const routes = state.routeNames.map(
    (name) => state.routes.find((route) => route.name === name) ?? { ...descriptors[name]?.route, key: name, name },
  );
  return { ...state, index: Math.max(0, routes.findIndex((route) => route.key === focusedKey)), routes };
}
