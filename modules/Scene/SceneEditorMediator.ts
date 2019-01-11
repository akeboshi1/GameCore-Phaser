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
import {BasicTerrainItem} from "./terrainItems/BasicTerrainItem";

export class SceneEditorMediator extends SceneMediator {
  private mTick: Tick;
  private movementX = 0;
  private movementY = 0;
  private deltaY = 0;
  private isGameDown = false;
  private isElementDown = false;
  private mousePointer: Phaser.Pointer;
  private mSelectElement: BasicElement;
  private mSelectTerrain: BasicTerrainItem;

  constructor() {
    super();
  }

  private get em(): IEditorMode {
    return Globals.DataCenter.EditorData.editorMode;
  }

  protected stageResizeHandler(): void {
    Globals.game.world.setBounds(0, 0, Globals.Room45Util.mapTotalWidth, Globals.Room45Util.mapTotalHeight);
    this.view.requestStageResize();
  }

  public onRegister(): void {
    this.mTick = new Tick(33);
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.setRenderCallBack(this.onFrame, this);
    this.mTick.start();
    this.view.inputEnabled = true;
    this.view.middleSceneLayer.inputEnableChildren = true;
    this.mousePointer = Globals.game.input.activePointer;

    Globals.game.input.mouse.mouseWheelCallback = (event: WheelEvent) => {
      this.deltaY = event.deltaY;
    };
    super.onRegister();
  }

