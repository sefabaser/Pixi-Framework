import { Vec2, Vector } from './vector';

describe('Vector', () => {
  describe('vector to camera perspective', () => {
    it('sample 1', () => {
      let vector: Vec2 = { x: 1, y: 0 };
      let cameraPerspective = Vector.vectorToCameraPerspective(vector);
      let expected: Vec2 = { x: Math.pow(2, 1 / 2) / 2, y: -Math.pow(2, 1 / 2) / 4 };
      expect(cameraPerspective.x).toBeCloseTo(expected.x, 15);
      expect(cameraPerspective.y).toBeCloseTo(expected.y, 15);
    });

    it('sample 2', () => {
      let vector: Vec2 = { x: 1, y: 1 };
      let cameraPerspective = Vector.vectorToCameraPerspective(vector);
      let expected: Vec2 = { x: 0, y: -Math.pow(2, 1 / 2) / 2 };
      expect(cameraPerspective.x).toBeCloseTo(expected.x, 15);
      expect(cameraPerspective.y).toBeCloseTo(expected.y, 15);
    });

    it('sample 3', () => {
      let vector: Vec2 = { x: 0, y: 1 };
      let cameraPerspective = Vector.vectorToCameraPerspective(vector);
      let expected: Vec2 = { x: -Math.pow(2, 1 / 2) / 2, y: -Math.pow(2, 1 / 2) / 4 };
      expect(cameraPerspective.x).toBeCloseTo(expected.x, 15);
      expect(cameraPerspective.y).toBeCloseTo(expected.y, 15);
    });
  });

  describe('camera perspective to vector', () => {
    it('sample 1', () => {
      let vector: Vec2 = { x: Math.pow(2, 1 / 2) / 2, y: -Math.pow(2, 1 / 2) / 4 };
      let cameraPerspective = Vector.cameraPerspectiveToVector(vector);
      let expected: Vec2 = { x: 1, y: 0 };
      expect(cameraPerspective.x).toBeCloseTo(expected.x, 15);
      expect(cameraPerspective.y).toBeCloseTo(expected.y, 15);
    });

    it('sample 2', () => {
      let vector: Vec2 = { x: 0, y: -Math.pow(2, 1 / 2) / 2 };
      let cameraPerspective = Vector.cameraPerspectiveToVector(vector);
      let expected: Vec2 = { x: 1, y: 1 };
      expect(cameraPerspective.x).toBeCloseTo(expected.x, 15);
      expect(cameraPerspective.y).toBeCloseTo(expected.y, 15);
    });

    it('sample 3', () => {
      let vector: Vec2 = { x: -Math.pow(2, 1 / 2) / 2, y: -Math.pow(2, 1 / 2) / 4 };
      let cameraPerspective = Vector.cameraPerspectiveToVector(vector);
      let expected: Vec2 = { x: 0, y: 1 };
      expect(cameraPerspective.x).toBeCloseTo(expected.x, 15);
      expect(cameraPerspective.y).toBeCloseTo(expected.y, 15);
    });
  });
});
