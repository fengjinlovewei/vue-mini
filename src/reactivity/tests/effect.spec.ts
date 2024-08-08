import { reactive } from '../reactive';
import { effect, stop } from '../effect';

describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    });

    let nextAge;

    effect(() => {
      nextAge = user.age + 1;
    });

    expect(nextAge).toBe(11);

    user.age++;

    expect(nextAge).toBe(12);
  });

  it('return', () => {
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return 'foo';
    });

    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe('foo');
  });

  it('scheduler', () => {
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      run = runner;
    });
    const obj = reactive({ foo: 1 });

    // 有了 scheduler 参数后，obj.foo的变动不会再触发
    // effect 的第一个参数的函数调用，
    // 而是会触发 scheduler 的函数调用
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      { scheduler }
    );

    // 用来验证 scheduler 没有被调用过
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);

    obj.foo++;

    //  用来验证 scheduler 被调了1次
    expect(scheduler).toHaveBeenCalledTimes(1);

    // dummy不会变化
    expect(dummy).toBe(1);

    run();

    // 调用 run（runner） 后可以调用effect的第一个参数函数调用
    expect(dummy).toBe(2);
  });

  it('stop', () => {
    let dummy;
    const obj = reactive({ prop: 1 });
    const runner = effect(() => {
      dummy = obj.prop;
    });
    obj.prop = 2;
    expect(dummy).toBe(2);
    // 相当于删除操作
    stop(runner);
    obj.prop = 3;
    expect(dummy).toBe(2);

    runner();
    expect(dummy).toBe(3);
  });

  it('onStop', () => {
    const obj = reactive({
      foo: 1,
    });

    const onStop = jest.fn();
    let dummy;
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        onStop,
      }
    );

    stop(runner);
    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
