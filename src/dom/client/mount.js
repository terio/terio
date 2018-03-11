import {mount as mountNode} from './node';
import {TERIO_ROOT} from '../../constants/attr';
import {isFunction} from '../../utils/type';
import {isComponentClass} from '../../classes/component';
import Prop from '../../vdom/prop';

let counter = 0;
const treeMap = {};

export default function mount(node, $parent) {
    const shouldHydrate = $parent.childNodes.length === 1 &&
        $parent.firstChild.hasAttribute &&
        $parent.firstChild.hasAttribute(TERIO_ROOT);
    if(!shouldHydrate && $parent.childNodes.length) {
        throw 'parent is not empty!';
    }
    if(!isFunction(node.type) || !isComponentClass(node.type)) {
        throw 'root should be component or a function!';
    }
    const treeId = `#${counter++}`;
    node = node.clone();
    node.props.add(new Prop(TERIO_ROOT, treeId));
    node = node.inflate(`${treeId}.0`);
    treeMap[treeId] = mountNode($parent, node, shouldHydrate);
    return treeMap[treeId];
}
