let activeEffect;
const targetMap = new Map();
class ReactiveEffect {
  private _fn;
  public scheduler;
  deps = [];
  onStop?: () => void;
  active = true;
  constructor(fn) {
    this._fn = fn;
  }
  run() {
    activeEffect = this;
    return this._fn();
  }
  stop() {
    if (this.active) {
      this.deps.forEach((dep: any) => {
        dep.delete(this);
      });
      if (this.onStop) {
        this.onStop();
      }
      this.active = false;
    }
  }
}

// get
export function track(target, key) {
  let depMap = targetMap.get(target);

  if (!depMap) {
    depMap = new Map();
    targetMap.set(target, depMap);
  }

  let dep = depMap.get(key);

  if (!dep) {
    dep = new Set();
    depMap.set(key, dep);
  }

  if (!activeEffect) return;
  dep.add(activeEffect);
  // 这块的操作是为了 把所有收集过 activeEffect 的dep
  // 记录到 activeEffect.deps 中，因为stop的删除操作
  // 要把所有的收集过 activeEffect 的dep 中的 fn 删除掉；
  activeEffect.deps.push(dep);
}

// set
export function trigger(target, key, value) {
  const depMap = targetMap.get(target);
  if (!depMap) return;
  const dep = depMap.get(key);
  if (!dep) return;
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn);

  Object.assign(_effect, options);
  _effect.run();

  const runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;

  return runner;
}

export function stop(runner) {
  runner.effect.stop();
}
