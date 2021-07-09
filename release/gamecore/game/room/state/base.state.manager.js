var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import { op_def } from "pixelpai_proto";
import { Logger } from "structure";
import { State } from "./state.group";
export class BaseStateManager {
  constructor(room) {
    this.room = room;
    __publicField(this, "add");
    __publicField(this, "delete");
    __publicField(this, "stateMap");
    this.init();
  }
  setState(stateGroup) {
    if (!this.stateMap)
      this.stateMap = new Map();
    const { owner, state } = stateGroup;
    const waitExec = new Map();
    for (const sta of state) {
      const parse = new State(sta, owner);
      this.stateMap.set(parse.name, parse);
      waitExec.set(parse.name, parse);
    }
    this.handleStates(waitExec);
  }
  handleStates(states) {
    if (!states)
      return;
    states.forEach((state) => this.handleState(state));
  }
  destroy() {
    if (!this.stateMap)
      return;
    this.stateMap.forEach((state) => this.delete.handler(state));
    this.stateMap.clear();
    this.add = null;
    this.delete = null;
  }
  handleState(state) {
    switch (state.execCode) {
      case op_def.ExecCode.EXEC_CODE_ADD:
      case op_def.ExecCode.EXEC_CODE_UPDATE:
        this.add.handler(state);
        break;
      case op_def.ExecCode.EXEC_CODE_DELETE:
        this.delete.handler(state);
        break;
      default:
        Logger.getInstance().warn(`${state.execCode} is not defined`);
        break;
    }
  }
  init() {
  }
}
export class BaseHandler {
  constructor(room) {
    this.room = room;
  }
  handler(state) {
    if (!state) {
      return;
    }
    const fun = this[state.name];
    if (!fun) {
      return Logger.getInstance().warn(`${state.name} is not defined definition`);
    }
    fun.call(this, state);
  }
  init(param) {
  }
}
