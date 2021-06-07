import { BlockObject } from "../block/block.object";
import { ISprite } from "structure";
import { IElement, MoveData } from "../element/element";
import { IElementManager } from "../element/element.manager";
import { op_client } from "pixelpai_proto";
import { IPos, Logger } from "utils";
import { IRoomService } from "../room/room";
import { IFramesModel } from "structure";
import { LayerEnum } from "game-capsule";

export class Terrain extends BlockObject implements IElement {
    protected mId: number;
    protected mDisplayInfo: IFramesModel;
    protected mModel: ISprite;
    protected mCreatedDisplay: boolean = false;
    private mMoveData: MoveData;
    private mState: boolean = false;

    constructor(sprite: ISprite, protected mElementManager: IElementManager) {
        super(sprite.id, mElementManager.roomService);
        this.mId = sprite.id;
        this.model = sprite;
    }

    changeDisplayData(texturePath: string, dataPath?: string) {
        this.mDisplayInfo.display.texturePath = texturePath;
        if (dataPath) this.mDisplayInfo.display.dataPath = dataPath;
        this.changeDisplay(this.mDisplayInfo);
    }

    get state(): boolean {
        return this.mState;
    }

    set state(val: boolean) {
        this.mState = val;
    }

    get moveData(): MoveData {
        return this.mMoveData;
    }

    get moving() {
        return false;
    }

    public startMove() {
    }

    public stopMove() {
    }

    public startFireMove(pos: IPos) {
    }

    public addToMap() {
        this.addToWalkableMap();
        this.addToInteractiveMap();
    }

    public removeFromMap() {
        this.removeFromWalkableMap();
        this.removeFromInteractiveMap();
    }

    public addToInteractiveMap() {

    }

    public removeFromInteractiveMap() {

    }

    public addToWalkableMap() {
        this.addBody();
        if (this.model && this.mElementManager) this.mElementManager.roomService.addToWalkableMap(this.model, true);
    }

    public removeFromWalkableMap() {
        this.removeBody();
        if (this.model && this.mElementManager) this.mElementManager.roomService.removeFromWalkableMap(this.model, true);
    }

    async setModel(val: ISprite) {
        this.mModel = val;
        if (!val) {
            return;
        }
        if (!this.mModel.layer) {
            this.mModel.layer = LayerEnum.Terrain;
        }
        const area = this.mModel.getCollisionArea();
        const obj = { id: this.mModel.id, pos: this.mModel.pos, nickname: this.mModel.nickname, alpha: this.mModel.alpha, titleMask: this.mModel.titleMask | 0x00020000 };
        await this.mElementManager.roomService.game.renderPeer.setModel(obj);
        const obj1 = {
            id: this.mModel.id,
            point3f: this.mModel.pos,
            currentAnimationName: this.mModel.currentAnimationName,
            direction: this.mModel.direction,
            mountSprites: this.mModel.mountSprites,
            speed: this.mModel.speed,
            displayInfo: this.mModel.displayInfo
        };
        this.removeFromWalkableMap();
        this.load(<IFramesModel>this.mModel.displayInfo);
        this.setPosition(this.mModel.pos);
        this.setRenderable(true);
        this.addToWalkableMap();
    }

    updateModel(val: op_client.ISprite) {
    }

    public load(displayInfo: IFramesModel) {
        this.mCreatedDisplay = false;
        this.mDisplayInfo = displayInfo;
        if (!this.mDisplayInfo) {
            return;
        }
        this.addDisplay();
    }

    public play(animationName: string): void {
        if (!this.mModel) {
            Logger.getInstance().error(`${Terrain.name}: sprite is empty`);
            return;
        }
        if (this.mModel.currentAnimation.name !== animationName) {
            this.removeFromWalkableMap();
            this.mModel.setAnimationName(animationName);
            this.addToWalkableMap();
            this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
        }
    }

    public setDirection(val: number) {
        if (this.mDisplayInfo && this.mDisplayInfo.avatarDir) this.mDisplayInfo.avatarDir = val;
    }

    public getDirection(): number {
        return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    }

    public setPosition(p: IPos) {
        this.mModel.setPosition(p.x, p.y);
        if (this.moveControll) this.moveControll.setPosition(this.mModel.pos);
        this.mRoomService.game.peer.render.setPosition(this.id, p.x, p.y, p.z);
        this.setDepth();
    }

    public showNickname() {
    }

    public hideNickname() {
    }

    public showRefernceArea() {
    }

    public hideRefernceArea() {
    }

    public showEffected() {
    }

    public turn() {
    }

    public setAlpha(val: number) {
    }

    public scaleTween() {
    }

    public setQueue() {
    }

    public completeAnimationQueue() {
    }

    public update() {
    }

    public mount() {
        return this;
    }

    public async unmount(): Promise<this> {
        return this;
    }

    public addMount() {
        return this;
    }

    public removeMount() {
        return Promise.resolve();
    }

    public getInteractivePositionList() {
        return [];
    }

    public destroy() {
        this.removeDisplay();
        super.destroy();
    }

    protected async createDisplay(): Promise<any> {
        if (this.mCreatedDisplay) return;
        super.createDisplay();

        if (!this.mDisplayInfo) {
            // Logger.getInstance().error("displayinfo does not exist, Create display failed");
            return;
        }
        const frameModel = Object.assign({}, this.mDisplayInfo);
        frameModel.animationName = this.mModel.currentAnimation.name;
        await this.mRoomService.game.peer.render.createTerrainDisplay(this.id, frameModel, this.mModel.layer);
        return this.addToBlock();
    }

    protected async addDisplay(): Promise<any> {
        await super.addDisplay();
        const pos = this.mModel.pos;
        return this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z);
    }

    protected setDepth() {
        // if (this.mDisplay) {
        //     this.mDisplay.setDepth(this.mDisplay.y);
        //     if (!this.roomService) {
        //         throw new Error("roomService is undefined");
        //     }
        //     const layerManager = this.roomService.layerManager;
        //     if (!layerManager) {
        //         throw new Error("layerManager is undefined");
        //     }
        //     layerManager.depthGroundDirty = true;
        // }
    }

    private setPosition45(pos: IPos) {
        if (!this.roomService) {
            Logger.getInstance().error("roomService does not exist");
            return;
        }
        const point = this.roomService.transformTo90(pos);
        this.setPosition(point);
    }

    get id(): number {
        return this.mId;
    }

    get dir(): number {
        return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
    }

    get roomService(): IRoomService {
        if (!this.mElementManager) {
            Logger.getInstance().error("element manager is undefined");
            return;
        }
        return this.mElementManager.roomService;
    }

    get model(): ISprite {
        return this.mModel;
    }

    set model(val: ISprite) {
        this.setModel(val);
    }

    get currentAnimationName() {
        if (this.mModel) {
            return this.mModel.currentAnimationName;
        }
        return "";
    }

    get created() {
        return true;
    }
}
