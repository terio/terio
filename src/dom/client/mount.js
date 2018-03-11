import {mount as mountNode} from './node';
import {TERIO_ROOT} from '../../constants/attr';
import {isFunction} from '../../utils/type';
import {isComponentClass} from '../../classes/component';
import Prop from '../../vdom/prop';

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
    node = node.clone();
    node.props.add(new Prop(TERIO_ROOT, ''));
    node = node.inflate();
    return mountNode($parent, node, shouldHydrate);
}
