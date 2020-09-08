import { Entity, EntityClassType } from './entity';
import { Service, ServiceDecorator } from './service';
import { HardReset } from '../helpers/update-loop';

@ServiceDecorator()
export class Store extends Service {
  private static nextAvailableIds = new Map<string, number>();
  private static entityClasses = new Map<string, EntityClassType>();
  private static entities = new Map<string, Map<number, Entity>>();

  private static registerEntityClass(entityClass: EntityClassType, className: string) {
    if (this.entityClasses.has(className)) {
      throw new Error(`Entity class names should be unique! This entity name is already taken. name: '${className}'`);
    } else {
      this.entityClasses.set(className, entityClass);
    }
  }

  private static registerEntity(entity: Entity, entityClassName: string) {
    let id = this.nextAvailableIds.get(entityClassName) || 1;
    this.nextAvailableIds.set(entityClassName, id + 1);
    // @ts-ignore
    entity.id = this.createEntityId(entityClassName, id);

    let idToEntityMap = this.entities.get(entityClassName);
    if (!idToEntityMap) {
      idToEntityMap = new Map<number, Entity>();
      this.entities.set(entityClassName, idToEntityMap);
    }
    idToEntityMap.set(id, entity);
  }

  private static unregisterEntity(entityClassName: string, entityId: string) {
    let { id } = this.parseEntityId(entityId);
    this.entities.get(entityClassName)?.delete(id);
  }

  private static createEntityId(className: string, id: number) {
    return `${className}:${id}`;
  }

  private static parseEntityId(entityId: string) {
    let [className, id] = entityId.split(':');
    return { className, id: +id };
  }

  getEntityById<T extends Entity>(entityId: string): T | undefined {
    let { className, id } = Store.parseEntityId(entityId);
    return <T>Store.entities.get(className)?.get(id);
  }

  selectSingle<T extends Entity>(EntityClass: new (...args: any[]) => T): T {
    let className = (<any>EntityClass).name;
    let entityMap = Store.entities.get(className);
    let entities = entityMap ? Array.from(entityMap.values()) : [];
    if (entities.length === 1) {
      return <T>entities.pop();
    } else if (entities.length > 1) {
      throw new Error(`Store: There is more than one entity have found for selectSingle! entity: '${className}'`);
    } else {
      throw new Error(`Store: There is no entity have found for selectSingle! entity: '${className}'`);
    }
  }

  selectEntities<T extends Entity>(EntityClass: new (...args: any[]) => T): T[] {
    let className = (<any>EntityClass).name;
    let entityMap = Store.entities.get(className);
    let entities = entityMap ? Array.from(entityMap.values()) : [];
    return <T[]>entities;
  }
}

HardReset.subscribe(() => {
  let store = <any>Store;
  store.entityClasses.clear();
  store.nextAvailableIds.clear();
  store.entities.forEach((idToEntityMap: Map<number, Entity>) => {
    idToEntityMap.forEach(entity => {
      entity.destroy();
    });
  });
  store.entities.clear();
});
