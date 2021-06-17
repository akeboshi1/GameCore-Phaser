import { InputEnable } from "../element/input.enable";
import { IBlockObject } from "./iblock.object";
import { IPos, LogicPos, Position45, IPosition45Obj, IFramesModel, IProjection, ISprite } from "structure";
import { op_def } from "pixelpai_proto";
import { MoveControll } from "../../collsion";
import { IRoomService } from "../../room/room";

export abstract class BlockObject implements IBlockObject {
    public isUsed = false;
    protected mRenderable: boolean = false;
    protected mBlockable: boolean = false;
    protected mModel: ISprite;
    protected mInputEnable: InputEnable;
    protected mCreatedDisplay: boolean;
    protected moveControll: MoveControll;
    constructor(id: number, protected mRoomService: IRoomService) {
        this.isUsed = true;
        if (id && this.mRoomService) this.moveControll = new MoveControll(id, this.mRoomService);
    }

    public async setRenderable(isRenderable: boolean, delay: number = 0): Promise<any> {
        if (this.mRenderable !== isRenderable) {
            this.mRenderable = isRenderable;
            if (isRenderable) {
                await this.addDisplay();
                if (delay > 0) {
                    return this.fadeIn();
                }
            } else {
                if (delay > 0) {
                    this.fadeOut(() => {
                        return this.removeDisplay();
                    });
                } else {
                    return this.removeDisplay();
                }
            }
        }
    }

    public getPosition(): IPos {
        const pos: IPos = this.mModel && this.mModel.pos ? this.mModel.pos : new LogicPos();
        return pos;
    }

    public getPosition45(): IPos {
        const pos = this.getPosition();
        if (!pos) return new LogicPos();
        return this.mRoomService.transformToMini45(pos);
    }

    public getRenderable() {
        return this.mRenderable;
    }

    public fadeIn(callback?: () => void): Promise<any> {
        return this.mRoomService.game.peer.render.fadeIn(this.id, this.type);
    }

    public fadeOut(callback?: () => void): Promise<any> {
        return this.mRoomService.game.peer.render.fadeOut(this.id, this.type);
    }

    public fadeAlpha(alpha: number) {
        this.mRoomService.game.peer.render.fadeAlpha(this.id, this.type, alpha);
    }

    public setInputEnable(val: InputEnable) {
        // if (this.mInputEnable !== val) {
        this.mInputEnable = val;
        if (!this.mRoomService) return;
        switch (val) {
            case InputEnable.Interactive:
                if (this.mModel && (this.mModel.hasInteractive || this.mModel.nodeType === op_def.NodeType.ElementNodeType)) {
                    this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
                } else {
                    this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
                }
                break;
            case InputEnable.Enable:
                this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
                break;
            default:
                this.mRoomService.game.peer.render.disableInteractive(this.id, this.type);
                break;

        }
        // }
    }

    public setBlockable(val: boolean): this {
        if (this.mBlockable !== val) {
            this.mBlockable = val;
            if (this.mRoomService) {
                if (val) {
                    // Logger.getInstance().debug("block addBlockObject");
                    this.mRoomService.addBlockObject(this);
                } else {
                    // Logger.getInstance().debug("block removeBlockObject");
                    this.mRoomService.removeBlockObject(this);
                }
            }
        }
        return this;
    }

    public destroy() {
        // this.mRoomService.game.peer.render.displayDestroy(this.id, this.type);
        if (this.moveControll) this.moveControll.removePolygon();
    }

    public moveBasePos(): IPos {
        return this.moveControll ? this.moveControll.position : undefined;
    }

    public clear() {
        this.isUsed = false;
    }

    public disableBlock() {
        this.removeFromBlock();
        this.mBlockable = false;
        this.mRenderable = false;
    }

    public enableBlock() {
        this.mBlockable = true;
        this.addToBlock();
    }

    public getProjectionSize(): IProjection {
        const miniSize = this.mRoomService.miniSize;
        const collision = this.mModel.getCollisionArea();
        const origin = this.mModel.getOriginPoint();
        if (!collision) return;
        const rows = collision.length;
        const cols = collision[0].length;
        const width = cols;
        const height = rows;
        const offset = this.mRoomService.transformToMini90(new LogicPos(origin.x, origin.y));
        return { offset, width, height };
    }

    public load(displayInfo) {
        this.addDisplay();
    }

    protected addDisplay(): Promise<any> {
        if (this.mCreatedDisplay) return;
        return this.createDisplay();
    }

