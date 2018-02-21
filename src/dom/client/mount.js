import {create as createDOMNode} from './node';
import {LOKI_ROOT} from '../../constants/attr';
import {isFunction} from '../../utils/type';

export default function mount(node, $parent) {
    const IS_HYDRATED = $parent.childNodes.length === 1 &&
        $parent.firstChild.hasAttribute &&
        $parent.firstChild.hasAttribute(LOKI_ROOT);
    if(!IS_HYDRATED && $parent.childNodes.length) {
        throw 'parent is not empty!';
    }
    if(!isFunction(node.type)) {
        throw 'root should be component or a function!';
    }
    const tree = {
        children: [node]
    };
    const $node = createDOMNode($parent, tree, 0, IS_HYDRATED, true);
    console.log('Tree is ', tree);
    return IS_HYDRATED ? $node : $parent.appendChild($node);
}
