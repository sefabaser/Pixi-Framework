export interface Destroyable {
  destroy(...args: any[]): void;
}

export interface Unsubscribable {
  unsubscribe(...args: any[]): void;
}

export interface CanBeParent {
  addChild(...args: any[]): void;
}
