import { AStarFinder } from 'astar-typescript';
import { Comparator } from 'helpers-lib';
import { Viewport } from 'pixi-viewport';

import { Vec2 } from '../vector/vector';

export class CommonLib {
  private static fibonacciMap: number[] = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];
  static fibonacci(i: number): number {
    if (Comparator.isInteger(i) && i >= 0) {
      if (this.fibonacciMap[i]) {
        return this.fibonacciMap[i];
      } else {
        let iMinus1Result = this.fibonacci(i - 1);
        this.fibonacciMap[i - 1] = iMinus1Result;
        let iResult = iMinus1Result + this.fibonacci(i - 2);
        this.fibonacciMap[i] = iResult;
        return iResult;
      }
    } else {
      return -1;
    }
  }

  static convertScreenPositionToWorldPosition(position: Vec2, viewport: Viewport): Vec2 {
    let imagePosition = {
      x: (position.x - viewport.position.x) / viewport.scale.x,
      y: (position.y - viewport.position.y) / viewport.scale.y
    };
    return imagePosition;
  }

  static deltaSpeed(speed: number, delta: number): number {
    return (speed * delta) / 1000;
  }

  static getTileImageAnchor(): Vec2 {
    return { x: 0.5, y: 0.8359375 };
  }

  static pickRandomWeight(weights: number[]): number {
    let total = weights.reduce((acc, item) => acc + item);
    let threshold = Math.ceil(Math.random() * total);
    total = 0;
    for (let i = 0; i < weights.length; ++i) {
      total += weights[i];
      if (total >= threshold) {
        return i;
      }
    }
    return -1;
  }

  static pickRandomElement<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
  }

  static pickRandomElementFirstLikely<T>(items: T[]): T {
    let i = this.pickRandomWeight(items.map((_, index) => this.fibonacci(items.length - index), 2));
    return items[i];
  }

  static pickRandomElementWithWeight<T>(items: { value: T; weight: number }[]): T {
    let selectedIndex = this.pickRandomWeight(items.map(item => item.weight));
    return items[selectedIndex].value;
  }

  static random(possibility = 0.5): boolean {
    return Math.random() < possibility;
  }

  static randomBetween(start: number, to: number): number {
    return Math.floor(Math.random() * (to - start)) + start;
  }

  static findShortestPath(from: Vec2, to: Vec2, matrix: boolean[][]): Vec2[] {
    let transposedMatrix: (0 | 1)[][] = this.transposeMatrix(matrix).map(row => row.map(available => (available ? 0 : 1)));

    transposedMatrix[from.y][from.x] = 0;
    transposedMatrix[to.y][to.x] = 0;

    let astarFinder = new AStarFinder({
      grid: { matrix: transposedMatrix },
      heuristic: 'Manhatten',
      diagonalAllowed: false,
      includeStartNode: false,
      includeEndNode: false
    });

    return astarFinder.findPath(from, to).map(position => <Vec2>{ x: position[0], y: position[1] });
  }

  static transposeMatrix<T>(matrix: T[][]): T[][] {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  }
}
