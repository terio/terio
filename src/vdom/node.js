function create(type, props, ...children) {
    return {type, props, children, $$vnode: true};
}
export {
    create
};
