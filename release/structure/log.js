var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
const _Logger = class {
  constructor() {
    __publicField(this, "isDebug", false);
  }
  static getInstance() {
    if (!_Logger._instance)
      _Logger._instance = new _Logger();
    return _Logger._instance;
  }
  fatal(message, ...optionalParams) {
    throw message;
  }
  log(message, ...optionalParams) {
    if (_Logger._instance.isDebug)
      console.log(message, ...optionalParams);
  }
  debug(message, ...optionalParams) {
    if (_Logger._instance.isDebug)
      console.log(message, ...optionalParams);
  }
  error(message, ...optionalParams) {
    console.error(message, ...optionalParams);
  }
  debugError(message, ...optionalParams) {
    if (_Logger._instance.isDebug)
      console.error(message, ...optionalParams);
  }
  warn(message, ...optionalParams) {
    if (_Logger._instance.isDebug)
      console.warn(message, ...optionalParams);
  }
  info(message, ...optionalParams) {
    if (_Logger._instance.isDebug)
      console.info(message, ...optionalParams);
  }
  v() {
    _Logger._instance.isDebug = true;
  }
  q() {
    _Logger._instance.isDebug = false;
  }
};
export let Logger = _Logger;
__publicField(Logger, "_instance");
export function log(message, ...optionalParams) {
  console.log(message, ...optionalParams);
}
export function error(message, ...optionalParams) {
  console.error(message, ...optionalParams);
}
