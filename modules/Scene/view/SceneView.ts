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
import {TerrainInfo} from "../../../common/struct/TerrainInfo";

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
        this.drawSceneLayer.addDraw(element.collisionArea);

        this.addSceneEntity(element);

        Globals.MessageCenter.emit(MessageType.ADD_SCENE_ELEMENT, element);

        return element;
    }

    public addTerrainElement(value: TerrainInfo): void {
        let terrain: any;
        if (this.terrainSceneLayer) {
            terrain = this.terrainSceneLayer.addTerrainItem(value);
            this.drawSceneLayer.addDraw(terrain.collisionArea);
        }
        if (this.terrainEditorLayer) {
            terrain = this.terrainEditorLayer.addTerrainItem(value);
            this.drawSceneLayer.addDraw(terrain.collisionArea);
        }
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
        for (; i < len; i++) {
            data = this.mapSceneInfo.elementConfig[i];
            this.addSceneElement(Const.SceneElementType.ELEMENT, data.id, data);
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
