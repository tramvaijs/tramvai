import { DoubleLinkedList } from './doubleLinkedList';

describe('DoubleLinkedList', () => {
  describe('constructor', () => {
    test('should create empty list when no initial array provided', () => {
      const list = new DoubleLinkedList<number>();

      expect(list.length).toBe(0);
      expect(list.start).toBeNull();
      expect(list.end).toBeNull();
      expect(list.size()).toBe(0);
    });

    test('should create list from initial array', () => {
      const initialArray = [1, 2, 3];
      const list = new DoubleLinkedList<number>(initialArray);

      expect(list.length).toBe(3);
      expect(list.start?.value).toBe(1);
      expect(list.end?.value).toBe(3);
      expect(list.toArray()).toEqual([1, 2, 3]);
    });

    test('should create empty list from empty array', () => {
      const list = new DoubleLinkedList<number>([]);

      expect(list.length).toBe(0);
      expect(list.start).toBeNull();
      expect(list.end).toBeNull();
    });
  });
  describe('push', () => {
    test('should add element to empty list', () => {
      const list = new DoubleLinkedList<number>();

      list.push(42);

      expect(list.length).toBe(1);
      expect(list.start?.value).toBe(42);
      expect(list.end?.value).toBe(42);
      expect(list.start?.next).toBeNull();
      expect(list.start?.prev).toBeNull();
    });

    test('should add element to non-empty list', () => {
      const list = new DoubleLinkedList<number>([1, 2]);

      list.push(3);

      expect(list.length).toBe(3);
      expect(list.end?.value).toBe(3);
      expect(list.end?.prev?.value).toBe(2);
      expect(list.end?.next).toBeNull();
    });

    test('should correctly link nodes when adding multiple elements', () => {
      const list = new DoubleLinkedList<string>();

      list.push('first');
      list.push('second');
      list.push('third');

      expect(list.start?.value).toBe('first');
      expect(list.start?.next?.value).toBe('second');
      expect(list.start?.next?.next?.value).toBe('third');
      expect(list.end?.prev?.prev?.value).toBe('first');
    });
  });
  describe('pop', () => {
    test('should return null when popping from empty list', () => {
      const list = new DoubleLinkedList<number>();

      const result = list.pop();

      expect(result).toBeNull();
      expect(list.length).toBe(0);
    });

    test('should remove and return last element from single-element list', () => {
      const list = new DoubleLinkedList<number>([42]);

      const result = list.pop();

      expect(result).toBe(42);
      expect(list.length).toBe(0);
      expect(list.start).toBeNull();
      expect(list.end).toBeNull();
    });

    test('should remove and return last element from multi-element list', () => {
      const list = new DoubleLinkedList<number>([1, 2, 3]);

      const result = list.pop();

      expect(result).toBe(3);
      expect(list.length).toBe(2);
      expect(list.end?.value).toBe(2);
      expect(list.end?.next).toBeNull();
    });

    test('should handle multiple consecutive pops', () => {
      const list = new DoubleLinkedList<string>(['a', 'b', 'c']);

      expect(list.pop()).toBe('c');
      expect(list.pop()).toBe('b');
      expect(list.pop()).toBe('a');
      expect(list.pop()).toBeNull();
      expect(list.length).toBe(0);
    });
  });
  describe('shift', () => {
    test('should return null when shifting from empty list', () => {
      const list = new DoubleLinkedList<number>();

      const result = list.shift();

      expect(result).toBeNull();
      expect(list.length).toBe(0);
    });

    test('should remove and return first element from single-element list', () => {
      const list = new DoubleLinkedList<number>([42]);

      const result = list.shift();

      expect(result).toBe(42);
      expect(list.length).toBe(0);
      expect(list.start).toBeNull();
      expect(list.end).toBeNull();
    });

    test('should remove and return first element from multi-element list', () => {
      const list = new DoubleLinkedList<number>([1, 2, 3]);

      const result = list.shift();

      expect(result).toBe(1);
      expect(list.length).toBe(2);
      expect(list.start?.value).toBe(2);
      expect(list.start?.prev).toBeNull();
    });

    test('should handle multiple consecutive shifts', () => {
      const list = new DoubleLinkedList<string>(['a', 'b', 'c']);

      expect(list.shift()).toBe('a');
      expect(list.shift()).toBe('b');
      expect(list.shift()).toBe('c');
      expect(list.shift()).toBeNull();
      expect(list.length).toBe(0);
    });
  });
  describe('size', () => {
    test('should return correct size for various list states', () => {
      const list = new DoubleLinkedList<number>();

      expect(list.size()).toBe(0);

      list.push(1);
      expect(list.size()).toBe(1);

      list.push(2);
      expect(list.size()).toBe(2);

      list.pop();
      expect(list.size()).toBe(1);
    });
  });

  describe('toArray', () => {
    test('should return empty array for empty list', () => {
      const list = new DoubleLinkedList<number>();

      expect(list.toArray()).toEqual([]);
    });

    test('should return correct array representation', () => {
      const list = new DoubleLinkedList<string>(['a', 'b', 'c']);

      expect(list.toArray()).toEqual(['a', 'b', 'c']);
    });

    test('should reflect changes after modifications', () => {
      const list = new DoubleLinkedList<number>([1, 2]);

      list.push(3);
      expect(list.toArray()).toEqual([1, 2, 3]);

      list.shift();
      expect(list.toArray()).toEqual([2, 3]);
    });
  });

  describe('toString', () => {
    test('should return correct JSON string for empty list', () => {
      const list = new DoubleLinkedList<number>();

      expect(list.toString()).toBe('[null]');
    });

    test('should return correct JSON string for non-empty list', () => {
      const list = new DoubleLinkedList<number>([1, 2, 3]);

      expect(list.toString()).toBe('[1,2,3]');
    });
  });
  describe('Symbol.iterator', () => {
    test('should iterate over empty list', () => {
      const list = new DoubleLinkedList<number>();
      const values = [];

      for (const value of list) {
        values.push(value);
      }

      expect(values).toEqual([]);
    });

    test('should iterate over all elements in correct order', () => {
      const list = new DoubleLinkedList<string>(['first', 'second', 'third']);
      const values = [];

      for (const value of list) {
        values.push(value);
      }

      expect(values).toEqual(['first', 'second', 'third']);
    });

    test('should work with spread operator', () => {
      const list = new DoubleLinkedList<number>([1, 2, 3]);

      const array = [...list];

      expect(array).toEqual([1, 2, 3]);
    });

    test('should work with Array.from', () => {
      const list = new DoubleLinkedList<boolean>([true, false, true]);

      const array = Array.from(list);

      expect(array).toEqual([true, false, true]);
    });
  });
  describe('type safety tests', () => {
    test('should work with number type', () => {
      const list = new DoubleLinkedList<number>();
      list.push(42);
      expect(list.pop()).toBe(42);
    });

    test('should work with string type', () => {
      const list = new DoubleLinkedList<string>();
      list.push('hello');
      expect(list.pop()).toBe('hello');
    });

    test('should work with object type', () => {
      interface TestObject {
        id: number;
        name: string;
      }

      const list = new DoubleLinkedList<TestObject>();
      const obj = { id: 1, name: 'test' };

      list.push(obj);
      expect(list.pop()).toEqual(obj);
    });

    test('should work with array type', () => {
      const list = new DoubleLinkedList<number[]>();
      const arr = [1, 2, 3];

      list.push(arr);
      expect(list.pop()).toEqual(arr);
    });
  });
});
