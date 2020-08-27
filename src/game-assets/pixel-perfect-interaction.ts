import * as PIXI from 'pixi.js';

// TODO: use ImageDataHelper
PIXI.Sprite.prototype.containsPoint = function (point) {
  let tempPoint = new PIXI.Point();
  this.worldTransform.applyInverse(point, tempPoint);

  // @ts-ignore
  let width = this._texture.orig.width;
  // @ts-ignore
  let height = this._texture.orig.height;
  let x1 = -width * this.anchor.x;
  let y1 = 0;

  let flag = false;

  if (tempPoint.x >= x1 && tempPoint.x < x1 + width) {
    y1 = -height * this.anchor.y;
    if (tempPoint.y >= y1 && tempPoint.y < y1 + height) {
      flag = true;
    }
  }

  if (!flag) {
    return false;
  }

  // bitmap check
  let tex = this.texture;
  let baseTex = this.texture.baseTexture;
  let res = baseTex.resolution;

  // @ts-ignore
  if (!baseTex.hitmap) {
    return true;
  }

  // @ts-ignore
  let hitmap = baseTex.hitmap;
  // this does not account for rotation yet!!!
  let dx = Math.round((tempPoint.x - x1 + tex.frame.x) * res);
  let dy = Math.round((tempPoint.y - y1 + tex.frame.y) * res);
  let ind = dx + dy * baseTex.realWidth;
  let ind1 = ind % 32;
  // eslint-disable-next-line no-bitwise
  let ind2 = (ind / 32) | 0;
  // eslint-disable-next-line no-bitwise
  return (hitmap[ind2] & (1 << ind1)) !== 0;
};

// TODO: use ImageDataHelper
export function SetPixelPerfectIteraction(baseTex: PIXI.BaseTexture): boolean {
  if (!baseTex.resource) {
    return false;
  }
  // @ts-ignore
  let imgSource = baseTex.resource.source;
  // eslint-disable-next-line no-null/no-null
  let canvas = null;
  if (!imgSource) {
    return false;
  }
  // eslint-disable-next-line no-null/no-null
  let context = null;
  if (imgSource.getContext) {
    canvas = imgSource;
    context = canvas.getContext('2d');
  } else if (imgSource instanceof Image) {
    canvas = document.createElement('canvas');
    canvas.width = imgSource.width;
    canvas.height = imgSource.height;
    context = canvas.getContext('2d');
    context && context.drawImage(imgSource, 0, 0);
  } else {
    return false;
  }

  let w = canvas.width;
  let h = canvas.height;
  let imageData = context.getImageData(0, 0, w, h);
  // @ts-ignore
  let hitmap = (baseTex.hitmap = new Uint32Array(Math.ceil((w * h) / 32)));
  for (let i = 0; i < w * h; i++) {
    let ind1 = i % 32;
    // eslint-disable-next-line no-bitwise
    let ind2 = (i / 32) | 0;
    if (imageData.data[i * 4 + 3] >= 1) {
      // eslint-disable-next-line no-bitwise
      hitmap[ind2] = hitmap[ind2] | (1 << ind1);
    }
  }
  return true;
}
