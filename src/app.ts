import * as PIXI from 'pixi.js';
// @ts-ignore
import { install } from '@pixi/unsafe-eval';
install(PIXI);
window.PIXI = PIXI;
import { Application } from 'pixi.js';
import { Viewport } from 'pixi-viewport';

import { DecorateActionLib } from './helpers/action-lib.polyfill';
import { GameAssets, AssetDefinition } from './game-assets/game-assets';
import { UpdateTick } from './helpers/update-loop';
DecorateActionLib();

// PIXI.settings.ROUND_PIXELS = true;

export const ScreenResolution = {
  width: 1200,
  height: 800
};

export class Game {
  private static inst: Game;
  static instance(): Game {
    return this.inst;
  }

  readonly app: Application;
  readonly viewport: Viewport;

  constructor() {
    if (Game.inst) {
      throw new Error('There can be only one Game instance!');
    } else {
      this.app = new Application({
        backgroundColor: 0x000000,
        width: ScreenResolution.width,
        height: ScreenResolution.height,
        autoStart: false,
        antialias: true,
        resolution: 1
      });
      document.body.appendChild(this.app.view);

      this.viewport = new Viewport({
        interaction: this.app.renderer.plugins.interaction,
        screenWidth: ScreenResolution.width,
        screenHeight: ScreenResolution.height
      });

      this.viewport
        .drag()
        .pinch()
        .wheel({ smooth: 20, percent: 4 })
        .decelerate({ friction: 0.8 })
        .addListener('moved-end', () => {
          let center = this.viewport.center;
          let roundedCenter = new PIXI.Point(
            Math.round(center.x * this.viewport.scale.x) / this.viewport.scale.x,
            Math.round(center.y * this.viewport.scale.y) / this.viewport.scale.y
          );
          this.viewport.moveCenter(roundedCenter);
        });

      this.viewport.sortableChildren = true;
      this.app.stage.addChild(this.viewport);

      Game.inst = this;
    }
  }

  async setup(assetDefinitions: AssetDefinition<string>[]): Promise<void> {
    await GameAssets.loadGameAssets(assetDefinitions);
    this.app.start();
    this.app.ticker.add(() => {
      UpdateTick(this.app.ticker.deltaMS);
    });
  }
}
