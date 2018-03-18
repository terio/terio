export default class Fragment extends Array {};

function isFragment(fragment) {
    return fragment instanceof Fragment;
}

export {
    isFragment
};
