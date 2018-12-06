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
import {SceneLoader} from "./view/SceneLoader";

export class SceneMediator extends MediatorBase {
    private hasRegisterHandler: boolean = false;
    private flowManager: FlowManager;

    private sceneLoader: SceneLoader;

    constructor() {
        super();
    }

    public get view(): SceneView {
        return this.viewComponent as SceneView;
    }

    private _move_graphics: MyGraphics;

    private get move_graphics(): MyGraphics {
        if (this._move_graphics === undefined) {
            this._move_graphics = new MyGraphics(Globals.game, 0x00FFFF);
            Globals.LayerManager.sceneLayer.add(this._move_graphics);
        }
        return this._move_graphics;
    }

    private _stop_graphics: MyGraphics;

    private get stop_graphics(): MyGraphics {
        if (this._stop_graphics === undefined) {
            this._stop_graphics = new MyGraphics(Globals.game, 0xFF0000);
            Globals.LayerManager.sceneLayer.add(this._stop_graphics);
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

    protected changedToMapSceneCompleteHandler(): void {
        //clear the last one scene.
        let mapSceneInfo: SceneInfo = Globals.DataCenter.SceneData.mapInfo;

        if (this.view) this.view.clearScene();

        Globals.SceneManager.popupScene();

        Globals.Room45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tileWidth, mapSceneInfo.tileHeight);

        Globals.game.world.setBounds(0, 0, mapSceneInfo.mapTotalWidth, mapSceneInfo.mapTotalHeight);

        this.view.initializeScene(mapSceneInfo);

        //初始化当前玩家其他信息
        let currentCharacterInfo: PlayerInfo = Globals.DataCenter.PlayerData.mainPlayerInfo;
        // currentCharacterInfo.walkableArea.draw(Globals.game, mapSceneInfo.tileWidth >> 1, mapSceneInfo.tileHeight >> 1);
        currentCharacterInfo.collisionArea.draw( mapSceneInfo.tileWidth >> 1, mapSceneInfo.tileHeight >> 1);
        this.view.addSceneElement(Const.SceneElementType.ROLE, currentCharacterInfo.actorId, currentCharacterInfo, true) as SelfRoleElement;

        // 播放场景音效
        Globals.SoundManager.playBgSound(1);

        //set camera
        Globals.SceneManager.pushScene(this.view);
        Globals.game.camera.follow(this.view.currentSelfPlayer.display);
        Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);
    }

    private onDraw(graphics: MyGraphics, x: number, y: number) {
        graphics.haha();
        graphics.drawCircle(x, y, 5 );
    }

    private moveToHandle(moveData: op_client.IMoveData[]): void {
        let imove: op_client.IMoveData;
        let entity: BasicSceneEntity;
        for (let i = 0; i < moveData.length; i++) {
            imove = moveData[i];
            entity = this.view.getSceneElement(imove.moveObjectId);
            if (this.view.currentSelfPlayer.uid === imove.moveObjectId) {
                this.onDraw(this.move_graphics, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
                // Log.trace("[行走] <--> ", imove.destinationPoint3f.x, imove.destinationPoint3f.y);
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
                this.onDraw(this.stop_graphics, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
                // Log.trace("[停下] <--> ", imove.destinationPoint3f.x, imove.destinationPoint3f.y);
            }
            if (entity)
                entity.moveStopTarget(imove);
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
        this.sceneLoader.changedToMap(Globals.DataCenter.SceneData.mapInfo);

        this.registerSceneListenerHandler();
    }

    private changedToMapSceneStartHandler(): void {
    }
}

class MyGraphics extends Phaser.Graphics {
    private _color: number;
    constructor(game: Phaser.Game, color: number) {
        super(game);
        this._color = color;
    }

    public haha(): void {
        this.clear();
        this.lineStyle(1, 0x000000, 1);
        this.beginFill(this._color);
    }
}