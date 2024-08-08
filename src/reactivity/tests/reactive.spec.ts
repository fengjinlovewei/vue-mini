import { reactive } from '../reactive';

describe('reactive', () => {
  // skip表示跳过当前测试，相当于把这段测试注释了！
  // effect 已经验证了，所以这块跳过吧
  it('reactive-get', () => {
    const original = { foo: 1 };
    const observed = reactive(original);

    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });

  it('reactive-set', () => {
    const original = { foo: 1 };
    const observed = reactive(original);

    expect(observed).not.toBe(original);

    observed.foo = 2
    expect(observed.foo).toBe(2);
  });
});
