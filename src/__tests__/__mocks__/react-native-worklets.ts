export const scheduleOnRN = (fn: (...args: any[]) => void, ...args: any[]) => fn(...args);

export default { scheduleOnRN };
