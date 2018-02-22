function defer(fn, args) {
    setTimeout(fn.call(null, args));
}
export {
    defer
};
