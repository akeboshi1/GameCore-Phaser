import {BasicTerrainItem} from "./BasicTerrainItem";
import Globals from "../../../Globals";
import {BasicTerrainAvatar} from "../../../common/avatar/BasicTerrainAvatar";
import {op_gameconfig} from "../../../../protocol/protocols";
import {DrawArea} from "../../../common/struct/DrawArea";
import {ITerrainLayer} from "../view/ITerrainLayer";
import {IQuadTreeNode} from "../../../base/ds/IQuadTreeNode";

export class TerrainAnimationItem extends BasicTerrainItem implements IQuadTreeNode {
  protected mAnimationDirty = false;
  protected myAnimationName: string;
  protected baseLoc: Phaser.Point;
  public collisionArea: DrawArea;

  public constructor(game: Phaser.Game, owner: ITerrainLayer) {
    super(game, owner);
  }

  public releaseTerrainItem() {
    if ((<BasicTerrainAvatar>this.terrainIsoDisplayObject)) {
      (<BasicTerrainAvatar>this.terrainIsoDisplayObject).onDispose();
    }
    super.releaseTerrainItem();
  }

  public get quadH(): number {
    return this.collisionArea.height;
  }

  public get quadW(): number {
    return this.collisionArea.width;
  }

  public get quadX(): number {
    return this.collisionArea.ox;
  }

  public get quadY(): number {
    return this.collisionArea.oy;
  }

  public setWalkableArea(value: string, orgin: Phaser.Point, hWidth: number, hHeight: number): void {
    if (this.walkableArea === undefined) {
      this.walkableArea = new DrawArea(value, 0x00FF00, orgin);
    }
    this.walkableArea.draw(hWidth, hHeight);
  }





  // Position
  public setPosition(x: number, y: number, z: number): void {
    super.setPosition(x, y, z);
    if (this.collisionArea) {
      this.collisionArea.setPosition(x, y, z);
    }
  }

  public setAnimation(value: string): void {
    // Log.trace("角度-->"+value);
    this.myAnimationName = value;

    this.invalidAnimation();
  }

    public setCollisionArea(value: string, orgin: Phaser.Point, hWidth: number, hHeight: number): void {
        if (this.collisionArea === undefined) {
            this.collisionArea = new DrawArea(value, 0xFF0000, orgin);
        }
        this.collisionArea.draw(hWidth, hHeight);
    }

  public onFrame(deltaTime: number) {
    super.onFrame(deltaTime);
    if (this.terrainIsoDisplayObject && (this.terrainIsoDisplayObject as BasicTerrainAvatar).onFrame !== undefined) (<BasicTerrainAvatar>this.terrainIsoDisplayObject).onFrame(deltaTime);
  }

  public onTick(deltaTime: number): void {
    if (this.mAnimationDirty) {
      this.onAvatarAnimationChanged();
      this.mAnimationDirty = false;
    }
    if (this.terrainIsoDisplayObject && (this.terrainIsoDisplayObject as BasicTerrainAvatar).onTick !== undefined) (<BasicTerrainAvatar>this.terrainIsoDisplayObject).onTick(deltaTime);
    super.onTick(deltaTime);
  }

  protected onTerrainItemCreate(): void {
    this.terrainIsoDisplayObject = new BasicTerrainAvatar(Globals.game);
    (<BasicTerrainAvatar>this.terrainIsoDisplayObject).initialize(this.data);
    this.initBaseLoc();
    super.onTerrainItemCreate();
  }

  protected onTerrainItemLoad(): void {
    super.onTerrainItemLoad();
    (<BasicTerrainAvatar>this.terrainIsoDisplayObject).loadModel(this.onTerrainItemLoadComplete, this);
  }

  private initBaseLoc(): void {
    // 图片坐标
    let config: op_gameconfig.IAnimation = this.data.config;
    if (config === null) return;
    let tmp: Array<string> = config.baseLoc.split(",");
    this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
  }

  protected onTerrainItemLoadComplete(): void {
    this.setAnimation(this.data.animationName);
    super.onTerrainItemLoadComplete();
  }

  protected invalidAnimation(): void {
    this.mAnimationDirty = true;
  }

  protected onAvatarAnimationChanged(): void {
    if (this.terrainIsoDisplayObject) {
      (<BasicTerrainAvatar>this.terrainIsoDisplayObject).animationName = this.myAnimationName;
    }
  }
}
