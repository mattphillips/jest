/**
 * Copyright (c) 2018-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import chalk from 'chalk';
import pretty from 'pretty-format';
import {getPath} from 'jest-util';

type Table = Array<Array<any>>;

const EXPECTED_COLOR = chalk.green;
const RECEIVED_COLOR = chalk.red;

export default (cb: Function) => (...args: any) =>
  function eachBind(title: string, test: Function): void {
    if (args.length === 1) {
      const table: Table = args[0].every(Array.isArray)
        ? args[0]
        : args[0].map(entry => [entry]);
      return table.forEach(row =>
        cb(interpolate(title, row), applyRestParams(row, test)),
      );
    }

    const templateStrings = args[0];
    const data = args.slice(1);

    const keys = getHeadingKeys(templateStrings[0]);
    const table = buildTable(data, keys.length, keys);

    const missingData = data.length % keys.length;

    if (missingData > 0) {
      const error = new Error(
        'Not enough arguments supplied for given headings:\n' +
          EXPECTED_COLOR(keys.join(' | ')) +
          '\n\n' +
          'Received:\n' +
          RECEIVED_COLOR(pretty(data)) +
          '\n\n' +
          `Missing ${RECEIVED_COLOR(missingData.toString())} ${pluralize(
            'argument',
            missingData,
          )}`,
      );

      if (Error.captureStackTrace) {
        Error.captureStackTrace(error, eachBind);
      }

      return cb(title, () => {
        throw error;
      });
    }

    return table.forEach(row =>
      cb(interpolate(title, row), applyObjectParams(row, test)),
    );
  };

const applyRestParams = (params: Array<any>, test: Function) => {
  if (params.length < test.length) return done => test(...params, done);

  return () => test(...params);
};

const getHeadingKeys = (headings: string): Array<string> =>
  headings.replace(/\s/g, '').split('|');

const buildTable = (
  data: Array<any>,
  rowSize: number,
  keys: Array<string>,
): Array<any> =>
  Array.from({length: data.length / rowSize})
    .map((_, index) => data.slice(index * rowSize, index * rowSize + rowSize))
    .map(row =>
      row.reduce(
        (acc, value, index) => Object.assign({}, acc, {[keys[index]]: value}),
        {},
      ),
    );

const getMatchingKeyPaths = title => (matches, key) =>
  matches.concat(title.match(new RegExp(`\\$${key}[\\.\\w]*`, 'g')) || []);

const replaceKeyPathWithValue = data => (title, match) => {
  const keyPath = match.replace('$', '').split('.');
  const result = getPath(data, keyPath);
  const value = result.hasEndProp ? result.value : result.lastTraversedObject;
  return title.replace(match, pretty(value, {maxDepth: 1, min: true}));
};

const interpolate = (title: string, data: any) =>
  Object.keys(data)
    .reduce(getMatchingKeyPaths(title), []) // aka flatMap
    .reduce(replaceKeyPathWithValue(data), title);

const applyObjectParams = (obj: any, test: Function) => {
  if (test.length > 1) return done => test(obj, done);

  return () => test(obj);
};

const pluralize = (word: string, count: number) =>
  word + (count === 1 ? '' : 's');
