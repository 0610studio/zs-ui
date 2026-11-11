import { host } from './expo-ui-host';

const cache = new Map<string, ReturnType<typeof host>>();

declare const module: { exports: unknown };

module.exports = new Proxy(
  {},
  {
    get: (_target, name) => {
      if (typeof name !== 'string' || name === '__esModule') return undefined;
      if (!cache.has(name)) cache.set(name, host(name));
      return cache.get(name);
    },
  },
);
