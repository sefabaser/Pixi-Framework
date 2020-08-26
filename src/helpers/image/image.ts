import { FilterDefinition } from '../../../../filters/filters';
import { EntityBase } from '../../game-entities/entity-base';
import { Vec2 } from '../../../../common';

export class Image {
  readonly sprite: PIXI.Sprite;

  private filterDefinitions: FilterDefinition[];
  private colorMatrix!: PIXI.filters.ColorMatrixFilter;

  private _red: number = 1.0;
  private _green: number = 1.0;
  private _blue: number = 1.0;
  private _brightness: number = 1.0;

  constructor(sprite: PIXI.Sprite) {
    this.sprite = sprite;
    this.filterDefinitions = [];
    sprite.filters = [];
  }

  get position() {
    return { x: this.sprite.x, y: this.sprite.y };
  }
  set position(value: Vec2) {
    this.sprite.x = value.x;
    this.sprite.y = value.y;
  }

  get brightness() {
    return this._brightness;
  }
  set brightness(value: number) {
    this._brightness = value;
    this.refreshColorMatrix();
  }

  get red() {
    return this._red;
  }
  set red(value: number) {
    this._red = value;
    this.refreshColorMatrix();
  }

  get green() {
    return this._green;
  }
  set green(value: number) {
    this._green = value;
    this.refreshColorMatrix();
  }

  get blue() {
    return this._blue;
  }
  set blue(value: number) {
    this._blue = value;
    this.refreshColorMatrix();
  }

  activateColorFilter() {
    this.colorMatrix = new PIXI.filters.ColorMatrixFilter();
    this.addFilter({
      filter: this.colorMatrix,
      order: 0
    });
  }

  addFilter(filterDefinition: FilterDefinition) {
    if (!this.sprite.filters.includes(filterDefinition.filter)) {
      let index = this.filterDefinitions.findIndex(definition => definition.order >= filterDefinition.order);
      if (index >= 0) {
        this.filterDefinitions.splice(index, 0, filterDefinition);
        this.sprite.filters.splice(index, 0, filterDefinition.filter);
      } else {
        this.filterDefinitions.push(filterDefinition);
        this.sprite.filters.push(filterDefinition.filter);
      }
    }
  }

  removeFilter(filterDefinition: FilterDefinition) {
    if (this.sprite.filters) {
      this.filterDefinitions = this.filterDefinitions.filter(definition => definition !== filterDefinition);
      this.sprite.filters = this.sprite.filters.filter(currentFilter => currentFilter !== filterDefinition.filter);
    }
  }

  tint(tint: number) {
    this.sprite.tint = tint;
  }

  attach(parent: EntityBase) {
    // @ts-ignore
    parent.setAttachment(this);
    return this;
  }

  destroy() {
    this.filterDefinitions = [];
    this.sprite.destroy();
  }

  private refreshColorMatrix() {
    if (this.colorMatrix) {
      // prettier-ignore
      this.colorMatrix.matrix = [
        this._red, 0, 0, 0, (this._brightness - 1),
        0, this._green, 0, 0, (this._brightness - 1),
        0, 0, this._blue, 0, (this._brightness - 1),
        0, 0, 0, 1, 0
      ];
    } else {
      throw new Error(`Image: you cannot set 'brightness' without activating color filter!`);
    }
  }
}
