import TYPE from '../constants/type';

function getType(variable) {
    const type = typeof variable;
    if(TYPE[type] === TYPE.object) {
        if(variable === null) {
            return TYPE.null;
        }
        if(variable.constructor) {
            return variable.constructor.name;
        }
    }
    return TYPE[type];
}
function isString(variable) {
    return getType(variable) === TYPE.string;
}
function isFunction(variable) {
    return getType(variable) === TYPE.function;
}
function isArray(variable) {
    return getType(variable) === TYPE.array;
}
function areDifferentTypes(a, b) {
    return getType(a) !== getType(b);
}
function isDefined(variable) {
    return getType(variable) !== TYPE.undefined;
}
function isNull(variable) {
    return getType(variable) !== TYPE.null;
}
function isObject(variable) {
    return getType(variable) !== TYPE.object;
}
function isVNode(variable) {
    return variable && variable.$$vnode;
}
export {
    getType,
    isString,
    isFunction,
    isArray,
    areDifferentTypes,
    isDefined,
    isNull,
    isObject,
    isVNode
};
