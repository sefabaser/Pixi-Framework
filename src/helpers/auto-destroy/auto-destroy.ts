import { Variable } from 'actions-lib';
import { Comparator } from 'helpers-lib';

import { Destroyable, Unsubscribable } from '../../_interfaces';

export type AutoDestroyable = Destroyable | Unsubscribable | AutoDestroyable[] | Variable<AutoDestroyable>;

export function AutoDestroy(): PropertyDecorator {
  return (target: Destroyable, key: string | symbol) => {
    let originalDestroy = target.destroy;
    target.destroy = function () {
      DestroyAutoDestroyable((<any>this)[key]);
      originalDestroy.bind(this)();
    };
  };
}

export function DestroyAutoDestroyable(object: AutoDestroyable): void {
  if (object instanceof Variable) {
    DestroyAutoDestroyable(object.value);
  } else if (object instanceof Array) {
    object.forEach((item: any) => DestroyAutoDestroyable(item));
  } else if (Comparator.isObject(object)) {
    let item: any = object;
    if (Comparator.isFunction(item.destroy)) {
      item.destroy();
    } else if (Comparator.isFunction(item.unsubscribe)) {
      item.unsubscribe();
    }
  } else {
    throw new Error(`DestroyAutoDestroyable is used with not supperted type! Target: '${object}'`);
  }
}
