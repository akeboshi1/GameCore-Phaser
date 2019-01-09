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
import {TerrainAnimationItem} from "./terrainItems/TerrainAnimationItem";
import BasicElement from "./elements/BasicElement";
import OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = op_editor.OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT;
import OP_CLIENT_REQ_EDITOR_FETCH_OBJECT = op_editor.OP_CLIENT_REQ_EDITOR_FETCH_OBJECT;
import {op_editor} from "../../../protocol/protocols";
import {ElementInfo} from "../../common/struct/ElementInfo";
import {BasicSceneEntity} from "../../base/BasicSceneEntity";
import {Const} from "../../common/const/Const";

export class SceneEditorMediator extends SceneMediator {
  private mTick: Tick;
  private movementY = 0;
  private deltaY = 0;
  private isGameDown = false;
  private isElementDown = false;
  private mousePointer: Phaser.Pointer;
  private mSelectElement: BasicElement;
  private mSelectTerrain: TerrainAnimationItem;

  constructor() {
    super();
  }

  private get em(): IEditorMode {
    return Globals.DataCenter.EditorData.editorMode;
  }

  public onRegister(): void {
    this.mTick = new Tick(33);
    this.mTick.setCallBack(this.onTick, this);
    this.mTick.setRenderCallBack(this.onFrame, this);
    this.mTick.start();
    this.view.inputEnabled = true;
    this.view.middleSceneLayer.inputEnableChildren = true;
    this.mousePointer = Globals.game.input.activePointer;
    super.onRegister();

    Globals.MessageCenter.on(MessageType.EDITOR_CHANGE_MODE, this.handleChangeMode, this);
    Globals.MessageCenter.on(MessageType.SCENE_ADD_ELEMENT, this.handleAddElement, this);
    Globals.MessageCenter.on(MessageType.SCENE_ADD_TERRAIN, this.handleAddTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_ELEMENT, this.handleRemoveElement, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_TERRAIN, this.handleRemoveTerrain, this);
    Globals.MessageCenter.on(MessageType.SCENE_REMOVE_ALL_TERRAIN, this.handleRemoveAllTerrain, this);


    Globals.game.input.mouse.mouseWheelCallback = (event: WheelEvent) => {
      this.deltaY = event.deltaY;
    };
  }

  public onFrame(deltaTime: number): void {
    switch (this.em.mode) {
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
        Log.trace("选中", this.mSelectElement,  this.isElementDown, this.mousePointer );
        if (this.isElementDown && this.mSelectElement && this.mousePointer) {
          this.moveElement(this.mSelectElement, this.mousePointer);
        }
        break;
      case EditorEnum.Mode.ZOOM:
        let scale = 0;
        if (this.isGameDown) {
          let newMoveY: number = Globals.game.input.y;
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

    if (this.view.scale.x < this.minScaleX) {
      this.view.scale.x = this.minScaleX;
    }

    if (this.view.scale.y < this.minScaleY) {
      this.view.scale.y = this.minScaleY;
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

  private minScaleX = 1;
  private minScaleY = 1;
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

    this.initializeTerrainItems(mapSceneInfo.terrainConfig);

    Globals.SceneManager.pushScene(this.view);

    Globals.game.camera.follow(this.view);

    Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);

    this.minScaleX = GameConfig.GameWidth / mapSceneInfo.mapTotalWidth;
    this.minScaleY = GameConfig.GameHeight / mapSceneInfo.mapTotalHeight;

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
      let scaleX: number = this.view.scale.x;
      let scaleY: number = this.view.scale.y;
      let bounds: Phaser.Rectangle = new Phaser.Rectangle(-this.view.x * scaleX - (Globals.Room45Util.mapTotalWidth * scaleX - GameConfig.GameWidth), -this.view.y * scaleY - (Globals.Room45Util.mapTotalHeight * scaleY - GameConfig.GameHeight),
        (Globals.Room45Util.mapTotalWidth * scaleX - GameConfig.GameWidth + Globals.Room45Util.tileWidth * scaleX / 2), (Globals.Room45Util.mapTotalHeight * scaleY - GameConfig.GameHeight + Globals.Room45Util.tileHeight * scaleY));
      this.view.input.boundsRect = bounds;
      this.view.input.enableDrag();
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
        this.view.terrainGridLayer.graphics.inputEnabled = true;
        this.view.terrainGridLayer.inputEnableChildren = true;
        this.view.terrainGridLayer.onChildInputUp.add(this.onTerrainLayerUp, this);
      }
    }
  }

  private sendScenePoint(x: number, y: number): void {
    Log.trace("点击地块-->", x, y);
    let pkt: PBpacket = new PBpacket(op_editor.OPCODE._OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT);
    let content: OP_CLIENT_RES_EDITOR_SCENE_POINT_RESULT = pkt.content;
    content.point = {x: x, y: y};
    Globals.SocketManager.send(pkt);
  }

  private sendSceneObject(value: number[]): void {
    Log.trace("点击物件-->", value);
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
    let terrain: TerrainAnimationItem = this.view.terrainEditorLayer.addTerrainItem(value) as TerrainAnimationItem;
    if (terrain) {
      this.view.drawSceneLayer.addDraw(terrain.mouseOverArea);
    }
  }

  /**
   * 删除地块
   * @elementId elementId
   */
  private removeTerrain(col: number, row: number): void {
    let terrain: TerrainAnimationItem = this.view.terrainEditorLayer.getTerrainItem(col, row) as TerrainAnimationItem;
    if (terrain) {
        this.view.drawSceneLayer.removeDraw(terrain.mouseOverArea);
    }
    this.view.terrainEditorLayer.removeTerrainItem(col, row);
  }

  private clearMode(): void {
    if (this.view.input) {
      this.view.input.disableDrag();
    }

    this.view.terrainGridLayer.graphics.inputEnabled = false;
    this.view.terrainGridLayer.inputEnableChildren = false;

    // Layer events
    this.view.middleSceneLayer.onChildInputDown.remove(this.onElementLayerDown, this);
    this.view.terrainGridLayer.onChildInputUp.remove(this.onTerrainLayerUp, this);

    // Game events
    Globals.game.input.onDown.remove(this.onGameDown, this);
    Globals.game.input.onUp.remove(this.onGameUp, this);

  }

  private handleRemoveAllTerrain(): void {
    this.view.terrainEditorLayer.releaseTerrainItems();
  }

  private handleRemoveTerrain(value: any): void {
    this.removeTerrain(value[0], value[1]);
  }

  protected addElement(value: ElementInfo): void {
    this.view.addSceneElement(Const.SceneElementType.ELEMENT, value.id, value);
  }

  private onElementLayerDown(item: any): void {
    let elementId: number = item.owner.data.id;
    this.sendSceneObject([elementId]);
    if (this.em.mode === EditorEnum.Mode.SELECT) {
      if (this.mSelectElement) {
        this.mSelectElement.collisionArea.hide();
      }
      this.mSelectElement = item.owner; // 0xfffab0
      this.mSelectElement.collisionArea.show();
    }
    this.isElementDown = true;
    Globals.game.input.onUp.add(this.onGameUp, this);
  }

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
      this.sendScenePoint(this.mSelectElement.ox, this.mSelectElement.oy);
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
