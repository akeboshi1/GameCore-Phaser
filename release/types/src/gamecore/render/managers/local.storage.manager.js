var LocalStorageManager = /** @class */ (function () {
    function LocalStorageManager() {
    }
    LocalStorageManager.prototype.setItem = function (key, value) {
        localStorage.setItem(key, value);
    };
    LocalStorageManager.prototype.removeItem = function (key) {
        localStorage.removeItem(key);
    };
    LocalStorageManager.prototype.getItem = function (key) {
        return localStorage.getItem(key);
    };
    LocalStorageManager.prototype.clear = function () {
        localStorage.clear();
    };
    LocalStorageManager.prototype.destroy = function () {
        this.clear();
    };
    return LocalStorageManager;
}());
export { LocalStorageManager };
//# sourceMappingURL=local.storage.manager.js.map