  public registerSceneListenerHandler(): void {
    super.registerSceneListenerHandler();
    Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode, this);
    Globals.MessageCenter.on(MessageType.SCENE_ADD_ALL_TERRAIN, this.handleAddAllTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_TERRAIN, this.handleRemoveTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_ALL_TERRAIN, this.handleRemoveAllTerrain, this);
  }

  public unRegisterSceneListenerHandler(): void {
    Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode, this);
    Globals.MessageCenter.on(MessageType.SCENE_ADD_ALL_TERRAIN, this.handleAddAllTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_TERRAIN, this.handleRemoveTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_ALL_TERRAIN, this.handleRemoveAllTerrain, this);
    super.unRegisterSceneListenerHandler();
  }

  public onFrame(deltaTime: number): void {
    switch (this.em.mode) {
      case  EditorEnum.Mode.MOVE:
        if (this.isGameDown) {
          let newMoveX = this.mousePointer.x;
          let newMoveY = this.mousePointer.y;
          let targetX = this.view.x + newMoveX - this.movementX;
          let targetY = this.view.y + newMoveY - this.movementY;
          if (targetX > 0) {
            targetX = 0;
          }
          if (targetX < GameConfig.GameWidth - Globals.Room45Util.mapTotalWidth * this.view.scale.x) {
            targetX = GameConfig.GameWidth - Globals.Room45Util.mapTotalWidth * this.view.scale.x;
          }
          if (targetY > 0) {
            targetY = 0;
          }
          if (targetY < GameConfig.GameHeight - Globals.Room45Util.mapTotalHeight * this.view.scale.y) {
            targetY = GameConfig.GameHeight - Globals.Room45Util.mapTotalHeight * this.view.scale.y;
          }
          this.view.x = targetX;
          this.view.y = targetY;
          this.movementX = newMoveX;
          this.movementY = newMoveY;
        }
        break;
      case  EditorEnum.Mode.BRUSH:
        if (this.isGameDown) {
          if (this.em.type === EditorEnum.Type.TERRAIN) {
            this.preSendSceneDown(this.mousePointer);
          } else if (this.em.type === EditorEnum.Type.ELEMENT) {
            this.triggerMouseDown(this.mousePointer);
          }
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
      if (this.deltaY < 0) {
        this.view.scale.add(0.02, 0.02);
      } else if (this.deltaY > 0) {
        this.view.scale.add(-0.02, -0.02);
      }
    }

    if (this.view.scale.x < this.minScale) {
      this.view.scale.x = this.minScale;
    }

    if (this.view.scale.y < this.minScale) {
      this.view.scale.y = this.minScale;
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

    this.view.initializeScene(mapSceneInfo);

    if (this.view.terrainGridLayer) {
      this.view.terrainGridLayer.initializeMap(mapSceneInfo);
    }

    this.initializeTerrainItems(mapSceneInfo.terrainConfig);
    this.initializeElementItems(mapSceneInfo.elementConfig);

    Globals.SceneManager.pushScene(this.view);

    Globals.game.camera.follow(this.view);

    Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);

    let minScaleX = GameConfig.GameWidth / mapSceneInfo.mapTotalWidth;
    let minScaleY = GameConfig.GameHeight / mapSceneInfo.mapTotalHeight;
    this.minScale = minScaleX >= minScaleY ? minScaleX : minScaleY;

    this.handleChangeMode();
  }

  protected initializeTerrainItems(datas: Array<any>): void {
    let len: number = datas.length;
    let value: TerrainInfo;
    for (let i = 0; i < len; i++) {
      value = datas[i];
      this.addTerrain(value);
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
        this.view.middleSceneLayer.inputEnableChildren = true;
        this.view.middleSceneLayer.onChildInputDown.add(this.onElementLayerDown, this);
      }
    }
  }

  private sendScenePoint(x: number, y: number): void {
    Log.trace("点击场景-->", x, y);
    let pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT);
    let content: OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = pkt.content;
    content.point = {x: x, y: y};
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
    let screenX: number = (pointer.x - this.view.x) / this.view.scale.x;
    let screenY: number = (pointer.y - this.view.y) / this.view.scale.y;
    element.setPosition(screenX, screenY);
  }

  /**
   * 添加物件
   * @element ElementInfo
   */
  protected addTerrain(value: TerrainInfo): void {
    let terrain: BasicTerrainItem = this.view.terrainEditorLayer.addTerrainItem(value);
    if (terrain) {
      this.view.drawSceneLayer.addDraw(terrain.mouseOverArea);
    }
  }

  /**
   * 删除地块
   * @elementId elementId
   */
  private removeTerrain(col: number, row: number): void {
    let terrain: BasicTerrainItem = this.view.terrainEditorLayer.getTerrainItem(col, row);
    if (terrain) {
        this.view.drawSceneLayer.removeDraw(terrain.mouseOverArea);
    }
    this.view.terrainEditorLayer.removeTerrainItem(col, row);
  }

  private clearMode(): void {
    if (!this.view) {
      return;
    }
    if (this.view.input) {
      this.view.input.disableDrag();
    }

    // Layer events
    this.view.middleSceneLayer.inputEnableChildren = false;
    this.view.middleSceneLayer.onChildInputDown.remove(this.onElementLayerDown, this);

    // Game events
    Globals.game.input.onDown.remove(this.onGameDown, this);
    Globals.game.input.onUp.remove(this.onGameUp, this);

  }

  protected handleAddAllTerrain(value: op_client.ITerrain): void {
    this.handleRemoveAllTerrain();

    let terrain: TerrainInfo;
    let cols: number = Globals.Room45Util.cols;
    let rows: number = Globals.Room45Util.rows;
    let n: number = cols * rows;
    for (let i = 0; i < n; i++) {
      let colIndex: number = Math.floor(i % cols);
      let rowIndex: number = Math.floor(i / cols);
        terrain = new TerrainInfo();
        terrain.setInfo(value);
        terrain.x = colIndex;
        terrain.y = rowIndex;
        this.addTerrain(terrain);
    }
  }

  private handleRemoveAllTerrain(): void {
    this.view.terrainEditorLayer.clear();
  }

  private handleRemoveTerrain(value: any): void {
    this.removeTerrain(value[0], value[1]);
  }

  protected addElement(value: ElementInfo): void {
    this.view.addSceneElement(Const.SceneElementType.ELEMENT, value.id, value);
  }

  private elementOldPoint: Phaser.Point = new Phaser.Point;
  private onElementLayerDown(item: any): void {
    let elementId: number = item.owner.data.id;
    this.sendSceneObject([elementId]);
    if (this.em.mode === EditorEnum.Mode.SELECT) {
      if (this.mSelectElement) {
        this.mSelectElement.collisionArea.hide();
      }
      this.mSelectElement = item.owner;
      this.elementOldPoint.x = this.mSelectElement.ox;
      this.elementOldPoint.y = this.mSelectElement.oy;
      this.mSelectElement.collisionArea.show();
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
    let screenX: number = (pointer.x - this.view.x) / this.view.scale.x;
    let screenY: number = (pointer.y - this.view.y) / this.view.scale.y;
    let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
    if (tempPoint.x >= 0 && tempPoint.x < Globals.Room45Util.cols && tempPoint.y >= 0 && tempPoint.y < Globals.Room45Util.rows) {
      if (this.em.type === EditorEnum.Type.TERRAIN) {
        this.sendScenePoint(tempPoint.x, tempPoint.y);
      } else if (this.em.type === EditorEnum.Type.ELEMENT) {
        this.sendScenePoint(screenX, screenY);
      }
    }
  }

  /**
   * 鼠标经过效果
   */
  private triggerMouseDown(pointer: Phaser.Pointer): void {
    let screenX: number = (pointer.x - this.view.x) / this.view.scale.x;
    let screenY: number = (pointer.y - this.view.y) / this.view.scale.y;
    let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
    if (tempPoint.x >= 0 && tempPoint.x < Globals.Room45Util.cols && tempPoint.y >= 0 && tempPoint.y < Globals.Room45Util.rows) {
      if (this.mSelectTerrain) {
        this.mSelectTerrain.triggerMouseOver(false);
        this.mSelectTerrain = null;
      }
      this.mSelectTerrain = this.view.terrainEditorLayer.getTerrainItem(tempPoint.x, tempPoint.y);
      if (this.mSelectTerrain) {
        this.mSelectTerrain.triggerMouseOver(true);
      }
    }
  }

  private onGameDown(pointer: Phaser.Pointer, event: any): void {
    if (this.em.type === EditorEnum.Type.TERRAIN) {
      this.preSendSceneDown(this.mousePointer);
    } else if (this.em.type === EditorEnum.Type.ELEMENT) {
      this.triggerMouseDown(this.mousePointer);
    }
    this.movementX = pointer.position.x;
    this.movementY = pointer.position.y;
    this.isGameDown = true;
    Globals.game.input.onUp.add(this.onGameUp, this);
  }

  private onGameUp(pointer: Phaser.Pointer, event: any): void {
    Globals.game.input.onUp.remove(this.onGameUp, this);

    if (this.mSelectTerrain) {
      this.mSelectTerrain.triggerMouseOver(false);
      this.mSelectTerrain = null;
    }

    if (this.mSelectElement) {
      let screenX: number = (pointer.x - this.view.x) / this.view.scale.x;
      let screenY: number = (pointer.y - this.view.y) / this.view.scale.y;
      let tempPoint: Phaser.Point = Globals.Room45Util.pixelToTileCoords(screenX, screenY);
      if (tempPoint.x >= 0 && tempPoint.x < Globals.Room45Util.cols && tempPoint.y >= 0 && tempPoint.y < Globals.Room45Util.rows) {
        this.sendScenePoint(this.mSelectElement.ox, this.mSelectElement.oy);
      } else {
        this.mSelectElement.setPosition(this.elementOldPoint.x, this.elementOldPoint.y);
        this.sendScenePoint(this.elementOldPoint.x, this.elementOldPoint.y);
      }
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
    let element: BasicSceneEntity;
    for (; i < len; i++) {
      data = datas[i];
      element = this.view.addSceneElement(Const.SceneElementType.ELEMENT, data.id, data);
      element.collisionArea.hide();
    }
  }
}
