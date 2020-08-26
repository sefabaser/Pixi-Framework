import { ImageDataHelper } from './image-data.helper';
import { Vec2 } from '../../../common';

export enum MapGroundType {
  normal = 'normal',
  difficult = 'difficult',
  notReachable = 'notReachable'
}

export class GroundMap {
  private static groundMapHelperMap = new Map<string, ImageDataHelper>();

  static processMapGroundImage(assetName: string, baseTex: PIXI.BaseTexture) {
    let helper = new ImageDataHelper(baseTex);
    this.groundMapHelperMap.set(assetName, helper);
  }

  static getInstance(assetName: string): GroundMap {
    let helper = this.groundMapHelperMap.get(assetName);
    if (!helper) {
      throw new Error(`GroundMap: No 'ground map' asset definition is defined for: '${assetName}'`);
    }
    return new GroundMap(helper);
  }

  private helper: ImageDataHelper;
  constructor(helper: ImageDataHelper) {
    this.helper = helper;
  }

  getGroundType(position: Vec2): MapGroundType {
    let pixel = this.helper.getPixel(position);
    if (pixel.r < 5) {
      return MapGroundType.normal;
    } else if (pixel.r > 250) {
      return MapGroundType.notReachable;
    } else {
      return MapGroundType.difficult;
    }
  }
}
