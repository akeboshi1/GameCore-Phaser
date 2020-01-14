import { IRoomService } from "./room";
import { IRoomManager } from "./room.manager";
import {ViewblockService} from "./cameras/viewblock.manager";
import {CamerasManager, ICameraService} from "./cameras/cameras.manager";
import {ConnectionService} from "../net/connection.service";
import {ElementManager} from "./element/element.manager";
import {LayerManager} from "./layer/layer.manager";
import {IPosition45Obj, Position45} from "../utils/position45";
import {TerrainManager} from "./terrain/terrain.manager";
import { WorldService } from "../game/world.service";
import {IElement} from "./element/element";
import {ElementDisplay} from "./display/element.display";
import {op_client, op_virtual_world, op_def} from "pixelpai_proto";
import {Pos} from "../utils/pos";
import {PlayerManager} from "./player/player.manager";
import {PacketHandler, PBpacket} from "net-socket-packet";
import {SelectedElement} from "./decorate/selected.element";
import {LoadingScene} from "../scenes/loading";
import {PlayScene} from "../scenes/play";
import {Logger} from "../utils/log";
import { FramesDisplay } from "./display/frames.display";
import { DisplayObject } from "./display/display.object";
import { TerrainDisplay } from "./display/terrain.display";
import { DecorateElementManager } from "./element/decorate.element.manager";
import { MessageType } from "../const/MessageType";
import { Sprite, ISprite } from "./element/sprite";

export class DecorateRoom extends PacketHandler implements IRoomService {
    readonly blocks: ViewblockService;
    // TODO clock sync
    clockSyncComplete: boolean = true;
    readonly playerManager: PlayerManager;
    readonly world: WorldService;
    private mID: number;
    private mSize: IPosition45Obj;
    private mMiniSize: IPosition45Obj;
    private mTerrainManager: TerrainManager;
    private mElementManager: ElementManager;
    private mLayerManager: LayerManager;
    private mCameraService: ICameraService;
    private mScene: Phaser.Scene | undefined;
    private mSelectedElement: SelectedElement;
    private mMap: number[][];

    constructor(manager: IRoomManager) {
        super();
        this.world = manager.world;
        this.mCameraService = new CamerasManager(this);
        if (this.world) {
            const size = this.world.getSize();
            if (size) {
                this.mCameraService.resize(size.width, size.height);
            } else {
                throw new Error(`World::getSize undefined!`);
            }
        }
        if (this.connection) {
            this.connection.addPacketListener(this);
            this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_SELECTED_SPRITE, this.onSelectSpriteHandler);
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

        if (!this.world.game.scene.getScene(LoadingScene.name))
            this.world.game.scene.add(LoadingScene.name, LoadingScene, false);
        this.world.game.scene.start(LoadingScene.name, {
            world: this.world,
            room: this
        });
    }

    addBlockObject(object: IElement) {
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
    }

    now(): number {
        return 0;
    }

    pause(): void {
        if (this.mScene) {
            this.mScene.scene.pause();
        }
    }

    removeBlockObject(object: IElement) {
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
        this.mLayerManager.drawGrid(this);
        this.mTerrainManager = new TerrainManager(this);
        this.mElementManager = new DecorateElementManager(this);
        this.mScene.input.on("pointerup", this.onPointerUpHandler, this);
        this.mScene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.mScene.input.on("gameobjectdown", this.onGameobjectUpHandler, this);
        this.mCameraService.camera = this.scene.cameras.main;
        // const mainCameras = this.mScene.cameras.main;
        this.mCameraService.setBounds(-200, -200, this.mSize.sceneWidth + 400, this.mSize.sceneHeight + 400);
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
        if (this.mSelectedElement) {
            this.mSelectedElement.update(time, delta);
        }
    }

    updateBlockObject() {
    }

    resize(width: number, height: number) {
        this.layerManager.resize(width, height);
        this.mCameraService.resize(width, height);
    }

