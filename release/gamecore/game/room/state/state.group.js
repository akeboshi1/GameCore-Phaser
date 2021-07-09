var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class StateGroup {
  constructor() {
    __publicField(this, "mName");
    __publicField(this, "states");
    this.states = [];
  }
  update(group) {
    this.mName = group.owner.name;
  }
}
export class State {
  constructor(state, owner) {
    this.owner = owner;
    __publicField(this, "name");
    __publicField(this, "type");
    __publicField(this, "packet");
    __publicField(this, "execCode");
    this.type = state.type;
    this.name = state.name;
    this.execCode = state.execCode;
    this.packet = state.packet;
  }
}
