import {SceneMediator} from "./SceneMediator";
import {SceneInfo} from "../../common/struct/SceneInfo";
import Globals from "../../Globals";
import {MessageType} from "../../common/const/MessageType";
import {IEditorMode} from "../../interface/IEditorMode";
import {EditorEnum} from "../../common/const/EditorEnum";
import {GameConfig} from "../../GameConfig";
import {Log} from "../../Log";
import {Tick} from "../../common/tick/Tick";
import {PBpacket} from "net-socket-packet";
import {TerrainInfo} from "../../common/struct/TerrainInfo";
import BasicElement from "./elements/BasicElement";
import OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = op_editor.OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT;
import OP_CLIENT_REQ_EDITOR_FETCH_OBJECT = op_editor.OP_CLIENT_REQ_EDITOR_FETCH_OBJECT;
import {op_client, op_editor} from "../../../protocol/protocols";
import {ElementInfo} from "../../common/struct/ElementInfo";
import {BasicSceneEntity} from "../../base/BasicSceneEntity";
import {Const} from "../../common/const/Const";
import {MouseFollower} from "./view/MouseFollower";

export class SceneEditorMediator extends SceneMediator {
  private mTick: Tick;
  private movementX = 0;
  private movementY = 0;
  private deltaY = 0;
  private isGameDown = false;
  private isElementDown = false;
  private mousePointer: Phaser.Pointer;
  private mSelectElement: BasicElement;
  private mMouseFollower: MouseFollower;

  constructor() {
    super();
  }

  private get em(): IEditorMode {
    return Globals.DataCenter.EditorData.editorMode;
  }

  protected get camera(): Phaser.Camera {
    return Globals.game.camera;
  }

  protected stageResizeHandler(): void {
    Globals.game.world.setBounds(0, 0, Globals.Room45Util.mapTotalWidth, Globals.Room45Util.mapTotalHeight);
    this.view.requestStageResize();
  }

  public onRegister(): void {
    this.mTick = new Tick(60);
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.setRenderCallBack(this.onFrame, this);
    this.mTick.start();

    this.view.inputEnabled = true;
    this.view.middleSceneLayer.inputEnableChildren = true;
    this.mousePointer = Globals.game.input.activePointer;

    this.mMouseFollower = new MouseFollower(Globals.game);
    this.mMouseFollower.inputEnabled = false;
    Globals.game.world.add(this.mMouseFollower);

    // Globals.game.input.mouse.mouseWheelCallback = (event: WheelEvent) => {
    //   this.deltaY = event.deltaY;
    // };
     Globals.game.input.addMoveCallback(this.onMouseMove, this);
    super.onRegister();
  }

  public onRemove(): void {
    super.onRemove();
    if (this.mTick) {
      this.mTick.onDispose();
      this.mTick = null;
    }
    if (this.mMouseFollower) {
      this.mMouseFollower.onDispose();
      this.mMouseFollower = null;
    }
  }

