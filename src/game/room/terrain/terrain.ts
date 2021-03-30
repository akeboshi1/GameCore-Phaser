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

    get state(): boolean {
        return this.mState;
    }

    set state(val: boolean) {
        this.mState = val;
    }

    get moveData(): MoveData {
        return this.mMoveData;
    }

    public startMove() {
    }

    public stopMove() {
    }

    public startFireMove(pos: IPos) {
    }

    public addToWalkableMap() {
        if (this.model && this.mElementManager) this.mElementManager.roomService.addToWalkableMap(this.model, true);
    }

    public removeFromWalkableMap() {
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
        await this.mRoomService.game.physicalPeer.setModel(obj1);
        this.removeFromWalkableMap();
        this.load(<IFramesModel>this.mModel.displayInfo);
        // this.mDisplayInfo = <IFramesModel> this.mModel.displayInfo;
        // this.createDisplay();
        this.setPosition(this.mModel.pos);
        this.setRenderable(true);
        this.addToWalkableMap();
        // this.addDisplay();
    }

    updateModel(val: op_client.ISprite) {
    }

    public load(displayInfo: IFramesModel) {
        this.mDisplayInfo = displayInfo;
        if (!this.mDisplayInfo) {
            return;
        }
        this.addDisplay();
        // if (!this.mDisplay) {
        //     this.createDisplay();
        // }
        // this.mDisplayInfo = displayInfo;
        // this.mDisplay.once("initialized", this.onInitializedHandler, this);
        // this.mDisplay.load(this.mDisplayInfo);
    }

    public play(animationName: string): void {
        if (!this.mModel) {
            Logger.getInstance().error(`${Terrain.name}: sprite is empty`);
            return;
        }
        if (this.mModel.currentAnimationName !== animationName) {
            // this.mAnimationName = animationName;
            this.mModel.currentAnimationName = animationName;
            this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
            // if (this.mDisplay) {
            //     this.mDisplay.play(this.this.mModel.currentAnimation);
            // }
        }
    }

    public setDirection(val: number) {
        if (this.mDisplayInfo && this.mDisplayInfo.avatarDir) this.mDisplayInfo.avatarDir = val;
    }

    public getDirection(): number {
        return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    }

    public setPosition(p: IPos) {
        this.mRoomService.game.peer.render.setPosition(this.id, p.x, p.y, p.z);
        // if (this.mDisplay) {
        //     this.mDisplay.setPosition(p.x, p.y, p.z);
        // }
        this.setDepth();
    }

    // public getDisplay(): BaseDisplay {
    //     return this.mDisplay;
    // }

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

    public async getInteractivePositionList() {
        return [];
    }

    public destroy() {
        this.removeDisplay();
        // this.mElementManager.removeFromMap(this.mModel);
        super.destroy();
    }

    protected async createDisplay(): Promise<any> {
        if (this.mCreatedDisplay) return;
        super.createDisplay();

        if (!this.mDisplayInfo) {
            // Logger.getInstance().error("displayinfo does not exist, Create display failed");
            return;
        }
        await this.mRoomService.game.peer.render.createTerrainDisplay(this.id, this.mDisplayInfo, this.mModel.layer);
        const currentAnimation = this.mModel.currentAnimation;
        if (currentAnimation) {
            await this.mElementManager.roomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation);
        }

        // debug
        // this.mRoomService.game.renderPeer.showNickname(this.id, this.mModel.nickname);

        // const scene = this.mElementManager.scene;
        // if (scene) {
        //     this.mDisplay = new TerrainDisplay(scene, this.mElementManager.roomService, this);
        //     this.setPosition45(this.model.pos);
        //     this.addToBlock();
        //     // this.mDisplay.load(this.mDisplayInfo);
        // }
        return this.addToBlock();
    }

    protected async addDisplay(): Promise<any> {
        await super.addDisplay();
        const pos = this.mModel.pos;
        return this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z);
        // if (!this.mDisplay) {
        //     // Logger.getInstance().error("display does not exist");
        //     return;
        // }
        // if (!this.mElementManager) {
        //     Logger.getInstance().error("element manager does not exist");
        //     return;
        // }
        // const room = this.mElementManager.roomService;
        // if (!room) {
        //     Logger.getInstance().error("roomService does not exist");
        //     return;
        // }
        // room.addToGround(this.mDisplay);
        // this.setDepth();
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

    // protected onInitializedHandler() {
    //     if (this.mDisplay) {
    //         // this.mDisplay.setInteractive();
    //         this.mDisplay.play(this.model.currentAnimation);
    //     }
    // }

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
