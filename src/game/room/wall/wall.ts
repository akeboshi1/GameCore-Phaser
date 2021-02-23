import { IFramesModel, ISprite } from "structure";
import { op_def, op_client } from "pixelpai_proto";
import { IRoomService } from "..";
import { BlockObject } from "../block/block.object";
import { IPos, Logger, LogicPos } from "utils";

export class Wall extends BlockObject {
    protected mModel: ISprite;
    protected mDisplayInfo: IFramesModel;
    constructor(sprite: ISprite, roomService: IRoomService) {
        super(sprite.id, roomService);
        this.setModel(sprite);
    }

    public startMove() { }

    public stopMove() { }

    async setModel(val: ISprite) {
        this.mModel = val;
        if (!val) {
            return;
        }
        await this.mRoomService.game.peer.render.setModel(val);
        this.load(<IFramesModel>this.mModel.displayInfo);
        // this.mDisplayInfo = <IFramesModel> this.mModel.displayInfo;
        // this.createDisplay();
        this.setPosition(this.mModel.pos);
        this.setRenderable(true);
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
            Logger.getInstance().error(`${Wall.name}: sprite is empty`);
            return;
        }
        if (this.mModel.currentAnimationName !== animationName) {
            // this.mAnimationName = animationName;
            this.mModel.currentAnimationName = animationName;
            this.mRoomService.game.peer.render.playElementAnimation(this.id, this.mModel.currentAnimationName);
            // if (this.mDisplay) {
            //     this.mDisplay.play(this.model.currentAnimation);
            // }
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
        // if (this.mDisplay) {
        //     this.mDisplay.setPosition(p.x, p.y, p.z);
        // }
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
        return this.setPosition(pos);
        // return this.mRoomService.game.peer.render.setPosition(this.id, pos.x, pos.y, pos.z);
    }

    protected setDepth() {
    }

    get id(): number {
        return this.guid;
    }

    get dir(): number {
        return this.mDisplayInfo.avatarDir !== undefined ? this.mDisplayInfo.avatarDir : 3;
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
