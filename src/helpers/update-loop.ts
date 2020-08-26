import { Action } from 'actions-lib';

export const HardReset = new Action();
export const UpdateAction = new Action<{ time: number; delta: number }>();

let time = 0;
export function UpdateTick(delta: number): void {
  time += delta;
  UpdateAction.trigger({ time, delta });
}

HardReset.subscribe(() => {
  time = 0;
});
