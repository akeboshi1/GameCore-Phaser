import { IFramesModel, ISprite } from "structure";
import { op_client } from "pixelpai_proto";
import { IRoomService } from "..";
import { BlockObject } from "../block/block.object";
import { IPos, Logger, LogicPos } from "utils";
import { Sprite } from "baseModel";

export class Wall extends BlockObject {
    protected mModel: ISprite;
    protected mDisplayInfo: IFramesModel;
    protected mId: number;
    constructor(sprite: op_client.ISprite, roomService: IRoomService) {
        super(roomService);
        this.setModel(sprite);
    }

    public startMove() { }

    public stopMove() { }

    async setModel(val: op_client.ISprite) {
        if (!val) {
            return;
        }
        this.mTmpSprite = val;
        // =========> 下一帧处理
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
            Logger.getInstance().error(`${Wall.name}: sprite is empty`);
            return;
        }
        if (this.mModel.currentAnimationName !== animationName) {
            this.mModel.currentAnimationName = animationName;
            this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
        }
    }

    public setDirection(val: number) {
        // if (this.mDisplayInfo && this.mDisplayInfo.avatarDir) this.mDisplayInfo.avatarDir = val;
    }

    public getDirection(): number {
        return 3;
        // return this.mDisplayInfo && this.mDisplayInfo.avatarDir ? this.mDisplayInfo.avatarDir : 3;
    }

    public setPosition(p: IPos) {
        const pos = this.mRoomService.transformTo90(new LogicPos(p.x, p.y, p.z));
        this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z);
        this.setDepth();
    }

    // public getDisplay(): BaseDisplay {
    //     return this.mDisplay;
    // }

    public showNickname() { }

    public hideNickname() { }

    public showRefernceArea() { }

    public hideRefernceArea() { }

    public showEffected() { }

    public turn() { }

    public setAlpha(val: number) { }

    public scaleTween() { }

    public setQueue() { }

    public completeAnimationQueue() { }

    public update() { }

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

    protected async _dataInit() {
        this.mId = this.mTmpSprite.id;
        this.mModel = new Sprite(this.mTmpSprite);
        await this.mRoomService.game.peer.render.setModel(this.mModel);
        this.load(<IFramesModel>this.mModel.displayInfo);
        this.setPosition(this.mModel.pos);
        this.setRenderable(true);
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
            await this.mRoomService.game.renderPeer.playAnimation(this.id, this.mModel.currentAnimation);
        }
        return this.addToBlock();
    }

    protected async addDisplay(): Promise<any> {
        super.addDisplay();
        const pos = this.mModel.pos;
        return this.setPosition(pos);
    }

    protected removeDisplay(): Promise<any> {
        // Logger.getInstance().debug("removeDisplay ====>", this);
        this.mCreatedDisplay = false;
        return this.mRoomService.game.peer.render.removeBlockObject(this.id);
    }

    protected setDepth() {
    }

    get id(): number {
        return this.mId;
    }

    get dir(): number {
        return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
    }

    get model(): ISprite {
        return this.mModel;
    }

    set model(val: ISprite) {
        this.mModel = val;
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
