import {isString, getType, isFunction, isDefined, isUnDefined} from '../../utils/type';
import {defer} from '../../utils/function';
import {slice} from '../../utils/array';
import {toLowerCase} from '../../utils/string';
import {create as createVirtualNode, default as VNode, isVNode} from '../../vdom/node';
import {isComponent, isComponentClass} from '../../classes/component';
import {TERIO_ROOT} from '../../constants/attr';
import PropList from '../../vdom/prop-list';
import {isPlaceHolder} from '../../vdom/placeholder';
import {isFragment} from '../../vdom/fragment';

function setTextProps($node, attrs) {
    attrs.forEach((prop) => {
        $node.setAttribute(prop.name, prop.value);
    });
}
function removeTextProps($node, attrs) {
    attrs.forEach((prop) => {
        $node.removeAttribute(prop.name);
    });
}
function setEventListenerProps($node, listeners) {
    listeners.forEach((prop) => {
        $node.addEventListener(prop.name, prop.value);
    });
}
function removeEventListenerProps($node, listeners) {
    listeners.forEach((prop) => {
        $node.removeEventListener(prop.name, prop.value);
    });
}
function setProps($node, props) {
    setTextProps($node, props.textProps);
    setEventListenerProps($node, props.events);
}
function removeProps($node, props) {
    removeTextProps($node, props.textProps);
    removeEventListenerProps($node, props.events);
}

