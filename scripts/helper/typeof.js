function isString(value) {
    return typeof value === 'string';
}
function isNumber(value) {
    return typeof value === 'number';
}
function isBoolean(value) {
    return typeof value === 'boolean';
}
function isDate(value) {
    return typeof value === 'date';
}
function isObject(value) {
    return typeof value === 'object';
}
function isArray(value) {
    return Array.isArray(value);
}
hexo.extend.helper.register('isString', isString);
hexo.extend.helper.register('isNumber', isNumber);
hexo.extend.helper.register('isBoolean', isBoolean);
hexo.extend.helper.register('isDate', isDate);
hexo.extend.helper.register('isObject', isObject);
hexo.extend.helper.register('isArray', isArray);