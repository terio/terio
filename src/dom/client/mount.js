import {create as createDOMNode} from './node';
import {LOKI_ROOT} from '../../constants/attr';

export default function mount(node, parent) {
    let existingDOMNode;
    const IS_HYDRATED = parent.childNodes.length === 1 &&
        parent.firstChild.hasAttribute &&
        parent.firstChild.hasAttribute(LOKI_ROOT);
    if(!IS_HYDRATED && parent.childNodes.length) {
        throw 'parent is not empty!';
    }
    if(IS_HYDRATED) {
        existingDOMNode = parent.firstChild;
        return createDOMNode(node, existingDOMNode, null, IS_HYDRATED, true);
    }
    return parent.appendChild(createDOMNode(node, existingDOMNode, null, IS_HYDRATED, true));
}
