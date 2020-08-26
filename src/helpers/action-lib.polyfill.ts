/* eslint-disable no-shadow */
import { ActionSubscription, ReducerEffectChannel } from 'actions-lib';

import { EntityBase } from '../game-entities/entity-base';

declare module 'actions-lib' {
  class ActionSubscription {
    attach(parent: EntityBase): ActionSubscription;
  }

  class ReducerEffectChannel<EffectType, ResponseType> {
    attach(parent: EntityBase): ReducerEffectChannel<EffectType, ResponseType>;
  }
}

export const DecorateActionLib = (): void => {
  ActionSubscription.prototype.attach = function (parent: EntityBase) {
    // @ts-ignore
    parent.setAttachment(this);
    return this;
  };

  ReducerEffectChannel.prototype.attach = function (parent: EntityBase) {
    // @ts-ignore
    parent.setAttachment(this);
    return this;
  };
};
