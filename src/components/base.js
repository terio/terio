import {create as createVirtualNode} from '../vdom/node';
import {defer} from '../utils/function';

export default class Component {
    constructor(props, children, rerender) {
        this.props = props;
        this.children = children;
        this.state = Object.freeze({});
        this.rerender = rerender;
    }
    mounted(){}
    willUnmount(){}
    setState(state) {
        this.state = Object.freeze(Object.assign({}, state));
        defer(this.rerender);
    }
    render() {
        return <div></div>;
    }
}
