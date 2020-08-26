import { Entity } from './entity';
import { EntityBase } from './entity-base';
import { Service } from './service';

export type ViewClassType<EntityType> = new (entity: EntityType, ...services: any[]) => View;

export interface ViewDecoratorMeta<EntityType> {
  entity: new (...args: any[]) => EntityType;
}

export function ViewDecorator<EntityType extends Entity>(meta: ViewDecoratorMeta<EntityType>) {
  return function (ViewClass: ViewClassType<EntityType>): any {
    // @ts-ignore
    Entity.registerView(ViewClass, meta.entity);

    (<any>ViewClass).$meta = {
      paramtypes: Service.getParametersMeta(ViewClass),
      type: 'view'
    };
  };
}

export abstract class View extends EntityBase {}
