import {create as createVirtualNode} from '../vdom/node';

export default class Component {
    constructor(props, children) {
        this.props = props;
        this.children = children;
        this.state = {};
    }
    setState() {

    }
    render() {
        return <div></div>;
    }
}
