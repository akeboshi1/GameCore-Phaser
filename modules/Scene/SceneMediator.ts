import Globals from "../../Globals";
import {SceneInfo} from "../../common/struct/SceneInfo";
import {PlayerInfo} from "../../common/struct/PlayerInfo";
import {SelfRoleElement} from "./elements/SelfRoleElement";
import {Const} from "../../common/const/Const";
import {MediatorBase} from "../../base/module/core/MediatorBase";
import {SceneView} from "./view/SceneView";
import {FlowManager} from "./flow/FlowManager";
import {MessageType} from "../../common/const/MessageType";
import {op_client} from "../../../protocol/protocols";
import {BasicSceneEntity} from "../../base/BasicSceneEntity";
import {Log} from "../../Log";

export class SceneMediator extends MediatorBase {
    private hasRgistHandler: boolean = false;
    private flowManager: FlowManager;

    // private sceneLoader: SceneLoader;

    constructor() {
        super();
    }

    public get view(): SceneView {
        return this.viewComponent as SceneView;
    }

    public onRegister(): void {
        super.onRegister();
        this.onLoginOk();
    }

    public onRemove(): void {
        this.unRegistSceneListenerHandler();
        if (this.flowManager)
            this.flowManager.dispose();
        this.flowManager = null;
        super.onRemove();
    }

    //server handler
    public registSceneListenerHandler(): void {
        if (!this.hasRgistHandler) {
            Globals.MessageCenter.on(MessageType.SCENE_MOVE_TO, this.moveToHandle, this);
            Globals.MessageCenter.on(MessageType.SCENE_MOVE_STOP, this.moveStopHandle, this);
            this.hasRgistHandler = true;
        }
    }

    public unRegistSceneListenerHandler(): void {
        if (this.hasRgistHandler) {
            Globals.MessageCenter.cancel(MessageType.SCENE_MOVE_TO, this.moveToHandle, this);
            Globals.MessageCenter.cancel(MessageType.SCENE_MOVE_STOP, this.moveStopHandle, this);
            this.hasRgistHandler = false;
        }
    }

    protected changedToMapSceneCompleteHandler(mapSceneInfo: SceneInfo): void {
        //clear the last one scene.
        if (this.view) this.view.clearScene();

        Globals.SceneManager.popupScene();

        Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tileWidth, mapSceneInfo.tileHeight);

        Globals.game.world.setBounds(0, 0, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);

        this.view.initializeScene(mapSceneInfo);

        //初始化当前玩家其他信息
        let currentCharacterInfo: PlayerInfo = Globals.DataCenter.PlayerData.mainPlayerInfo;
        this.view.addSceneElement(Const.SceneElementType.ROLE, currentCharacterInfo.actorId, currentCharacterInfo, true) as SelfRoleElement;

        //set camera
        Globals.SceneManager.pushScene(this.view);
        Globals.game.camera.follow(this.view.currentSelfPlayer.display);
        Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);
    }

    private moveToHandle(moveData: op_client.IMoveData[]): void {
        let imove: op_client.IMoveData;
        let entity: BasicSceneEntity;
        for (let i = 0; i < moveData.length; i++) {
            imove = moveData[i];
            entity = this.view.getSceneElement(imove.moveObjectId);
            if (this.view.currentSelfPlayer.uid === imove.moveObjectId)
                Log.trace("[收到] <--> ", imove.direction, imove.timeSpan, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
            if (entity)
                entity.moveToTarget(imove);
        }
    }

    private moveStopHandle(posData: op_client.IMovePosition[]): void {
        let imove: op_client.IMovePosition;
        let entity: BasicSceneEntity;
        for (let i = 0; i < posData.length; i++) {
            imove = posData[i];
            entity = this.view.getSceneElement(imove.moveObjectId);
            if (this.view.currentSelfPlayer.uid === imove.moveObjectId)
                Log.trace("[收到] <--> ", imove.direction, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
            // if (entity)
                // entity.setPosition(imove.destinationPoint3f.x, imove.destinationPoint3f.y, imove.destinationPoint3f.z);
        }
    }

    private onLoginOk(): void {
        // App.SocketCenter.gameSocket.sendMsg([Core.MessageEnum.SEND_ENTER_GAME, 1]);
        this.onEnterScene();
    }

    private onEnterScene(): void {

        // this.sceneLoader = new SceneLoader();
        // this.sceneLoader.setLoadCallback(this.changedToMapSceneStartHandler, this.changedToMapSceneCompleteHandler, this);

        this.flowManager = new FlowManager();
        this.flowManager.initialize();
        this.flowManager.setView(this.view);

        //mapScene
        // this.sceneLoader.changedToMap(Globals.DataCenter.PlayerData.mainPlayerInfo.mapId);

        this.registSceneListenerHandler();

        this.changedToMapSceneCompleteHandler(Globals.DataCenter.SceneData.mapInfo);
    }

    private changedToMapSceneStartHandler(): void {
    }
}