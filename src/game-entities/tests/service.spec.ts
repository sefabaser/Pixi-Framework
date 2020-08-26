import { Wait } from 'helpers-lib';

import { EntityDecorator, Entity } from '../entity';
import { ServiceDecorator, Service, Inject } from '../service';
import { ViewDecorator, View } from '../view';
import { HardReset } from '../helpers/update-loop';

describe('SERVICE', () => {
  afterEach(async () => {
    await Wait();
    HardReset.trigger(undefined);
  });

  it('inject services to entities', () => {
    let serviceInstance: SampleService | undefined;

    @ServiceDecorator()
    class SampleService extends Service {
      constructor() {
        super();
        serviceInstance = this;
      }
    }

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {
      @Inject() public service!: SampleService;
    }

    let parent = new Parent();

    expect(serviceInstance).toBeDefined();
    expect(parent.service).toEqual(serviceInstance);
  });

  it('mock service should be injectable to entities', () => {
    @ServiceDecorator()
    class SampleService extends Service {}

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {
      @Inject() public service!: SampleService;
    }

    Parent.prototype.service = <any>'mock';

    let parent = new Parent();
    expect(parent.service).toEqual('mock');
  });

  it('mock service should reverted to original after HardReset', () => {
    let serviceInstance: SampleService | undefined;

    @ServiceDecorator()
    class SampleService extends Service {
      constructor() {
        super();
        serviceInstance = this;
      }
    }

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {}
    let parent = new Parent();

    @EntityDecorator()
    class Child extends Entity {
      @Inject() public service!: SampleService;
    }

    Child.prototype.service = <any>'mock';

    let child1 = new Child().attach(parent);
    expect(child1.service).toEqual('mock');

    HardReset.trigger(undefined);

    let child2 = new Child().attach(parent);
    expect(child2.service).toEqual(serviceInstance);
  });

  it('inject services to views', async () => {
    let serviceInstance: SampleService | undefined;
    let viewInstance: SampleView | undefined;

    @ServiceDecorator()
    class SampleService extends Service {
      constructor() {
        super();
        serviceInstance = this;
      }
    }

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {}

    @ViewDecorator({ entity: Parent })
    class SampleView extends View {
      constructor(public entity: Parent, public service: SampleService) {
        super();
        viewInstance = this;
      }
    }

    new Parent();

    await Wait();

    expect(serviceInstance).toBeDefined();
    expect(viewInstance?.service).toEqual(serviceInstance);
  });

  it.only('inject decorator should throw error on views', async () => {
    @ServiceDecorator()
    class SampleService extends Service {}

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {}

    expect(() => {
      @ViewDecorator({ entity: Parent })
      class SampleView extends View {
        @Inject() service!: SampleService;
      }
    }).toThrow('something');
  });

  it('inject other services to services', () => {
    let service1Instance: SampleService1 | undefined;
    let service2Instance: SampleService2 | undefined;

    @ServiceDecorator()
    class SampleService1 extends Service {
      constructor() {
        super();
        service1Instance = this;
      }
    }

    @ServiceDecorator()
    class SampleService2 extends Service {
      constructor(public service1: SampleService1) {
        super();
        service2Instance = this;
      }
    }

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {
      @Inject() public service2!: SampleService2;
    }

    let parent = new Parent();
    expect(service1Instance).toBeDefined();
    expect(service2Instance).toBeDefined();
    expect(parent.service2).toEqual(service2Instance);
    expect(service2Instance?.service1).toEqual(service1Instance);
  });

  it.only('inject decorator should throw error on services', () => {
    @ServiceDecorator()
    class SampleService1 extends Service {}

    expect(() => {
      @ServiceDecorator()
      class SampleService2 extends Service {
        @Inject() service!: SampleService1;
      }
    }).toThrow('something');
  });

  it('services should be singleton', () => {
    let service1InstanceCount = 0;
    let service2InstanceCount = 0;
    let service3InstanceCount = 0;

    @ServiceDecorator()
    class SampleService1 extends Service {
      constructor() {
        super();
        service1InstanceCount++;
      }
    }

    @ServiceDecorator()
    class SampleService2 extends Service {
      constructor(public service1: SampleService1) {
        super();
        service2InstanceCount++;
      }
    }

    @ServiceDecorator()
    class SampleService3 extends Service {
      constructor(public service1: SampleService1) {
        super();
        service3InstanceCount++;
      }
    }

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {
      @Inject() public service2!: SampleService2;
      @Inject() public service3!: SampleService3;
    }

    let parent = new Parent();
    expect(service1InstanceCount).toEqual(1);
    expect(service2InstanceCount).toEqual(1);
    expect(service3InstanceCount).toEqual(1);
    expect(parent.service2?.service1).toBeDefined();
    expect(parent.service2?.service1).toEqual(parent.service3?.service1);
  });

  it('services should be lazy initiated', () => {
    let serviceInstance: SampleService | undefined;

    @ServiceDecorator()
    class SampleService extends Service {
      constructor() {
        super();
        serviceInstance = this;
      }
    }

    expect(serviceInstance).not.toBeDefined();

    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {
      @Inject() public service!: SampleService;
    }

    expect(serviceInstance).toBeDefined();

    let parent = new Parent();
    expect(parent.service).toEqual(serviceInstance);
  });

  it('resolve parameters should pass known parameters with falsly values', () => {
    let receivedArgs: any[] = [];
    @EntityDecorator({
      baseEntity: true
    })
    class Parent extends Entity {
      constructor(...args: any[]) {
        super();
        receivedArgs = args;
      }
    }

    new Parent(0, undefined, false, '');
    expect(receivedArgs[0]).toStrictEqual(0);
    expect(receivedArgs[1]).toStrictEqual(undefined);
    expect(receivedArgs[2]).toStrictEqual(false);
    expect(receivedArgs[3]).toStrictEqual('');
  });

  it('decorator should not effect static variables', () => {
    @ServiceDecorator()
    class SampleService extends Service {
      static test = 'test';
    }

    expect(SampleService.test).toEqual('test');
  });
});
