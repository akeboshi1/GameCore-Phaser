var StateListener = /** @class */ (function () {
    function StateListener() {
        this.mStates = new Map();
    }
    StateListener.prototype.add = function (stateGroups) {
        if (!stateGroups) {
            return;
        }
        for (var _i = 0, stateGroups_1 = stateGroups; _i < stateGroups_1.length; _i++) {
            var stateGroup = stateGroups_1[_i];
            // stateGroup.owner
            // stateGroup.state
            this.mStates.set(stateGroup.owner.name, stateGroup);
            // stateGroup.state[0].execCode
            for (var _a = 0, _b = stateGroup.state; _a < _b.length; _a++) {
                var state = _b[_a];
                if (state.execCode) {
                }
            }
        }
    };
    StateListener.prototype.remove = function () {
    };
    return StateListener;
}());
export { StateListener };
//# sourceMappingURL=state.listener.js.map