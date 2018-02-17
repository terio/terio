import {create as createDOMNode} from './node';
import {LOKI_ROOT} from '../../constants/attr';

export default function mount(node, parent) {
    let existingDOMNode;
    const IS_HYDRATED = parent.childNodes.length === 1 && parent.childNodes[0].hasAttribute(LOKI_ROOT);
    if(!IS_HYDRATED && parent.childNodes.length) {
        throw 'parent is not empty!';
    }
    if(IS_HYDRATED) {
        existingDOMNode = parent.childNodes[0];
        return createDOMNode(node, existingDOMNode, IS_HYDRATED);
    }
    const root = createDOMNode(node, existingDOMNode, IS_HYDRATED);
    root.setAttribute(LOKI_ROOT, '');
    return parent.appendChild(root);
}
