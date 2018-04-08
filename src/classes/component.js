import {create as createVirtualNode} from '../vdom/node';
import {defer, noop} from '../utils/function';

export default class Component {
    constructor(props, children) {
        this.props = props;
        this.children = children;
        this.state = Object.freeze({});
    }
    mounted(){}
    willUnmount(){}
    setState(state, done) {
        this.state = Object.freeze(Object.assign({}, state));
        done = done || noop;
        if(this.onStateChange) {
            // defer(this.onStateChange, done);
            this.onStateChange(done);
        }
    }
    render() {
        return <div></div>;
    }
    _render() {
        return <div {...this.props}>{this.render()}</div>;
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
