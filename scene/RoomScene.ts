import {RoomSceneBasic} from "./RoomSceneBasic";
import {RoomGridUtil} from "./util/RoomGridUtil";
import {MapInfo} from "../struct/MapInfo";
import {BasicSceneEntity} from "../base/BasicSceneEntity";
import {Const} from "../const/Const";
import Globals from "../Globals";
import {MessageType} from "../const/MessageType";
import {SelfRoleElement} from "./elements/SelfRoleElement";
import {RoleElement} from "./elements/RoleElement";
import BasicElement from './elements/BasicElement';
import {ElementInfo} from "../struct/ElementInfo";

export class RoomScene extends RoomSceneBasic {
    public seaMapGrid: RoomGridUtil;
    public currentSelfPlayer: SelfRoleElement;

    protected onInitialize(): void {
        super.onInitialize();
        this.seaMapGrid = new RoomGridUtil();
    }

    protected onInitializeScene(value: MapInfo): void {
        this.mapSceneInfo = value;
        this.seaMapGrid.initGrid(this.mapSceneInfo.cols, this.mapSceneInfo.rows);

        super.onInitializeScene(value);

        this.terrainSceneLayer.initializeMap(value);

        let i: number = 0;
        let len: number = this.mapSceneInfo.elementData.length;
        let element: ElementInfo;
        for (; i < len; i++) {
            element = this.mapSceneInfo.elementData[i];
            // if (element.config.type == 13) {
            //    this.addSceneElement(Const.SceneElementType.ELEMENT, element.id.toString(), element);
            // }
        }
    }

    protected onActivedScene(): void {
        super.onActivedScene();
        this.camera.follow(this.currentSelfPlayer.display);
    }

    public addSceneElement(sceneElementType: number,
                           uid: string, elemetData: any,
                           isSelf: boolean = false): BasicSceneEntity {

        var element: BasicSceneEntity = this.createElementByType(sceneElementType, elemetData, isSelf);

        element.uid = uid;
        element.elementTypeId = sceneElementType;
        element.data = elemetData;

        this.addSceneEntity(element);

        Globals.MessageCenter.dispatch(MessageType.ADD_SCENE_ELEMENT, element);

        return element;
    }

    protected createElementByType(sceneElementType: number, elemetData: any, isSelf: boolean = false): BasicSceneEntity {
        var element: BasicSceneEntity = null;

        switch (sceneElementType) {

            case Const.SceneElementType.ROLE:
                //当前玩家
                if (isSelf) {
                    element = this.currentSelfPlayer = new SelfRoleElement();
                }
                else {
                    element = new RoleElement();
                }
                break;

            case Const.SceneElementType.ELEMENT:
                //普通
                // if (elemetData.config.subType == 1) {
                    element = new BasicElement();
                // }//npc
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