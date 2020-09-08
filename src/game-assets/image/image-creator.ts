import { GameAssets } from '../game-assets';
import { Image } from './image';
import { CanBeParent, FilterDefinition } from '../../_interfaces';
import { Vec2 } from '../../lib/vector/vector';

export class ImageCreator {
  private sprite: PIXI.Sprite;
  private image: Image;

  constructor(imageName: string, mode?: string) {
    this.sprite = new PIXI.Sprite(GameAssets.getAsset(imageName, mode)?.texture);
    this.image = new Image(this.sprite);
  }

  parent(target: CanBeParent): ImageCreator {
    target.addChild(this.sprite);
    return this;
  }

  position(pos: Vec2): ImageCreator {
    this.sprite.x = pos.x;
    this.sprite.y = pos.y;
    return this;
  }

  zIndex(value: number): ImageCreator {
    this.sprite.zIndex = value;
    return this;
  }

  scale(value: number): ImageCreator {
    this.sprite.scale = new PIXI.Point(value, value);
    return this;
  }

  alpha(value: number): ImageCreator {
    this.sprite.alpha = value;
    return this;
  }

  anchor(pos: Vec2): ImageCreator {
    this.sprite.anchor.x = pos.x;
    this.sprite.anchor.y = pos.y;
    return this;
  }

  mirror(mirror: boolean = false): ImageCreator {
    if (mirror) {
      this.sprite.scale.x *= -1;
    }
    return this;
  }

  filter(filterDefinition?: FilterDefinition): ImageCreator {
    filterDefinition && this.image.addFilter(filterDefinition);
    return this;
  }

  interactive(): ImageCreator {
    this.sprite.interactive = true;
    return this;
  }

  pointer(): ImageCreator {
    this.sprite.cursor = 'pointer';
    return this;
  }

  on(event: string, callback: (event: PIXI.InteractionEvent) => void): ImageCreator {
    this.sprite.on(event, callback);
    return this;
  }

  activateColorFilter(): ImageCreator {
    this.image.activateColorFilter();
    return this;
  }

  getImage(): Image {
    return this.image;
  }
}
