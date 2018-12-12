import {SceneMediator} from "./SceneMediator";
import {SceneInfo} from "../../common/struct/SceneInfo";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IEditorMode} from "../../interface/IEditorMode";
import {EditorType} from "../../common/const/EditorType";
import {GameConfig} from "../../GameConfig";
import {Log} from "../../Log";
import {Tick} from "../../common/tick/Tick";
import {ElementInfo} from "../../common/struct/ElementInfo";
import {Const} from "../../common/const/Const";
import {TerrainInfo} from "../../common/struct/TerrainInfo";
import {PBpacket} from "net-socket-packet";
import {op_editor, op_virtual_world} from "../../../protocol/protocols";
import OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = op_editor.OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT;

export class SceneEditorMediator extends SceneMediator {
  private mTick: Tick;
  private sceneDownPos: Phaser.Point;
  private sceneDownPointer: Phaser.Pointer;
  private isSceneDown: boolean;
  private movementY = 0;
  private isGameDown: boolean;

  constructor() {
    super();
  }

  public onRegister(): void {
    this.sceneDownPos = new Phaser.Point(-1, -1);
    this.mTick = new Tick(30);
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.start();
    super.onRegister();
    Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode, this);
  }

  public onTick(deltaTime: Number): void {
    let em: IEditorMode = Globals.DataCenter.EditorData.editorMode;
    switch (em.mode) {
      case EditorType.MODE_BRUSH:
        if (this.isSceneDown) {
          let screenX: number = this.sceneDownPointer.x - this.view.x;
          let screenY: number = this.sceneDownPointer.y - this.view.y;
          let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX / this.view.scale.x, screenY / this.view.scale.y);
          if (tempPoint.x !== this.sceneDownPos.x || tempPoint.y !== this.sceneDownPos.y) {
            this.sceneDownPos.x = tempPoint.x;
            this.sceneDownPos.y = tempPoint.y;
            this.sendSceneBrush(this.sceneDownPos);
          }
        }
        break;
      case EditorType.MODE_ERASER:
        if (this.isSceneDown) {
          let screenX: number = this.sceneDownPointer.x - this.view.x;
          let screenY: number = this.sceneDownPointer.y - this.view.y;
          let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX / this.view.scale.x, screenY / this.view.scale.y);
          if (tempPoint.x !== this.sceneDownPos.x || tempPoint.y !== this.sceneDownPos.y) {
            this.sceneDownPos.x = tempPoint.x;
            this.sceneDownPos.y = tempPoint.y;
            this.sendSceneEraser(this.sceneDownPos);
          }
        }
        break;
      case EditorType.MODE_ZOOM:
        if (this.isGameDown) {
          let newMoveY: number = Globals.game.input.y;
          let add = this.movementY - newMoveY;
          let scale = (add / GameConfig.GameHeight) * 0.1;
          this.view.scale.add(scale, scale);
          Log.trace("放大场景-->", add);
        }
        break;
    }
  }

  protected changedToMapSceneCompleteHandler(): void {
    let mapSceneInfo: SceneInfo = Globals.DataCenter.SceneData.mapInfo;
    // clear the last one scene.
    if (this.view) {
      this.view.clearScene();
    }

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

  private sendSceneBrush(value: Phaser.Point): void {
    Log.trace("点击地块-->", value);
    let pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_RES_EDITOR_ELEMENT_POINT_RESULT);
    let content: OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = pkt.content;
    content.point = { x: value.x, y: value.y};
    Globals.SocketManager.send(pkt);
  }

  private sendSceneEraser(value: Phaser.Point): void {
    Log.trace("擦除地块-->", value);
  }

  /**
   * 添加物件
   * @element ElementInfo
   */
  private addElement(element: ElementInfo): void {
    element.collisionArea.draw(Globals.Room45Util.tileWidth >> 1, Globals.Room45Util.tileHeight >> 1);
    this.view.addSceneElement(Const.SceneElementType.ELEMENT, element.id, element);
  }

  /**
   * 添加物件
   * @element ElementInfo
   */
  private addTerrain(terrain: TerrainInfo): void {
    this.view.terrainSceneLayer.addTerrainItem(terrain);
  }

  private clearMode(): void {
    if (this.view.input) {
      this.view.input.disableDrag();
    }
    // Scene events
    this.view.events.onInputDown.remove(this.onSceneBrushDown, this);
    Globals.game.input.onUp.remove(this.onSceneBrushUp, this);

    // Game events
    Globals.game.input.onDown.remove(this.onGameDown, this);
    Globals.game.input.onUp.remove(this.onGameUp, this);
  }

  /**
   * 切换编辑器状态
   */
  private handleChangeMode(): void {
    this.clearMode();

    let em: IEditorMode = Globals.DataCenter.EditorData.editorMode;

    if (em.mode === EditorType.MODE_MOVE) {
      // Log.trace(this.view.x, this.view.y, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight, GameConfig.GameWidth, GameConfig.GameHeight);
      let bounds: Phaser.Rectangle = new Phaser.Rectangle(-(Globals.Room45Util.mapTotalWidth * this.view.scale.x - GameConfig.GameWidth), -(Globals.Room45Util.mapTotalHeight * this.view.scale.y - GameConfig.GameHeight),
        (Globals.Room45Util.mapTotalWidth * this.view.scale.x - GameConfig.GameWidth + Globals.Room45Util.tileWidth * this.view.scale.x / 2), (Globals.Room45Util.mapTotalHeight * this.view.scale.y - GameConfig.GameHeight + Globals.Room45Util.tileHeight * this.view.scale.y));
      // Log.trace(bounds);
      this.view.inputEnabled = true;
      this.view.input.enableDrag();
      this.view.input.boundsRect = bounds;
    } else if (em.mode === EditorType.MODE_BRUSH) {

      this.view.events.onInputDown.add(this.onSceneBrushDown, this);
    } else if (em.mode === EditorType.MODE_ERASER) {
      this.view.events.onInputDown.add(this.onSceneEraserDown, this);
    } else if (em.mode === EditorType.MODE_ZOOM) {
      Globals.game.input.onDown.add(this.onGameDown, this);
    }
  }

  private onSceneBrushDown(view: any, pointer: Phaser.Pointer): void {
    this.sceneDownPointer = pointer;
    this.isSceneDown = true;
    Globals.game.input.onUp.add(this.onSceneBrushUp, this);
  }

  private onSceneBrushUp(pointer: Phaser.Pointer, event: any): void {
    Globals.game.input.onUp.remove(this.onSceneBrushUp, this);
    this.isSceneDown = false;
    this.sceneDownPointer = null;
  }

  private onSceneEraserDown(view: any, pointer: Phaser.Pointer): void {
    this.sceneDownPointer = pointer;
    this.isSceneDown = true;
    Globals.game.input.onUp.add(this.onSceneEraserUp, this);
  }

  private onSceneEraserUp(pointer: Phaser.Pointer, event: any): void {
    Globals.game.input.onUp.remove(this.onSceneEraserUp, this);
    this.isSceneDown = false;
    this.sceneDownPointer = null;
  }

  private onGameDown(pointer: Phaser.Pointer, event: any): void {
    // Log.trace(pointer.position.x, pointer.position.y, pointer.x, pointer.y);
    this.movementY = pointer.position.y;
    this.isGameDown = true;
    Globals.game.input.onUp.add(this.onGameUp, this);
  }

  private onGameUp(pointer: Phaser.Pointer, event: any): void {
    Globals.game.input.onUp.remove(this.onGameUp, this);
    this.isGameDown = false;
  }
}
