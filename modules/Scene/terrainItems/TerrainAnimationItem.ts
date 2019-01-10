import {BasicTerrainItem} from "./BasicTerrainItem";
import Globals from "../../../Globals";
import {BasicTerrainAvatar} from "../../../common/avatar/BasicTerrainAvatar";
import {op_gameconfig} from "../../../../protocol/protocols";
import {DrawArea} from "../../../common/struct/DrawArea";
import {ITerrainLayer} from "../view/ITerrainLayer";

export class TerrainAnimationItem extends BasicTerrainItem {
  protected mAnimationDirty = false;
  protected myAnimationName: string;
  protected baseLoc: Phaser.Point;

  public constructor(game: Phaser.Game, owner: ITerrainLayer) {
    super(game, owner);
  }

  protected releaseTerrainItem() {
    if ((<BasicTerrainAvatar>this.terrainIsoDisplayObject)) {
      (<BasicTerrainAvatar>this.terrainIsoDisplayObject).onDispose();
    }
    super.releaseTerrainItem();
  }

  // Position
  public setPosition(x: number, y: number, z: number): void {
    super.setPosition(x, y, z);
    if (this.collisionArea) {
      this.collisionArea.setPosition(x, y, z);
    }
    if (this.mouseOverArea) {
      this.mouseOverArea.setPosition(x, y, z);
    }
  }

  public setAnimation(value: string): void {
    // Log.trace("角度-->"+value);
    this.myAnimationName = value;

    this.invalidAnimation();
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

  private initBaseLoc(): void {
    // 图片坐标
    let config: op_gameconfig.IAnimation = this.data.config;
    if (config === null) return;
    let tmp: Array<string> = config.baseLoc.split(",");
    this.baseLoc = new Phaser.Point(+(tmp[0]), +(tmp[1]));
  }
}
