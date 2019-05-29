import {MediatorBase} from "../../base/module/core/MediatorBase";
import {MiniMapView} from "./view/MiniMapView";
import {GameConfig} from "../../GameConfig";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {SceneInfo} from "../../common/struct/SceneInfo";
import {Tick} from "../../common/tick/Tick";

export class MiniMapMediator extends MediatorBase {
  private mTick: Tick;
  protected maxWidth = 200;
  protected curScale = 0;
  protected curHeight = 0;
  private get view(): MiniMapView {
    return this.viewComponent as MiniMapView;
  }

  public onRegister(): void {
    super.onRegister();
    this.mTick = new Tick();
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.setRenderCallBack(this.onFrame, this);
    this.mTick.start();

    if (Globals.DataCenter.SceneData.initialize) {
      this.drawMap();
    } else {
      Globals.MessageCenter.on(MessageType.SCENE_DATA_INITIALIZE, this.onHandleSceneInitialize, this);
    }
    Globals.MessageCenter.on(MessageType.SCENE_CHANGE_TO, this.changeSceneToHandle, this);
  }

  public onRemove(): void {
    super.onRemove();
    if (this.mTick) {
      this.mTick.onDispose();
      this.mTick = null;
    }
  }

  private setX = 0;
  private setY = 0;
  public onTick(deltaTime: number): void {
    this.setX = Globals.game.camera.x * this.curScale;
    this.setY = Globals.game.camera.y * this.curScale;
  }

  public onFrame(): void {
    this.view.x = GameConfig.GameWidth - this.maxWidth - 1;
    this.view.y = GameConfig.GameHeight - this.curHeight - 1;
    this.view.curRect.x = this.setX;
    this.view.curRect.y = this.setY;
  }

  private onHandleSceneInitialize(): void {
    Globals.MessageCenter.cancel(MessageType.SCENE_DATA_INITIALIZE, this.onHandleSceneInitialize, this);
    this.drawMap();
  }

  private changeSceneToHandle(): void {
    this.drawMap();
  }

  protected stageResizeHandler(): void {
    this.drawMap();
  }

  private drawMap(): void {
    let mapSceneInfo: SceneInfo = Globals.DataCenter.SceneData.mapInfo;
    this.curScale = this.maxWidth / mapSceneInfo.mapTotalWidth;
    let setWidth = this.maxWidth;
    let setHeight = (mapSceneInfo.mapTotalHeight * this.curScale) >> 0;
    this.curHeight = setHeight;

    if (this.view.mapRect.height !== setHeight) {
      if (this.view.mapRect.cacheAsBitmap) {
        this.view.mapRect.cacheAsBitmap = false;
      }
      this.view.mapRect.clear();
      this.view.mapRect.lineStyle(1, 0xffffff, 1);
      this.view.mapRect.beginFill(0x000000, 0.2);
      this.view.mapRect.drawRect(0, 0, setWidth, setHeight);
      this.view.mapRect.endFill();
      this.view.mapRect.cacheAsBitmap = true;
    }

    setWidth = (GameConfig.GameWidth * this.curScale) >> 0;
    setHeight = (GameConfig.GameHeight * this.curScale) >> 0;

    if (this.view.curRect.width !== setWidth || this.view.curRect.height !== setHeight) {
      if (this.view.curRect.cacheAsBitmap) {
        this.view.curRect.cacheAsBitmap = false;
      }
      this.view.curRect.clear();
      this.view.curRect.lineStyle(1, 0xffff00, 1);
      this.view.curRect.drawRect(0, 0, setWidth, setHeight);
      this.view.curRect.endFill();
      this.view.curRect.cacheAsBitmap = true;
    }
  }
}
