import { AutoDestroyable, DestroyAutoDestroyable } from '../helpers/auto-destroy/auto-destroy';
import { Destroyable, Unsubscribable } from '../_interfaces';

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

  setAttachment(child: Destroyable | Unsubscribable): void {
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
