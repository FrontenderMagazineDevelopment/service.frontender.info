

/**
 * Small usefull functions
 * @class Utilities 
 */
export default class Utilities {
  /**
     * Flatten array
     * @param array {Array} array to flatten
     */
  flatten(array, mutable) {
    const toString = Object.prototype.toString;
    const arrayTypeStr = '[object Array]';

    const result = [];
    const nodes = (mutable && array) || array.slice();
    let node;

    if (!array.length) {
      return result;
    }

    node = nodes.pop();

    do {
      if (toString.call(node) === arrayTypeStr) {
        nodes.push(...node);
      } else {
        result.push(node);
      }
    } while (nodes.length && (node = nodes.pop()) !== undefined);

    result.reverse(); // we reverse result to restore the original order
    return result;
  }
}
