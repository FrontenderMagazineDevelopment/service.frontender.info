

import { transliterate as tr } from 'transliteration';

const translit = require('translitit-cyrillic-russian-to-latin');

const cyrillicPatternOne = /[\u0400-\u04FF]/;
// const cyrillicPatternTwo = /[а-яА-ЯЁёҐїЇіІєЄ]/;

/**
 * @class Class to get variations of name
 */
export default class Translit {
  /**
     * @constructor
     * @param names {Array} array of names
     * @returns {Array} array of names with variations
     */
  constructor(namesList) {
    let names = (!Array.isArray(namesList) && typeof namesList === 'string') ? new Array(namesList) : namesList;
    names = names.map((name)=>cyrillicPatternOne.test(name) ? [name, tr(name), translit(name)] : [name]).reduce((a, b)=>a.concat(b));
    return Array.from(new Set(names));
  }
}
