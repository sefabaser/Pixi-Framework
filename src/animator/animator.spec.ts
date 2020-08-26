import { Animator } from './animator';
import { Wait } from 'helpers-lib';

describe('Animation', () => {
  it('set values without animation', () => {
    let obj = { x: 0 };
    let transform = new Animator(obj, 'x');
    transform.set({ x: 5 });
    expect(obj.x).toEqual(5);
  });

  it('on construction valueOrigins should be set', () => {
    let obj = { x: 1, y: 2, z: 3 };
    let transform = new Animator(obj, ['x', 'y']);
    expect(transform['valueOrigins'].x).toEqual(1);
    expect(transform['valueOrigins'].y).toEqual(2);
    expect(transform['valueOrigins'].z).toEqual(undefined);
  });

  it('animate to target', () => {
    let obj = { x: 0 };
    let transform = new Animator(obj, 'x');
    transform.animate({ x: 5 });
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(5);
  });

  it('animate to target and return back', () => {
    let obj = { x: 0 };
    let transform = new Animator(obj, 'x');
    transform.animate({ x: 5 });
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform.animate({ x: 0 });
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(0);
  });

  it('animate to target and return back before it finises', () => {
    let obj = { x: 0 };
    let transform = new Animator(obj, 'x');
    transform.animate({ x: 5 });
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform.animate({ x: 0 });
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(0);
  });

  it('animate switch before it finishes', () => {
    let obj = { x: 0 };
    let transform = new Animator(obj, 'x');
    transform.animate({ x: 5 });
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform.animate({ x: 7 });
    transform['update'](50);
    transform.animate({ x: 0 });
    transform['update'](50);
    transform['update'](50);
    transform.animate({ x: 5 });
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(5);
  });

  it('set with animation', () => {
    let obj = { x: 12 };
    let transform = new Animator(obj, 'x');
    transform.set({ x: 5 }, true);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(8.5);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(5);
  });

  it('set with animation and switch before it finishes', () => {
    let obj = { x: 12 };
    let transform = new Animator(obj, 'x');
    transform.set({ x: 5 }, true);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(8.5);
    transform.set({ x: 20 }, true);
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    transform['update'](50);
    expect(obj.x).toEqual(20);
  });

  it('animate multiple', () => {
    let obj = { x: 10, y: 40 };
    let transform = new Animator(obj, ['x', 'y']);
    transform.animate({ x: 10, y: 10 });
    transform['update'](50);
    expect(obj).toEqual({ x: 11.25, y: 41.25 });
    transform['update'](50);
    expect(obj).toEqual({ x: 15, y: 45 });
    transform['update'](50);
    expect(obj).toEqual({ x: 18.75, y: 48.75 });
    transform['update'](50);
    expect(obj).toEqual({ x: 20, y: 50 });
  });

  it('set multiple', () => {
    let obj = { x: 10, y: 40 };
    let transform = new Animator(obj, ['x', 'y']);
    transform.set({ x: 20, y: 30 }, true);
    transform['update'](50);
    expect(obj).toEqual({ x: 11.25, y: 38.75 });
    transform['update'](50);
    expect(obj).toEqual({ x: 15, y: 35 });
    transform['update'](50);
    expect(obj).toEqual({ x: 18.75, y: 31.25 });
    transform['update'](50);
    expect(obj).toEqual({ x: 20, y: 30 });
  });

  it('animate custom duration', () => {
    let obj = { x: 10 };
    let transform = new Animator(obj, 'x');
    transform.animate({ x: 10 }, { duration: 100 });
    transform['update'](25);
    expect(obj).toEqual({ x: 11.25 });
    transform['update'](25);
    expect(obj).toEqual({ x: 15 });
    transform['update'](25);
    expect(obj).toEqual({ x: 18.75 });
    transform['update'](25);
    expect(obj).toEqual({ x: 20 });
  });

  it('set custom duration', () => {
    let obj = { x: 10 };
    let transform = new Animator(obj, 'x');
    transform.set({ x: 20 }, true);
    transform['update'](50);
    expect(obj).toEqual({ x: 11.25 });
    transform['update'](50);
    expect(obj).toEqual({ x: 15 });
    transform['update'](50);
    expect(obj).toEqual({ x: 18.75 });
    transform['update'](50);
    expect(obj).toEqual({ x: 20 });
  });

  it('animate partial', () => {
    let obj = { x: 10, y: 40 };
    let transform = new Animator(obj, ['x', 'y']);
    transform.animate({ x: 10 });
    transform['update'](50);
    expect(obj).toEqual({ x: 11.25, y: 40 });
    transform['update'](50);
    expect(obj).toEqual({ x: 15, y: 40 });
    transform['update'](50);
    expect(obj).toEqual({ x: 18.75, y: 40 });
    transform['update'](50);
    expect(obj).toEqual({ x: 20, y: 40 });
  });

  it('set partial', () => {
    let obj = { x: 10, y: 40 };
    let transform = new Animator(obj, ['x', 'y']);
    transform.set({ x: 20 }, true);
    transform['update'](50);
    expect(obj).toEqual({ x: 11.25, y: 40 });
    transform['update'](50);
    expect(obj).toEqual({ x: 15, y: 40 });
    transform['update'](50);
    expect(obj).toEqual({ x: 18.75, y: 40 });
    transform['update'](50);
    expect(obj).toEqual({ x: 20, y: 40 });
  });

  it('animate partial async', () => {
    let obj = { x: 10, y: 40 };
    let transform = new Animator(obj, ['x', 'y']);
    transform.animate({ y: 10 });
    transform['update'](50);
    expect(obj).toEqual({ x: 10, y: 41.25 });
    transform.animate({ x: 10 });
    transform['update'](50);
    expect(obj).toEqual({ x: 11.25, y: 45 });
    transform['update'](50);
    expect(obj).toEqual({ x: 15, y: 48.75 });
    transform['update'](50);
    expect(obj).toEqual({ x: 18.75, y: 50 });
    transform['update'](50);
    expect(obj).toEqual({ x: 20, y: 50 });
  });

  it('set partial async', () => {
    let obj = { x: 10, y: 40 };
    let transform = new Animator(obj, ['x', 'y']);
    transform.set({ y: 50 }, true);
    transform['update'](50);
    expect(obj).toEqual({ x: 10, y: 41.25 });
    transform.set({ x: 50 }, true);
    transform['update'](50);
    expect(obj).toEqual({ x: 15, y: 45 });
    transform['update'](50);
    expect(obj).toEqual({ x: 30, y: 48.75 });
    transform['update'](50);
    expect(obj).toEqual({ x: 45, y: 50 });
    transform['update'](50);
    expect(obj).toEqual({ x: 50, y: 50 });
  });

  it('animate step callbacks', () => {
    let obj = { x: 10 };

    let valueFromOnStep = 0;
    let onStepCallCount = 0;

    let transform = new Animator(obj, 'x').onChange(item => {
      valueFromOnStep = item.x;
      onStepCallCount++;
    });

    transform.animate({ x: 10 }, { duration: 100 });

    expect(valueFromOnStep).toEqual(0);
    expect(onStepCallCount).toEqual(0);

    transform['update'](25);
    expect(valueFromOnStep).toEqual(11.25);
    transform['update'](25);
    expect(valueFromOnStep).toEqual(15);
    transform['update'](25);
    expect(valueFromOnStep).toEqual(18.75);
    transform['update'](25);
    expect(valueFromOnStep).toEqual(20);

    transform['update'](25);
    transform['update'](25);
    transform['update'](25);
    expect(onStepCallCount).toEqual(4);
  });

  it('animation complete promise', async () => {
    let completed = false;
    let obj = { x: 0 };
    let transform = new Animator(obj, 'x');

    transform.animate({ x: 5 }).then(() => {
      completed = true;
    });

    expect(completed).toBeFalsy();
    transform['update'](50);
    expect(completed).toBeFalsy();
    transform['update'](50);
    expect(completed).toBeFalsy();
    transform['update'](50);
    expect(completed).toBeFalsy();
    transform['update'](50);
    await Wait();
    expect(completed).toBeTruthy();
  });

  it('animate complete promise partial async', async () => {
    let completed1 = false;
    let completed2 = false;

    let obj = { x: 10, y: 40 };
    let transform = new Animator(obj, ['x', 'y']);

    transform.animate({ y: 10 }).then(() => {
      completed1 = true;
    });

    transform['update'](50);

    transform.animate({ x: 10 }).then(() => {
      completed2 = true;
    });
    transform['update'](50);
    transform['update'](50);
    await Wait();
    expect(completed1).toBeFalsy();
    expect(completed2).toBeFalsy();
    transform['update'](50);
    await Wait();
    expect(completed1).toBeTruthy();
    expect(completed2).toBeFalsy();
    transform['update'](50);
    await Wait();
    expect(completed1).toBeTruthy();
    expect(completed2).toBeTruthy();
  });

  it('animation complete promise with rapid triggering', async () => {
    let completeCount = 0;
    let obj = { x: 0 };
    let transform = new Animator(obj, 'x');

    transform.animate({ x: 5 }).then(() => {
      completeCount++;
    });

    expect(completeCount).toEqual(0);

    transform['update'](50);
    transform.animate({ x: 5 }).then(() => {
      completeCount++;
    });
    await Wait();
    expect(completeCount).toEqual(1);

    transform['update'](50);
    transform.animate({ x: 5 }).then(() => {
      completeCount++;
    });
    await Wait();
    expect(completeCount).toEqual(2);

    transform['update'](50);
    await Wait();
    expect(completeCount).toEqual(2);

    transform['update'](50);
    await Wait();
    expect(completeCount).toEqual(2);

    transform['update'](50);
    await Wait();
    expect(completeCount).toEqual(2);

    transform['update'](50);
    await Wait();
    expect(completeCount).toEqual(3);
  });

  it('animate getter/setter property', () => {
    class Foo {
      private _x = 10;
      get x() {
        return this._x;
      }
      set x(value: number) {
        this._x = value;
      }
    }

    let obj = new Foo();
    let transform = new Animator(obj, ['x']);
    transform.animate({ x: 10 });
    transform['update'](50);
    expect(obj.x).toEqual(11.25);
    transform['update'](50);
    expect(obj.x).toEqual(15);
    transform['update'](50);
    expect(obj.x).toEqual(18.75);
    transform['update'](50);
    expect(obj.x).toEqual(20);
  });

  it('constructor should throw error if target is not an object', () => {
    let obj = 'string';
    expect(() => {
      new Animator(obj, 'x');
    }).toThrow();
  });

  it('constructor should throw error if  target does not have all target properties', () => {
    let obj = { x: 1, y: 2, z: 3 };
    expect(() => {
      new Animator(obj, ['x', 't']);
    }).toThrow();
  });

  it('set values should throw error if non effected property tried to set', () => {
    let obj = { x: 0, y: 0 };
    let transform = new Animator(obj, 'x');
    expect(() => {
      transform.set({ x: 5, y: 5 });
    }).toThrow();
  });

  it('animate should throw error if non effected property tried to animate', () => {
    let obj = { x: 0, y: 0 };
    let transform = new Animator(obj, 'x');
    expect(() => {
      transform.animate({ x: 5, y: 5 });
    }).toThrow();
  });
});
