import { op_def } from "pixelpai_proto";
import { Logger } from "structure";
import { State } from "./state.group";
var BaseStateManager = /** @class */ (function () {
    function BaseStateManager(room) {
        this.room = room;
        this.init();
    }
    BaseStateManager.prototype.setState = function (stateGroup) {
        if (!this.stateMap)
            this.stateMap = new Map();
        var owner = stateGroup.owner, state = stateGroup.state;
        var waitExec = new Map();
        for (var _i = 0, state_1 = state; _i < state_1.length; _i++) {
            var sta = state_1[_i];
            var parse = new State(sta, owner);
            this.stateMap.set(parse.name, parse);
            waitExec.set(parse.name, parse);
        }
        this.handleStates(waitExec);
    };
    BaseStateManager.prototype.handleStates = function (states) {
        var _this = this;
        if (!states)
            return;
        states.forEach(function (state) { return _this.handleState(state); });
    };
    BaseStateManager.prototype.destroy = function () {
        var _this = this;
        if (!this.stateMap)
            return;
        this.stateMap.forEach(function (state) { return _this.delete.handler(state); });
        this.stateMap.clear();
        this.add = null;
        this.delete = null;
    };
    BaseStateManager.prototype.handleState = function (state) {
        switch (state.execCode) {
            case op_def.ExecCode.EXEC_CODE_ADD:
            case op_def.ExecCode.EXEC_CODE_UPDATE:
                this.add.handler(state);
                break;
            case op_def.ExecCode.EXEC_CODE_DELETE:
                this.delete.handler(state);
                break;
            default:
                Logger.getInstance().warn(state.execCode + " is not defined");
                break;
        }
    };
    BaseStateManager.prototype.init = function () {
    };
    return BaseStateManager;
}());
export { BaseStateManager };
var BaseHandler = /** @class */ (function () {
    function BaseHandler(room) {
        this.room = room;
    }
    BaseHandler.prototype.handler = function (state) {
        if (!state) {
            return;
        }
        var fun = this[state.name];
        if (!fun) {
            return Logger.getInstance().warn(state.name + " is not defined definition");
        }
        fun.call(this, state);
    };
    BaseHandler.prototype.init = function (param) {
    };
    return BaseHandler;
}());
export { BaseHandler };
//# sourceMappingURL=base.state.manager.js.map