import {isString, isDefined, isFunction, getType, areDifferentTypes, isTextNode} from '../utils/type';
import {toString} from '../utils/string';
import PropList from './prop-list';
import {isComponentClass} from '../components/base';
import {VOID_ELEMENTS} from '../constants/element';

export default class VNode {
    constructor(type, props, ...children) {
        this.type = type;
        this.props = new PropList(props);
        this.children = mergeAdjacentTextNodes(children.map(child => {
            if(isVNode(child)) {
                return child;
            }
            return toString(child);
        }));
        this.isSelfClosing = isString(this.type) && VOID_ELEMENTS.has(this.type);
    }
    inflate() {
        if(isComponentClass(this.type)) {
            const component = new this.type(this.props, this.children);
            const vnode =  <div {...this.props}>{component.render()}</div>;
            vnode.component = component;
            vnode.originalNode = this;
            return vnode.inflate();
        }
        const newNode = this.clone();
        newNode.children = newNode.children.map(function(child) {
            if(isString(child)) {
                return child;
            }
            return child.inflate();
        });
        return newNode;
    }
    set component(component) {
        this.$$component = component;
        return component;
    }
    set originalNode(node) {
        this.$$originalNode = node;
        return node;
    }
    get originalNode() {
        return this.$$originalNode;
    }
    get component() {
        return this.$$component;
    }
    isInflated() {
        return isDefined(this.component) && isDefined(this.originalNode);
    }
    isComponentNode() {
        return !!this.component;
    }
    clone() {
        const node = new VNode(this.type, this.props, ...this.children);
        if(this.isInflated()) {
            node.component = this.component;
            node.originalNode = this.originalNode;
        }
        return node;
    }
}
VNode.diff = function(firstNode, secondNode) {
    const diff = {
        ARE_DIFFERENT_TYPES: false,
        ARE_DIFFERENT_TEXTS: false,
        ADDED_PROPS: new PropList(),
        REMOVED_PROPS: new PropList(),
        UPDATED_PROPS: new PropList()
    };
    if(areDifferentTypes(firstNode, secondNode)) {
        diff.ARE_DIFFERENT_TYPES = true;
        return diff;
    }
    if(isString(firstNode)) {
        if(firstNode !== secondNode) {
            diff.ARE_DIFFERENT_TEXTS = true;
        }
        return diff;
    }
    if(firstNode.type !== secondNode.type) {
        diff.ARE_DIFFERENT_TYPES = true;
        return diff;
    }
    for(const prop of secondNode.props.toArray()) {
        if(!firstNode.props.has(prop.name)) {
            diff.REMOVED_PROPS.add(prop);
            continue;
        }
        if(prop.value !== firstNode.props.getProp(prop.name)) {
            if(prop.isEvent) {
                diff.REMOVED_PROPS.add(prop);
                diff.ADDED_PROPS.add(firstNode.props.getProp(prop.name));
                continue;
            }
            diff.UPDATED_PROPS.add(firstNode.props.getProp(prop.name));
        }
    }
    for(const prop of firstNode.props.toArray()) {
        if(!secondNode.props.has(prop.name)) {
            diff.ADDED_PROPS.add(prop);
            continue;
        }
    }
    return diff;
};
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
function createVirtualNode(type, props, ...children) {
    return new VNode(type, props, ...children);
}
function isVNode(node) {
    return node instanceof VNode;
}
export {
    createVirtualNode as create,
    isVNode
};
