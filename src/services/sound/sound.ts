import PixiSound from 'pixi-sound';
import { Service, ServiceDecorator } from '../../game-entities/service';
PixiSound.volumeAll = 0.1;

@ServiceDecorator()
export class SoundService extends Service {
  play(sound: string): void {
    PixiSound.play(sound);
  }
}
