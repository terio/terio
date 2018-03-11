function defer(fn, ...args) {
    setTimeout(fn.bind(null, ...args));
}
function noop() {}
export {
    defer,
    noop
};
