var StateGroup = /** @class */ (function () {
    function StateGroup() {
        this.states = [];
    }
    StateGroup.prototype.update = function (group) {
        this.mName = group.owner.name;
    };
    return StateGroup;
}());
export { StateGroup };
var State = /** @class */ (function () {
    function State(state, owner) {
        this.owner = owner;
        this.type = state.type;
        this.name = state.name;
        this.execCode = state.execCode;
        this.packet = state.packet;
    }
    return State;
}());
export { State };
//# sourceMappingURL=state.group.js.map