import { op_gameconfig } from "pixelpai_proto";

export interface IDisplayInfo {
  id: number;
  x: number;
  y: number;
  type?: string;
  display?: op_gameconfig.IDisplay | null;
  animations?: op_gameconfig.IAnimation[] | null;
  animationName: string;

  avatarDir?: number;
  avatar?: op_gameconfig.IAvatar;
}

export class DisplayInfo implements IDisplayInfo {
  id: number;
  x: number;
  y: number;
  type: string;
  display: op_gameconfig.IDisplay | null;
  animations: op_gameconfig.IAnimation[] | null;
  animationName: string;
  
  avatarDir?: number;
  avatar?: op_gameconfig.IAvatar;
  setInfo(val: any) {
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        this[key] = val[key];
      }
    }
  }
}