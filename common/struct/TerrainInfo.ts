import {op_client, op_gameconfig} from "../../../protocol/protocols";
import ITerrain = op_client.ITerrain;

export class TerrainInfo implements ITerrain {
  public name: string;

  public des: string;

  public x = 0;

  public y = 0;

  public z = 0;

  public animations: op_gameconfig.IAnimation[];

  private _animationName: string;

  public type: string;

  public display: op_gameconfig.IDisplay;

  public walkableArea: string;
  public originWalkablePoint: Phaser.Point;
  public collisionArea: string;
  public originCollisionPoint: Phaser.Point;

  public constructor() {
  }

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

  public get col(): number {
    return this.x;
  }

  public get row(): number {
    return this.y;
  }

  public setInfo(base: any): void {
    let value: any;
    for (let key in base) {
      value = base[key];
      if (value) {
          this[key] = value;
      }
    }
  }

  private _uid: number;
  public get uid(): number {
    return this._uid;
  }
  public setUid(cols: number) {
     this._uid = 10000 + this.col + this.row + this.row * cols;
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
