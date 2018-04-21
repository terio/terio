import {isUnDefined} from '../utils/type';
import {default as Prop} from './prop';

export default class Fragment {
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
};
function isFragment(fragment) {
    return fragment instanceof Fragment;
}
function isFragmentClass(fn) {
    return Fragment.isPrototypeOf(fn) || fn === Fragment;
}
export {
    isFragment,
    isFragmentClass
};
