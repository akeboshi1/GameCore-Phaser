var HttpLoadManager = /** @class */ (function () {
    function HttpLoadManager() {
        this.mCacheList = [];
        this.mCurLen = 0;
    }
    HttpLoadManager.prototype.update = function (time, delay) {
        if (this.mCacheList && this.mCurLen < HttpLoadManager.maxLen) {
            var tmpLen = HttpLoadManager.maxLen - this.mCurLen;
            var list = this.mCacheList.splice(0, tmpLen);
            for (var i = 0; i < tmpLen; i++) {
                var http = list[i];
                if (http) {
                    this.mCurLen++;
                    http.send();
                }
            }
        }
    };
    HttpLoadManager.prototype.destroy = function () {
        this.mCacheList.length = 0;
        this.mCacheList = [];
        this.mCurLen = 0;
    };
    HttpLoadManager.prototype.addLoader = function (loaderConfig) {
        var _this = this;
        if (this.mCurLen < HttpLoadManager.maxLen) {
            var path_1 = loaderConfig.path;
            var responseType_1 = loaderConfig.responseType;
            return new Promise(function (resolve, reject) {
                var http = new XMLHttpRequest();
                http.addEventListener("error", function () {
                    // tslint:disable-next-line:no-console
                    console.log("http error =============>>>>");
                });
                http.timeout = 20000; // 超时时间，单位是毫秒
                http.onload = function (response) {
                    _this.mCurLen--;
                    var currentTarget = response.currentTarget;
                    if (currentTarget && currentTarget["status"] === 200)
                        resolve(response.currentTarget);
                    else
                        reject(path_1 + " load error " + currentTarget["status"]);
                };
                http.onerror = function () {
                    _this.mCurLen--;
                    // tslint:disable-next-line:no-console
                    console.log("http error ====>");
                    reject(path_1 + " load error!!!!!");
                };
                http.ontimeout = function (e) {
                    _this.mCurLen--;
                    // XMLHttpRequest 超时。在此做某事。
                    // tslint:disable-next-line:no-console
                    console.log("http timeout ====>");
                    reject(path_1 + " load ontimeout!!!!!");
                };
                http.open("GET", path_1, true);
                http.responseType = responseType_1 || "";
                _this.mCurLen++;
                http.send();
            });
        }
        else {
            this.mCacheList.unshift(loaderConfig);
        }
    };
    HttpLoadManager.prototype.startSingleLoader = function (loaderConfig) {
        var _this = this;
        var path = loaderConfig.path;
        var responseType = loaderConfig.responseType;
        return new Promise(function (resolve, reject) {
            var http = new XMLHttpRequest();
            http.addEventListener("error", function () {
                // tslint:disable-next-line:no-console
                console.log("http error =============>>>>");
            });
            http.timeout = 20000; // 超时时间，单位是毫秒
            http.onload = function (response) {
                _this.mCurLen--;
                var currentTarget = response.currentTarget;
                if (currentTarget && currentTarget["status"] === 200)
                    resolve(response.currentTarget);
                else
                    reject(path + " load error " + currentTarget["status"]);
            };
            http.onerror = function () {
                _this.mCurLen--;
                // tslint:disable-next-line:no-console
                console.log("http error ====>");
                reject(path + " load error!!!!!");
            };
            http.ontimeout = function (e) {
                _this.mCurLen--;
                // XMLHttpRequest 超时。在此做某事。
                // tslint:disable-next-line:no-console
                console.log("http timeout ====>");
                reject(path + " load ontimeout!!!!!");
            };
            http.open("GET", path, true);
            http.responseType = responseType || "";
            // 当前索引大于加载最大并发数量，则放入缓存队列中
            if (_this.mCurLen >= HttpLoadManager.maxLen) {
                _this.mCacheList.push(http);
            }
            else {
                _this.mCurLen++;
                http.send();
            }
        });
    };
    HttpLoadManager.prototype.startListLoader = function (loaderConfigs) {
        var _this = this;
        return new Promise(function (reslove, reject) {
            var len = loaderConfigs.length;
            for (var i = 0; i < len; i++) {
                var loaderConfig = loaderConfigs[i];
                if (!loaderConfig)
                    continue;
                _this.startSingleLoader(loaderConfig).then(function (req) {
                    reslove(req);
                }).catch(function () {
                    reslove(null);
                });
            }
        });
    };
    HttpLoadManager.maxLen = 30; // 默认最大长度30个，浏览器最大并发数为32个，空余2个为了能处理优先加载逻辑
    return HttpLoadManager;
}());
export { HttpLoadManager };
//# sourceMappingURL=http.load.manager.js.map