    protected createDisplay(): Promise<any> {
        this.mCreatedDisplay = true;
        return Promise.resolve();
    }

    protected removeDisplay(): Promise<any> {
        // Logger.getInstance().debug("removeDisplay ====>", this);
        this.mCreatedDisplay = false;
        if (!this.mRoomService) return;
        // this.removeBody();
        return this.mRoomService.game.peer.render.removeBlockObject(this.id);
    }

    protected changeDisplay(displayInfo: IFramesModel) {
        this.mCreatedDisplay = false;
        this.load(displayInfo);
    }

    protected addToBlock(): Promise<any> {
        if (this.mBlockable) {
            return this.mRoomService.addBlockObject(this).then((resolve) => {
                return Promise.resolve();
            });

        } else {
            this.addDisplay();
            return Promise.resolve();
        }
    }

    protected removeFromBlock(remove?: boolean) {
        if (this.mBlockable) {
            this.mRoomService.removeBlockObject(this);
            if (remove) {
                this.setRenderable(false);
            }
        }
    }

    protected updateBlock() {
        if (this.mBlockable) {
            this.mRoomService.updateBlockObject(this);
        }
    }

    protected addBody() {
        this.drawBody();
    }

    protected removeBody() {
        if (!this.moveControll) return;
        this.moveControll.removePolygon();
    }

    protected drawBody() {
        if (!this.moveControll) return;
        if (!this.mModel) return;
        // super.addBody();
        const collision = this.mModel.getCollisionArea();
        if (!collision) {
            // body = Bodies.circle(this._tempVec.x * this._scale, this._tempVec.y * this._scale, 10);
            return;
        }

        const collisionArea = [...collision];
        let walkableArea = this.mModel.getWalkableArea();
        if (!walkableArea) {
            walkableArea = [];
        }

        const cols = collisionArea.length;
        const rows = collisionArea[0].length;
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (walkableArea[i] && walkableArea[i][j] === 1) {
                    collisionArea[i][j] = 0;
                }
            }
        }

        const walkable = (val: number) => val === 0;
        const resule = collisionArea.some((val: number[]) => val.some(walkable));
        let paths = [];
        const miniSize = this.mRoomService.miniSize;

        if (resule) {
            paths = this.calcBodyPath(collisionArea, miniSize);
        } else {
            paths = [Position45.transformTo90(new LogicPos(0, 0), miniSize), Position45.transformTo90(new LogicPos(rows, 0), miniSize), Position45.transformTo90(new LogicPos(rows, cols), miniSize), Position45.transformTo90(new LogicPos(0, cols), miniSize)];
        }
        if (paths.length < 1) {
            this.removeBody();
            return;
        }
        const origin = Position45.transformTo90(this.mModel.getOriginPoint(), miniSize);
        this.moveControll.drawPolygon(paths, { x: -origin.x, y: -origin.y });
    }

    protected updateBody(model) {
        // if (this.mRootMount) {
        //     return;
        // }
        // super.updateBody(model);
    }

    private calcBodyPath(collisionArea: number[][], miniSize) {
        const allpoints = this.prepareVertices(collisionArea).reduce((acc, p) => acc.concat(this.transformBodyPath(p[1], p[0], miniSize)), []);
        const convexHull = require("monotone-convex-hull-2d");
        const resultIndices = convexHull(allpoints);
        return resultIndices.map((i) => ({ x: allpoints[i][0], y: allpoints[i][1] }));
    }

    private prepareVertices(collisionArea: number[][]): any[] {
        const allpoints = [];
        for (let i = 0; i < collisionArea.length; i++) {
            let leftMost, rightMost;
            for (let j = 0; j < collisionArea[i].length; j++) {
                if (collisionArea[i][j] === 1) {
                    if (!leftMost) {
                        leftMost = [i, j];
                        allpoints.push(leftMost);
                    } else {
                        rightMost = [i, j];
                    }
                }
            }
            if (rightMost) {
                allpoints.push(rightMost);
            }
        }
        return allpoints;
    }

    private transformBodyPath(x: number, y: number, miniSize: IPosition45Obj) {
        const pos = Position45.transformTo90(new LogicPos(x, y), miniSize);
        const result = [[pos.x, -miniSize.tileHeight * 0.5 + pos.y], [pos.x + miniSize.tileWidth * 0.5, pos.y], [pos.x, pos.y + miniSize.tileHeight * 0.5], [pos.x - miniSize.tileWidth * 0.5, pos.y]];
        return result;
    }

    get id(): number {
        return -1;
    }

    get type(): number {
        return -1;
    }
}
