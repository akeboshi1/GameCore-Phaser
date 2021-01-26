import { op_client, op_def, op_virtual_world } from "pixelpai_proto";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { IPosition45Obj, Position45, IPos, LogicPos, Logger } from "utils";
import { Game } from "../../game";
import { IBlockObject } from "../block/iblock.object";
import { IRoomManager } from "../room.manager";
import { ConnectionService } from "../../../../lib/net/connection.service";
import { CamerasManager, ICameraService } from "../camera/cameras.manager";
import { ViewblockManager } from "../viewblock/viewblock.manager";
import { PlayerManager } from "../player/player.manager";
import { IElement } from "../element/element";
import { TerrainManager } from "../terrain/terrain.manager";
import { SkyBoxManager } from "../sky.box/sky.box.manager";
import { IScenery, LoadState, ModuleName, SceneName } from "structure";
import { IRoomService } from "./room";
import { ISprite } from "structure";
import { IViewBlockManager } from "../viewblock/iviewblock.manager";
import { DecorateTerrainManager } from "../terrain/decorate.terrain.manager";
import { DecorateElementManager } from "../element/decorate.element.manager";
import { SpawnPoint } from "../display/spawn.point";
import { Sprite } from "baseModel";

export interface DecorateRoomService extends IRoomService {
    readonly miniSize: IPosition45Obj;
    // readonly selectedSprite: IElement | undefined;

    canPut(pos: IPos, collisionArea: number[][], origin: IPos): boolean;
}

export class DecorateRoom extends PacketHandler implements DecorateRoomService {
    readonly blocks: IViewBlockManager;
    // TODO clock sync
    clockSyncComplete: boolean = true;
    readonly playerManager: PlayerManager;
    readonly game: Game;
    private mID: number;
    private mBlocks: ViewblockManager;
    private mSize: IPosition45Obj;
    private mMiniSize: IPosition45Obj;
    private mTerrainManager: DecorateTerrainManager;
    private mElementManager: DecorateElementManager;
    private mCameraService: ICameraService;
    private mSelectorElement;
    private mSkyboxManager: SkyBoxManager;
    private mMap: boolean[][];
    private mScaleRatio: number;
    private cameraPos: LogicPos;

    // ====
    private isSleep: boolean = false;
    // private mLoadState: ElementLoadState[];

