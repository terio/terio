import {isVNode, isString} from '../utils/type';
import {toString} from '../utils/string';
function mergeAdjacentTextNodes(children) {
    let str = '';
    const mergedChildren = [];
    children.forEach((child) => {
        if(!isString(child)) {
            if(str) {
                mergedChildren.push(str);
            }
            str = '';
            mergedChildren.push(child);
            return;
        }
        str += child;
    });
    if(str) {
        mergedChildren.push(str);
    }
    return mergedChildren;
}
function create(type, props, ...children) {
    return {
        type,
        props: props || {},
        children: mergeAdjacentTextNodes(children.map(child => {
            if(isVNode(child)) {
                return child;
            }
            return toString(child);
        })),
        $$vnode: true
    };
}
export {
    create
};
