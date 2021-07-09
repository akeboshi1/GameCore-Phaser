var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _Handler = class {
  constructor(caller = null, method = null, args = null, once = false) {
    __publicField(this, "caller");
    __publicField(this, "method");
    __publicField(this, "args");
    __publicField(this, "once", false);
    __publicField(this, "_id", 0);
    this.setTo(caller, method, args, once);
  }
  static create(caller, method, args = null, once = true) {
    if (_Handler._pool.length)
      return _Handler._pool.pop().setTo(caller, method, args, once);
    return new _Handler(caller, method, args, once);
  }
  setTo(caller, method, args, once) {
    this._id = _Handler._gid++;
    this.caller = caller;
    this.method = method;
    this.args = args;
    this.once = once;
    return this;
  }
  run() {
    if (this.method == null)
      return null;
    const id = this._id;
    const result = this.method.apply(this.caller, this.args);
    this._id === id && this.once && this.recover();
    return result;
  }
  runWith(data) {
    if (this.method == null)
      return null;
    const id = this._id;
    if (data == null)
      var result = this.method.apply(this.caller, this.args);
    else if (!this.args && !(data instanceof Array))
      result = this.method.call(this.caller, data);
    else if (this.args)
      result = this.method.apply(this.caller, this.args.concat(data));
    else
      result = this.method.apply(this.caller, data);
    this._id === id && this.once && this.recover();
    return result;
  }
  clear() {
    this.caller = null;
    this.method = null;
    this.args = null;
    return this;
  }
  recover() {
    if (this._id > 0) {
      this._id = 0;
      _Handler._pool.push(this.clear());
    }
  }
};
export let Handler = _Handler;
__publicField(Handler, "_pool", []);
__publicField(Handler, "_gid", 1);
