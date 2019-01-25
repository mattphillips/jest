/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

'use strict';

export type ValueType =
  | 'array'
  | 'boolean'
  | 'function'
  | 'null'
  | 'number'
  | 'object'
  | 'regexp'
  | 'map'
  | 'set'
  | 'date'
  | 'string'
  | 'symbol'
  | 'undefined';

// get the type of a value with handling the edge cases like `typeof []`
// and `typeof null`
const getType = (value: any): ValueType => {
  if (value === undefined) {
    return 'undefined';
  } else if (value === null) {
    return 'null';
  } else if (Array.isArray(value)) {
    return 'array';
  } else if (typeof value === 'boolean') {
    return 'boolean';
  } else if (typeof value === 'function') {
    return 'function';
  } else if (typeof value === 'number') {
    return 'number';
  } else if (typeof value === 'string') {
    return 'string';
  } else if (typeof value === 'object') {
    if (value.constructor === RegExp) {
      return 'regexp';
    } else if (value.constructor === Map) {
      return 'map';
    } else if (value.constructor === Set) {
      return 'set';
    } else if (value.constructor === Date) {
      return 'date';
    }
    return 'object';
    // $FlowFixMe https://github.com/facebook/flow/issues/1015
  } else if (typeof value === 'symbol') {
    return 'symbol';
  }

  throw new Error(`value of unknown type: ${value}`);
};

export default getType;
