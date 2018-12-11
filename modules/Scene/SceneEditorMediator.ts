import {SceneMediator} from "./SceneMediator";
import {SceneInfo} from "../../common/struct/SceneInfo";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IEditorMode} from "../../interface/IEditorMode";
import {EditorType} from "../../common/const/EditorType";
import {GameConfig} from "../../GameConfig";
import {Log} from "../../Log";
import {ElementInfo} from "../../common/struct/ElementInfo";
import {Const} from "../../common/const/Const";

export class SceneEditorMediator extends SceneMediator {
  constructor() {
    super();
  }

  public onRegister(): void {
    super.onRegister();
    Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode);
  }

  protected changedToMapSceneCompleteHandler(): void {
    let mapSceneInfo: SceneInfo = Globals.DataCenter.SceneData.mapInfo;
    // clear the last one scene.
    if (this.view) { this.view.clearScene(); }

    Globals.SceneManager.popupScene();

    Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tileWidth, mapSceneInfo.tileHeight);

    Globals.game.world.setBounds(0, 0, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);

    this.view.initializeScene(mapSceneInfo);

    this.view.terrainGridLayer.initializeMap(mapSceneInfo);

    Globals.SceneManager.pushScene(this.view);

    this.handleChangeMode();

    Globals.game.camera.follow(this.view);

    Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);
  }

  private dragStart(): void {
  }

  private dragUpdate(sprite: any, pointer: Phaser.Pointer, dragX: number, dragY: number, snapPoint: Phaser.Point): void {
  }

  private dragStop(): void {
  }

  private resetStatus(): void {
    this.view.inputEnabled = false;
    //  Drag events
    this.view.events.onDragStart.remove(this.dragStart);
    this.view.events.onDragUpdate.remove(this.dragUpdate);
    this.view.events.onDragStop.remove(this.dragStop);
  }

  /**
   * 切换编辑器状态
   */
  private handleChangeMode(): void {
    this.resetStatus();

    let mapSceneInfo: SceneInfo = Globals.DataCenter.SceneData.mapInfo;

    let em: IEditorMode = Globals.DataCenter.EditorData.editorMode;

    if (em.mode === EditorType.MODE_BRUSH) {
      this.view.inputEnabled = true;
      Log.trace(this.view.x, this.view.y, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight, GameConfig.GameWidth, GameConfig.GameHeight);
      //  Our sprite that will act as the drag bounds
      let bounds: Phaser.Rectangle = new Phaser.Rectangle( -(mapSceneInfo.mapTotalWidth - GameConfig.GameWidth),  -(mapSceneInfo.mapTotalHeight - GameConfig.GameHeight), mapSceneInfo.mapTotalWidth - GameConfig.GameWidth + (mapSceneInfo.tileWidth >> 1), mapSceneInfo.mapTotalHeight - GameConfig.GameHeight + mapSceneInfo.tileHeight);
      Log.trace(bounds);
      this.view.input.enableDrag();
      this.view.input.boundsRect = bounds;
      // this.view.anchor.set(0.5);
      //  Drag events
      this.view.events.onDragStart.add(this.dragStart);
      this.view.events.onDragUpdate.add(this.dragUpdate);
      this.view.events.onDragStop.add(this.dragStop);
    } else if (em.mode === EditorType.MODE_MOVE) {
      this.view.inputEnabled = true;
      this.view.events.onInputDown.add(this.inputDown, this);
    }
  }

  private inputDown(view: any, pointer: Phaser.Pointer): void {
      Log.trace(pointer.position);
      let screenX: number = pointer.position.x;
      let screenY: number = pointer.position.y;
      let point: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
  }
}
