import { Action } from 'actions-lib';
import { ServiceDecorator, Service } from '../../game-entities/service';

@ServiceDecorator()
export class KeyboardService extends Service {
  readonly keyboardAction = new Action<string>();

  constructor() {
    super();
    document.addEventListener('keydown', event => {
      !event.repeat && this.keyboardAction.trigger(event.key);
    });
  }
}
