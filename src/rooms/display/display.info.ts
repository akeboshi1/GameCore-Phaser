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
  public id: number;
  public x: number;
  public y: number;
  public type: string;
  public display: op_gameconfig.IDisplay | null;
  public animations: op_gameconfig.IAnimation[] | null;
  public animationName: string;

  public avatarDir?: number;
  public avatar?: op_gameconfig.IAvatar;
  public setInfo(val: any) {
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        this[key] = val[key];
      }
    }
  }
}
