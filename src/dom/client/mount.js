import {create as createDOMNode} from './node';
import {TERIO_ROOT} from '../../constants/attr';
import {isFunction} from '../../utils/type';
import {isComponentClass} from '../../components/base';

export default function mount(node, $parent) {
    const IS_HYDRATED = $parent.childNodes.length === 1 &&
        $parent.firstChild.hasAttribute &&
        $parent.firstChild.hasAttribute(TERIO_ROOT);
    if(!IS_HYDRATED && $parent.childNodes.length) {
        throw 'parent is not empty!';
    }
    if(!isFunction(node.type) || !isComponentClass(node.type)) {
        throw 'root should be component or a function!';
    }
    const tree = {
        children: [node.inflate()]
    };
    const $node = createDOMNode($parent, tree, 0, IS_HYDRATED, true);
    return IS_HYDRATED ? $node : $parent.appendChild($node);
}
