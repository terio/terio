function create(type, props, ...children) {
    return {type, props: props || {}, children: children || [], $$vnode: true};
}
export {
    create
};
