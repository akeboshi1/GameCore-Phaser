import { op_gameconfig } from "pixelpai_proto";

export interface IDisplayInfo {
  id: number;
  x: number;
  y: number;
  type?: string;
  display?: op_gameconfig.IDisplay|null;
  animations?: op_gameconfig.IAnimation[]|null;
  animationName: string
}

export class DisplayInfo implements IDisplayInfo {
  id: number;
  x: number;
  y: number;
  type: string;
  display: op_gameconfig.IDisplay|null;
  animations: op_gameconfig.IAnimation[]|null;
  animationName: string
  
  setInfo(val: any) {
    const keys = Object.keys(this);
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        this[key] = val[key];
      }
    }
  }
}