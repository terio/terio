function defer(fn, args) {
    setTimeout(fn.call(null, args));
}
function noop() {}
export {
    defer,
    noop
};
