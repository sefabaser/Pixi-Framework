import { GameAssets } from '../../game-assets/game-assets';
import { FilterDefinition } from '../../../../filters/filters';
import { Image } from './image';
import { CanBeParent } from '../destroyable-interface';
import { Vec2 } from '../../../../common/vector/vector';

export class ImageCreator {
  private sprite: PIXI.Sprite;
  private image: Image;

  constructor(imageName: string, mode?: string) {
    this.sprite = new PIXI.Sprite(GameAssets.getAsset(imageName, mode)?.texture);
    this.image = new Image(this.sprite);
  }

  parent(target: CanBeParent) {
    target.addChild(this.sprite);
    return this;
  }

  position(pos: Vec2) {
    this.sprite.x = pos.x;
    this.sprite.y = pos.y;
    return this;
  }

  zIndex(value: number) {
    this.sprite.zIndex = value;
    return this;
  }

  scale(value: number) {
    this.sprite.scale = new PIXI.Point(value, value);
    return this;
  }

  alpha(value: number) {
    this.sprite.alpha = value;
    return this;
  }

  anchor(pos: Vec2) {
    this.sprite.anchor.x = pos.x;
    this.sprite.anchor.y = pos.y;
    return this;
  }

  mirror(mirror: boolean = false) {
    if (mirror) {
      this.sprite.scale.x *= -1;
    }
    return this;
  }

  filter(filterDefinition?: FilterDefinition) {
    filterDefinition && this.image.addFilter(filterDefinition);
    return this;
  }

  interactive() {
    this.sprite.interactive = true;
    return this;
  }

  pointer() {
    this.sprite.cursor = 'pointer';
    return this;
  }

  on(event: string, callback: (event: PIXI.InteractionEvent) => void) {
    this.sprite.on(event, callback);
    return this;
  }

  activateColorFilter() {
    this.image.activateColorFilter();
    return this;
  }

  getImage() {
    return this.image;
  }
}
