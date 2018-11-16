import {RoomGridUtil} from "../util/RoomGridUtil";
import {MapInfo} from "../../../common/struct/MapInfo";
import {BasicSceneEntity} from "../../../base/BasicSceneEntity";
import {Const} from "../../../common/const/Const";
import Globals from "../../../Globals";
import {MessageType} from "../../../common/const/MessageType";
import {SelfRoleElement} from "../elements/SelfRoleElement";
import {RoleElement} from "../elements/RoleElement";
import BasicElement from "../elements/BasicElement";
import {ElementInfo} from "../../../common/struct/ElementInfo";
import {SceneBase} from "./SceneBase";

export class SceneView extends SceneBase {
    public seaMapGrid: RoomGridUtil;
    public currentSelfPlayer: SelfRoleElement;

    // private graphics1;
    public onFrame(deltaTime: number): void {
        super.onFrame(deltaTime);
        // if (this.graphics === undefined)
        //     this.graphics = Globals.game.add.graphics();
        // this.graphics.clear();
        // // this.graphics.alpha = 0.2;
        // this.graphics.lineStyle(5, 0xff0000, 1);
        // // this.graphics.beginFill(0xff0000);
        // this.graphics.drawRect(Globals.game.camera.x, Globals.game.camera.y, Globals.game.camera.width, Globals.game.camera.height);
        // this.graphics.endFill();

        // if (this.graphics1 === undefined)
        //     this.graphics1 = Globals.game.add.graphics();
        // this.graphics1.clear();
        // // this.graphics.alpha = 0.2;
        // this.graphics1.lineStyle(5, 0x00ff00, 1);
        // // this.graphics.beginFill(0xff0000);
        // this.graphics1.drawRect(Globals.game.world.x, Globals.game.world.y, Globals.game.world.width, Globals.game.world.height);
        // this.graphics1.endFill();
        // Log.trace(this.currentSelfPlayer.display.isoX,this.currentSelfPlayer.display.isoY);
    }

    public addSceneElement(sceneElementType: number,
                           uid: string, elemetData: any,
                           isSelf: boolean = false): BasicSceneEntity {

        let element: BasicSceneEntity = this.createElementByType(sceneElementType, elemetData, isSelf);

        element.uid = uid;
        element.elementTypeId = sceneElementType;
        element.data = elemetData;

        this.addSceneEntity(element);

        Globals.MessageCenter.dispatch(MessageType.ADD_SCENE_ELEMENT, element);

        return element;
    }

    // private graphics;

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
        Globals.game.camera.follow(this.currentSelfPlayer.display);
    }

    protected createElementByType(sceneElementType: number, elemetData: any, isSelf: boolean = false): BasicSceneEntity {
        let element: BasicSceneEntity = null;

        switch (sceneElementType) {

            case Const.SceneElementType.ROLE :
                // 当前玩家
                if (isSelf) {
                    element = this.currentSelfPlayer = new SelfRoleElement();
                }
                else {
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