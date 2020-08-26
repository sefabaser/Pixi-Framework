import { Wait } from 'helpers-lib';

import { EntityDecorator, Entity } from '../entity';
import { Store } from '../store';
import { HardReset } from '../helpers/update-loop';
import { Service } from '../service';

describe('STORE', () => {
  afterEach(async () => {
    await Wait();
    HardReset.trigger(undefined);
  });

  it('entities should have ids', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    let sample = new Sample();
    expect(sample.id).toBeDefined();
  });

  it('entities ids should be unique', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class BaseEntity extends Entity {}
    let baseEntity = new BaseEntity();

    @EntityDecorator()
    class Sample extends Entity {}

    let sample1 = new Sample().attach(baseEntity);
    let sample2 = new Sample().attach(baseEntity);
    expect(sample1.id !== sample2.id).toBeTruthy();
  });

  it('get entity by id', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    let sample = new Sample();
    let store = Service.get(Store);

    expect(store.getEntityById(sample.id)).toEqual(sample);
  });

  it('destroyed entities also should be removed from store', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    let sample = new Sample();
    let store = Service.get(Store);

    expect(store.getEntityById(sample.id)).toBeDefined();
    sample.destroy();
    expect(store.getEntityById(sample.id)).toBeUndefined();
  });

  it('select single', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class Sample extends Entity {}

    let sample = new Sample();
    let store = Service.get(Store);

    expect(store.selectSingle(Sample)).toEqual(sample);
  });

  it('select entities', () => {
    @EntityDecorator({
      baseEntity: true
    })
    class BaseEntity extends Entity {}
    let baseEntity = new BaseEntity();

    @EntityDecorator()
    class Sample extends Entity {}

    let sample1 = new Sample().attach(baseEntity);
    let sample2 = new Sample().attach(baseEntity);

    let store = Service.get(Store);
    expect(store.selectEntities(Sample)).toEqual([sample1, sample2]);
  });
});
