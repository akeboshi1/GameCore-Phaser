import Globals from "../../Globals";
import {MapInfo} from "../../common/struct/MapInfo";
import {SceneLoader} from "./view/SceneLoader";
import {PlayerInfo} from "../../common/struct/PlayerInfo";
import {SelfRoleElement} from "./elements/SelfRoleElement";
import {Const} from "../../common/const/Const";
import {MediatorBase} from "../../base/module/core/MediatorBase";
import {SceneView} from "./view/SceneView";
import {FlowManager} from "./flow/FlowManager";
import {MessageType} from "../../common/const/MessageType";

export class SceneMediator extends MediatorBase {
    private hasRgistHandler: boolean = false;
    private flowManager: FlowManager;
    private sceneLoader: SceneLoader;

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

        this.sceneLoader = new SceneLoader();
        this.sceneLoader.setLoadCallback(this.changedToMapSceneStartHandler, this.changedToMapSceneCompleteHandler, this);

        this.flowManager = new FlowManager();
        this.flowManager.initialize();
        this.flowManager.setView(this.view);

        //mapScene
        this.sceneLoader.changedToMap(Globals.DataCenter.PlayerData.mainPlayerInfo.mapId);

        this.registSceneListenerHandler();
    }

    private changedToMapSceneStartHandler(): void {
    }

    protected changedToMapSceneCompleteHandler(mapSceneInfo: MapInfo): void {
        //clear the last one scene.
        if (this.view) this.view.clearScene();

        Globals.SceneManager.popupScene();

        Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tilewidth, mapSceneInfo.tileheight);

        Globals.game.world.setBounds(0, 0, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);

        this.view.initializeScene(mapSceneInfo);

        //初始化当前玩家其他信息
        let currentCharacterInfo: PlayerInfo = Globals.DataCenter.PlayerData.mainPlayerInfo;
        this.view.addSceneElement(Const.SceneElementType.ROLE, currentCharacterInfo.playerID.toString(), currentCharacterInfo, true) as SelfRoleElement;

        //set camera
        Globals.SceneManager.pushScene(this.view);
        Globals.game.camera.follow(this.view.currentSelfPlayer.display);
        Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);
    }
}