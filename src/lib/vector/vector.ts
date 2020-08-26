export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

const GridRotationTop: Vec2 = { x: 1 / Math.pow(2, 1 / 2), y: -1 / Math.pow(2, 1 / 2) };
const DoublePI = Math.PI * 2;

export class Vector {
  static isEqual(vector1: Vec2 | undefined, vector2: Vec2 | undefined): boolean {
    if (!vector1 || !vector2) {
      return false;
    } else {
      return vector1.x === vector2.x && vector1.y === vector2.y;
    }
  }

  static sum(vector1: Vec2, vector2: Vec2): Vec2 {
    return {
      x: vector1.x + vector2.x,
      y: vector1.y + vector2.y
    };
  }

  static fromTo(from: Vec2, to: Vec2): Vec2 {
    return {
      x: to.x - from.x,
      y: to.y - from.y
    };
  }

  static multiply(vector: Vec2, multiplier: number): Vec2 {
    return {
      x: vector.x * multiplier,
      y: vector.y * multiplier
    };
  }

  static round(vector: Vec2): Vec2 {
    return {
      x: Math.round(vector.x),
      y: Math.round(vector.y)
    };
  }

  static getCoordinates(position: Vec2): Vec3 {
    return {
      x: position.x * 128 - position.y * 128,
      y: position.x * 64 + position.y * 64 + 64,
      z: position.x + position.y
    };
  }

  static getWorldSize(gridSize: Vec2): Vec2 {
    let worldSizeMultiplier = (gridSize.x + gridSize.y) / 2;
    return {
      x: worldSizeMultiplier * 256,
      y: worldSizeMultiplier * 128 + 20
    };
  }

  static cameraPerspectiveToVector(coordinates: Vec2): Vec2 {
    coordinates = { x: coordinates.x, y: -coordinates.y * 2 };
    return this.rotate(coordinates, { x: GridRotationTop.x, y: GridRotationTop.y }, false);
  }

  static vectorToCameraPerspective(vector: Vec2): Vec2 {
    let rotationTop = this.rotate(vector, { x: GridRotationTop.x, y: -GridRotationTop.y }, false);
    return { x: rotationTop.x, y: -rotationTop.y / 2 };
  }

  static rotate(vector1: Vec2, vector2: Vec2, normalize: boolean = true): Vec2 {
    if (normalize) {
      vector2 = this.normalize(vector2);
    }
    return { x: vector1.x * vector2.x - vector1.y * vector2.y, y: vector1.x * vector2.y + vector1.y * vector2.x };
  }

  static normalize(vector: Vec2): Vec2 {
    let length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
    if (length !== 0) {
      return { x: vector.x / length, y: vector.y / length };
    } else {
      return { x: 1, y: 0 };
    }
  }

  static normalizeRadian(radian: number): number {
    if (radian <= 0) {
      radian += Math.ceil(-radian / DoublePI) * DoublePI;
    }
    return radian % DoublePI;
  }

  static radianToVector(radian: number): Vec2 {
    return {
      x: Math.cos(radian),
      y: Math.sin(radian)
    };
  }

  static getRadian(vector: Vec2, normalize: boolean = true): number {
    if (normalize) {
      vector = this.normalize(vector);
    }
    return this.normalizeRadian(Math.atan2(-vector.y, vector.x));
  }

  static acuteAngle(radian1: number, radian2: number): number {
    let result = (radian2 - radian1) % DoublePI;
    if (result > Math.PI) {
      return result - DoublePI;
    } else if (result < -Math.PI) {
      return result + DoublePI;
    } else {
      return result;
    }
  }

  static getLength(vector: Vec2): number {
    return Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
  }

  static getDistance(position1: Vec2, position2: Vec2): number {
    return Math.abs(this.getLength(this.fromTo(position1, position2)));
  }
}
