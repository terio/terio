function create(type, props, ...children) {
    return {type, props: props || {}, children, $$vnode: true};
}
export {
    create
};
