import TYPE from '../constants/type'

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
    console.log(getType(variable), TYPE.function)
    return getType(variable) === TYPE.function;
}
function isArray(variable) {
    return getType(variable) === TYPE.array;
}
export {
    getType,
    isString,
    isFunction,
    isArray
}
