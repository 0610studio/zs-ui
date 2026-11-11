type Hinge = { angle: number; status: 'closed' | 'partiallyOpen' | 'fullyOpen' | 'unknown' };
type Listener = (event: { hinge: Hinge | null }) => void;

let current: Hinge | null = null;
const listeners = new Set<Listener>();

export function getHinge(): Hinge | null {
  return current;
}

export function addHingeListener(listener: Listener) {
  listeners.add(listener);
  return { remove: () => listeners.delete(listener) };
}

export function __setHinge(hinge: Hinge | null) {
  current = hinge;
  listeners.forEach((listener) => listener({ hinge }));
}

export function __listenerCount() {
  return listeners.size;
}
