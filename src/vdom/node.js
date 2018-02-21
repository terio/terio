import {isVNode} from '../utils/type';
import {toString} from '../utils/string';

function create(type, props, ...children) {
    return {
        type,
        props: props || {},
        children: children.map(child => {
            if(isVNode(child)) {
                return child;
            }
            return toString(child);
        }) || [],
        $$vnode: true
    };
}
export {
    create
};
