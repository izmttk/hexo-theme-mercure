const {
  isString,
  isNumber,
  isBoolean,
  isDate,
  isObject,
  isObjectLike,
  isPlainObject,
  isNull,
  isUndefined,
  isArray,
  isArrayLike,
} = require('../../utils/is');

hexo.extend.helper.register('isString', isString);
hexo.extend.helper.register('isNumber', isNumber);
hexo.extend.helper.register('isBoolean', isBoolean);
hexo.extend.helper.register('isDate', isDate);
hexo.extend.helper.register('isObject', isObject);
hexo.extend.helper.register('isObjectLike', isObjectLike);
hexo.extend.helper.register('isPlainObject', isPlainObject);
hexo.extend.helper.register('isNull', isNull);
hexo.extend.helper.register('isUndefined', isUndefined);
hexo.extend.helper.register('isArray', isArray);
hexo.extend.helper.register('isArrayLike', isArrayLike);
