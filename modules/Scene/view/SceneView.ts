import {RoomGridUtil} from "../util/RoomGridUtil";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {SelfRoleElement} from "../elements/SelfRoleElement";
import {RoleElement} from "../elements/RoleElement";
import BasicElement from "../elements/BasicElement";
import {ElementInfo} from "../../../common/struct/ElementInfo";
import {SceneBase} from "./SceneBase";
import {DrawArea} from "../../../common/struct/DrawArea";

export class SceneView extends SceneBase {
  public seaMapGrid: RoomGridUtil;
  public currentSelfPlayer: SelfRoleElement;

  public addSceneElement(sceneElementType: number,
                         uid: number, elemetData: any,
                         isSelf: boolean = false): BasicSceneEntity {

    let element: BasicSceneEntity = this.createElementByType(sceneElementType, elemetData, isSelf);

    element.uid = uid;
    element.elementTypeId = sceneElementType;
    element.data = elemetData;

    this.addSceneEntity(element);

    Globals.MessageCenter.emit(MessageType.ADD_SCENE_ELEMENT, element);

    return element;
  }

  protected onInitialize(): void {
    super.onInitialize();
    this.seaMapGrid = new RoomGridUtil();
  }

  protected onInitializeScene(value: SceneInfo): void {
    this.mapSceneInfo = value;
    this.seaMapGrid.initGrid(this.mapSceneInfo.cols, this.mapSceneInfo.rows);

    super.onInitializeScene(value);

    let i = 0;
    let len: number = this.mapSceneInfo.elementConfig.length;
    let data: ElementInfo;
    let element: BasicSceneEntity;
    for (; i < len; i++) {
      data = this.mapSceneInfo.elementConfig[i];
      element = this.addSceneElement(Const.SceneElementType.ELEMENT, data.id, data);
      element.setCollisionArea(data.collisionArea, data.originCollisionPoint, this.mapSceneInfo.tileWidth >> 1
        , this.mapSceneInfo.tileHeight >> 1);
      this.drawSceneLayer.addDraw(element.collisionArea);
    }
  }

  protected onActivedScene(): void {
    super.onActivedScene();
    // Globals.game.camera.follow(this.currentSelfPlayer.display);
  }

  protected createElementByType(sceneElementType: number, elemetData: any, isSelf: boolean = false): BasicSceneEntity {
    let element: BasicSceneEntity = null;

    switch (sceneElementType) {

      case Const.SceneElementType.ROLE :
        // 当前玩家
        if (isSelf) {
          element = this.currentSelfPlayer = new SelfRoleElement();
        } else {
          element = new RoleElement();
        }
        break;

      case Const.SceneElementType.ELEMENT :
        // 普通
        // if (elemetData.config.subType == 1) {
        element = new BasicElement();
        // }
        // npc
        // else if (elemetData.config.subType == 2 || elemetData.config.subType == 3) {
        // element = new BasicNPCElement();
        // }
        break;

      default:
        break;
    }

    return element;
  }
}
