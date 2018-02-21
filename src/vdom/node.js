function create(type, props, ...children) {
    return {
        type,
        props: Object.freeze(props || {}),
        children: Object.freeze(children.filter(child => child) || []),
        $$vnode: true
    };
}
export {
    create
};
