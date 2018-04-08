export default class Fragment {
    constructor(children) {
        this.children = children;
    }
};

function isFragment(fragment) {
    return fragment instanceof Fragment;
}
function isFragmentClass(fn) {
    return Fragment.isPrototypeOf(fn) || fn === Fragment;
}
export {
    isFragment,
    isFragmentClass
};
