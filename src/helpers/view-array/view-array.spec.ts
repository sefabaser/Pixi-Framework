import { ViewArrayController, ViewArray } from './view-array';
import { Vec2 } from '../../lib/vector/vector';

class TestController extends ViewArrayController<Vec2> {
  static createCalls: { pos: Vec2; index: number }[];
  static updateCalls: { pos: Vec2; index: number }[];
  static destroyCalls: { pos: Vec2; index: number }[];

  constructor(pos: Vec2, index: number) {
    super();
    TestController.createCalls.push({ pos, index });
  }

  update(pos: Vec2, index: number) {
    TestController.updateCalls.push({ pos, index });
  }

  destroy(pos: Vec2, index: number) {
    TestController.destroyCalls.push({ pos, index });
  }
}

let attachTargetMock = <any>{
  setAttachment: () => {}
};

describe('View Array', () => {
  beforeEach(() => {
    TestController.createCalls = [];
    TestController.updateCalls = [];
    TestController.destroyCalls = [];
  });

  it('should call create functions on new definitions', () => {
    let test = new ViewArray<Vec2>(TestController).attach(attachTargetMock);
    test.set([
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]);

    expect(TestController.createCalls).toEqual([
      { pos: { x: 1, y: 1 }, index: 0 },
      { pos: { x: 2, y: 2 }, index: 1 }
    ]);
  });

  it('should call delete functions on setting empty array', () => {
    let test = new ViewArray<Vec2>(TestController).attach(attachTargetMock);
    test.set([
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]);
    test.set([]);

    expect(TestController.destroyCalls).toEqual([
      { pos: { x: 2, y: 2 }, index: 1 },
      { pos: { x: 1, y: 1 }, index: 0 }
    ]);
  });

  it('sould call update function when receiving same definition', () => {
    let test = new ViewArray<Vec2>(TestController).attach(attachTargetMock);
    let arr = [
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ];
    test.set(arr);
    test.set(arr);

    expect(TestController.updateCalls).toEqual([
      { pos: { x: 1, y: 1 }, index: 0 },
      { pos: { x: 2, y: 2 }, index: 1 }
    ]);
  });

  it('trackBy', () => {
    let test = new ViewArray<Vec2>(TestController).attach(attachTargetMock);
    test.trackBy('x');
    test.set([
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]);
    test.set([
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]);

    expect(TestController.updateCalls).toEqual([
      { pos: { x: 1, y: 1 }, index: 0 },
      { pos: { x: 2, y: 2 }, index: 1 }
    ]);
  });

  it('integration', () => {
    let test = new ViewArray<Vec2>(TestController).attach(attachTargetMock);
    test.trackBy('x');
    test.set([
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 }
    ]);
    TestController.createCalls = [];
    test.set([
      { x: 1, y: 2 },
      { x: 4, y: 4 }
    ]);

    expect(TestController.createCalls).toEqual([{ pos: { x: 4, y: 4 }, index: 1 }]);
    expect(TestController.updateCalls).toEqual([{ pos: { x: 1, y: 2 }, index: 0 }]);
    expect(TestController.destroyCalls).toEqual([
      { pos: { x: 2, y: 2 }, index: 1 },
      { pos: { x: 3, y: 3 }, index: 2 }
    ]);
  });

  it('sould throw error if set is called after array is destroyed', () => {
    let test = new ViewArray<Vec2>(TestController).attach(attachTargetMock);
    test.set([
      { x: 1, y: 1 },
      { x: 2, y: 2 }
    ]);
    test.destroy();

    expect(() => {
      test.set([{ x: 1, y: 1 }]);
    }).toThrow();
  });
});
