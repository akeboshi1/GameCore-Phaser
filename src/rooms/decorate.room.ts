import { IRoomService } from "./room";
import { IRoomManager } from "./room.manager";
import { ViewblockService, ViewblockManager } from "./cameras/viewblock.manager";
import { CamerasManager, ICameraService } from "./cameras/cameras.manager";
import { ConnectionService } from "../net/connection.service";
import { LayerManager } from "./layer/layer.manager";
import { IPosition45Obj, Position45 } from "../utils/position45";
import { TerrainManager } from "./terrain/terrain.manager";
import { WorldService } from "../game/world.service";
import { IElement } from "./element/element";
import { ElementDisplay } from "./display/element.display";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";
import { Pos } from "../utils/pos";
import { PlayerManager } from "./player/player.manager";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { LoadingScene } from "../scenes/loading";
import { PlayScene } from "../scenes/play";
import { Logger } from "../utils/log";
import { DisplayObject } from "./display/display.object";
import { TerrainDisplay } from "./display/terrain.display";
import { DecorateElementManager } from "./element/decorate.element.manager";
import { MessageType } from "../const/MessageType";
import { Sprite, ISprite } from "./element/sprite";
import { DecorateTerrainManager } from "./terrain/decorate.terrain.manager";
import { SpawnPoint } from "./decorate/spawn.point";
import { SelectorElement } from "./decorate/selector.element";
import { IBlockObject } from "./cameras/block.object";

export interface DecorateRoomService extends IRoomService {
    readonly miniSize: IPosition45Obj;
    readonly selectedSprite: IElement | undefined;

    transformToMini45(p: Pos): Pos;

    transformToMini90(p: Pos): Pos;

    canPut(pos: Pos, collisionArea: number[][], origin: Phaser.Geom.Point): boolean;
}

export class DecorateRoom extends PacketHandler implements DecorateRoomService {
    readonly blocks: ViewblockService;
    // TODO clock sync
    clockSyncComplete: boolean = true;
    readonly playerManager: PlayerManager;
    readonly world: WorldService;
    private mID: number;
    private mBlocks: ViewblockManager;
    private mSize: IPosition45Obj;
    private mMiniSize: IPosition45Obj;
    private mTerrainManager: DecorateTerrainManager;
    private mElementManager: DecorateElementManager;
    private mLayerManager: LayerManager;
    private mCameraService: ICameraService;
    private mScene: Phaser.Scene | undefined;
    private mSelectorElement: SelectorElement;
    private mMap: number[][];
    private mScaleRatio: number;
    private cameraPos: Pos;

