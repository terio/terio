import {create as createDOMNode} from './node'

export default function mount(node, parent) {
    return parent.appendChild(createDOMNode(node));
}
