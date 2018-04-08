import {isString, isDefined, isFunction, areDifferentTypes} from '../utils/type';
import {toString} from '../utils/string';
import PropList from './prop-list';
import {isComponentClass} from '../classes/component';
import {VOID_ELEMENTS} from '../constants/element';
import {isPlaceHolder, default as placeholder} from './placeholder';
import {isFragment, isFragmentClass, default as Fragment} from './fragment';

const PLACEHOLDER_POSSIBLE_VALUES = new Set([null, undefined, false, '']);

export default class VNode {
    constructor(type, props, ...children) {
        this.type = type;
        this.props = new PropList(props);
        this.children = mergeAdjacentTextNodes(children.map(child => {
            if(isVNode(child) || isFragment(child)) {
                return child;
            }
            if(isPlaceHolder(child) || PLACEHOLDER_POSSIBLE_VALUES.has(child)) {
                return placeholder;
            }
            return toString(child);
        }));
        this.isSelfClosing = isFunction(this.type) || VOID_ELEMENTS.has(this.type);
    }
    inflate() {
        const newNode = this.shallowInflate(true);
        newNode.children = VNode.inflateArray(newNode.children);
        return newNode;
    }
    shallowInflate(clone = false) {
        if(isComponentClass(this.type)) {
            const component = new this.type(this.props, this.children);
            const vnode =  component._render();
            vnode.component = component;
            return vnode;
        }
        return clone ? this.clone() : this;
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
        return node;
    }
}
//Fragments are left with their children inflated
VNode.inflateArray = function(arr) {
    const nodes = [];
    for(let i = 0; i < arr.length; i++) {
        const node = arr[i];
        if(isString(node) || isPlaceHolder(node)) {
            nodes.push(node);
            continue;
        }
        if(isFragment(node)) {
            nodes.push(new Fragment(VNode.inflateArray(node.children)));
            continue;
        }
        nodes.push(node.inflate());
    }
    return nodes;
};
VNode.getNonEmptyNodesBeforeIdx = function(children, idx = -1) {
    if(idx === -1) {
        idx = children.length;
    }
    const nonEmptyNodes = [];
    for(let i = 0; i < idx; i++) {
        const child = children[i];
        if(isFragment(child) && child.children.length) {
            nonEmptyNodes.push(...VNode.getNonEmptyNodesBeforeIdx(child.children));
            continue;
        }
        if(!isPlaceHolder(child)) {
            nonEmptyNodes.push(child);
            continue;
        }
    }
    return nonEmptyNodes;
};
VNode.diff = function(newNode, oldNode) {
    const diff = {
        newNode: {
            exists: true
        },
        oldNode: {
            exists: true
        },
        areDifferentTypes: false,
        areDifferentTexts: false,
        props: {
            added: new PropList(),
            removed: new PropList(),
            updated: new PropList()
        }
    };
    if(isPlaceHolder(newNode) && isPlaceHolder(oldNode)) {
        diff.newNode.exists = false;
        diff.oldNode.exists = false;
        return diff;
    }
    if(!newNode || isPlaceHolder(newNode)) {
        diff.newNode.exists = false;
        return diff;
    }
    if(!oldNode|| isPlaceHolder(oldNode)) {
        diff.oldNode.exists = false;
        return diff;
    }
    if((newNode.type !== oldNode.type) || areDifferentTypes(newNode, oldNode) || areDifferentTypes(newNode.component, oldNode.component)) {
        diff.areDifferentTypes = true;
        return diff;
    }
    if(isString(newNode)) {
        if(newNode !== oldNode) {
            diff.areDifferentTexts = true;
        }
        return diff;
    }
    if(isFragment(newNode)) {
        return diff;
    }
    for(const prop of oldNode.props.toArray()) {
        if(!newNode.props.has(prop.name)) {
            diff.props.removed.add(prop);
            continue;
        }
        if(prop.value !== newNode.props.get(prop.name)) {
            if(prop.isEvent) {
                diff.props.removed.add(prop);
                diff.props.added.add(newNode.props.get(prop.name));
                continue;
            }
            diff.props.updated.add(newNode.props.get(prop.name));
        }
    }
    for(const prop of newNode.props.toArray()) {
        if(!oldNode.props.has(prop.name)) {
            diff.props.added.add(prop);
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
    if(isFragmentClass(type)) {
        return new Fragment(children);
    }
    return new VNode(type, props, ...children);
}
function isVNode(node) {
    return node instanceof VNode;
}
export {
    createVirtualNode as create,
    isVNode
};
