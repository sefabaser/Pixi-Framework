import { ActionSubscription, ReducerEffectChannel } from 'actions-lib';

import { AutoDestroyable, DestroyAutoDestroyable } from './decorators/auto-destroy/auto-destroy';
import { Destroyable, Unsubscribable } from '../pixi-js/object-creation/destroyable-interface';
import { Entity } from './entity';
import { Image } from '../pixi-js/object-creation/Image/image';

export type IAttachable = Entity | Image | ActionSubscription | ReducerEffectChannel<any, any>;

export abstract class EntityBase {
  protected destroyed = false;
  private attachedEntities: AutoDestroyable[] = [];

  constructor() {
    let originalDestroy = this.destroy.bind(this);
    this.destroy = function () {
      if (!this.destroyed) {
        this.destroyed = true;
        let attachedEntities = [...this.attachedEntities];
        attachedEntities.forEach(item => DestroyAutoDestroyable(item));
        this.attachedEntities = [];
        originalDestroy();
      }
    };
  }

  init(): void {}
  update?(time: number, delta: number): void;
  destroy(): void {}

  private setAttachment(child: Destroyable | Unsubscribable) {
    if (this.destroyed) {
      DestroyAutoDestroyable(child);
    } else {
      this.attachedEntities.push(child);
    }
  }

  private removeAttachment(child: Destroyable | Unsubscribable) {
    let index = this.attachedEntities.indexOf(child);
    if (index >= 0) {
      this.attachedEntities.splice(index, 1);
    }
  }
}
