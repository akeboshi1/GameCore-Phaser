import { EventDispatcher } from "structure";
var BaseDataControlManager = /** @class */ (function () {
    function BaseDataControlManager(game) {
        this.mGame = game;
        this.mEvent = new EventDispatcher();
        this.initPackMap();
        this.initDataMap();
    }
    BaseDataControlManager.prototype.initPackMap = function () {
    };
    BaseDataControlManager.prototype.initDataMap = function () {
    };
    Object.defineProperty(BaseDataControlManager.prototype, "emitter", {
        get: function () {
            return this.mEvent;
        },
        enumerable: true,
        configurable: true
    });
    BaseDataControlManager.prototype.init = function () {
    };
    BaseDataControlManager.prototype.addPackListener = function () {
        this.mPackMap.forEach(function (value) {
            value.addPackListener();
        });
    };
    BaseDataControlManager.prototype.removePackListener = function () {
        this.mPackMap.forEach(function (value) {
            value.removePackListener();
        });
    };
    BaseDataControlManager.prototype.emit = function (type, data, dataType) {
        var mEvent = this.getEvent(dataType);
        mEvent.emit(type, data);
    };
    BaseDataControlManager.prototype.on = function (event, fn, context, dataType) {
        var mEvent = this.getEvent(dataType);
        mEvent.on(event, context, fn);
    };
    BaseDataControlManager.prototype.off = function (event, fn, context, dataType) {
        var mEvent = this.getEvent(dataType);
        mEvent.off(event, context, fn);
    };
    BaseDataControlManager.prototype.clear = function () {
        this.removePackListener();
        this.mEvent.offAll();
        this.mPackMap.forEach(function (value) {
            value.clear();
        });
        this.mDataMap.forEach(function (value) {
            value.clear();
        });
    };
    BaseDataControlManager.prototype.destroy = function () {
        this.removePackListener();
        this.mEvent.destroy();
        this.mPackMap.forEach(function (value) {
            value.destroy();
        });
        this.mDataMap.forEach(function (value) {
            value.destroy();
        });
    };
    BaseDataControlManager.prototype.getDataMgr = function (type) {
        var data;
        if (this.mPackMap.has(type)) {
            data = this.mPackMap.get(type);
        }
        else if (this.mDataMap.has(type)) {
            data = this.mDataMap.get(type);
        }
        if (data)
            return data;
        return null;
    };
    BaseDataControlManager.prototype.getEvent = function (dataType) {
        var mEvent = !dataType ? this.mEvent : this.getDataMgr(dataType).Event;
        return mEvent;
    };
    return BaseDataControlManager;
}());
export { BaseDataControlManager };
export var DataMgrType;
(function (DataMgrType) {
    DataMgrType[DataMgrType["None"] = 0] = "None";
    DataMgrType[DataMgrType["BaseMgr"] = 1] = "BaseMgr";
    DataMgrType[DataMgrType["CacheMgr"] = 2] = "CacheMgr";
    DataMgrType[DataMgrType["EleMgr"] = 3] = "EleMgr";
    DataMgrType[DataMgrType["SceneMgr"] = 4] = "SceneMgr";
    DataMgrType[DataMgrType["CommonMgr"] = 5] = "CommonMgr";
    DataMgrType[DataMgrType["ChatMgr"] = 6] = "ChatMgr";
})(DataMgrType || (DataMgrType = {}));
//# sourceMappingURL=base.data.control.manager.js.map