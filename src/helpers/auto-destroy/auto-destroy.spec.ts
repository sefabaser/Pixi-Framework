import { Wait } from 'helpers-lib';
import { Variable } from 'actions-lib';

import { AutoDestroy } from './auto-destroy';
import { Entity, EntityDecorator } from '../../game-entities/entity';
import { HardReset } from '../update-loop';

describe('AUTO DESTROY', () => {
  it('destroy function for the variable should be called on destroy', () => {
    let destroyIsCalled = false;

    class TestClass {
      @AutoDestroy() testVariable = {
        destroy: () => {
          destroyIsCalled = true;
        }
      };
      destroy() {}
    }

    let testObject = new TestClass();
    testObject.destroy();

    expect(destroyIsCalled).toBeTruthy();
  });

  it('unsubscribe function for the variable should be called on destroy', () => {
    let unsubscribeIsCalled = false;

    class TestClass {
      @AutoDestroy() testVariable = {
        unsubscribe: () => {
          unsubscribeIsCalled = true;
        }
      };
      destroy() {}
    }

    let testObject = new TestClass();
    testObject.destroy();

    expect(unsubscribeIsCalled).toBeTruthy();
  });

  it('if the decorated property is array, all destroy functions should be called inside', () => {
    let destroyIsCalled = false;
    let unsubscribeIsCalled = false;

    class TestClass {
      @AutoDestroy() testVariable = [
        {
          destroy: () => {
            destroyIsCalled = true;
          }
        },
        {
          unsubscribe: () => {
            unsubscribeIsCalled = true;
          }
        }
      ];
      destroy() {}
    }

    let testObject = new TestClass();
    testObject.destroy();

    expect(destroyIsCalled && unsubscribeIsCalled).toBeTruthy();
  });

  it('all destroy functions should be called reccursively for nested arrays', () => {
    let destroyIsCalled = false;
    let unsubscribeIsCalled = false;

    class TestClass {
      @AutoDestroy() testVariable = [
        [
          {
            destroy: () => {
              destroyIsCalled = true;
            }
          },
          [
            {
              unsubscribe: () => {
                unsubscribeIsCalled = true;
              }
            }
          ]
        ]
      ];
      destroy() {}
    }

    let testObject = new TestClass();
    testObject.destroy();

    expect(destroyIsCalled && unsubscribeIsCalled).toBeTruthy();
  });

  it(`should support 'Variable'`, () => {
    let destroyed = false;

    class TestClass1 {
      destroy() {
        destroyed = true;
      }
    }

    class TestClass2 {
      @AutoDestroy() var = new Variable<TestClass1>();
      destroy() {}
    }

    let testObject1 = new TestClass1();
    let testObject2 = new TestClass2();
    testObject2.var.value = testObject1;

    testObject2.destroy();

    expect(destroyed).toBeTruthy();
  });

  it('should throw error if decorated property is not expected type', () => {
    expect(() => {
      class TestClass {
        @AutoDestroy() testVariable = 0;
        destroy() {}
      }

      let testObject = new TestClass();
      testObject.destroy();
    }).toThrow();
  });

  it('should throw error if decorated property is array and containes not expected type', () => {
    expect(() => {
      class TestClass {
        @AutoDestroy() testVariable = [0];
        destroy() {}
      }

      let testObject = new TestClass();
      testObject.destroy();
    }).toThrow();
  });
});

describe('Auto Destroy - Framework Entities', () => {
  afterEach(async () => {
    await Wait();
    HardReset.trigger(undefined);
  });

  it('auto destroy', () => {
    let variable = new Variable<string>();

    abstract class ParentEntity extends Entity {
      @AutoDestroy()
      readonly parentSubscription = variable.subscribe(() => {});
    }

    @EntityDecorator({
      baseEntity: true
    })
    class ChildEntity extends ParentEntity {
      @AutoDestroy()
      readonly childSubscription = variable.subscribe(() => {});
    }

    let child = new ChildEntity();
    expect(variable.listenerCount).toEqual(2);

    child.destroy();

    expect(variable.listenerCount).toEqual(0);
  });
});
