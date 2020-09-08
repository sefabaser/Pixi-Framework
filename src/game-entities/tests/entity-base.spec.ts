import { Wait } from 'helpers-lib';
import { Variable } from 'actions-lib';

import { EntityDecorator, Entity } from '../entity';
import { HardReset } from '../../helpers/update-loop';
import { Destroyable } from '../../_interfaces';

describe('ENTITY BASE', () => {
  afterEach(async () => {
    await Wait();
    HardReset.trigger(undefined);
  });

  it('destroyable', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    class Foo implements Destroyable {
      destroyed = false;
      destroy() {
        this.destroyed = true;
      }
    }

    let sample = new Sample();
    let foo = new Foo();
    // @ts-ignore
    sample.setAttachment(foo);

    sample.destroy();
    expect(foo.destroyed).toBeTruthy();
  });

  it('destroyable, delayed', async () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    class Foo implements Destroyable {
      destroyed = false;
      destroy() {
        this.destroyed = true;
      }
    }

    let sample = new Sample();
    let foo = new Foo();
    // @ts-ignore
    sample.setAttachment(foo);

    await Wait();
    sample.destroy();
    expect(foo.destroyed).toBeTruthy();
  });

  it('subscription', async () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    let foo = new Variable<number>();
    let sample = new Sample();

    expect(foo.listenerCount).toEqual(0);
    foo.subscribe(() => {}).attach(sample);
    expect(foo.listenerCount).toEqual(1);
    sample.destroy();

    await Wait();
    expect(foo.listenerCount).toEqual(0);
  });

  it('entity attachment in constructor', async () => {
    let childDestoyIsCalled = false;

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {
      constructor() {
        super();
        new Child().attach(this);
      }
    }

    @EntityDecorator()
    class Child extends Entity {
      destroy() {
        childDestoyIsCalled = true;
      }
    }

    let parent = new Parent();
    await Wait();
    parent.destroy();

    expect(childDestoyIsCalled).toBeTruthy();
  });
});
