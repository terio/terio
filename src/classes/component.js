import {create as createVirtualNode} from '../vdom/node';
import Children from '../vdom/children';
import {defer, noop} from '../utils/function';
import VNode from '../vdom/node';

export default class Component {
    constructor(props, children) {
        this.props = props;
        this.children = Children.from(children);
        this.state = Object.freeze({});
    }
    mounted(){}
    willUnmount(){}
    setState(state, done) {
        this.state = Object.freeze(Object.assign({}, state));
        done = done || noop;
        if(this.onStateChange) {
            defer(this.onStateChange, done);
        }
    }
    render() {
        return null;
    }
    _render() {
        return VNode.toVNode(this.render());
    }
}
function isComponent(component) {
    return component instanceof Component;
}
function isComponentClass(fn) {
    return Component.isPrototypeOf(fn) || fn === Component;
}
export {
    isComponent,
    isComponentClass
};
