import {SceneMediator} from "./SceneMediator";
import {SceneInfo} from "../../common/struct/SceneInfo";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IEditorMode} from "../../interface/IEditorMode";
import {EditorEnum} from "../../common/const/EditorEnum";
import {GameConfig} from "../../GameConfig";
import {Log} from "../../Log";
import {Tick} from "../../common/tick/Tick";
import {ElementInfo} from "../../common/struct/ElementInfo";
import {Const} from "../../common/const/Const";
import {PBpacket} from "net-socket-packet";
import {op_client, op_editor, op_virtual_world} from "../../../protocol/protocols";
import OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = op_editor.OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT;
import {TerrainInfo} from "../../common/struct/TerrainInfo";

export class SceneEditorMediator extends SceneMediator {
  private mTick: Tick;
  private movementY = 0;
  private isGameDown: boolean;

  constructor() {
    super();
  }

  public onRegister(): void {
    this.mTick = new Tick(30);
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.start();
    this.view.inputEnabled = true;
    super.onRegister();
    Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode, this);
    Globals.MessageCenter.on(MessageType.SCENE_ADD_ELEMENT, this.handleAddElement, this);
    Globals.MessageCenter.on(MessageType.SCENE_ADD_TERRAIN, this.handleAddTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_TERRAIN, this.handleRemoveElement, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_TERRAIN, this.handleRemoveTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_ALL_TERRAIN, this.handleRemoveAllTerrain, this);

  }

  public onTick(deltaTime: Number): void {
    let em: IEditorMode = Globals.DataCenter.EditorData.editorMode;
    switch (em.mode) {
      case  EditorEnum.Mode.ERASER:

        break;
      case EditorEnum.Mode.ZOOM:
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

    Globals.game.camera.follow(this.view);

    Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);

    this.handleChangeMode();
  }

  private sendSceneBrush(value: Phaser.Point): void {
    Log.trace("点击地块-->", value);
    let pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT);
    let content: OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = pkt.content;
    content.point = {x: value.x, y: value.y};
    Globals.SocketManager.send(pkt);
  }

  private sendSceneEraser(value: Phaser.Point): void {
    Log.trace("擦除地块-->", value);
  }

  /**
   * 添加物件
   * @element ElementInfo
   */
  private addElement(value: ElementInfo): void {
    this.view.addSceneElement(Const.SceneElementType.ELEMENT, value.id, value);
  }

  /**
   * 删除物件
   * @elementId elementId
   */
  private removeElement(elementId: number): void {
    this.view.deleteSceneElement(elementId);
  }

  /**
   * 添加物件
   * @element ElementInfo
   */
  private addTerrain(terrain: TerrainInfo): void {
    this.view.terrainSceneLayer.addTerrainItem(terrain);
  }

  /**
   * 删除地块
   * @elementId elementId
   */
  private removeTerrain(col: number, row: number): void {
    this.view.terrainSceneLayer.removeTerrainItem(col, row);
  }


  private clearMode(): void {
    if (this.view.input) {
      this.view.input.disableDrag();
    }
    // Scene events
    this.view.events.onInputDown.remove(this.onSceneBrushDown, this);
    this.view.events.onInputDown.remove(this.onSceneEraserDown, this);
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
    if (em.mode === EditorEnum.Mode.MOVE) {
      // Log.trace(this.view.x, this.view.y, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight, GameConfig.GameWidth, GameConfig.GameHeight);
      let scaleX: number = this.view.scale.x;
      let scaleY: number = this.view.scale.y;
      let bounds: Phaser.Rectangle = new Phaser.Rectangle(-(Globals.Room45Util.mapTotalWidth * scaleX - GameConfig.GameWidth), -(Globals.Room45Util.mapTotalHeight * scaleY - GameConfig.GameHeight),
        (Globals.Room45Util.mapTotalWidth * scaleX - GameConfig.GameWidth + Globals.Room45Util.tileWidth * scaleX / 2), (Globals.Room45Util.mapTotalHeight * scaleY - GameConfig.GameHeight + Globals.Room45Util.tileHeight * scaleY));
      this.view.input.boundsRect = bounds;
      this.view.input.enableDrag();
    } else if (em.mode === EditorEnum.Mode.BRUSH) {
      this.view.events.onInputDown.add(this.onSceneBrushDown, this);
    } else if (em.mode === EditorEnum.Mode.ERASER) {
      this.view.events.onInputDown.add(this.onSceneEraserDown, this);
    } else if (em.mode === EditorEnum.Mode.ZOOM) {
      Globals.game.input.onDown.add(this.onGameDown, this);
    }
  }

  private handleAddElement(value: op_client.IElement): void {
    let element: ElementInfo = new ElementInfo();
    element.setInfo(value);
    element.setCollisionArea(value.collisionArea, value.originPoint ? new Phaser.Point(value.originPoint[0], value.originPoint[1]) : new Phaser.Point());
    this.addElement(element);
  }

  private handleAddTerrain(value: op_client.ITerrain[]): void {
    let terrain: TerrainInfo;
    let len: number = value.length;
    for (let i = 0; i < len; i++) {
      terrain = new TerrainInfo();
      terrain.type = value[i].type;
      terrain.x = value[i].x;
      terrain.y = value[i].y;
      this.addTerrain(terrain);
    }
  }

  private handleRemoveElement(value: number): void {
    this.removeElement(value);
  }

  private handleRemoveAllTerrain(): void {
    this.view.terrainSceneLayer.removeAllTerrain();
  }

  private handleRemoveTerrain(value: any): void {
      this.removeTerrain(value[0], value[1]);
  }

  private onSceneBrushDown(view: any, pointer: Phaser.Pointer): void {
    Log.trace("name", view.name);
    let em: IEditorMode = Globals.DataCenter.EditorData.editorMode;
    let screenX: number = (pointer.x - this.view.x) / this.view.scale.x;
    let screenY: number = (pointer.y - this.view.y) / this.view.scale.y;
    let tempPoint: Phaser.Point;
    if (em.type === EditorEnum.Type.TERRAIN) {
      tempPoint = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
    } else if (em.type === EditorEnum.Type.ELEMENT) {
      tempPoint = new Phaser.Point(screenX, screenY);
    }
    this.sendSceneBrush(tempPoint);
  }

  private onSceneEraserDown(view: any, pointer: Phaser.Pointer): void {
      let screenX: number = (pointer.x - this.view.x) / this.view.scale.x;
      let screenY: number = (pointer.y - this.view.y) / this.view.scale.y;
      let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
      this.sendSceneEraser(tempPoint);
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
