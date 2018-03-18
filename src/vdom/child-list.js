export default class ChildList extends Array {};

function isChildList(childList) {
    return childList instanceof ChildList;
}

export {
    isChildList
};
