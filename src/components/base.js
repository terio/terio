import {create as createVirtualNode} from '../vdom/node';

export default class Component {
    constructor(props, children, rerender) {
        this.props = props;
        this.children = children;
        this.state = Object.freeze({});
        this.rerender = rerender;
    }
    setState(state) {
        this.state = Object.freeze(Object.assign({}, state));
        this.rerender();
    }
    render() {
        return <div></div>;
    }
}
