import {isString, isDefined} from '../utils/type';
import {toString} from '../utils/string';
import PropList from './prop-list';
import {isComponentClass} from '../components/base';
import {VOID_ELEMENTS} from '../constants/element';

export default class VNode {
    constructor(type, props, ...children) {
        this.type = type;
        this.props = new PropList(props || {});
        this.children = mergeAdjacentTextNodes(children.map(child => {
            if(isVNode(child)) {
                return child;
            }
            return toString(child);
        }));
        this.isSelfClosing = isString(this.type) && VOID_ELEMENTS.has(this.type);
    }
    inflate(noClone = false) {
        if(isComponentClass(this.type)) {
            const component = new this.type(this.props, this.children);
            const vnode =  component.render();
            vnode.setComponent(component);
            return vnode.inflate(noClone);
        }
        const newNode = noClone ? this : this.clone();
        newNode.children = newNode.children.map(function(child) {
            if(isString(child)) {
                return child;
            }
            return child.inflate(noClone);
        });
        return newNode;
    }
    setComponent(component) {
        this.$$component = component;
        return this;
    }
    getComponent(component) {
        return this.$$component;
    }
    isComponentSet() {
        return isDefined(this.$$component);
    }
    clone() {
        const node = new VNode(this.type, this.props, ...this.children);
        if(this.isComponentSet()) {
            node.setComponent(this.getComponent());
        }
        return node;
    }
}

function mergeAdjacentTextNodes(children) {
    let str = '';
    const mergedChildren = [];
    children.forEach((child) => {
        if(!isString(child)) {
            if(str) {
                mergedChildren.push(str);
            }
            str = '';
            mergedChildren.push(child);
            return;
        }
        str += child;
    });
    if(str) {
        mergedChildren.push(str);
    }
    return mergedChildren;
}
function create(type, props, ...children) {
    return new VNode(type, props, ...children);
}
function isVNode(node) {
    return node instanceof VNode;
}
export {
    create,
    isVNode
};
