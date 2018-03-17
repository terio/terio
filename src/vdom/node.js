import {isString, isDefined, isFunction, areDifferentTypes} from '../utils/type';
import {toString} from '../utils/string';
import PropList from './prop-list';
import {isComponentClass} from '../classes/component';
import {VOID_ELEMENTS} from '../constants/element';
import {isPlaceHolder, default as placeholder} from './placeholder';

const PLACEHOLDER_POSSIBLE_VALUES = new Set([null, undefined, false, '']);

export default class VNode {
    constructor(type, props, ...children) {
        this.type = type;
        this.props = new PropList(props);
        this.children = mergeAdjacentTextNodes(children.map(child => {
            if(isVNode(child)) {
                return child;
            }
            if(isPlaceHolder(child) || PLACEHOLDER_POSSIBLE_VALUES.has(child)) {
                return placeholder;
            }
            return toString(child);
        }));
        this.isSelfClosing = isFunction(this.type) || VOID_ELEMENTS.has(this.type);
    }
    inflate(id) {
        if(isComponentClass(this.type)) {
            const component = new this.type(this.props, this.children);
            const vnode =  <div {...this.props}>{component.render()}</div>;
            vnode.component = component;
            return vnode.inflate(id);
        }
        const newNode = this.clone();
        newNode.id = id;
        newNode.children = newNode.children.map(function(child, idx) {
            if(isString(child) || isPlaceHolder(child)) {
                return child;
            }
            return child.inflate(`${id}.${idx}`);
        });
        return newNode;
    }
    set component(component) {
        this.$$component = component;
        return component;
    }
    set id(id) {
        this.$$id = id;
        return id;
    }
    get id() {
        return this.$$id;
    }
    get component() {
        return this.$$component;
    }
    isInflated() {
        return isDefined(this.component);
    }
    isComponentNode() {
        return !!this.component;
    }
    clone() {
        const node = new VNode(this.type, this.props, ...this.children);
        if(this.isInflated()) {
            node.component = this.component;
        }
        return node;
    }
}
VNode.getNonEmptyNodesBeforeIdx= function(children, idx) {
    const nonEmptyNodes = [];
    for(let i = 0; i < idx; i++) {
        if(!isPlaceHolder(children[i])) {
            nonEmptyNodes.push(children[i]);
        }
    }
    return nonEmptyNodes;
};
VNode.diff = function(firstNode, secondNode) {
    const diff = {
        FIRST_NODE_EXISTS: true,
        SECOND_NODE_EXISTS: true,
        ARE_DIFFERENT_TYPES: false,
        ARE_DIFFERENT_TEXTS: false,
        ADDED_PROPS: new PropList(),
        REMOVED_PROPS: new PropList(),
        UPDATED_PROPS: new PropList()
    };
    if(isPlaceHolder(firstNode) && isPlaceHolder(secondNode)) {
        diff.FIRST_NODE_EXISTS = false;
        diff.SECOND_NODE_EXISTS = false;
        return diff;
    }
    if(!firstNode || isPlaceHolder(firstNode)) {
        diff.FIRST_NODE_EXISTS = false;
        return diff;
    }
    if(!secondNode|| isPlaceHolder(secondNode)) {
        diff.SECOND_NODE_EXISTS = false;
        return diff;
    }
    if(areDifferentTypes(firstNode, secondNode) || areDifferentTypes(firstNode.component, secondNode.component)) {
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
        if(prop.value !== firstNode.props.get(prop.name)) {
            if(prop.isEvent) {
                diff.REMOVED_PROPS.add(prop);
                diff.ADDED_PROPS.add(firstNode.props.get(prop.name));
                continue;
            }
            diff.UPDATED_PROPS.add(firstNode.props.get(prop.name));
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
