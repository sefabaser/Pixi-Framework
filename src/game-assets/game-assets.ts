import { Comparator } from 'helpers-lib';

import { App } from '../../../../app';
import { SetPixelPerfectIteraction } from './pixel-perfect-interaction';
import { GroundMap } from './map-ground-image';
import { MapAssetMode } from '../../../../🏹definitions/general/general.model';

export interface AssetDefinition<T extends string = string> {
  name: string;
  source: T | Record<T, string>;
  pixelPerfectInteraction?: boolean;
  floorMap?: boolean;
}

class GameAssetsClass {
  private recources: Map<string, PIXI.LoaderResource | Record<string, PIXI.LoaderResource>> = new Map();

  getAsset(name: string, mode?: string): PIXI.LoaderResource {
    let resource = this.recources.get(name);
    if (resource instanceof PIXI.LoaderResource) {
      if (!mode) {
        return resource;
      } else {
        throw new Error(`Game Assets: Resource do not have mode! Key: '${name}'`);
      }
    } else if (Comparator.isObject(resource)) {
      if (mode && (<any>resource)[mode]) {
        return (<any>resource)[mode];
      } else {
        throw new Error(`Game Assets: Resource mode not located! Key: '${name}', mode: '${mode}'`);
      }
    } else {
      throw new Error(`Game Assets: Resource not found! Key: '${name}'`);
    }
  }

  hasMode(name: string, mode: string) {
    let resource = this.recources.get(name);
    return Comparator.isObject(resource) && !!(<any>resource)[mode];
  }

  loadGameAssets(assetDefinitions: AssetDefinition[], callback: () => void) {
    let sourceToKey = new Map<string, string>();
    let keyToGroup = new Map<string, string>();

    let load = (key: string, source: string) => {
      if (!source.startsWith('./')) {
        throw new Error(`GameAssets: source url should start with "./"! url: ${source}`);
      }

      let previouslyDefinedSourceKey = sourceToKey.get(source);
      if (previouslyDefinedSourceKey) {
        keyToGroup.set(key, previouslyDefinedSourceKey);
      } else {
        sourceToKey.set(source, key);
        App.loader.add(key, source);
      }
    };

    let get = (resources: Partial<Record<string, PIXI.LoaderResource>>, key: string) => {
      let group = keyToGroup.get(key) || key;
      return resources[group];
    };

    assetDefinitions.forEach(definition => {
      if (Comparator.isString(definition.source)) {
        load(definition.name, <string>definition.source);
      } else if (Comparator.isObject(definition.source)) {
        let source = <{ [key: string]: string }>definition.source;
        Object.keys(source).forEach(key => {
          load(`${definition.name}#${key}`, source[key]);
        });
      }
    });

    let handleTextureType = (baseTexture: PIXI.BaseTexture, definition: AssetDefinition) => {
      if (definition.pixelPerfectInteraction) {
        SetPixelPerfectIteraction(baseTexture);
      } else if (definition.floorMap) {
        GroundMap.processMapGroundImage(definition.name, baseTexture);
      }
    };

    App.loader.load((loader, resources) => {
      assetDefinitions.forEach(definition => {
        if (Comparator.isString(definition.source)) {
          let resource = get(resources, definition.name);
          if (resource) {
            if (resource.texture) {
              if (definition.pixelPerfectInteraction) {
                SetPixelPerfectIteraction(resource.texture.baseTexture);
              } else if (definition.floorMap) {
                GroundMap.processMapGroundImage(definition.name, resource.texture.baseTexture);
              }
            }

            resource.texture && handleTextureType(resource.texture.baseTexture, definition);
            this.recources.set(definition.name, resource);
          }
        } else if (Comparator.isObject(definition.source)) {
          let source = <{ [key: string]: string }>definition.source;
          let resourceObject: Record<string, PIXI.LoaderResource> = {};

          Object.keys(source).forEach(key => {
            let resource = get(resources, `${definition.name}#${key}`);
            if (resource) {
              if (resource.texture) {
                if (definition.pixelPerfectInteraction) {
                  SetPixelPerfectIteraction(resource.texture.baseTexture);
                } else if (definition.floorMap && key === MapAssetMode.ground) {
                  GroundMap.processMapGroundImage(definition.name, resource.texture.baseTexture);
                }
              }

              resourceObject[key] = resource;
            }
          });
          this.recources.set(definition.name, resourceObject);
        }
      });
      callback();
    });
  }
}

export const GameAssets = new GameAssetsClass();
