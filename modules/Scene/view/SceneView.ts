import {RoomGridUtil} from "../util/RoomGridUtil";
import {SceneInfo} from "../../../common/struct/SceneInfo";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {SelfRoleElement} from "../elements/SelfRoleElement";
import {RoleElement} from "../elements/RoleElement";
import BasicElement from "../elements/BasicElement";
import {SceneBase} from "./SceneBase";
import {TerrainElement} from "../elements/TerrainElement";

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

    element.setCollisionArea(elemetData.collisionArea, elemetData.originCollisionPoint, this.mapSceneInfo.tileWidth >> 1
      , this.mapSceneInfo.tileHeight >> 1);
    // this.drawSceneLayer.addDraw(element.collisionArea);

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
    // this.seaMapGrid.initGrid(this.mapSceneInfo.cols, this.mapSceneInfo.rows);

    super.onInitializeScene(value);
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
        element = new BasicElement();
        break;

      case Const.SceneElementType.TERRAIN :
        element = new TerrainElement();
        break;

      default:
        break;
    }

    return element;
  }
}
