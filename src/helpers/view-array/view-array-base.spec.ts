import { ViewArrayBase } from './view-array';

class TestArray {
  viewArray: ViewArrayBase<number, string>;

  createCalls: { definition: string; index: number }[] = [];
  updateCalls: { item: number; definition: string; index: number }[] = [];
  deleteCalls: { item: number; definition: string; index: number }[] = [];

  constructor() {
    this.viewArray = new ViewArrayBase<number, string>(
      (definition, index) => {
        this.createCalls.push({ definition, index });
        return index;
      },
      (item, definition, index) => {
        this.updateCalls.push({ item, definition, index });
      },
      (item, definition, index) => {
        this.deleteCalls.push({ item, definition, index });
      }
    ).attach(<any>{
      setAttachment: () => {}
    });
  }
}

describe('View Array Base', () => {
  it('should call create functions on new definitions', () => {
    let test = new TestArray();
    test.viewArray.set(['a', 'b']);
    expect(test.createCalls).toEqual([
      { definition: 'a', index: 0 },
      { definition: 'b', index: 1 }
    ]);
  });

  it('should call delete functions on setting empty array', () => {
    let test = new TestArray();
    test.viewArray.set(['a', 'b']);
    test.viewArray.set([]);
    expect(test.deleteCalls).toEqual([
      { item: 1, definition: 'b', index: 1 },
      { item: 0, definition: 'a', index: 0 }
    ]);
  });

  it('sould call update function when receiving same definition', () => {
    let test = new TestArray();
    test.viewArray.set(['a', 'b']);
    test.viewArray.set(['a', 'b']);
    expect(test.updateCalls).toEqual([
      { item: 0, definition: 'a', index: 0 },
      { item: 1, definition: 'b', index: 1 }
    ]);
  });

  it('integration', () => {
    let test = new TestArray();
    test.viewArray.set(['a', 'b', 'c']);
    test.createCalls = [];
    test.viewArray.set(['a', 'd']);
    expect(test.createCalls).toEqual([{ definition: 'd', index: 1 }]);
    expect(test.updateCalls).toEqual([{ item: 0, definition: 'a', index: 0 }]);
    expect(test.deleteCalls).toEqual([
      { item: 1, definition: 'b', index: 1 },
      { item: 2, definition: 'c', index: 2 }
    ]);
  });

  it('sould throw error if set is called after array is destroyed', () => {
    let test = new TestArray();
    test.viewArray.set(['a', 'b']);
    test.viewArray.destroy();
    expect(() => {
      test.viewArray.set(['c']);
    }).toThrow();
  });
});
