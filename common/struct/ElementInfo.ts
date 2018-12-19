import {op_client, op_gameconfig} from "../../../protocol/protocols";
import IElement = op_client.IElement;

export class ElementInfo implements IElement {
  public id: number;
  public type: string;
  public dir: number;
  public x: number;
  public y: number;
  public z: number;
  public name: string;
  public des: string;
  public color: number;
  public subType: number;
  public display: op_gameconfig.IDisplay;
  public animations: op_gameconfig.IAnimation[];
  public attributes: op_gameconfig.IAttribute[];

  public walkableArea: string;
  public originWalkablePoint: Phaser.Point;
  public collisionArea: string;
  public originCollisionPoint: Phaser.Point;

  public scale = 1; // -1水平翻转

  public animationName: string;

  public speed = 4;

  public constructor() {
  }

  public get config(): op_gameconfig.IAnimation {
    if (this.animations == null) return null;
    let len: number = this.animations.length;
    if (len === 0) return null;

    for (let i = 0; i < len; i++) {
      if (this.animations[i].name === this.animationName) {
        return this.animations[i];
      }
    }
    return null;
  }

  public setInfo(base: any): void {
    let value: any;
    for (let key in base) {
      value = base[key];
      this[key] = value;
    }
  }

  public setWalkableArea(value: string, orgin: Phaser.Point): void {
    this.walkableArea = value;
    this.originWalkablePoint = orgin;
  }

  public setCollisionArea(value: string, orgin: Phaser.Point): void {
    this.collisionArea = value;
    this.originCollisionPoint = orgin;
  }


}