    constructor(manager: IRoomManager) {
        super();
        this.world = manager.world;
        this.mScaleRatio = this.world.scaleRatio;
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_SELECTED_SPRITE, this.onSelectSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_SPAWN_POINT, this.onShowSpawnPointHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ADD_SPRITE_BY_TYPE, this.onAddSpriteHandler);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ADD_SINGLE_SPRITE_BY_TYPE, this.onAddSingleSpriteHandler);
        }
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

        this.mMap = new Array(rows);
        for (let i = 0; i < rows; i++) {
            this.mMap[i] = new Array(cols).fill(0);
        }
        this.mCameraService = new CamerasManager(this);

        // if (!this.world.game.scene.getScene(LoadingScene.name))
        //     this.world.game.scene.add(LoadingScene.name, LoadingScene, false);
        // this.world.game.scene.start(LoadingScene.name, {
        //     world: this.world,
        //     room: this
        // });
        this.world.showLoading().then(() => {
            this.completeLoad();
        });
    }

    addBlockObject(object: IBlockObject) {
        if (this.mBlocks) {
            this.mBlocks.add(object);
        }
    }

    addMouseListen() {
    }

    addToGround(element: ElementDisplay | ElementDisplay[]) {
        this.mLayerManager.addToGround(element);
    }

    addToSceneUI(element: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]) {
        this.mLayerManager.addToSceneToUI(element);
    }

    addToSurface(element: ElementDisplay | ElementDisplay[]) {
        this.mLayerManager.addToSurface(element);
    }

    addToUI(element: Phaser.GameObjects.Container | Phaser.GameObjects.Container[]) {
    }

    completeLoad() {
        this.world.game.scene.add(PlayScene.name, PlayScene, true, {
            room: this
        });
    }

    destroy() {
        if (this.mTerrainManager) this.mTerrainManager.destroy();
        if (this.mElementManager) this.mElementManager.destroy();
        if (this.mLayerManager) this.mLayerManager.destroy();
        if (this.mBlocks) this.mBlocks.destroy();
        this.removePointerMoveHandler();
        this.world.game.scene.remove(PlayScene.name);
        this.world.emitter.off(MessageType.TURN_ELEMENT, this.onTurnElementHandler, this);
        this.world.emitter.off(MessageType.RECYCLE_ELEMENT, this.onRecycleHandler, this);
        this.world.emitter.off(MessageType.PUT_ELEMENT, this.onPutElement, this);
        this.world.emitter.off(MessageType.CANCEL_PUT, this.onCancelPutHandler, this);
        if (!this.mScene) return;
        this.mScene.input.off("pointerup", this.onPointerUpHandler, this);
        this.mScene.input.off("pointerdown", this.onPointerDownHandler, this);
        this.mScene.input.off("gameobjectdown", this.onGameobjectUpHandler, this);
    }

    now(): number {
        return 0;
    }

    pause(): void {
        if (this.mScene) {
            this.mScene.scene.pause();
        }
    }

    removeBlockObject(object: IBlockObject) {
        if (this.mBlocks) {
            this.mBlocks.remove(object);
        }
    }

    requestActorMove(d: number, key: number[]) {
    }

    resume(name: string): void {
        if (this.mScene) {
            this.mScene.scene.resume(name);
        }
    }

    startLoad() {
    }

    startPlay() {
        if (this.mLayerManager) {
            this.mLayerManager.destroy();
        }
        this.mScene = this.world.game.scene.getScene(PlayScene.name);
        this.mLayerManager = new LayerManager(this);
        // this.mLayerManager.drawGrid(this);
        this.mTerrainManager = new DecorateTerrainManager(this);
        this.mElementManager = new DecorateElementManager(this);
        this.mBlocks = new ViewblockManager(this.mCameraService);
        this.mBlocks.int(this.mSize);
        this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
        this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.mScene.input.on("gameobjectdown", this.onGameobjectUpHandler, this);
        // const mainCameras = this.mScene.cameras.main;
        const camera = this.scene.cameras.main;
        this.mCameraService.camera = camera;
        const zoom = Math.ceil(window.devicePixelRatio);
        this.mCameraService.setBounds(-camera.width >> 1, -camera.height >> 1, this.mSize.sceneWidth * zoom + camera.width, this.mSize.sceneHeight * zoom + camera.height);
        if (this.cameraPos) {
            this.mCameraService.scrollTargetPoint(this.cameraPos.x, this.cameraPos.y);
            this.mCameraService.syncCameraScroll();
        }
        this.world.changeRoom(this);
        const loadingScene: LoadingScene = this.world.game.scene.getScene(LoadingScene.name) as LoadingScene;
        if (loadingScene) loadingScene.sleep();

        this.connection.send(new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_SCENE_CREATED));
        // this.mCameraService.centerCameas();

        if (this.world.uiManager) {
            this.world.uiManager.showDecorateUI();
        }

        this.world.emitter.on(MessageType.TURN_ELEMENT, this.onTurnElementHandler, this);
        this.world.emitter.on(MessageType.RECYCLE_ELEMENT, this.onRecycleHandler, this);
        this.world.emitter.on(MessageType.PUT_ELEMENT, this.onPutElement, this);
        this.world.emitter.on(MessageType.CANCEL_PUT, this.onCancelPutHandler, this);
    }

    transformTo45(p: Pos): Pos {
        if (!this.mSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mSize);
    }

    transformTo90(p: Pos): Pos {
        if (!this.mSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mSize);
    }

    transformToMini90(p: Pos): undefined | Pos {
        if (!this.mMiniSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo90(p, this.mMiniSize);
    }

    transformToMini45(p: Pos): undefined | Pos {
        if (!this.mMiniSize) {
            Logger.getInstance().error("position object is undefined");
            return;
        }
        return Position45.transformTo45(p, this.mMiniSize);
    }

    update(time: number, delta: number): void {
        if (this.mLayerManager) {
            this.mLayerManager.update(time, delta);
        }
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
        this.layerManager.resize(width, height);
        this.mCameraService.resize(width, height);
    }

    transitionGrid(x: number, y: number,) {
        const source = new Pos(x, y);
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
        this.cameraPos = new Pos(x, y);
    }

    /**
     * 边界检查
     * @param pos 45度坐标，
     * @param source 没有超出边界并不贴边就返回原始坐标
     */
    checkBound(pos: Pos, source?: Pos) {
        const bound = new Pos(pos.x, pos.y);
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

    public canPut(pos: Pos, collisionArea: number[][], origin: Phaser.Geom.Point) {
        if (!collisionArea || !origin) {
            return;
        }
        const pos45 = this.transformToMini45(pos);
        if (pos45.x < 0 || pos45.y < 0 || pos45.x > this.miniSize.rows || pos45.y > this.miniSize.cols) {
            return false;
        }
        const eles = [this.mElementManager, this.mTerrainManager];
        for (const manager of eles) {
            if (manager.canPut(pos45, collisionArea, origin) === false) {
                return false;
            }
        }
        return true;
        // let row = 0;
        // let col = 0;
        // const map = this.terrainManager.map;
        // for (let i = 0; i < collisionArea.length; i++) {
        //     row = i + pos45.y - origin.y;
        //     if (row >= map.length) {
        //         return false;
        //     }
        //     for (let j = 0; j < collisionArea[i].length; j++) {
        //         col = j + pos45.x - origin.x;
        //         if (col >= map[i].length || map[row][col] === 1) {
        //             return false;
        //         }
        //     }
        // }
        // return true;
    }

    public setMap(cols: number, rows: number, type: number) {
        if (rows < 0 || cols < 0 || this.mMap.length < rows || this.mMap[0].length < cols) {
            return;
        }
        this.mMap[cols][rows] = type;
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

    private addPointerMoveHandler() {
        if (!this.mScene) return;
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("gameout", this.onGameOutHandler, this);
    }

    private removePointerMoveHandler() {
        if (!this.mScene) return;
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.off("gameout", this.onGameOutHandler, this);
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
        const com = gameobject.parentContainer.parentContainer || gameobject.parentContainer;
        if (!com) {
            return;
        }
        if (!(com instanceof DisplayObject)) {
            return;
        }
        if (com instanceof TerrainDisplay) {
            return;
        }
        this.selectedElement(com.element);
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
        this.cameraService.offsetScroll(pointer.prevPosition.x - pointer.position.x, pointer.prevPosition.y - pointer.position.y);
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

    private addElement(sprite: ISprite, addMap?: boolean) {
        const nodeType = sprite.nodeType;
        if (nodeType === op_def.NodeType.ElementNodeType || nodeType === op_def.NodeType.SpawnPointType) {
            this.mElementManager.add([sprite], addMap);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            this.mTerrainManager.add([sprite]);
        }
    }

    private selectedElement(element: IElement, isClone: boolean = true) {
        if (!element) {
            return;
        }
        if (!this.mSelectorElement) {
            this.mSelectorElement = new SelectorElement(element);
            if (isClone) {
                this.mSelectorElement.clone();
                this.elementManager.removeMap(element.model);
            }
            this.mSelectorElement.update();
        } else {
            if (this.mSelectorElement.element === element) {
                this.mSelectorElement.selecting = true;
            } else {
                this.onPutElement(null);
                // this.cancelSelector();
                this.selectedElement(element, isClone);
            }
        }
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
                this.mElementManager.addMap(sprite);
            }
        }
    }

    private onTurnElementHandler(display: DisplayObject) {
        if (!this.mSelectorElement) {
            return;
        }

        this.mSelectorElement.turnElement();
    }

    private onRecycleHandler(display: DisplayObject) {
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
        this.world.connection.send(packet);
        this.mSelectorElement.destroy();
        this.mSelectorElement = undefined;
    }

    private onPutElement(display: DisplayObject) {
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

    private sendSpawnPoint(pos: Pos) {
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

    private onSelectSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_SELECTED_SPRITE = packet.content;
        const camera = this.cameraService.camera;
        const sprite = new Sprite(content.sprite, content.nodeType);
        sprite.setPosition((camera.scrollX + camera.width / 2) / this.world.scaleRatio, (camera.scrollY + camera.height / 2) / this.world.scaleRatio);
        this.addElement(sprite, false);
        const element = this.mElementManager.get(content.sprite.id);
        if (element) this.selectedElement(element, false);
    }

    private onShowSpawnPointHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_GET_SPAWN_POINT = packet.content;
        const spawnPoint = new SpawnPoint();
        const pos = content.spawnPoint;
        spawnPoint.setPosition(pos.x, pos.y);
        this.addElement(spawnPoint, false);

        this.selectedElement(this.mElementManager.get(spawnPoint.id), false);
        // this.mSelectedElement.setSprite(spawnPoint);
        this.mCameraService.scrollTargetPoint(pos.x, pos.y);
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
                if (ele) {
                    this.cancelSelector();
                    this.selectedElement(ele);
                    if (this.mSelectorElement) this.mSelectorElement.selecting = false;
                }
            }
        }
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

    get layerManager(): LayerManager {
        return this.mLayerManager;
    }

    get cameraService(): ICameraService {
        return this.mCameraService;
    }

    get scene(): Phaser.Scene | undefined {
        return this.mScene;
    }

    get connection(): ConnectionService {
        return this.world.connection;
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
}
