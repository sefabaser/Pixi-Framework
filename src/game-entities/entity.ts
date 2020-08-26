import { ViewClassType, View } from './view';
import { UpdateAction, HardReset } from './helpers/update-loop';
import { Store } from './store';
import { EntityBase } from './entity-base';
import { Service } from './service';

export type EntityClassType = new (...args: any[]) => Entity;

export interface EntityDecoratorMeta {
  baseEntity?: boolean;
}

export function EntityDecorator(meta?: EntityDecoratorMeta) {
  return function (EntityClass: EntityClassType): any {
    if (meta?.baseEntity) {
      // @ts-ignore
      if (Entity.baseEntity) {
        throw new Error(`EntityDecorator: there can be only one 'baseEntity' defined!`);
      } else {
        // @ts-ignore
        Entity.baseEntity = EntityClass;
      }
    }

    // @ts-ignore
    Store.registerEntityClass(EntityClass, EntityClass.name);

    (<any>EntityClass).$meta = {
      type: 'entity'
    };
  };
}

export abstract class Entity extends EntityBase {
  private static viewRegistries: Map<EntityClassType, ViewClassType<any>[]> = new Map();
  private static baseEntity: EntityClassType | undefined;
  private static baseEntityInstanceIsCreated = false;

  private static registerView<T extends Object>(ViewClass: ViewClassType<T>, EntityClass: EntityClassType) {
    if (!Entity.viewRegistries.has(EntityClass)) {
      Entity.viewRegistries.set(EntityClass, []);
    }

    let relatedRegistries = Entity.viewRegistries.get(EntityClass);
    relatedRegistries && relatedRegistries.push(ViewClass);
  }

  private static hardReset() {
    Entity.baseEntity = undefined;
    Entity.baseEntityInstanceIsCreated = false;
    Entity.viewRegistries.clear();
  }

  readonly id: string = '';

  private views: View[] = [];
  private viewMap = new Map<ViewClassType<any>, View>();
  private attachIsCalled = false;
  private attachedParent?: EntityBase;

  constructor() {
    super();

    let baseEntity = Entity.baseEntity === this.constructor;
    if (baseEntity) {
      if (Entity.baseEntityInstanceIsCreated) {
        throw new Error(`EntityDecorator: there can be only one 'baseEntity' instance!`);
      } else {
        Entity.baseEntityInstanceIsCreated = true;
      }
    }

    // @ts-ignore
    Store.registerEntity(this, this.constructor.name);

    setTimeout(() => {
      if (!this.attachIsCalled && !baseEntity) {
        throw new Error(`EntityDecorator: entity is not attached to anything! Name: '${this.constructor.name}'`);
      }

      if (!this.destroyed) {
        let registeredViewClasses = Entity.viewRegistries.get(<EntityClassType>this.constructor);

        if (registeredViewClasses) {
          registeredViewClasses.forEach(ViewClass => {
            let resolvedViewArgs: any[] = (<any>Service).resolveParameters([this], (<any>ViewClass).$meta.paramtypes);
            let view = new ViewClass(this, ...resolvedViewArgs.slice(1));
            this.views.push(view);
            this.viewMap.set(ViewClass, view);
          });
        }

        this.init();
        setTimeout(() => {
          !this.destroyed && this.views.forEach(view => view.init());
        });
      }
    });

    let updateSubscription = UpdateAction.subscribe(updateData => {
      this.update && this.update(updateData.time, updateData.delta);
      this.views.forEach(view => view.update && view.update(updateData.time, updateData.delta));
    });

    let originalDestroy = this.destroy.bind(this);
    this.destroy = function () {
      if (!this.destroyed) {
        updateSubscription.unsubscribe();
        this.views.forEach(view => view.destroy && view.destroy());
        this.viewMap.clear();
        // @ts-ignore
        Store.unregisterEntity(this.constructor.name, this.id);

        if (this.attachedParent) {
          // @ts-ignore
          this.attachedParent.removeAttachment(this);
          this.attachedParent = undefined;
        }
        originalDestroy();
      }
    };
  }

  attach(parent: EntityBase): this {
    if (parent === this) {
      throw new Error(`Entity cannot be attach to itself! entity: '${this.constructor.name}'`);
    }

    this.attachIsCalled = true;
    if (!this.destroyed) {
      this.attachedParent = parent;
      // @ts-ignore
      parent.setAttachment(this);
    }
    return this;
  }

  getView<T extends View>(ViewClass: new (...args: any[]) => T): T {
    let display = this.viewMap.get(ViewClass);
    if (!display) {
      throw new Error(`Find view error: No '${ViewClass.name}' is defined for '${this.constructor.name}'`);
    }
    return <T>display;
  }
}

HardReset.subscribe((<any>Entity).hardReset.bind(Entity));