function patch($parent, parent, newNode, oldNode, idx = 0) {
    const diff = VNode.diff(newNode, oldNode);

    const patchSummary = {
        isNodeObsolete: true
    };

    if(!diff.oldNode.exists && !diff.newNode.exists) {
        return patchSummary;
    }
    const nonEmptyNodesBeforeIdx = VNode.getNonEmptyNodesBeforeIdx(parent.children, idx);
    const $node = $parent.childNodes[nonEmptyNodesBeforeIdx.length];

    if(!diff.oldNode.exists) {
        const $newNode = create(newNode);
        $parent.insertBefore($newNode, $node || null);

        doPostAttachTasks($newNode, newNode);

        return patchSummary;
    }
    if(!diff.newNode.exists) {
        if(isFragment(oldNode)) {
            const fragmentNonEmptyNodes = VNode.getNonEmptyNodesBeforeIdx(oldNode.children);
            const $start = nonEmptyNodesBeforeIdx.length;
            const $end = $start + fragmentNonEmptyNodes.length;
            const $fragmentNodes = slice($parent.childNodes, $start, $end);
            fragmentNonEmptyNodes
                .forEach((childNode, idx) => {
                    unmount($fragmentNodes[idx], childNode);
                });
            return patchSummary;
        }
        unmount($node, oldNode);

        return patchSummary;
    }
    if(diff.areDifferentTexts || diff.areDifferentTypes) {
        doPreDetachTasks($node, oldNode, idx);

        const $newNode = create(newNode);
        $parent.replaceChild($newNode, $node);

        doPostAttachTasks($newNode, newNode);

        return patchSummary;
    }
    if(isFragment(newNode)) {
        const oldFragmentNonEmptyNodes = VNode.getNonEmptyNodesBeforeIdx(oldNode.children);
        const $start = nonEmptyNodesBeforeIdx.length;
        const $end = $start + oldFragmentNonEmptyNodes.length;
        const $fragmentNodes = slice($parent.childNodes, $start, $end);
        const $nextSibling = $fragmentNodes.length ? $fragmentNodes[$fragmentNodes.length - 1].nextSibling : null;

        const newFragmentNonEmptyNodes = VNode.getNonEmptyNodesBeforeIdx(newNode.children);

        const keyNodeMap = Object.keys(diff.fragment.existing).reduce((acc, key) => {
            acc[key] = $fragmentNodes[diff.fragment.existing[key]];
            return acc;
        }, {});
        for(const oldIdx of Object.values(diff.fragment.removed)) {
            unmount($fragmentNodes[oldIdx], oldFragmentNonEmptyNodes[oldIdx]);
        }
        const $newNode = create(newNode, keyNodeMap);
        $parent.insertBefore($newNode, $nextSibling);

        newFragmentNonEmptyNodes.forEach((node, idx) => {
            const key = node.props ? node.props.get('key'): undefined;
            if(isUnDefined(key)) {
                return;
            }
            if(isDefined(diff.fragment.added[key])) {
                doPostAttachTasks($newNode._childNodes[idx], node);
            }
        });

        return patchSummary;
    }

    if(oldNode.component) {
        newNode.component = oldNode.component;
        newNode.children = [newNode.component.render().inflate()];
    }

    setProps($node, diff.props.added);
    removeProps($node, diff.props.removed);
    setProps($node, diff.props.updated);

    patchSummary.isNodeObsolete = false;

    return patchSummary;
}
function doPostAttachTasks($node, node) {
    if(isString(node)) {
        return;
    }
    if(isComponent(node.component)) {
        const component = node.component;
        component.onStateChange = function(done) {
            const renderedComponent = component.render().inflate();
            update($node, node, renderedComponent, node.children[0], 0);
            node.children = [renderedComponent];
            defer(done);
        };
        component.mounted();
    }
    VNode.getNonEmptyNodesBeforeIdx(node.children).forEach((childNode, idx) => {
        let $childNode;
        if($node._childNodes) {
            $childNode = $node._childNodes[idx];
        } else {
            $childNode = $node.childNodes[idx];
        }
        doPostAttachTasks($childNode, childNode)
    });
}
function doPreDetachTasks($node, node) {
    if(isString(node)) {
        return;
    }
    if(isComponent(node.component)) {
        const component = node.component;
        component.willUnmount();
        delete component.onStateChange;
    }
    VNode.getNonEmptyNodesBeforeIdx(node.children)
        .forEach((childNode, idx) => {
            let $childNode;
            if($node._childNodes) {
                $childNode = $node._childNodes[idx];
            } else {
                $childNode = $node.childNodes[idx];
            }
            doPreDetachTasks($childNode, childNode);
        });
}
function hydrate($node, node) {
    if(isString(node)) {
        if(getType($node) !== 'Text' || node !== $node.textContent) {
            throw 'Hydration went wrong or parent is not empty!';
        }
        return $node;
    }
    if(isFunction(node.type)) {
        return hydrate($node, node.inflate());
    }
    if(!$node || node.type !== toLowerCase($node.tagName)) {
        throw 'Hydration went wrong or parent is not empty!';
    }
    const existingProps = $node.getAttributeNames().reduce((pv, attr) => {
        pv[attr] = $node.getAttribute(attr);
        return pv;
    }, {});
    node.props.textProps.forEach((prop) => {
        if(prop.name === TERIO_ROOT) {
            setTextProps($node, [node.props.get(TERIO_ROOT)]);
            return;
        }
        if(!existingProps[prop.name] || existingProps[prop.name] !== prop.value) {
            throw 'Hydration went wrong or parent is not empty!';
        }
    });
    setEventListenerProps($node, node.props.events);
    VNode.getNonEmptyNodesBeforeIdx(node.children)
        .forEach((child, idx) => {
            if(!$node.childNodes[idx]) {
                throw 'Hydration went wrong or parent is not empty!';
            }
            return hydrate($node.childNodes[idx], child);
        });
    return $node;
}
function create(node, cache = {}) {
    if(isString(node)) {
        return document.createTextNode(node);
    }
    if(isFunction(node.type)) {
        return create(node.inflate());
    }
    let $node, key;
    if(isFragment(node)) {
        $node = document.createDocumentFragment();
        $node._childNodes = [];
    } else {
        $node = document.createElement(node.type);
        setProps($node, node.props);
    }
    VNode.getNonEmptyNodesBeforeIdx(node.children)
        .map(child => {
            if(isVNode(child)) {
                const key = child.props.get('key');
                if(isDefined(cache[key])) {
                    return cache[key];
                }
            }
            return create(child);
        })
        .forEach(function(child) {
            $node.appendChild(child);
            if($node._childNodes) {
                $node._childNodes.push(child);
            }
        });
    return $node;
}

function update($parent, parent, newNode, oldNode, idx = 0) {
    const patchSummary = patch($parent, parent, newNode, oldNode, idx);

    if(patchSummary.isNodeObsolete) {
        return;
    }
    if(isFragment(newNode) || isFragment(oldNode)) {
        return;
    }
    const $node = $parent.childNodes[VNode.getNonEmptyNodesBeforeIdx(parent.children, idx).length];

    if(!isString(newNode)) {
        const len = Math.max(oldNode.children.length, newNode.children.length);
        for(let i = 0; i < len; i++) {
            update($node, oldNode, newNode.children[i], oldNode.children[i], i);
            if(i < newNode.children.length) {
                oldNode.children[i] = newNode.children[i];
            }
        }
    }
}
function unmount($node, node) {
    doPreDetachTasks($node, node);
    $node.parentNode.removeChild($node);
}
function mount($parent, node, shouldHydrate = false) {
    let $node = $parent.firstChild;
    const inflatedNode = node.inflate();
    if(shouldHydrate) {
        hydrate($node, inflatedNode);
    } else {
        $node = $parent.appendChild(create(inflatedNode));
    }
    doPostAttachTasks($node, inflatedNode);
    return {
        node,
        $node
    };
}
export {
    mount,
    unmount
};
