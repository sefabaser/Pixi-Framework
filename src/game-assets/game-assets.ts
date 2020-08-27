import { Comparator } from 'helpers-lib';

import { SetPixelPerfectIteraction } from './pixel-perfect-interaction';
import { Game } from '../app';
import { ImageDataHelper } from './image-data.helper';

export interface AssetDefinition<T extends string = string> {
  name: string;
  source: T | Record<T, string>;
  pixelPerfectInteraction?: boolean;
  pixelAccess?: boolean | string[];
}

class GameAssetsClass {
  private recources: Map<string, PIXI.LoaderResource | Record<string, PIXI.LoaderResource>> = new Map();

  getAsset(name: string, mode?: string): PIXI.LoaderResource {
    let resource = this.recources.get(name);
    if (resource && !mode) {
      return <PIXI.LoaderResource>resource;
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

  loadGameAssets(assetDefinitions: AssetDefinition[]): Promise<void> {
    return new Promise(resolve => {
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
          Game.instance.app.loader.add(key, source);
        }
      };

      let getResource = (resources: Partial<Record<string, PIXI.LoaderResource>>, key: string) => {
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

      Game.instance.app.loader.load((loader, resources) => {
        assetDefinitions.forEach(definition => {
          if (Comparator.isString(definition.source)) {
            let resource = getResource(resources, definition.name);
            if (resource) {
              if (resource.texture) {
                if (definition.pixelPerfectInteraction) {
                  SetPixelPerfectIteraction(resource.texture.baseTexture);
                }
                if (definition.pixelAccess) {
                  (<any>ImageDataHelper).registerImage(definition.name, resource.texture.baseTexture);
                }
              }

              this.recources.set(definition.name, resource);
            }
          } else if (Comparator.isObject(definition.source)) {
            let source = <{ [key: string]: string }>definition.source;
            let resourceObject: Record<string, PIXI.LoaderResource> = {};

            Object.keys(source).forEach(key => {
              let resource = getResource(resources, `${definition.name}#${key}`);
              if (resource) {
                if (resource.texture) {
                  if (definition.pixelPerfectInteraction) {
                    SetPixelPerfectIteraction(resource.texture.baseTexture);
                  }
                  if (
                    (Comparator.isArray(definition.pixelAccess) && (<string[]>definition.pixelAccess).indexOf(key) !== -1) ||
                    definition.pixelAccess === true
                  ) {
                    (<any>ImageDataHelper).registerImage(definition.name, resource.texture.baseTexture);
                  }
                }

                resourceObject[key] = resource;
              }
            });
            this.recources.set(definition.name, resourceObject);
          }
        });
        resolve();
      });
    });
  }
}

export const GameAssets = new GameAssetsClass();
