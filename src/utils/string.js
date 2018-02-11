function toLowerCase(str) {
    return String.prototype.toLowerCase.call(str);
}
function toUpperCase(str) {
    return String.prototype.toUpperCase.call(str);
}
function toTitleCase(str) {
    try {
        return toUpperCase(str[0]) + toLowerCase(str.substr(1));
    } catch(e) {
        return str;
    }
}
export {
    toLowerCase,
    toTitleCase
};
