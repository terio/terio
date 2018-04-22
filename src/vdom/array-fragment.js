import {isUnDefined} from '../utils/type';
import {default as Prop} from './prop';

export default class ArrayFragment {
    constructor(children) {
        this.children = children;
        this.children.forEach((node, idx) => {
            if(!node.props) {
                return;
            }
            if(isUnDefined(node.props.get('key'))) {
                node.props.add(new Prop('key', idx));
            }
        });
    }
}
function isArrayFragment(fragment) {
    return fragment instanceof ArrayFragment;
}
function isArrayFragmentClass(fn) {
    return ArrayFragment.isPrototypeOf(fn) || fn === ArrayFragment;
}
export {
    isArrayFragment,
    isArrayFragmentClass
};
