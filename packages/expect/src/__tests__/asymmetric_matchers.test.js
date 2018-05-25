/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

'use strict';

const jestExpect = require('../');
const {
  any,
  anything,
  arrayContaining,
  arrayNotContaining,
  objectContaining,
  objectNotContaining,
  stringContaining,
  stringNotContaining,
  stringMatching,
  stringNotMatching,
} = require('../asymmetric_matchers');

const Thing = function() {};

test.each`
  given       | expected
  ${String}   | ${'jest'}
  ${Number}   | ${1}
  ${Function} | ${() => {}}
  ${Boolean}  | ${true}
  ${Object}   | ${{}}
  ${Array}    | ${[]}
  ${Thing}    | ${new Thing()}
`('Any.asymmetricMatch(): $given', ({given, expected}) => {
  jestExpect(any(given).asymmetricMatch(expected)).toBe(true);
});

test('Any.toAsymmetricMatcher()', () => {
  jestExpect(any(Number).toAsymmetricMatcher()).toBe('Any<Number>');
});

test('Any throws when called with empty constructor', () => {
  jestExpect(() => any()).toThrow();
});

test('Anything matches any type', () => {
  [
    anything().asymmetricMatch('jest'),
    anything().asymmetricMatch(1),
    anything().asymmetricMatch(() => {}),
    anything().asymmetricMatch(true),
    anything().asymmetricMatch({}),
    anything().asymmetricMatch([]),
  ].forEach(test => {
    jestExpect(test).toBe(true);
  });
});

test('Anything does not match null and undefined', () => {
  [
    anything().asymmetricMatch(null),
    anything().asymmetricMatch(undefined),
  ].forEach(test => {
    jestExpect(test).toBe(false);
  });
});

test('Anything.toAsymmetricMatcher()', () => {
  jestExpect(anything().toAsymmetricMatcher()).toBe('Anything');
});

test('ArrayContaining matches', () => {
  [
    arrayContaining([]).asymmetricMatch('jest'),
    arrayContaining(['foo']).asymmetricMatch(['foo']),
    arrayContaining(['foo']).asymmetricMatch(['foo', 'bar']),
    arrayContaining([]).asymmetricMatch({}),
  ].forEach(test => {
    jestExpect(test).toEqual(true);
  });
});

test('ArrayContaining does not match', () => {
  jestExpect(arrayContaining(['foo']).asymmetricMatch(['bar'])).toBe(false);
});

test('ArrayContaining throws for non-arrays', () => {
  jestExpect(() => {
    arrayContaining('foo').asymmetricMatch([]);
  }).toThrow();
});

test('ArrayNotContaining matches', () => {
  jestExpect(arrayNotContaining(['foo']).asymmetricMatch(['bar'])).toBe(true);
});

test('ArrayNotContaining does not match', () => {
  [
    arrayNotContaining([]).asymmetricMatch('jest'),
    arrayNotContaining(['foo']).asymmetricMatch(['foo']),
    arrayNotContaining(['foo']).asymmetricMatch(['foo', 'bar']),
    arrayNotContaining([]).asymmetricMatch({}),
  ].forEach(test => {
    jestExpect(test).toEqual(false);
  });
});

test('ArrayNotContaining throws for non-arrays', () => {
  jestExpect(() => {
    arrayNotContaining('foo').asymmetricMatch([]);
  }).toThrow();
});

test('ObjectContaining matches', () => {
  [
    objectContaining({}).asymmetricMatch('jest'),
    objectContaining({foo: 'foo'}).asymmetricMatch({foo: 'foo', jest: 'jest'}),
    objectContaining({foo: undefined}).asymmetricMatch({foo: undefined}),
    objectContaining({first: objectContaining({second: {}})}).asymmetricMatch({
      first: {second: {}},
    }),
  ].forEach(test => {
    jestExpect(test).toEqual(true);
  });
});

test('ObjectContaining does not match', () => {
  [
    objectContaining({foo: 'foo'}).asymmetricMatch({bar: 'bar'}),
    objectContaining({foo: 'foo'}).asymmetricMatch({foo: 'foox'}),
    objectContaining({foo: undefined}).asymmetricMatch({}),
  ].forEach(test => {
    jestExpect(test).toEqual(false);
  });
});

test('ObjectContaining matches defined properties', () => {
  const definedPropertyObject = {};
  Object.defineProperty(definedPropertyObject, 'foo', {get: () => 'bar'});
  jestExpect(
    objectContaining({foo: 'bar'}).asymmetricMatch(definedPropertyObject),
  ).toBe(true);
});

