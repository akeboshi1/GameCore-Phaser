import {BaseProc} from "../base/BaseProc";
import Globals from "../Globals";
import {RoomScene} from "../scene/RoomScene";
import {MapInfo} from "../struct/MapInfo";
import {FlowManager} from "../flow/FlowManager";
import {SceneLoader} from "../scene/SceneLoader";
import {PlayerInfo} from "../struct/PlayerInfo";
import {SelfRoleElement} from "../scene/elements/SelfRoleElement";
import {Const} from "../const/Const";
import {BasicRoleAvatar} from "../avatar/BasicRoleAvatar";

export class SceneProc extends BaseProc {
    public roomScene: RoomScene;
    private hasRgistHandler: boolean = false;
    private flowManager: FlowManager;
    private sceneLoader: SceneLoader;

    public beginProc(): void {
        super.beginProc();
        this.onLoginOk();
    }

    public endProc(): void {
        if (this._active) {
            Globals.MessageCenter.removeByGroup("SceneProc");
            this.unRegistRoomListenerHandler();
            if (this.flowManager)
                this.flowManager.dispose();
            this.flowManager = null;
            super.endProc();
        }
    }

    //server handler
    public registRoomListenerHandler(): void {
        if (!this.hasRgistHandler) {
            this.hasRgistHandler = true;
        }
    }

    public unRegistRoomListenerHandler(): void {
        if (this.hasRgistHandler) {
            this.hasRgistHandler = false;
        }
    }

    private onLoginOk(): void {
        // App.SocketCenter.gameSocket.sendMsg([Core.MessageEnum.SEND_ENTER_GAME, 1]);
        this.onEnterRoom();
    }

    private onEnterRoom(): void {
        this.roomScene = new RoomScene(Globals.game);
        this.roomScene.camera = Globals.game.camera;

        Globals.LayerManager.sceneLayer.add(this.roomScene);
        this.sceneLoader = new SceneLoader();
        this.sceneLoader.setLoadCallback(this.changedToMapSceneStartHandler, this.changedToMapSceneCompleteHandler, this)

        this.flowManager = new FlowManager();
        this.flowManager.initialize();
        this.flowManager.setView(this.roomScene);

        //mapScene
        this.sceneLoader.changedToMap(Globals.DataCenter.PlayerData.mainPlayerInfo.mapId);

        this.registRoomListenerHandler();
    }

    private changedToMapSceneStartHandler(): void {
    }

    private changedToMapSceneCompleteHandler(mapSceneInfo: MapInfo): void {
        //clear the last one scene.
        if (this.roomScene) this.roomScene.clearScene();

        Globals.SceneManager.popupScene();

        Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tilewidth, mapSceneInfo.tileheight);

        this.roomScene.initializeScene(mapSceneInfo);

        //初始化当前玩家其他信息
        var currentCharacterInfo: PlayerInfo = Globals.DataCenter.PlayerData.mainPlayerInfo;
        this.roomScene.addSceneElement(Const.SceneElementType.ROLE, currentCharacterInfo.playerID.toString(), currentCharacterInfo, true) as SelfRoleElement;

        //set camera
        Globals.SceneManager.pushScene(this.roomScene);
        this.roomScene.notifyInitializeSceneComplete();
    }
}