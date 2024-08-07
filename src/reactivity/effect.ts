let activeEffect;

class ReactiveEffect {
  private _fn;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    this._fn();
  }
}

const targetMap = new Map();

export function track(target, key) {
  let depMap = targetMap.get(target);

  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }

  let deps = depMap.get(key);

  if (!deps) {
    deps = new Set();
    depMap.set(key, deps);
  }

  deps.add(activeEffect);
}

export function trigger(target, key, value) {
  const depMap = targetMap.get(target);
  const deps = depMap.get(key);

  for (const item of deps) {
    item.run();
  }
}

export function effect(fn) {
  const _effect = new ReactiveEffect(fn);

  _effect.run();
}
