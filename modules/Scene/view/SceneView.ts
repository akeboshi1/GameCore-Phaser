import {SceneInfo} from "../../../common/struct/SceneInfo";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {SelfRoleElement} from "../elements/SelfRoleElement";
import {RoleElement} from "../elements/RoleElement";
import BasicElement from "../elements/BasicElement";
import {SceneBase} from "./SceneBase";
import {IObjectPool} from "../../../base/pool/interfaces/IObjectPool";
import {BasicTerrain} from "../elements/BasicTerrain";
import {Log} from "../../../Log";

export class SceneView extends SceneBase {
    public currentSelfPlayer: SelfRoleElement;
    protected m_TerrainPool: IObjectPool;
    protected m_ElementPool: IObjectPool;
    protected m_PlayerPool: IObjectPool;

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

    public addTerrainElement(uid: number, elementData: any): BasicSceneEntity {

      let element: BasicSceneEntity = this.m_TerrainPool.alloc() as BasicTerrain;
      if (null == element) {
        element = new BasicTerrain();
      }
      element.uid = uid;
      element.data = elementData;

      this.addTerrainEntity(element);
      return element;
    }

  public insertTerrainElement(uid: number, elementData: any, all: boolean = false): BasicSceneEntity {

    let element: BasicSceneEntity = this.m_TerrainPool.alloc() as BasicTerrain;
    if (null == element) {
      element = new BasicTerrain();
    }

    element.uid = uid;
    element.data = elementData;

    this.insertTerrainEntity(element, all);
    return element;
  }

  public removeTerrainElement(uid: number, all: boolean = false): BasicSceneEntity {
    let element: BasicSceneEntity = super.removeTerrainElement(uid, all);
    if (element == null) return null;
    this.m_TerrainPool.free(element);
    return element;
  }

  public deleteSceneElement(uid: number): BasicSceneEntity {
        let element: BasicSceneEntity = super.deleteSceneElement(uid);
        if (element == null) return null;
        switch (element.elementTypeId) {
            case Const.SceneElementType.ROLE :
                // 当前玩家
                if (uid !== this.currentSelfPlayer.uid) {
                    this.m_PlayerPool.free(element);
                }
                break;

            case Const.SceneElementType.ELEMENT :
                this.m_ElementPool.free(element);
                break;

            default:
                break;
        }
        return element;
    }

    protected onInitialize(): void {
        super.onInitialize();
        this.m_ElementPool = Globals.ObjectPoolManager.getObjectPool("elements");
        this.m_PlayerPool = Globals.ObjectPoolManager.getObjectPool("players");
        this.m_TerrainPool = Globals.ObjectPoolManager.getObjectPool("terrains");
    }

    protected onInitializeScene(value: SceneInfo): void {
        this.mapSceneInfo = value;
        super.onInitializeScene(value);
    }

    protected createElementByType(sceneElementType: number, elemetData: any, isSelf: boolean = false): BasicSceneEntity {
        let element: BasicSceneEntity = null;

        switch (sceneElementType) {

            case Const.SceneElementType.ROLE :
                // 当前玩家
                if (isSelf) {
                    if (this.currentSelfPlayer === undefined) {
                        this.currentSelfPlayer = new SelfRoleElement();
                    }
                    element = this.currentSelfPlayer;
                } else {
                    element = this.m_PlayerPool.alloc() as RoleElement;
                    if (null == element) {
                        element = new RoleElement();
                    }
                }
                break;

            case Const.SceneElementType.ELEMENT :
                element = this.m_ElementPool.alloc() as BasicElement;
                if (null == element) {
                    element = new BasicElement();
                }
                break;

            default:
                break;
        }

        return element;
    }
}
