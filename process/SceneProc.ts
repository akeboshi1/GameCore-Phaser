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
import {Log} from "../Log";

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
            this.unRegistSceneListenerHandler();
            if (this.flowManager)
                this.flowManager.dispose();
            this.flowManager = null;
            super.endProc();
        }
    }

    //server handler
    public registSceneListenerHandler(): void {
        if (!this.hasRgistHandler) {
            this.hasRgistHandler = true;
        }
    }

    public unRegistSceneListenerHandler(): void {
        if (this.hasRgistHandler) {
            this.hasRgistHandler = false;
        }
    }

    private onLoginOk(): void {
        // App.SocketCenter.gameSocket.sendMsg([Core.MessageEnum.SEND_ENTER_GAME, 1]);
        this.onEnterScene();
    }

    private onEnterScene(): void {
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

        this.registSceneListenerHandler();
    }

    private changedToMapSceneStartHandler(): void {
    }

    private changedToMapSceneCompleteHandler(mapSceneInfo: MapInfo): void {
        //clear the last one scene.
        if (this.roomScene) this.roomScene.clearScene();

        Globals.SceneManager.popupScene();

        Log.trace(mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);
        Globals.game.world.setBounds(0, 0, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);

        Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tilewidth, mapSceneInfo.tileheight);

        this.roomScene.initializeScene(mapSceneInfo);

        //初始化当前玩家其他信息
        var currentCharacterInfo: PlayerInfo = Globals.DataCenter.PlayerData.mainPlayerInfo;
        this.roomScene.addSceneElement(Const.SceneElementType.ROLE, currentCharacterInfo.playerID.toString(), currentCharacterInfo, true) as SelfRoleElement;

        //set camera
        Globals.SceneManager.pushScene(this.roomScene);
        // let camera = Globals.game.camera;
        // camera.setSize(Globals.DataCenter.MapData.mapInfo.mapTotalWidth,Globals.DataCenter.MapData.mapInfo.mapTotalHeight);
        Globals.game.camera.follow(this.roomScene.currentSelfPlayer.display);
        this.roomScene.notifyInitializeSceneComplete();
    }
}