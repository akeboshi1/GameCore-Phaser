var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class StateListener {
  constructor() {
    __publicField(this, "mStates");
    this.mStates = new Map();
  }
  add(stateGroups) {
    if (!stateGroups) {
      return;
    }
    for (const stateGroup of stateGroups) {
      this.mStates.set(stateGroup.owner.name, stateGroup);
      for (const state of stateGroup.state) {
        if (state.execCode) {
        }
      }
    }
  }
  remove() {
  }
}
