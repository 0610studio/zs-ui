
declare const module: { exports: unknown };

const shapes = new Proxy(
  {},
  {
    get: (_target, name) => (typeof name === 'string' ? (...args: unknown[]) => ({ $type: `shapes.${name}`, args }) : undefined),
  },
);

module.exports = new Proxy(
  {},
  {
    get: (_target, name) => {
      if (typeof name !== 'string' || name === '__esModule') return undefined;
      if (name === 'shapes') return shapes;
      return (...args: unknown[]) => ({ $type: name, args });
    },
  },
);