    transitionGrid(x: number, y: number, ) {
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

    public canPut(pos: Pos, area: number[][], originPoint: Phaser.Geom.Point) {
        if (!pos || !area || area.length <= 0 || area[0].length <= 0) {
            return true;
        }
        // const pos45 = this.transformToMini45(pos);
        for (let i = 0; i < area.length; i++) {
            for (let j = 0; j < area[i].length; j++) {
                if (this.mMap[pos.x + i - originPoint.x][pos.y + j - originPoint.y] === 1) {
                    return false;
                }
            }
        }
        return true;
    }

    public setMap(cols: number, rows: number, type: number) {
        if (rows < 0 || cols < 0 || this.mMap.length < rows || this.mMap[0].length < cols) {
            return;
        }
        this.mMap[cols][rows] = type;
    }

    private addPointerMoveHandler() {
        this.mScene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.on("gameout", this.onGameOutHandler, this);
    }

    private removePointerMoveHandler() {
        this.mScene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.mScene.input.off("gameout", this.onGameOutHandler, this);
    }

    private onPointerUpHandler() {
        this.removePointerMoveHandler();
        if (this.mSelectedElement) {
            this.mSelectedElement.selecting = false;
        }
    }

    private onPointerDownHandler() {
        this.addPointerMoveHandler();
    }

    private onGameobjectUpHandler(pointer, gameobject) {
        this.addPointerMoveHandler();
        const com = gameobject.parentContainer;
        if (!com) {
            return;
        }
        this.selectedElement(com);
    }

    private onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (!this.mSelectedElement) {
            return;
        }
        if (this.mSelectedElement.selecting === false) {
            return;
        }
        if (pointer.downX === pointer.x && pointer.downY === pointer.y) {
            return;
        }
        // if (pointer.downX !== pointer.upX && pointer.downY !== pointer.upY) {
        const pos = this.transitionGrid(pointer.worldX, pointer.worldY);
        this.mSelectedElement.setDisplayPos(pos.x, pos.y);
        // }
        if (pointer.x < 300) {
            if (pointer.prevPosition.x > pointer.x) this.mCameraService.camera.scrollX -= pointer.prevPosition.x - pointer.x;
        } else if (pointer.x > this.world.getSize().width - 300) {
            if (pointer.x > pointer.prevPosition.x) this.mCameraService.camera.scrollX += pointer.x - pointer.prevPosition.x;
        }

        if (pointer.y < 300) {
            if (pointer.prevPosition.y > pointer.y) this.mCameraService.camera.scrollY -= pointer.prevPosition.y - pointer.y;
        } else if (pointer.y > this.world.getSize().height - 300) {
            if (pointer.y > pointer.prevPosition.y) this.mCameraService.camera.scrollY += pointer.y - pointer.prevPosition.y;
        }
    }

    private onGameOutHandler() {
        this.removePointerMoveHandler();
    }

    private removeElement(id: number, nodeType: op_def.NodeType) {
        if (nodeType === op_def.NodeType.ElementNodeType) {
            this.elementManager.remove(id);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            this.elementManager.remove(id);
        }
    }

    private addElement(sprite: ISprite) {
        const nodeType = sprite.nodeType;
        if (nodeType === op_def.NodeType.ElementNodeType) {
            this.mElementManager.add([sprite]);
        } else if (nodeType === op_def.NodeType.TerrainNodeType) {
            this.mTerrainManager.add([sprite]);
        }
    }

    private selectedElement(display: FramesDisplay) {
        if (!(display instanceof DisplayObject)) {
            return;
        }
        if (!this.mSelectedElement) {
            this.mSelectedElement = new SelectedElement(this.mScene, this);
        }
        if (display instanceof TerrainDisplay) {
            return;
        }
        this.mSelectedElement.selecting = true;
        if (this.mSelectedElement.display === display) {
            return;
        }
        const element = display.element;
        if (element) {
            const sprite = element.model;
            if (sprite) {
                this.removeElement(element.id, sprite.nodeType);
            }
        }
        if (this.mSelectedElement.display) {
            this.onPutElement(this.mSelectedElement.display);
        }
        const ele = display.element;
        if (ele) this.mSelectedElement.setSprite(ele.model);
        // this.mSelectedElement.setElement(display);
    }

    private onTurnElementHandler(display: DisplayObject) {
        if (!this.mSelectedElement) {
            return;
        }
        const sprite = this.mSelectedElement.sprite;
        if (!sprite) {
            return;
        }

        this.mSelectedElement.turnElement();
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_FLIP_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_FLIP_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.world.connection.send(packet);
    }

    private onRecycleHandler(display: DisplayObject) {
        if (!this.mSelectedElement) {
            return;
        }
        const sprite = this.mSelectedElement.sprite;
        if (!sprite) {
            return;
        }
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_RECYCLE_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.world.connection.send(packet);
        this.mSelectedElement.remove();
    }

    private onPutElement(display: DisplayObject) {
        if (!this.mSelectedElement) {
            return;
        }
        const sprite = this.mSelectedElement.sprite;
        if (!sprite) {
            return;
        }
        this.addElement(sprite);
        const packet = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_EDIT_MODE_ADD_SPRITE = packet.content;
        content.sprites = [sprite.toSprite()];
        content.nodeType = sprite.nodeType;
        this.world.connection.send(packet);
        this.mSelectedElement.remove();
    }

    private onSelectSpriteHandler(packet: PBpacket) {
        const content: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_SELECTED_SPRITE = packet.content;
        this.mSelectedElement.selecting = true;
        this.mSelectedElement.setSprite(new Sprite(content.sprite, content.nodeType));
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

    get elementManager(): ElementManager {
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
}
