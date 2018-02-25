import {create as createVirtualNode} from '../vdom/node';
import {defer} from '../utils/function';
import EventTarget from '../events/event-target';

export default class Component extends EventTarget {
    constructor(props, children) {
        super();
        this.props = props;
        this.children = children;
        this.state = Object.freeze({});
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
function isComponent(component) {
    return component instanceof Component;
}
function isComponentClass(fn) {
    return Component.isPrototypeOf(fn) || fn === Component;
}
export {
    isComponent,
    isComponentClass
}
