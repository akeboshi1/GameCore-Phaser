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

  public scale = false;
  public speed = 4;

  public constructor() {
  }

  public get scaleX(): number {
    return this.scale ? -1 : 1;
  }

  private _animationName: string;

  public set animationName(value: string) {
    this._animationName = value;
    this.setArea();
  }

  public get animationName(): string {
    return this._animationName;
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
      if (value) {
          this[key] = value;
      }
    }
    this.setArea();
  }

  private setArea(): void {
    let curAnimation: op_gameconfig.IAnimation = this.config;
    if (curAnimation) {
      if (curAnimation.walkableArea) {
        if (this.walkableArea !== curAnimation.walkableArea || this.originWalkablePoint.x !== curAnimation.walkOriginPoint[0] || this.originWalkablePoint.y !== curAnimation.walkOriginPoint[1]) {
          this.setWalkableArea(curAnimation.walkableArea, curAnimation.walkOriginPoint ? new Phaser.Point(curAnimation.walkOriginPoint[0], curAnimation.walkOriginPoint[1]) : new Phaser.Point());
        }
      }
      if (curAnimation.collisionArea) {
        if (this.collisionArea !== curAnimation.collisionArea || this.originCollisionPoint.x !== curAnimation.originPoint[0] || this.originCollisionPoint.y !== curAnimation.originPoint[1]) {
          this.setCollisionArea(curAnimation.collisionArea, curAnimation.originPoint ? new Phaser.Point(curAnimation.originPoint[0], curAnimation.originPoint[1]) : new Phaser.Point());
        }
      }
    }
  }

  private setWalkableArea(value: string, orgin: Phaser.Point): void {
    this.walkableArea = value;
    this.originWalkablePoint = orgin;
  }

  private setCollisionArea(value: string, orgin: Phaser.Point): void {
    this.collisionArea = value;
    this.originCollisionPoint = orgin;
  }
}
