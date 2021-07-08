var ValueResolver = /** @class */ (function () {
    function ValueResolver() {
        var _this = this;
        this.resolver = null;
        this.rejecter = null;
        this.set = function (resolver, reject) {
            if (reject === void 0) { reject = null; }
            if (_this.resolver) {
                var error = new Error("Resolver already exists");
                if (reject) {
                    return reject(error);
                }
                else {
                    throw error;
                }
            }
            _this.resolver = resolver;
            _this.rejecter = reject;
        };
        this.promise = function (work) {
            return new Promise(function (resolve, reject) {
                _this.set(resolve, reject);
                if (work) {
                    try {
                        work();
                    }
                    catch (error) {
                        _this.reject(error);
                    }
                }
            });
        };
        this.resolve = function (value) {
            if (!_this.resolver) {
                // const error = new Error("No Resolver");
                // if (this.rejecter) {
                //   return this.rejecter(error);
                // } else {
                //   throw error;
                // }
                var error = "No Resolver";
                if (_this.rejecter) {
                    return _this.rejecter(error);
                }
                else {
                    return;
                }
            }
            _this.resolver(value);
            _this.resolver = null;
            _this.rejecter = null;
        };
        this.reject = function (reason) {
            if (_this.rejecter) {
                _this.rejecter(reason);
            }
            else {
                throw reason;
            }
            _this.resolver = null;
            _this.rejecter = null;
        };
    }
    ValueResolver.create = function () {
        return new ValueResolver();
    };
    return ValueResolver;
}());
export { ValueResolver };
//# sourceMappingURL=promise.js.map