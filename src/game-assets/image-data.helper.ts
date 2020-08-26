import { Image } from '../helpers/image/image';
import { Vec2 } from '../lib/vector/vector';

export interface Pixel {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class ImageDataHelper {
  size: Vec2;

  private imageData: Uint8ClampedArray;

  constructor(baseTex: PIXI.BaseTexture) {
    let imgSource: any = (<any>baseTex.resource)?.source;
    if (!imgSource) {
      throw new Error(`ImageDataHelper: No 'resource.source' in BaseTexture!`);
    }

    this.size = { x: imgSource.width, y: imgSource.height };

    let context: CanvasRenderingContext2D | undefined;
    if (imgSource.getContext) {
      context = imgSource.getContext('2d');
    } else if (imgSource instanceof Image) {
      let canvas = document.createElement('canvas');
      canvas.width = this.size.x;
      canvas.height = this.size.y;
      context = canvas.getContext('2d') || undefined;
      context && context.drawImage(<any>imgSource, 0, 0);
    } else {
      throw new Error(`ImageDataHelper: No 'context' extracted from BaseTexture!`);
    }

    let imageData = context?.getImageData(0, 0, this.size.x, this.size.y).data;
    if (!imageData) {
      throw new Error(`ImageDataHelper: No 'imageData' extracted from BaseTexture!`);
    } else if (imageData.length % 4 !== 0 || imageData.length / 4 !== this.size.x * this.size.y) {
      throw new Error(`ImageDataHelper: Unexpected structore of 'imageData'!`);
    }

    this.imageData = imageData;
  }

  getPixel(position: Vec2): Pixel {
    let offset = (position.x + position.y * this.size.x) * 4;
    return {
      r: this.imageData[offset],
      g: this.imageData[offset + 1],
      b: this.imageData[offset + 2],
      a: this.imageData[offset + 3]
    };
  }
}