  public registerSceneListenerHandler(): void {
    super.registerSceneListenerHandler();
    Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode, this);
    Globals.MessageCenter.on(MessageType.SCENE_ADD_ALL_TERRAIN, this.handleAddAllTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_TERRAIN, this.handleRemoveTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_ALL_TERRAIN, this.handleRemoveAllTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_MOUSE_FOLLOW, this.handleMouseFollow, this);
  }

  public unRegisterSceneListenerHandler(): void {
    Globals.MessageCenter.cancel(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode, this);
    Globals.MessageCenter.cancel(MessageType.SCENE_ADD_ALL_TERRAIN, this.handleAddAllTerrain, this);
    Globals.MessageCenter.cancel(MessageType.SCENE_REMOVE_TERRAIN, this.handleRemoveTerrain, this);
    Globals.MessageCenter.cancel(MessageType.SCENE_REMOVE_ALL_TERRAIN, this.handleRemoveAllTerrain, this);
    Globals.MessageCenter.cancel(MessageType.SCENE_MOUSE_FOLLOW, this.handleMouseFollow, this);
    super.unRegisterSceneListenerHandler();
  }

  public onFrame(): void {
    switch (this.em.mode) {
      case  EditorEnum.Mode.MOVE:
        if (this.isGameDown) {
          let camera = Globals.game.camera;
          let newMoveX = this.mousePointer.x;
          let newMoveY = this.mousePointer.y;
          let targetX = camera.x - (newMoveX - this.movementX);
          let targetY =  camera.y - (newMoveY - this.movementY);
          if (targetX > 0 || targetY > 0) {
            camera.setPosition(targetX, targetY);
          }
          this.movementX = newMoveX;
          this.movementY = newMoveY;
        }
        break;
      case  EditorEnum.Mode.ERASER:
        if (this.isGameDown) {
          if (this.em.type === EditorEnum.Type.TERRAIN) {
            this.preSendSceneDown(this.mousePointer);
          }
        }
        break;
      case EditorEnum.Mode.SELECT:
        if (this.isElementDown && this.mSelectElement && this.mousePointer) {
          this.moveElement(this.mSelectElement, this.mousePointer);
        }
        break;
      case EditorEnum.Mode.ZOOM:
        let scale = 0;
        if (this.isGameDown) {
          let newMoveY: number = this.mousePointer.y;
          let add = this.movementY - newMoveY;
          scale = (add / GameConfig.GameHeight) * 0.1;
          this.view.scale.add(scale, scale);
        }
        break;
    }

    if (this.deltaY !== 0) {
      let scaleX = this.view.scale.x;
      let scaleY = this.view.scale.x;
      if (this.deltaY < 0) {
        scaleX += 0.01;
        scaleY += 0.01;
      } else if (this.deltaY > 0) {
        scaleX -= 0.01;
        scaleY -= 0.01;
      }

      if (scaleX < this.minScale) {
        scaleX = this.minScale;
      }

      if (scaleY < this.minScale) {
        scaleY = this.minScale;
      }
      this.view.scale.set(scaleX, scaleY);
    }

    if (this.addAllFlag) {
      if (this.addAllTerrain) {
        this.onAddAllTerrain(this.addAllTerrain);
        this.addAllTerrain = null;
      }
      this.addAllFlag = false;
    }

    if (this.mMouseFollower) {
      this.mMouseFollower.onFrame();
    }
  }

  public onTick(deltaTime: number): void {
    if (this.deltaY !== 0) {
      if (this.deltaY < 0) {
        this.deltaY += 10;
      } else if (this.deltaY > 0) {
        this.deltaY -= 10;
      }
    }
    if (this.mMouseFollower) {
      this.mMouseFollower.onTick();
    }
  }

  private onMouseMove(): void {
    if (this.em.mode === EditorEnum.Mode.BRUSH && this.em.type === EditorEnum.Type.TERRAIN && this.isGameDown) {
      this.preSendSceneDown(this.mousePointer);
    }
  }

  private minScale = 0;
  protected changedToMapSceneCompleteHandler(): void {
    let mapSceneInfo: SceneInfo = Globals.DataCenter.SceneData.mapInfo;
    // clear the last one scene.
    if (this.view) {
      this.view.clearScene();
    }

    Globals.SceneManager.popupScene();

    Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tileWidth, mapSceneInfo.tileHeight);

    Globals.game.world.setBounds(0, 0, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);
    Globals.game.camera.setPosition((mapSceneInfo.mapTotalWidth - GameConfig.GameWidth) >> 1, 0);

    Log.trace("[参数]", "mapW: " + mapSceneInfo.mapTotalWidth + "|mapH:" + mapSceneInfo.mapTotalHeight,
      "cameraX: " + this.camera.x + "|cameraY:" + this.camera.x + "|cameraW:" + this.camera.width + "|cameraH:" + this.camera.height,
      "gameW: " + GameConfig.GameWidth + "|gameH:" + GameConfig.GameHeight,
    );

    this.view.initializeScene(mapSceneInfo);

    if (this.view.terrainGridLayer) {
      this.view.terrainGridLayer.initializeMap(mapSceneInfo);
    }

    this.initializeTerrainItems(mapSceneInfo.terrainConfig);
    this.initializeElementItems(mapSceneInfo.elementConfig);

    Globals.SceneManager.pushScene(this.view);

    Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);

    let minScaleX = GameConfig.GameWidth / mapSceneInfo.mapTotalWidth;
    let minScaleY = GameConfig.GameHeight / mapSceneInfo.mapTotalHeight;
    this.minScale = minScaleX >= minScaleY ? minScaleX : minScaleY;

    this.handleChangeMode();
  }

  protected initializeTerrainItems(datas: Array<any>): void {
    let i = 0;
    let len: number = datas.length;
    let data: TerrainInfo;
    for (; i < len; i++) {
      data = datas[i];
      this.addTerrain(data);
    }
  }

  /**
   * 切换编辑器状态
   */
  private handleChangeMode(): void {
    this.clearMode();
    if (this.em.mode === EditorEnum.Mode.MOVE) {
      Globals.game.input.onDown.add(this.onGameDown, this);
    } else if (this.em.mode === EditorEnum.Mode.BRUSH) {
      Globals.game.input.onDown.add(this.onGameDown, this);
    } else if (this.em.mode === EditorEnum.Mode.ERASER) {
      if (this.em.type === EditorEnum.Type.TERRAIN) {
        Globals.game.input.onDown.add(this.onGameDown, this);
      } else if (this.em.type === EditorEnum.Type.ELEMENT) {
        this.view.middleSceneLayer.onChildInputDown.add(this.onElementLayerDown, this);
      }
    } else if (this.em.mode === EditorEnum.Mode.ZOOM) {
      Globals.game.input.onDown.add(this.onGameDown, this);
    } else if (this.em.mode === EditorEnum.Mode.SELECT) {
      if (this.em.type === EditorEnum.Type.TERRAIN) {
        Globals.game.input.onDown.add(this.onGameDown, this);
      } else if (this.em.type === EditorEnum.Type.ELEMENT) {
        this.view.middleSceneLayer.onChildInputDown.add(this.onElementLayerDown, this);
      }
    }
  }

  private sendScenePoint(x: number, y: number): void {
    Log.trace("点击场景-->", x, y);
    let pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT);
    let content: OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = pkt.content;
    content.point = {x: x >> 0, y: y >> 0};
    Globals.SocketManager.send(pkt);
  }

  private sendSceneObject(value: number[]): void {
    Log.trace("选择物件-->", value);
    let pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_REQ_EDITOR_FETCH_OBJECT);
    let content: OP_CLIENT_REQ_EDITOR_FETCH_OBJECT = pkt.content;
    content.ids = value;
    Globals.SocketManager.send(pkt);
  }

  private moveElement(element: BasicElement, pointer: Phaser.Pointer): void {
    let screenX: number = (pointer.x + this.camera.x) / this.view.scale.x;
    let screenY: number = (pointer.y + this.camera.y) / this.view.scale.y;
    element.setPosition(screenX, screenY);
  }

  private clearMode(): void {
    // Layer events
    this.view.middleSceneLayer.onChildInputDown.remove(this.onElementLayerDown, this);

    if (this.mMouseFollower) {
      this.mMouseFollower.onClear();
    }

    // Game events
    Globals.game.input.onDown.remove(this.onGameDown, this);
    Globals.game.input.onUp.remove(this.onGameUp, this);

    this.mSelectElement = null;
    this.movementX = 0;
    this.movementY = 0;
    this.deltaY = 0;
    this.isElementDown = false;
    this.isGameDown = false;
  }

  private addAllFlag = false;
  private addAllTerrain: op_client.ITerrain;
  protected handleAddAllTerrain(value: op_client.ITerrain): void {
    this.handleRemoveAllTerrain();
    this.addAllTerrain = value;
    this.addAllFlag = true;
  }

  private onAddAllTerrain(value: op_client.ITerrain): void {
    let i = 0;
    let terrain: TerrainInfo;
    let cols: number = Globals.Room45Util.cols;
    let rows: number = Globals.Room45Util.rows;

    for (; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        terrain = new TerrainInfo();
        terrain.setInfo(value);
        terrain.x = i;
        terrain.y = j;
        this.addTerrain(terrain);
      }
    }
  }

  private handleRemoveAllTerrain(): void {
    this.view.removeAllSceneElements( (element: BasicSceneEntity) => {
      return element.elementTypeId === Const.SceneElementType.TERRAIN;
    });
  }

  private handleMouseFollow(value: op_client.OP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW): void {
    if (this.mMouseFollower) {
      this.mMouseFollower.setData(value);
    }
  }

  /**
   * 添加物件
   * @element ElementInfo
   */
  protected addTerrain(value: TerrainInfo): void {
    this.view.addSceneElement(Const.SceneElementType.TERRAIN, value.uid, value);
  }

  /**
   * 删除地块
   * @elementId elementId
   */
  private handleRemoveTerrain(value: any): void {
    let uid: number = Globals.Room45Util.getUid(+value[0], +value[1]);
    this.removeElement(uid);
  }

  protected addElement(value: ElementInfo): void {
    this.view.addSceneElement(Const.SceneElementType.ELEMENT, value.id, value);
  }

  private elementOldPoint: Phaser.Point = new Phaser.Point;
  private onElementLayerDown(item: any): void {
    let tempElement = item.getOwner();
    let elementId: number = tempElement.data.id;
    this.sendSceneObject([elementId]);
    if (this.em.mode === EditorEnum.Mode.SELECT) {
      this.mSelectElement = tempElement;
      this.elementOldPoint.x = this.mSelectElement.ox;
      this.elementOldPoint.y = this.mSelectElement.oy;
    }
    this.isElementDown = true;
    Globals.game.input.onUp.add(this.onGameUp, this);
  }

  // todo:
  private onTerrainLayerUp(item: any): void {
    if (this.em.mode === EditorEnum.Mode.SELECT) {
      this.sendSceneObject([]);
    }
  }

  private preSendSceneDown(pointer: Phaser.Pointer): void {
    let screenX: number = (pointer.x + this.camera.x) / this.view.scale.x;
    let screenY: number = (pointer.y + this.camera.y) / this.view.scale.y;
    let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
    if (tempPoint.x >= 0 && tempPoint.x < Globals.Room45Util.cols && tempPoint.y >= 0 && tempPoint.y < Globals.Room45Util.rows) {
      if (this.em.type === EditorEnum.Type.TERRAIN) {
        this.sendScenePoint(tempPoint.x, tempPoint.y);
      } else if (this.em.type === EditorEnum.Type.ELEMENT) {
        this.sendScenePoint(screenX, screenY);
      }
    }
  }

  private onGameDown(pointer: Phaser.Pointer, event: any): void {
    if (this.em.type === EditorEnum.Type.TERRAIN) {
      this.preSendSceneDown(this.mousePointer);
    }
    this.movementX = pointer.position.x;
    this.movementY = pointer.position.y;
    this.isGameDown = true;
    Globals.game.input.onUp.add(this.onGameUp, this);
  }

  private onGameUp(pointer: Phaser.Pointer, event: any): void {
    Globals.game.input.onUp.remove(this.onGameUp, this);

    if (this.mSelectElement) {
      let screenX: number = (pointer.x + this.camera.x) / this.view.scale.x;
      let screenY: number = (pointer.y + this.camera.y) / this.view.scale.y;
      let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
      if (tempPoint.x >= 0 && tempPoint.x < Globals.Room45Util.cols && tempPoint.y >= 0 && tempPoint.y < Globals.Room45Util.rows) {
        this.sendScenePoint(this.mSelectElement.ox, this.mSelectElement.oy);
      }
      this.mSelectElement.isCanShow = true;
    }

    if (this.isElementDown) {
      if (this.em.mode === EditorEnum.Mode.BRUSH && this.em.type === EditorEnum.Type.ELEMENT) {
        this.preSendSceneDown(pointer);
      }
    }

    this.isElementDown = false;

    if (this.isGameDown) {
      if (this.em.mode === EditorEnum.Mode.BRUSH && this.em.type === EditorEnum.Type.ELEMENT) {
        this.preSendSceneDown(pointer);
      }
    }

    this.isGameDown = false;
  }

  protected initializeElementItems(datas: Array<any>): void {
    let i = 0;
    let len: number = datas.length;
    let data: ElementInfo;
    for (; i < len; i++) {
      data = datas[i];
      this.view.addSceneElement(Const.SceneElementType.ELEMENT, data.id, data);
    }
  }
}
