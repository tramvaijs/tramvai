/**
 * Represents a node in the doubly linked list
 * @interface
 * @template Value
 */
interface ListNode<Value> {
  /** Reference to next node */
  next: ListNode<Value> | null;
  /** Reference to previous node */
  prev: ListNode<Value> | null;
  /** The node's value */
  value: Value;
}

/**
 * Represents a doubly linked list data structure.
 * @template Value The type of elements held in the list
 */
export class DoubleLinkedList<Value> {
  /**
   * The number of elements in the list
   * @type {number}
   */
  length: number;
  /**
   * Reference to the first node in the list
   * @type {ListNode<Value> | null}
   */
  start: null | ListNode<Value>;
  /**
   * Reference to the last node in the list
   * @type {ListNode<Value> | null}
   */
  end: null | ListNode<Value>;

  /**
   * Creates a new DoubleLinkedList instance
   * @constructor
   * @param {Value[]} [initArray] Optional array of initial values
   * @example
   * const list = new DoubleLinkedList([1, 2, 3]);
   */
  constructor(initArray?: Value[]) {
    this.length = 0;
    this.start = null;
    this.end = null;
    if (initArray) {
      for (const item of initArray) {
        this.push(item);
      }
    }
  }

  /**
   * Adds a value to the end of the list
   * @param {Value} value The value to add
   * @example
   * list.push(42);
   */
  push(value: Value): void {
    const newNode = {
      value,
      next: null,
      prev: null,
    };
    this.length++;
    if (this.start === null) {
      this.start = newNode;
      this.end = newNode;
      return;
    }

    const currentEnd = this.end;
    this.end = newNode;
    this.end.prev = currentEnd;
    if (currentEnd !== null) {
      currentEnd.next = this.end;
    }
  }

  /**
   * Removes and returns the last value from the list
   * @returns {Value | null} The removed value or null if list is empty
   * @example
   * const last = list.pop();
   */
  pop(): Value | null {
    if (this.end === null) {
      return null;
    }
    this.length--;
    // if equal we have only 1 node, so we just remove start
    if (this.end === this.start) {
      this.start = null;
    }
    const { value } = this.end;
    this.end = this.end.prev;
    if (this.end) {
      this.end.next = null;
    }

    return value;
  }

  /**
   * Removes and returns the first value from the list
   * @returns {Value | null} The removed value or null if list is empty
   * @example
   * const first = list.shift();
   */
  shift(): Value | null {
    if (this.start === null) {
      return null;
    }
    this.length--;
    // if equal we have only 1 node, so we just remove end
    if (this.end === this.start) {
      this.end = null;
    }
    const { value } = this.start;
    this.start = this.start.next;
    if (this.start) {
      this.start.prev = null;
    }

    return value;
  }

  /**
   * Returns the current number of elements in the list
   * @returns {number} The list size
   * @example
   * const size = list.size();
   */
  size() {
    return this.length;
  }

  /**
   * Converts the list to an array of values
   * @returns {Value[]} Array containing list values
   * @example
   * const arr = list.toArray();
   */
  toArray(): Value[] {
    const result = [];
    let current = this.start;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }

  /**
   * Returns a JSON string representation of the list
   * @returns {string} JSON string of values
   * @example
   * const str = list.toString(); // "[1,2,3]"
   */
  toString() {
    const result = [this.start?.value];
    let currentNode = this.start;
    while (currentNode?.next) {
      result.push(currentNode.next.value);
      currentNode = currentNode.next;
    }
    return JSON.stringify(result);
  }

  /**
   * Iterates through the list values
   * @yields {Value} The next value in the list
   * @example
   * for (const value of list) {
   *   console.log(value);
   * }
   */
  *[Symbol.iterator]() {
    let current = this.start;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}
