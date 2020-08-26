import { Wait } from 'helpers-lib';

import { EntityDecorator, Entity } from '../entity';
import { ViewDecorator, View } from '../view';
import { HardReset, UpdateTick } from '../../helpers/update-loop';

describe('VIEW', () => {
  afterEach(async () => {
    await Wait();
    HardReset.trigger(undefined);
  });

  it('entity creation should create related view', async () => {
    let viewInstance: SampleView | undefined;

    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {
      constructor() {
        super();
        viewInstance = this;
      }
    }

    new Sample();
    await Wait();
    expect(viewInstance).toBeDefined();
  });

  it('view should not be created if entity destroyed immidiately', async () => {
    let viewInstance: SampleView | undefined;

    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {
      constructor() {
        super();
        viewInstance = this;
      }
    }

    expect(viewInstance).toBeUndefined();

    let entity = new Sample();
    expect(entity).toBeDefined();
    entity.destroy();

    await Wait();
    expect(viewInstance).toBeUndefined();
  });

  it('entities should not destroy each others views on destroy', async () => {
    let viewInstanceCount = 0;

    @EntityDecorator({
      baseEntity: true
    })
    class BaseEntity extends Entity {}
    let baseEntity = new BaseEntity();

    @EntityDecorator()
    class Sample extends Entity {}

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {
      constructor() {
        super();
        viewInstanceCount++;
      }

      destroy() {
        viewInstanceCount--;
      }
    }

    let entity1 = new Sample().attach(baseEntity);
    let entity2 = new Sample().attach(baseEntity);
    await Wait();

    expect(viewInstanceCount).toEqual(2);
    entity1.destroy();
    expect(viewInstanceCount).toEqual(1);
    entity2.destroy();
    expect(viewInstanceCount).toEqual(0);
  });

  it('entity destruction should destroy related views', async () => {
    let viewDestroyCount = 0;

    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {
      destroy() {
        viewDestroyCount++;
      }
    }

    let entity = new Sample();
    await Wait();

    entity.destroy();
    expect(viewDestroyCount).toEqual(1);
  });

  it('triggering destroy() multiple times should not take effect multiply', async () => {
    let viewDestroyCount = 0;

    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {
      destroy() {
        viewDestroyCount++;
      }
    }

    let entity = new Sample();
    await Wait();

    entity.destroy();
    entity.destroy();
    expect(viewDestroyCount).toEqual(1);
  });

  it(`find view`, async () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {}

    let entity = new Sample();
    await Wait();

    expect(entity.getView(SampleView)).toBeDefined();
  });

  it(`find view should throw error if no view is defined for the entity`, async () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    let entity = new Sample();
    await Wait();

    expect(() => entity.getView(<any>{ original: { name: 'Fake View' } })).toThrow();
  });

  it('update tick should update view', async () => {
    let viewUpdateCount = 0;

    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    @ViewDecorator({ entity: Sample })
    class SampleView extends View {
      update() {
        viewUpdateCount++;
      }
    }

    new Sample();

    await Wait();

    expect(viewUpdateCount).toEqual(0);
    UpdateTick(0);
    expect(viewUpdateCount).toEqual(1);
    UpdateTick(0);
    expect(viewUpdateCount).toEqual(2);
  });

  it('race condition between views, views should be available after init', async () => {
    let found = false;

    @EntityDecorator({
      baseEntity: true
    })
    class BaseEntity extends Entity {}
    let baseEntity = new BaseEntity();

    @EntityDecorator()
    class Sample1 extends Entity {}

    @EntityDecorator()
    class Sample2 extends Entity {}

    new Sample1().attach(baseEntity);
    let sample2 = new Sample2().attach(baseEntity);

    @ViewDecorator({ entity: Sample1 })
    class SampleView1 extends View {
      init() {
        try {
          found = !!sample2.getView(SampleView2);
        } catch (e) {}
      }
    }

    @ViewDecorator({ entity: Sample2 })
    class SampleView2 extends View {}

    await Wait(); // wait for views to be created
    await Wait(); // wait for init() function in views to be triggered
    UpdateTick(0);

    expect(found).toBeTruthy();
  });

  it('decorator should not effect static variables', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class BaseEntity extends Entity {}

    @ViewDecorator({ entity: BaseEntity })
    class SampleView extends View {
      static test = 'test';
    }

    expect(SampleView.test).toEqual('test');
  });
});