    constructor(manager: IRoomManager) {
        super();
        this.game = manager.game;
        this.mScaleRatio = this.game.scaleRatio;
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_SELECTED_SPRITE, this.onSelectSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_SPAWN_POINT, this.onShowSpawnPointHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ADD_SPRITE_BY_TYPE, this.onAddSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ADD_SINGLE_SPRITE_BY_TYPE, this.onAddSingleSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.onSpriteEndHandler);
        }
    }
    onManagerCreated(key: string) {

    }
    onManagerReady(key: string) {

    }

    enter(room: op_client.IScene): void {
        // this.mID = room.id;
        this.mID = room.id;
        let { rows, cols, tileWidth, tileHeight } = room;
        this.mSize = {
            cols: room.cols,
            rows: room.rows,
            tileHeight: room.tileHeight,
            tileWidth: room.tileWidth,
            sceneWidth: (room.rows + room.cols) * (room.tileWidth / 2),
            sceneHeight: (room.rows + room.cols) * (room.tileHeight / 2)
        };

        rows *= 2;
        cols *= 2;
        tileWidth /= 2;
        tileHeight /= 2;
        this.mMiniSize = {
            cols,
            rows,
            tileHeight,
            tileWidth,
            sceneWidth: (rows + cols) * (tileWidth / 2),
            sceneHeight: (rows + cols) * (tileHeight / 2),
        };

        this.mMap = new Array(this.mMiniSize.rows);
        for (let i = 0; i < this.mMiniSize.rows; i++) {
            this.mMap[i] = new Array(this.mMiniSize.cols).fill(false);
        }

        this.game.showLoading({
            "dpr": this.mScaleRatio,
            "sceneName": "DecorateScene",
            "state": LoadState.CREATESCENE
        });
    }

    addBlockObject(object: IBlockObject): Promise<any> {
        if (this.mBlocks) {
            this.mBlocks.add(object);
        }
        return Promise.resolve();
    }

    addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]) {
    }

    completeLoad() {
    }

    initUI() {
        if (this.game.uiManager) this.game.uiManager.showDecorateUI();
    }

    destroy() {
        this.isSleep = false;
        this.connection.removePacketListener(this);
        if (this.mTerrainManager) this.mTerrainManager.destroy();
        if (this.mElementManager) this.mElementManager.destroy();
        if (this.mBlocks) this.mBlocks.destroy();
        if (this.mSkyboxManager) this.mSkyboxManager.destroy();
        this.game.renderPeer.clearRoom();
        this.game.uiManager.recover();
        this.removePointerMoveHandler();
        this.game.renderPeer.removeScene(SceneName.DECORATE_SCENE);
        // this.game.game.scene.remove(PlayScene.name);
        // this.game.emitter.off(MessageType.TURN_ELEMENT, this.onTurnElementHandler, this);
        // this.game.emitter.off(MessageType.RECYCLE_ELEMENT, this.onRecycleHandler, this);
        // this.game.emitter.off(MessageType.PUT_ELEMENT, this.onPutElement, this);
        // this.game.emitter.off(MessageType.CANCEL_PUT, this.onCancelPutHandler, this);
        // if (!this.mScene) return;
        // this.mScene.input.off("pointerup", this.onPointerUpHandler, this);
        // this.mScene.input.off("pointerdown", this.onPointerDownHandler, this);
        // this.mScene.input.off("gameobjectdown", this.onGameobjectUpHandler, this);
    }

    now(): number {
        return 0;
    }

    pause(): void {
        // if (this.mScene) {
        //     this.mScene.scene.pause();
        // }
    }

    removeBlockObject(object: IBlockObject) {
        if (this.mBlocks) {
            this.mBlocks.remove(object);
        }
    }

    requestActorMove(d: number, key: number[]) {
    }

    resume(name: string): void {
    }

    startPlay() {
        this.mCameraService = new CamerasManager(this.game, this);
        // this.mLayerManager = new LayerManager(this);
        // this.mLayerManager.drawGrid(this);
        this.mTerrainManager = new DecorateTerrainManager(this);
        this.mElementManager = new DecorateElementManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        this.mSkyboxManager = new SkyBoxManager(this);
        this.mBlocks.int(this.mSize);
        // this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
        // this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
        // this.mScene.input.on("gameobjectdown", this.onGameobjectUpHandler, this);
        // const mainCameras = this.mScene.cameras.main;
        // const camera = this.scene.cameras.main;
        // this.mCameraService.camera = camera;
        const padding = 199 * this.mScaleRatio;
        const offsetX = this.mSize.rows * (this.mSize.tileWidth / 2);
        this.game.renderPeer.roomstartPlay();
        this.game.renderPeer.setCamerasBounds(-padding - offsetX * this.mScaleRatio, -padding, this.mSize.sceneWidth * this.mScaleRatio + padding * 2, this.mSize.sceneHeight * this.mScaleRatio + padding * 2);
        this.game.renderPeer.setCamerasScroll(0, this.mSize.sceneHeight * 0.5);
        if (this.cameraPos) {
            // this.mCameraService.scrollTargetPoint(this.cameraPos.x, this.cameraPos.y);
            this.mCameraService.syncCameraScroll();
        }
        // this.game.changeRoom(this);

        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        // this.mCameraService.centerCameas();

        // this.world.emitter.on(MessageType.TURN_ELEMENT, this.onTurnElementHandler, this);
        // this.world.emitter.on(MessageType.RECYCLE_ELEMENT, this.onRecycleHandler, this);
        // this.world.emitter.on(MessageType.PUT_ELEMENT, this.onPutElement, this);
        // this.world.emitter.on(MessageType.CANCEL_PUT, this.onCancelPutHandler, this);

        // this.mLoadState = [];
        // this.scene.load.on(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);

        this.initSkyBox();
    }

    transformTo45(p: IPos): IPos {
        if (!this.mSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    transformTo90(p: IPos): IPos {
        if (!this.mSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    transformToMini90(p: IPos): undefined | IPos {
        if (!this.mMiniSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mMiniSize);
    }

    transformToMini45(p: IPos): undefined | IPos {
        if (!this.mMiniSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mMiniSize);
    }

    update(time: number, delta: number): void {
        if (this.mSelectorElement) {
            this.mSelectorElement.update(time, delta);
        }
        if (this.mBlocks) {
            this.mBlocks.update(time, delta);
        }
    }

    updateBlockObject() {
    }

    resize(width: number, height: number) {
        // this.layerManager.resize(width, height);
        // this.mCameraService.resize(width, height);
    }

    transitionGrid(x: number, y: number,) {
        const source = new LogicPos(x, y);
        const pos = this.transformToMini45(source);
        return this.checkBound(pos);
    }

    addElements(sprites: ISprite[], nodeType) {
        if (nodeType === op_def.NodeType.ElementNodeType) {
            this.mElementManager.add(sprites);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            this.mTerrainManager.add(sprites);
        }
    }

    setEnterPos(x: number, y: number) {
        this.cameraPos = new LogicPos(x, y);
    }

    /**
     * 边界检查
     * @param pos 45度坐标，
     * @param source 没有超出边界并不贴边就返回原始坐标
     */
    checkBound(pos: IPos, source?: IPos) {
        const bound = new LogicPos(pos.x, pos.y);
        const size = this.mMiniSize;
        if (pos.x < 0) {
            bound.x = 0;
        } else if (pos.x > size.cols) {
            bound.x = size.cols;
        }

        if (pos.y < 0) {
            bound.y = 0;
        } else if (pos.y > size.rows) {
            bound.y = size.rows;
        }
        if (bound.equal(pos) && source) {
            return source;
        }
        return this.transformToMini90(bound);
    }

    public canPut(pos: IPos, collisionArea: number[][], origin: IPos) {
        if (!collisionArea || !origin) {
            return;
        }
        const pos45 = this.transformToMini45(pos);
        if (pos45.x < 0 || pos45.y < 0 || pos45.y > this.mMiniSize.rows || pos45.x > this.mMiniSize.cols) {
            return false;
        }
        // return true;
        let row = 0;
        let col = 0;
        const map = this.mMap;
        for (let i = 0; i < collisionArea.length; i++) {
            row = i + pos45.y - origin.y;
            if (row < 0 || row >= map.length) {
                return false;
            }
            for (let j = 0; j < collisionArea[i].length; j++) {
                col = j + pos45.x - origin.x;
                if (col < 0 || col >= map[i].length || map[row][col] === false) {
                    return false;
                }
            }
        }
        return true;
    }

    public setElementWalkable(x: number, y: number, val: boolean) {
        this.mMap[x][y] = val;
    }

    public setTerrainWalkable(x: number, y: number, val: boolean) {
        const map = this.mElementManager.map;
        const value = map[x][y];
        if (value === 0) {
            this.mMap[x][y] = false;
            this.game.physicalPeer.setWalkableAt(y, x, false);
            // this.mAstar.setWalkableAt(y, x, false);
        } else {
            this.mMap[x][y] = val;
            this.game.physicalPeer.setWalkableAt(y, x, val);
            // this.mAstar.setWalkableAt(y, x, val);
        }
    }

    public getElement(id: number): IElement {
        let ele = null;
        if (this.mElementManager) {
            ele = this.elementManager.get(id);
        }
        if (!ele && this.mTerrainManager) {
            ele = this.mTerrainManager.get(id);
        }
        return ele;
    }

    public async findPath(start: IPos, targetPosList: IPos[], toReverse: boolean): Promise<IPos[]> {
        return [];
    }

    protected initSkyBox() {
        const scenerys = this.game.elementStorage.getScenerys();
        if (scenerys) {
            for (const scenery of scenerys) {
                this.addSkyBox({
                    id: scenery.id,
                    uris: scenery.uris,
                    depth: scenery.depth,
                    width: scenery.width,
                    height: scenery.height,
                    speed: scenery.speed,
                    offset: scenery.offset,
                    fit: scenery.fit
                });
            }
        }
    }

    protected addSkyBox(scenery: IScenery) {
        this.mSkyboxManager.add(scenery);
    }

    private addPointerMoveHandler() {
        // if (!this.mScene) return;
        // this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        // this.mScene.input.on("gameout", this.onGameOutHandler, this);
    }

    private removePointerMoveHandler() {
        // if (!this.mScene) return;
        // this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        // this.mScene.input.off("gameout", this.onGameOutHandler, this);
    }

    private onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.removePointerMoveHandler();
        if (this.mSelectorElement) {
            this.mSelectorElement.selecting = false;
        }
    }

    private onPointerDownHandler() {
        this.addPointerMoveHandler();
    }

    private onGameobjectUpHandler(pointer, gameobject) {
        // this.addPointerMoveHandler();
        // TODO
        // const com = gameobject.parentContainer.parentContainer || gameobject.parentContainer;
        // if (!com) {
        //     return;
        // }
        // if (!(com instanceof BaseDisplay)) {
        //     return;
        // }
        // if (com instanceof TerrainDisplay) {
        //     return;
        // }
        // this.selectedElement(com.element);
    }

    private onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (!this.mSelectorElement || (this.mSelectorElement && this.mSelectorElement.selecting === false)) {
            this.moveCamera(pointer);
            return;
        }
        if (pointer.downX === pointer.x && pointer.downY === pointer.y) {
            return;
        }
        // if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
        this.moveElement(pointer);
    }

    private onGameOutHandler() {
        this.removePointerMoveHandler();
    }

    private moveCamera(pointer: Phaser.Input.Pointer) {
        // this.cameraService.offsetScroll(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
    }

    private moveElement(pointer: Phaser.Input.Pointer) {
        const pos = this.transitionGrid(pointer.worldX / this.mScaleRatio, pointer.worldY / this.mScaleRatio);
        if (this.mSelectorElement) {
            this.mSelectorElement.setDisplayPos(pos);
        }
        // this.mSelectedElement.setDisplayPos(pos.x, pos.y);
    }

    private removeElement(id: number, nodeType: op_def.NodeType) {
        if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
            this.elementManager.remove(id);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            this.elementManager.remove(id);
        }
    }

    private addElement(sprite: ISprite) {
        const nodeType = sprite.nodeType;
        if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
            this.mElementManager.add([sprite]);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            this.mTerrainManager.add([sprite]);
        }
    }

    private selectedElement(element: number, isClone: boolean = true) {
        const med: any = this.game.uiManager.getMed(ModuleName.PICADECORATE_NAME);
        med.setElement(element, isClone);
        // if (!element) {
        //     return;
        // }
        // if (!this.mSelectorElement) {
        //     this.mSelectorElement = new SelectorElement(element);
        //     if (isClone) {
        //         this.mSelectorElement.clone();
        //         this.elementManager.removeFromMap(element.model);
        //     }
        //     this.mSelectorElement.update();
        // } else {
        //     if (this.mSelectorElement.element === element) {
        //         this.mSelectorElement.selecting = true;
        //     } else {
        //         this.onPutElement(null);
        //         // this.cancelSelector();
        //         this.selectedElement(element, isClone);
        //     }
        // }
    }

    private cancelSelector() {
        if (this.mSelectorElement) {
            let sprite = null;
            if (this.mSelectorElement.root) {
                sprite = this.mSelectorElement.element.model;
            }
            this.mSelectorElement.destroy();
            this.mSelectorElement = undefined;
            if (sprite) {
                // this.game.physicalPeer.addToMap(sprite.id);
                this.mElementManager.addToMap(sprite);
            }
        }
    }

    private onTurnElementHandler(display) {
        if (!this.mSelectorElement) {
            return;
        }

        this.mSelectorElement.turnElement();
    }

    private onRecycleHandler(display) {
        if (!this.mSelectorElement) {
            return;
        }
        const element = this.mSelectorElement.element;
        const sprite = element.model;
        if (!sprite) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.game.connection.send(packet);
        this.mSelectorElement.destroy();
        this.mSelectorElement = undefined;
    }

    private onPutElement(display) {
        this.removePointerMoveHandler();
        if (!this.mSelectorElement) {
            return;
        }
        const element = this.mSelectorElement.element;
        if (!element) {
            return;
        }
        const sprite = element.model;
        if (!sprite) {
            return;
        }
        if (this.canPut(sprite.pos, sprite.currentCollisionArea, sprite.currentCollisionPoint)) {
            if (this.mSelectorElement.root) {
                this.sendUpdateSprite(sprite);
            } else {
                if (sprite.nodeType === op_def.NodeType.SpawnPointType) {
                    this.sendSpawnPoint(sprite.pos);
                    this.removeElement(sprite.id, sprite.nodeType);
                } else {
                    this.sendAddSprite(sprite);
                }
            }
            this.cancelSelector();
        } else {
            this.onCancelPutHandler(element);
        }
    }

    private onCancelPutHandler(element?: IElement) {
        this.removePointerMoveHandler();
        if (!this.mSelectorElement) {
            return;
        }
        if (!element) {
            element = this.mElementManager.get(this.mSelectorElement.element.id);
        }
        if (!element) {
            return;
        }
        const root = this.mSelectorElement.root;
        if (root) {
            this.mSelectorElement.recover();
        } else {
            this.removeElement(element.id, element.model.nodeType);
        }
        this.cancelSelector();
    }

    private sendAddSprite(sprite: ISprite) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.connection.send(packet);
    }

    private sendUpdateSprite(sprite: ISprite) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_UPDATE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_UPDATE_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.connection.send(packet);
    }

    private sendSpawnPoint(pos: LogicPos) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SET_SPAWN_POINT);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_SET_SPAWN_POINT = packet.content;
        const pos3f = op_def.PBPoint3f.create();
        pos3f.x = pos.x;
        pos3f.y = pos.y;
        content.spawnPoint = pos3f;
        this.connection.send(packet);
    }

    private sendPosition(sprite: ISprite) {
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_CHANGE_SPRITE_POSITION);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_CHANGE_SPRITE_POSITION = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.connection.send(packet);
    }

    private async onSelectSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_SELECTED_SPRITE = packet.content;
        // const camera = this.cameraService.camera;
        const sprite = new Sprite(content.sprite, content.nodeType);

        const camera = await this.game.renderPeer.getWorldView();
        sprite.setPosition((camera.x + camera.width * 0.5) / this.game.scaleRatio, (camera.y + camera.height * 0.5) / this.game.scaleRatio);
        this.addElement(sprite);
        // const element = this.mElementManager.get(content.sprite.id);
        this.selectedElement(sprite.id, false);
    }

    private onShowSpawnPointHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_SPAWN_POINT = packet.content;
        const spawnPoint = new SpawnPoint();
        const pos = content.spawnPoint;
        spawnPoint.setPosition(pos.x, pos.y);
        this.addElement(spawnPoint);

        this.selectedElement(spawnPoint.id, false);
        // this.mSelectedElement.setSprite(spawnPoint);
        // this.mCameraService.scrollTargetPoint(pos.x, pos.y);
    }

    private onAddSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ADD_SINGLE_SPRITE_BY_TYPE = packet.content;
        // if (this.mSelectedElement.root && content.id === this.mSelectedElement.root.id) {
        //     this.addElement(this.mSelectedElement.sprite);
        // }
        // this.mSelectedElement.remove();
        this.cancelSelector();
    }

    private onAddSingleSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ADD_SINGLE_SPRITE_BY_TYPE = packet.content;
        const addedSprites = content.addedSprites;
        if (addedSprites) {
            const sprites: ISprite[] = [];
            for (const sprite of addedSprites) {
                sprites.push(new Sprite(sprite, content.nodeType));
            }
            if (sprites.length > 0) {
                this.mElementManager.add(sprites);
                const ele = this.mElementManager.get(sprites[sprites.length - 1].id);
                this.selectedElement(sprites[sprites.length - 1].id);
                // if (ele) {
                //     this.cancelSelector();
                //     this.selectedElement(ele);
                //     if (this.mSelectorElement) this.mSelectorElement.selecting = false;
                // }
            }
        }
    }

    private onLoadCompleteHandler() {
        // if (this.mLoadState.indexOf(ElementLoadState.Display) === -1) {
        //     this.mLoadState.push(ElementLoadState.Display);
        // }
        // this.sleep();
    }

    private onSpriteEndHandler() {
        if (this.isSleep) return;
        this.isSleep = true;
        this.game.peer.render.hideLoading();
        // if (this.mLoadState.indexOf(ElementLoadState.Model) === -1) {
        //     this.mLoadState.push(ElementLoadState.Model);
        // }
        // this.sleep();
    }

    private sleep() {
        // if (this.mLoadState.indexOf(ElementLoadState.Complete) !== -1) {
        //     return;
        // }
        // if (this.mLoadState.indexOf(ElementLoadState.Model) === -1) {
        //     return;
        // }
        // if (this.scene.load.list.size !== 0) {
        //     return;
        // }
        // if (this.mLoadState.indexOf(ElementLoadState.Complete) === -1) {
        //     this.mLoadState.push(ElementLoadState.Complete);
        // }
        // this.scene.load.off(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
        // const loadingScene: LoadingScene = this.world.game.scene.getScene(LoadingScene.name) as LoadingScene;
        // if (loadingScene) loadingScene.sleep();
    }

    get id(): number {
        return this.mID;
    }

    get roomSize(): IPosition45Obj {
        return this.mSize;
    }

    get terrainManager(): TerrainManager {
        return this.mTerrainManager;
    }

    get elementManager(): DecorateElementManager {
        return this.mElementManager;
    }

    get cameraService(): ICameraService {
        return this.mCameraService;
    }

    get connection(): ConnectionService {
        return this.game.connection;
    }

    get miniSize(): IPosition45Obj {
        return this.mMiniSize;
    }

    get selectedSprite(): IElement | undefined {
        if (!this.mSelectorElement) {
            return;
        }
        return this.mSelectorElement.element;
    }

    get enableEdit(): boolean {
        return false;
    }

    get sceneType(): op_def.SceneTypeEnum {
        return op_def.SceneTypeEnum.EDIT_SCENE_TYPE;
    }

    get effectManager() {
        return undefined;
    }

    get matterWorld() {
        return undefined;
    }

    get isLoading() {
        return false;
    }
}