test('ObjectContaining matches prototype properties', () => {
  const prototypeObject = {foo: 'bar'};
  let obj;

  if (Object.create) {
    obj = Object.create(prototypeObject);
  } else {
    function Foo() {}
    Foo.prototype = prototypeObject;
    Foo.prototype.constructor = Foo;
    obj = new Foo();
  }
  jestExpect(objectContaining({foo: 'bar'}).asymmetricMatch(obj)).toBe(true);
});

test('ObjectContaining throws for non-objects', () => {
  jestExpect(() => objectContaining(1337).asymmetricMatch()).toThrow();
});

test('ObjectNotContaining matches', () => {
  [
    objectNotContaining({}).asymmetricMatch('jest'),
    objectNotContaining({foo: 'foo'}).asymmetricMatch({bar: 'bar'}),
    objectNotContaining({foo: 'foo'}).asymmetricMatch({foo: 'foox'}),
    objectNotContaining({foo: undefined}).asymmetricMatch({}),
  ].forEach(test => {
    jestExpect(test).toEqual(true);
  });
});

test('ObjectNotContaining does not match', () => {
  [
    objectNotContaining({foo: 'foo'}).asymmetricMatch({
      foo: 'foo',
      jest: 'jest',
    }),
    objectNotContaining({foo: undefined}).asymmetricMatch({foo: undefined}),
    objectNotContaining({
      first: objectNotContaining({second: {}}),
    }).asymmetricMatch({first: {second: {}}}),
  ].forEach(test => {
    jestExpect(test).toEqual(false);
  });
});

test('ObjectNotContaining throws for non-objects', () => {
  jestExpect(() => objectNotContaining(1337).asymmetricMatch()).toThrow();
});

test('StringContaining matches string against string', () => {
  jestExpect(stringContaining('en*').asymmetricMatch('queen*')).toBe(true);
  jestExpect(stringContaining('en').asymmetricMatch('queue')).toBe(false);
});

test('StringContaining throws for non-strings', () => {
  jestExpect(() => {
    stringContaining([1]).asymmetricMatch('queen');
  }).toThrow();

  jestExpect(() => {
    stringContaining('en*').asymmetricMatch(1);
  }).toThrow();
});

test('StringNotContaining matches string against string', () => {
  jestExpect(stringNotContaining('en*').asymmetricMatch('queen*')).toBe(false);
  jestExpect(stringNotContaining('en').asymmetricMatch('queue')).toBe(true);
});

test('StringNotContaining throws for non-strings', () => {
  jestExpect(() => {
    stringNotContaining([1]).asymmetricMatch('queen');
  }).toThrow();

  jestExpect(() => {
    stringNotContaining('en*').asymmetricMatch(1);
  }).toThrow();
});

test('StringMatching matches string against regexp', () => {
  jestExpect(stringMatching(/en/).asymmetricMatch('queen')).toBe(true);
  jestExpect(stringMatching(/en/).asymmetricMatch('queue')).toBe(false);
});

test('StringMatching matches string against string', () => {
  jestExpect(stringMatching('en').asymmetricMatch('queen')).toBe(true);
  jestExpect(stringMatching('en').asymmetricMatch('queue')).toBe(false);
});

test('StringMatching throws for non-strings and non-regexps', () => {
  jestExpect(() => {
    stringMatching([1]).asymmetricMatch('queen');
  }).toThrow();
});

test('StringMatching throws for non-string actual values', () => {
  jestExpect(() => {
    stringMatching('en').asymmetricMatch(1);
  }).toThrow();
});

test('StringNotMatching matches string against regexp', () => {
  jestExpect(stringNotMatching(/en/).asymmetricMatch('queen')).toBe(false);
  jestExpect(stringNotMatching(/en/).asymmetricMatch('queue')).toBe(true);
});

test('StringNotMatching matches string against string', () => {
  jestExpect(stringNotMatching('en').asymmetricMatch('queen')).toBe(false);
  jestExpect(stringNotMatching('en').asymmetricMatch('queue')).toBe(true);
});

test('StringNotMatching throws for non-strings and non-regexps', () => {
  jestExpect(() => {
    stringNotMatching([1]).asymmetricMatch('queen');
  }).toThrow();
});

test('StringNotMatching throws for non-string actual values', () => {
  jestExpect(() => {
    stringNotMatching('en').asymmetricMatch(1);
  }).toThrow();
});
