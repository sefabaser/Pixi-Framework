import { Variable } from 'actions-lib';
import { Wait } from 'helpers-lib';

import { EntityDecorator, Entity } from '../entity';
import { ViewDecorator, View } from '../view';
import { UpdateAction, HardReset } from '../../helpers/update-loop';

describe('ENTITY', () => {
  afterEach(async () => {
    await Wait();
    HardReset.trigger(undefined);
  });

  it('class names should be unique', () => {
    expect(() => {
      {
        @EntityDecorator()
        class Sample extends Entity {
          readonly str = new Variable<string>();
        }
      }

      {
        @EntityDecorator()
        class Sample extends Entity {
          readonly str = new Variable<string>();
        }
      }
    }).toThrow();
  });

  it('attach', async () => {
    let childDestroyed = false;

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {}

    @EntityDecorator()
    class Child extends Entity {
      destroy() {
        childDestroyed = true;
      }
    }

    let parent = new Parent();
    new Child().attach(parent);

    parent.destroy();
    expect(childDestroyed).toBeTruthy();
  });

  it(`attach to self should throw error`, () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    let sample = new Sample();
    expect(() => {
      sample.attach(sample);
    }).toThrow(`Entity cannot be attach to itself!`);
  });

  it(`defining multiple 'baseEntity' should throw error`, () => {
    expect(() => {
      @EntityDecorator({
        baseEntity: true
      })
      class Sample1 extends Entity {}

      @EntityDecorator({
        baseEntity: true
      })
      class Sample2 extends Entity {}
    }).toThrow(`EntityDecorator: there can be only one 'baseEntity' defined!`);
  });

  it(`creating multiple instances for 'baseEntity' should throw error`, () => {
    expect(() => {
      @EntityDecorator({
        baseEntity: true
      })
      class Sample extends Entity {}

      new Sample();
      new Sample();
    }).toThrow(`EntityDecorator: there can be only one 'baseEntity' instance!`);
  });

  it('lifecycle events', async () => {
    let callStack: string[] = [];

    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {
      constructor() {
        super();
        callStack.push('constructor');
      }

      init() {
        callStack.push('init');
      }

      update() {
        callStack.push('update');
      }

      destroy() {
        callStack.push('destroy');
      }
    }

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {
      constructor() {
        super();
        callStack.push('view constructor');
      }

      init() {
        callStack.push('view init');
      }

      update() {
        callStack.push('view update');
      }

      destroy() {
        callStack.push('view destroy');
      }
    }

    let sample = new Sample();
    await Wait(); // wait for views to be created
    await Wait(); // wait for init() function in views to be triggered

    UpdateAction.trigger({ time: 0, delta: 0 });
    UpdateAction.trigger({ time: 0, delta: 0 });

    sample.destroy();
    expect(callStack).toEqual([
      'constructor',
      'view constructor',
      'init',
      'view init',
      'update',
      'view update',
      'update',
      'view update',
      'view destroy',
      'destroy'
    ]);
  });

  it('decorator should not effect static variables', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {
      static test = 'test';
    }

    expect(Sample.test).toEqual('test');
  });
});
