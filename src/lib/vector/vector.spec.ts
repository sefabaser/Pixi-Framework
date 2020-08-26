import { Vector } from './vector';

describe('Vector', () => {
  describe('Rotate', () => {
    it('basic rotation 1', () => {
      let vec1 = { x: 1, y: 0 };
      let vec2 = { x: 1, y: 0 };
      expect(Vector.rotate(vec1, vec2, false)).toEqual({ x: 1, y: 0 });
    });

    it('basic rotation 2', () => {
      let vec1 = { x: 1, y: 0 };
      let vec2 = { x: 0, y: 1 };
      expect(Vector.rotate(vec1, vec2, false)).toEqual({ x: 0, y: 1 });
    });

    it('rotation with normalization', () => {
      let vec1 = { x: 3, y: 0 };
      let vec2 = { x: 0, y: 2 };
      expect(Vector.rotate(vec1, vec2)).toEqual({ x: 0, y: 3 });
    });

    it('complex rotation with normalization 1', () => {
      let vec1 = { x: 3, y: 2 };
      let vec2 = { x: 2, y: 3 };
      expect(Vector.rotate(vec1, vec2)).toEqual({ x: 0, y: 3.6055512754639896 });
    });

    it('complex rotation with normalization 2', () => {
      let vec1 = { x: 3, y: 2 };
      let vec2 = { x: -1, y: 3 };
      expect(Vector.rotate(vec1, vec2)).toEqual({ x: -2.846049894151541, y: 2.213594362117865 });
    });
  });

  describe('Normalize', () => {
    it('basic 1', () => {
      let vec = { x: 1, y: 0 };
      expect(Vector.normalize(vec)).toEqual({ x: 1, y: 0 });
    });

    it('basic 2', () => {
      let vec = { x: 0, y: 1 };
      expect(Vector.normalize(vec)).toEqual({ x: 0, y: 1 });
    });

    it('normalize bigger than 1', () => {
      let vec = { x: 3, y: 4 };
      expect(Vector.normalize(vec)).toEqual({ x: 0.6, y: 0.8 });
    });

    it('normalize smaller than 1', () => {
      let vec = { x: 0.3, y: 0.4 };
      expect(Vector.normalize(vec)).toEqual({ x: 0.6, y: 0.8 });
    });

    it('normalize zero vector', () => {
      let vec = { x: 0, y: 0 };
      expect(Vector.normalize(vec)).toEqual({ x: 1, y: 0 });
    });
  });

  describe('NormalizeRadian', () => {
    it('basic 1', () => {
      expect(Vector.normalizeRadian(0)).toEqual(0);
    });

    it('basic 2', () => {
      expect(Vector.normalizeRadian(1)).toEqual(1);
    });

    it('basic 3', () => {
      expect(Vector.normalizeRadian(Math.PI * 2)).toEqual(0);
    });

    it('negative 1', () => {
      expect(Vector.normalizeRadian(-1)).toEqual(Math.PI * 2 - 1);
    });

    it('negative 2', () => {
      expect(Vector.normalizeRadian(-0)).toEqual(0);
    });

    it('negative 3', () => {
      expect(Vector.normalizeRadian(-Math.PI * 2)).toEqual(0);
    });

    it('big number 1', () => {
      expect(Vector.normalizeRadian(Math.PI * 2 + 1)).toEqual(1);
    });

    it('big number 2', () => {
      expect(Vector.normalizeRadian(-Math.PI * 2 - 1)).toEqual(Math.PI * 2 - 1);
    });

    it('big number 3', () => {
      expect(Vector.normalizeRadian(Math.PI * 4 + 1)).toEqual(1);
    });
  });

  describe('GetDistance', () => {
    it('basic 1', () => {
      let vec1 = { x: 0, y: 0 };
      let vec2 = { x: 0, y: 0 };
      expect(Vector.getDistance(vec1, vec2)).toEqual(0);
    });

    it('basic 2', () => {
      let vec1 = { x: 0, y: 0 };
      let vec2 = { x: 1, y: 0 };
      expect(Vector.getDistance(vec1, vec2)).toEqual(1);
    });

    it('basic 3', () => {
      let vec1 = { x: 0, y: 0 };
      let vec2 = { x: 0, y: 1 };
      expect(Vector.getDistance(vec1, vec2)).toEqual(1);
    });

    it('basic 4', () => {
      let vec1 = { x: 3, y: 0 };
      let vec2 = { x: 0, y: 4 };
      expect(Vector.getDistance(vec1, vec2)).toEqual(5);
    });
  });
});
