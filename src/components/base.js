import {create as createVirtualNode} from '../vdom/node';
// import componentStore from '../store/component';
import {shallowMerge} from '../utils/object';

export default class Component {
    constructor(props, children=[]) {
        this.props = shallowMerge({}, props);
        this.children = children.slice();
    }
    render() {
        return <div></div>;
    }
}
