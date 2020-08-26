import { JsonHelper } from 'helpers-lib';

import { EntityBase } from '../../game-entities/entity-base';
import { Destroyable } from '../../_interfaces';

export class ViewArrayBase<ItemType, DefinitionType> {
  items: { item: ItemType; definition: DefinitionType }[] = [];

  protected destroyed = false;
  protected trackByPath: string = '';

  private attachIsCalled = false;

  constructor(
    private createFunction: (definition: DefinitionType, index: number) => ItemType,
    private updateFunction: (item: ItemType, definition: DefinitionType, index: number) => void,
    private destroyFunction: (item: ItemType, definition: DefinitionType, index: number) => void
  ) {
    setTimeout(() => {
      if (!this.attachIsCalled) {
        throw new Error(`EntityDecorator: entity is not attached to anything! Name: '${this.constructor.name}'`);
      }
    });
  }

  set(definitions: DefinitionType[]): void {
    if (this.destroyed) {
      throw new Error(`ViewArrayBase: set operation attempt after destruction!`);
    }

    definitions.forEach((definition, index) => {
      if (
        this.items[index] &&
        JsonHelper.deepFind(this.items[index].definition, this.trackByPath) === JsonHelper.deepFind(definition, this.trackByPath)
      ) {
        this.updateFunction(this.items[index].item, definition, index);
      } else {
        let item = this.createFunction(definition, index);
        this.items[index] && this.destroyFunction(this.items[index].item, this.items[index].definition, index);
        this.items[index] = { definition, item };
      }
    });

    while (this.items.length > definitions.length) {
      let element = this.items.pop();
      let index = this.items.length;
      element && this.destroyFunction(element.item, element.definition, index);
    }
  }

  trackBy(path: string): ViewArrayBase<ItemType, DefinitionType> {
    this.trackByPath = path;
    return this;
  }

  attach(parent: EntityBase): ViewArrayBase<ItemType, DefinitionType> {
    // @ts-ignore
    parent.setAttachment(this);
    this.attachIsCalled = true;
    return this;
  }

  destroy(): void {
    this.set([]);
    this.destroyed = true;
  }
}

export class ViewArray<DefinitionType> extends ViewArrayBase<Destroyable, DefinitionType> {
  private controllerClassName: string;

  constructor(
    ControllerClass: new (definition: DefinitionType, index: number, ...args: any[]) => ViewArrayController<DefinitionType>,
    ...args: any[]
  ) {
    let createF = (definition: DefinitionType, index: number) => new ControllerClass(definition, index, ...args);
    let updateF = (item: ViewArrayController<DefinitionType>, definition: DefinitionType, index: number) => {
      item.update(definition, index);
    };
    let destroyF = (item: ViewArrayController<DefinitionType>, definition: DefinitionType, index: number) => {
      item.destroy(definition, index);
    };

    super(createF, updateF, destroyF);

    this.controllerClassName = ControllerClass.name;
  }

  set(definitions: DefinitionType[]): void {
    if (this.destroyed) {
      throw new Error(`ViewArray: set operation attempt after destruction! controller: '${this.controllerClassName}'`);
    }

    super.set(definitions);
  }
}

export abstract class ViewArrayController<DefinitionType> implements Destroyable {
  abstract update(definition: DefinitionType, index: number): void;
  abstract destroy(definition: DefinitionType, index: number): void;
}
