import { Comparator } from 'helpers-lib';
import { ActionSubscription } from 'actions-lib';
import { UpdateAction } from '../update-loop';

interface PropertyState {
  duration: number;
  animationFunction: (t: number) => number;
  elapsedTime: number;
  startingValue: number;
  targetRelativeValue: number;
  completionCallback: () => void;
}

export enum AnimationType {
  lineer = 'lineer',
  easeInOut = 'easeInOut',
  easeIn = 'easeIn',
  easeOut = 'easeOut'
}

export interface AnimationOptions<T> {
  duration?: number;
  animation?: AnimationType;
}

export const AnimationTypeToFunction: Record<AnimationType, (t: number) => number> = {
  lineer: (t: number) => t,
  easeInOut: (t: number) => {
    if ((t *= 2) < 1) {
      return 0.5 * t * t;
    } else {
      return -0.5 * (--t * (t - 2) - 1);
    }
  },
  easeIn: (t: number) => Math.pow(t, 2),
  easeOut: (t: number) => 1 - Math.pow(1 - t, 2)
};

export class Animator<T> {
  readonly targetObject: T;

  private valueOrigins: Partial<T> = {};
  private effectOn: string[];

  private defaultDuration: number;
  private defaultAnimation: AnimationType;
  private onChangeCallback?: (target: T) => void;

  private propertyStates: Map<string, PropertyState> = new Map();
  private updateSubscription: ActionSubscription | undefined;

  constructor(target: T, effectOn: string | string[], options: AnimationOptions<T> = {}) {
    if (!Comparator.isObject(target)) {
      throw new Error(`Animator: target is not an object! Target: '${target}'`);
    }

    this.targetObject = target;
    this.defaultDuration = options.duration || 200;
    this.defaultAnimation = options.animation || AnimationType.easeInOut;

    this.effectOn = Comparator.isString(effectOn) ? [<string>effectOn] : <string[]>effectOn;
    this.effectOn.forEach(key => {
      // @ts-ignore
      if (Comparator.isNumber(target[key])) {
        // @ts-ignore
        this.valueOrigins[key] = target[key];
      } else {
        throw new Error(`Animator: target does not have target property. Target property: '${key}'`);
      }
    });
  }

  onChange(callback: (target: T) => void): Animator<T> {
    this.onChangeCallback = callback;
    return this;
  }

  /**
   * Set animations are not cancelable, they should finish their animation before starting to new one
   */
  set(values: Partial<T>, animate: boolean = false, options: AnimationOptions<T> = {}): Promise<void> {
    Object.keys(values).forEach(key => {
      this.validateProperty(key);
      // @ts-ignore
      this.valueOrigins[key] = values[key];
    });

    if (animate) {
      return this.startAnimate(values, false, options);
    } else {
      Object.keys(values).forEach(key => {
        // @ts-ignore
        this.targetObject[key] = values[key];
        this.propertyStates.delete(key);
      });
      return Promise.resolve();
    }
  }

  /**
   * Animate animations are cancelable, this function or set function can be called in the middle of the animation
   */
  animate(values: Record<string, any>, options: AnimationOptions<T> = {}): Promise<void> {
    let valueKeys = Object.keys(values);
    valueKeys.forEach(key => {
      this.validateProperty(key);
    });
    return this.startAnimate(values, true, options);
  }

  private startAnimate(values: Record<string, any>, setTarget: boolean, options: AnimationOptions<T> = {}): Promise<void> {
    return new Promise(resolveAll => {
      Promise.all(
        Object.keys(values).map(
          key =>
            new Promise(resolve => {
              let previousState = this.propertyStates.get(key);
              previousState && previousState.completionCallback();
              try {
                this.propertyStates.set(key, {
                  duration: options.duration || this.defaultDuration,
                  animationFunction: AnimationTypeToFunction[options.animation || this.defaultAnimation],
                  elapsedTime: 0,
                  // @ts-ignore
                  startingValue: this.targetObject[key],
                  // @ts-ignore
                  targetRelativeValue: setTarget ? values[key] : 0,
                  completionCallback: () => {
                    resolve();
                  }
                });
              } catch (e) {
                resolveAll();
              }
            })
        )
      ).then(() => {
        resolveAll();
      });
      this.subscribeUpdate();
    });
  }

  private subscribeUpdate() {
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = UpdateAction.subscribe(update => {
      try {
        this.update(update.delta);
      } catch (e) {
        this.propertyStates.forEach(value => {
          value.completionCallback();
        });
        this.propertyStates = new Map();
        this.updateSubscription?.unsubscribe();
      }
    });
  }

  private update(delta: number): boolean {
    let triggerOnChange = this.propertyStates.size;
    this.propertyStates.forEach((value, key) => {
      value.elapsedTime += delta;
      if (value.elapsedTime >= value.duration) {
        // animation is complete
        // @ts-ignore
        this.targetObject[key] = this.valueOrigins[key] + value.targetRelativeValue;
        value.completionCallback();

        this.propertyStates.delete(key);
        if (this.propertyStates.size <= 0) {
          this.updateSubscription?.unsubscribe();
        }
      } else {
        let multiplier = value.animationFunction(value.elapsedTime / value.duration);
        // @ts-ignore
        let target = this.valueOrigins[key] + value.targetRelativeValue;
        // @ts-ignore
        this.targetObject[key] = (target - value.startingValue) * multiplier + value.startingValue;
      }
    });
    triggerOnChange && this.onChangeCallback?.(this.targetObject);
    return false;
  }

  private validateProperty(key: string) {
    let valid = this.effectOn.includes(key);
    if (!valid) {
      throw new Error(`Animator: not effected property is tried to update. Key: '${key}', EffectOn: '${this.effectOn}'`);
    }
  }
}
