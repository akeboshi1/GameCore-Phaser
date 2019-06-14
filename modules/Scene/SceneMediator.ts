import Globals from "../../Globals";
import {SceneInfo} from "../../common/struct/SceneInfo";
import {PlayerInfo} from "../../common/struct/PlayerInfo";
import {SelfRoleElement} from "./elements/SelfRoleElement";
import {Const} from "../../common/const/Const";
import {MediatorBase} from "../../base/module/core/MediatorBase";
import {SceneView} from "./view/SceneView";
import {FlowManager} from "./flow/FlowManager";
import {MessageType} from "../../common/const/MessageType";
import {op_client, op_virtual_world} from "pixelpai_proto";
import {BasicSceneEntity} from "../../base/BasicSceneEntity";
import {SceneLoader} from "./view/SceneLoader";
import {TerrainInfo} from "../../common/struct/TerrainInfo";
import {ElementInfo} from "../../common/struct/ElementInfo";
import {PBpacket} from "net-socket-packet";
import {GameConfig} from "../../GameConfig";
import {Log} from "../../Log";
import OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE;
import SceneEntity from "./view/SceneEntity";

export class SceneMediator extends MediatorBase {
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
        this.view.clearScene();
        super.onRemove();
    }

    protected stageResizeHandler(): void {
        Globals.game.world.setBounds(-GameConfig.GameWidth / 2, -GameConfig.GameHeight / 2, Globals.Scene45Util.mapTotalWidth + GameConfig.GameWidth, Globals.Scene45Util.mapTotalHeight + GameConfig.GameHeight);
        this.view.requestStageResize();
    }

    // server handler
    public registerSceneListenerHandler(): void {
        Globals.MessageCenter.on(MessageType.SCENE_MOVE_TO, this.moveToHandle, this);
        Globals.MessageCenter.on(MessageType.SCENE_MOVE_STOP, this.moveStopHandle, this);
        Globals.MessageCenter.on(MessageType.CHANGE_ELEMENT_ANIMATION, this.changeElementHandle, this);

        Globals.MessageCenter.on(MessageType.SCENE_ADD_TERRAIN, this.handleAddTerrain, this);
        Globals.MessageCenter.on(MessageType.SCENE_ADD_TERRAIN_END, this.handleAddTerrainEnd, this);
        Globals.MessageCenter.on(MessageType.SCENE_ADD_ELEMENT, this.handleAddElement, this);
        Globals.MessageCenter.on(MessageType.SCENE_REMOVE_ELEMENT, this.handleRemoveElement, this);
        Globals.MessageCenter.on(MessageType.SCENE_ADD_PLAYER, this.handleAddPlayer, this);
        Globals.MessageCenter.on(MessageType.SCENE_UPDATE_PLAYER, this.handleUpdatePlayer, this);
        Globals.MessageCenter.on(MessageType.SCENE_REMOVE_PLAYER, this.handleRemovePlayer, this);
        Globals.MessageCenter.on(MessageType.SHOW_CHAT_BUBBLE, this.handleShowChatBubble, this);

        Globals.MessageCenter.on(MessageType.SCENE_CHANGE_TO, this.changeSceneToHandle, this);
    }

    public unRegisterSceneListenerHandler(): void {
        Globals.MessageCenter.cancel(MessageType.SCENE_MOVE_TO, this.moveToHandle, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_MOVE_STOP, this.moveStopHandle, this);
        Globals.MessageCenter.cancel(MessageType.CHANGE_ELEMENT_ANIMATION, this.changeElementHandle, this);

        Globals.MessageCenter.cancel(MessageType.SCENE_ADD_TERRAIN, this.handleAddTerrain, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_ADD_ELEMENT, this.handleAddElement, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_REMOVE_ELEMENT, this.handleRemoveElement, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_ADD_PLAYER, this.handleAddPlayer, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_UPDATE_PLAYER, this.handleUpdatePlayer, this);
        Globals.MessageCenter.cancel(MessageType.SCENE_REMOVE_PLAYER, this.handleRemovePlayer, this);
        Globals.MessageCenter.cancel(MessageType.SHOW_CHAT_BUBBLE, this.handleShowChatBubble, this);

        Globals.MessageCenter.cancel(MessageType.SCENE_CHANGE_TO, this.changeSceneToHandle, this);
    }

    protected get camera(): Phaser.Camera {
        return Globals.game.camera;
    }

    /**
     * 监听添加地块
     * @param value
     */
    protected handleAddTerrain(value: op_client.ITerrain[]): void {
        // todo:分批的
    }

    /**
     * 监听添加地块完成
     * @param value
     */
    protected handleAddTerrainEnd(): void {
        let value = Globals.DataCenter.SceneData.mapInfo.terrainConfig;
        value.sort(Globals.Scene45Util.sortDataFunc);
        let len = value.length;
        let terrain: TerrainInfo;
        for (let i = 0; i < len; i++) {
            terrain = value[i];
            this.addTerrain(terrain);
        }
        // this.camera.follow(this.view.currentSelfPlayer.display);
    }

    /**
     * 监听添加玩家
     * @param value
     */
    protected handleAddPlayer(value: op_client.IActor): void {
      this.view.addSceneElement(Const.SceneElementType.ROLE, value.uuid, value);
    }

    /**
     * 监听更新玩家
     * @param value
     */
    protected handleUpdatePlayer(value: op_client.IActor): void {
        let player: BasicSceneEntity = this.view.getSceneElement(value.uuid);
        if (player) {
            player.updateByData(value);
        }
    }

    /**
     * 监听移除玩家
     * @param value
     */
    protected handleRemovePlayer(uuid: number): void {
        this.view.deleteSceneElement(uuid);
    }

    /**
     * 监听添加物件
     * @param value
     */
    protected handleAddElement(value: op_client.IElement[]): void {
        let element: ElementInfo;
        let len: number = value.length;
        for (let i = 0; i < len; i++) {
            element = new ElementInfo();
            element.setInfo(value[i]);
            this.addElement(element);
        }
    }

    /**
     * 监听删除物件
     * @param value
     */
    protected handleRemoveElement(value: number): void {
        this.removeElement(value);
    }

    /**
     * 添加物件
     * @element ElementInfo
     */
    protected addTerrain(value: TerrainInfo): void {
        this.view.addTerrainElement(value.uid, value);
    }

    /**
     * 添加物件
     * @element ElementInfo
     */
    protected addElement(value: ElementInfo): void {
      this.view.addSceneElement(Const.SceneElementType.ELEMENT, value.id, value);
    }

    /**
     * 删除物件
     * @elementId elementId
     */
    protected removeElement(elementId: number): void {
        this.view.deleteSceneElement(elementId);
    }

    protected handleShowChatBubble(chat: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_ONLY_BUBBLE): void {
        let entity: SceneEntity;
        if (chat.receiverid) {
            entity = <SceneEntity>this.view.getSceneElement(chat.receiverid);
            if (entity) {
                entity.addBubble(chat.context, chat.chatsetting);
            }
        }
    }

    protected changedToMapSceneCompleteHandler(): void {
        // clear the last one scene.
        if (this.view) {
            this.view.clearScene();
        }
        Globals.SceneManager.popupScene();

        let mapSceneInfo: SceneInfo = Globals.DataCenter.SceneData.mapInfo;

        Globals.Scene45Util.setting(mapSceneInfo.rows, mapSceneInfo.cols, mapSceneInfo.tileWidth, mapSceneInfo.tileHeight);

        Globals.game.world.setBounds(-GameConfig.GameWidth / 2, -GameConfig.GameHeight / 2, mapSceneInfo.mapTotalWidth + GameConfig.GameWidth, mapSceneInfo.mapTotalHeight + GameConfig.GameHeight);

        let currentCharacterInfo: PlayerInfo = Globals.DataCenter.PlayerData.mainPlayerInfo;

        // 初始化当前玩家其他信息



        this.camera.setPosition(currentCharacterInfo.x - GameConfig.GameWidth / 2, currentCharacterInfo.y - GameConfig.GameHeight / 2);

        Log.trace("[参数]", "mapW: " + mapSceneInfo.mapTotalWidth + "|mapH:" + mapSceneInfo.mapTotalHeight,
            "cameraX: " + this.camera.x + "|cameraY:" + this.camera.y + "|cameraW:" + this.camera.width + "|cameraH:" + this.camera.height,
            "gameW: " + GameConfig.GameWidth + "|gameH:" + GameConfig.GameHeight,
        );

        this.view.initializeScene(mapSceneInfo);

        this.view.addSceneElement(Const.SceneElementType.ROLE, currentCharacterInfo.uuid, currentCharacterInfo, true);

        // this.camera.follow(this.view.currentSelfPlayer.display);

        this.initializeTerrainItems(mapSceneInfo.terrainConfig);
        this.initializeElementItems(mapSceneInfo.elementConfig);

        // 播放场景音效
        // Globals.SoundManager.playBgSound(1);

        Globals.SceneManager.pushScene(this.view);
        Globals.MessageCenter.emit(MessageType.SCENE_INITIALIZED);

        this.sendSceneReady();
    }

    private sendSceneReady(): void {
        let pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED);
        Globals.SocketManager.send(pkt);

        pkt = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE);
        let content: OP_CLIENT_REQ_VIRTUAL_WORLD_RESET_CAMERA_SIZE = pkt.content;
        content.width = GameConfig.GameWidth;
        content.height = GameConfig.GameHeight;
        Globals.SocketManager.send(pkt);

        Log.trace("【场景已就绪】");
    }

    protected initializeTerrainItems(datas: Array<any>): void {
        let len: number = datas.length;
        let value: TerrainInfo;
        for (let i = 0; i < len; i++) {
            value = datas[i];
            this.addTerrain(value);
        }
    }

    protected initializeElementItems(datas: Array<any>): void {
      let i = 0;
      let len: number = datas.length;
      let data: ElementInfo;
      for (; i < len; i++) {
        data = datas[i];
        this.view.addSceneElement(Const.SceneElementType.ELEMENT, data.id, data);
      }
    }

    private onDraw(graphics: MyGraphics, x: number, y: number) {
        graphics.haha();
        graphics.drawCircle(x, y, 4 );
    }

    private moveToHandle(moveData: op_client.IMoveData[]): void {
        let imove: op_client.IMoveData;
        let entity: BasicSceneEntity;
        for (let i = 0; i < moveData.length; i++) {
            imove = moveData[i];
            entity = this.view.getSceneElement(imove.moveObjectId);
            if (this.view.currentSelfPlayer.uid === imove.moveObjectId) {
                if (this.camera.target == null) {
                    this.camera.follow(this.view.currentSelfPlayer.display, Phaser.Camera.FOLLOW_LOCKON, 0.1, 0.1);
                }
            }
            if (entity) {
                imove.destinationPoint3f.x = (imove.destinationPoint3f.x >> 0);
                imove.destinationPoint3f.y = (imove.destinationPoint3f.y >> 0);
                // this.onDraw(this.move_graphics, imove.destinationPoint3f.x, imove.destinationPoint3f.y);

                // if (imove.direction.valueOf() === 4) {
                //     imove.destinationPoint3f.x = entity.ox + 20;
                //     imove.destinationPoint3f.y = entity.oy + 20;
                // } else {
                //     imove.destinationPoint3f.x = entity.ox - 20;
                //     imove.destinationPoint3f.y = entity.oy - 20;
                // }
                entity.moveToTarget(imove);
            }
            // Log.warn("[走路]： " + imove.timeSpan.toString(), imove.destinationPoint3f.x + "|" + imove.destinationPoint3f.y);
        }
    }

    protected moveStopHandle(posData: op_client.IMovePosition[]): void {
        let imove: op_client.IMovePosition;
        let entity: BasicSceneEntity;
        for (let i = 0; i < posData.length; i++) {
            imove = posData[i];
            entity = this.view.getSceneElement(imove.moveObjectId);
            // if (this.view.currentSelfPlayer && this.view.currentSelfPlayer.uid === imove.moveObjectId) {
            //     this.onDraw(this.stop_graphics, imove.destinationPoint3f.x, imove.destinationPoint3f.y);
            // }
            if (entity) {
                imove.destinationPoint3f.x = imove.destinationPoint3f.x;
                imove.destinationPoint3f.y = imove.destinationPoint3f.y;
                entity.moveStopTarget(imove);
            }
            // Log.warn("[停止]： " + Date.now(), imove.destinationPoint3f.x + "|" + imove.destinationPoint3f.y);
        }
    }

    private changeElementHandle(changeData: op_client.IChangeAnimation[]): void {
        let ichange: op_client.IChangeAnimation;
        let entity: any;
        for (let i = 0; i < changeData.length; i++) {
            ichange = changeData[i];
            entity = this.view.getSceneElement(ichange.id);
            if (entity) {
                entity.setAnimation(ichange.animationName);
                entity.setScaleX(ichange.scale);
            }
        }
    }

    private onLoginOk(): void {
        // App.SocketCenter.gameSocket.sendMsg([Core.MessageEnum.SEND_ENTER_GAME, 1]);
        this.onEnterScene();
    }

    private onEnterScene(): void {
        this.sceneLoader = new SceneLoader();

        this.flowManager = new FlowManager();
        this.flowManager.initialize();
        this.flowManager.setView(this.view);

        this.registerSceneListenerHandler();

        this.changeSceneToHandle();
    }

    private changeSceneToHandle(): void {
        // mapScene
        if (this.camera.target) {
            this.camera.unfollow();
        }
        this.sceneLoader.setLoadCallback(this.changedToMapSceneStartHandler, this.changedToMapSceneCompleteHandler, this);
        this.sceneLoader.changedToMap(Globals.DataCenter.SceneData.mapInfo);
    }

    private changedToMapSceneStartHandler(): void {
    }
}

class MyGraphics extends Phaser.Graphics {
    protected _color: number;
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
