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
    private hasRegisterHandler: boolean = false;
    private flowManager: FlowManager;

    // private sceneLoader: SceneLoader;

    constructor() {
        super();
    }

    public get view(): SceneView {
        return this.viewComponent as SceneView;
    }

    private _move_graphics: Phaser.Graphics;

    private get move_graphics(): Phaser.Graphics {
        if (this._move_graphics == null) {
            this._move_graphics = Globals.game.make.graphics();
            this._move_graphics.clear();
            this._move_graphics.lineStyle(2, 0x00ff00, 1);
            Globals.LayerManager.sceneLayer.add(this._move_graphics);
        }
        return this._move_graphics;
    }

    private _stop_graphics: Phaser.Graphics;

    private get stop_graphics(): Phaser.Graphics {
        if (this._stop_graphics == null) {
            this._stop_graphics = Globals.game.make.graphics();
            this._stop_graphics.lineStyle(2, 0xff0000, 1);
            this.view.addChild(this._stop_graphics);
        }
        return this._stop_graphics;
    }

    public onRegister(): void {
        super.onRegister();
        this.onLoginOk();
    }

    public onRemove(): void {
        this.unRegisterSceneListenerHandler();
        if (this.flowManager)
            this.flowManager.dispose();
        this.flowManager = null;
        super.onRemove();
    }

    //server handler
    public registerSceneListenerHandler(): void {
        if (!this.hasRegisterHandler) {
            Globals.MessageCenter.on(MessageType.SCENE_MOVE_TO, this.moveToHandle, this);
            Globals.MessageCenter.on(MessageType.SCENE_MOVE_STOP, this.moveStopHandle, this);
            this.hasRegisterHandler = true;
        }
    }

    public unRegisterSceneListenerHandler(): void {
        if (this.hasRegisterHandler) {
            Globals.MessageCenter.cancel(MessageType.SCENE_MOVE_TO, this.moveToHandle, this);
            Globals.MessageCenter.cancel(MessageType.SCENE_MOVE_STOP, this.moveStopHandle, this);
            this.hasRegisterHandler = false;
        }
    }

    protected changedToMapSceneCompleteHandler(mapSceneInfo: SceneInfo): void {
        //clear the last one scene.
        if (this.view) this.view.clearScene();

        Globals.SceneManager.popupScene();

        Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tileWidth, mapSceneInfo.tileHeight, mapSceneInfo.atanAngle);

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

    private onDraw(graphics: Phaser.Graphics, ox: number, oy: number, x: number, y: number) {
        graphics.moveTo(ox, oy);
        graphics.lineTo(x, y);
    }

    private moveToHandle(moveData: op_client.IMoveData[]): void {
        let imove: op_client.IMoveData;
        let entity: BasicSceneEntity;
        for (let i = 0; i < moveData.length; i++) {
            imove = moveData[i];
            entity = this.view.getSceneElement(imove.moveObjectId);
            if (this.view.currentSelfPlayer.uid === imove.moveObjectId) {
                this.onDraw(this.move_graphics, this.view.currentSelfPlayer.ox, this.view.currentSelfPlayer.oy, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
                // Log.trace("[收到] <--> ", imove.direction, imove.timeSpan, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
            }
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
            if (this.view.currentSelfPlayer.uid === imove.moveObjectId) {
                this.onDraw(this.stop_graphics, this.view.currentSelfPlayer.ox, this.view.currentSelfPlayer.oy, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
                // Log.trace("[收到-停下] <--> ", imove.direction, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
            }
            if (entity)
                entity.setPosition(imove.destinationPoint3f.x, imove.destinationPoint3f.y, imove.destinationPoint3f.z);
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

        this.registerSceneListenerHandler();

        this.changedToMapSceneCompleteHandler(Globals.DataCenter.SceneData.mapInfo);
    }

    private changedToMapSceneStartHandler(): void {
    }
}