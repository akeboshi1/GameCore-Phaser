import { Bodies, Body, Vertices } from "matter-js";
import { IPos, IPosition45Obj, Logger, LogicPos, Position45 } from "utils";
import { ISprite } from "../display/sprite/sprite";
import { InputEnable } from "../element/element";
import { MatterObject } from "../physical/matter.object";
import { IRoomService } from "../room/room";
import { IBlockObject } from "./iblock.object";

export abstract class BlockObject extends MatterObject implements IBlockObject {
    public isUsed = false;
    protected mRenderable: boolean = false;
    protected mBlockable: boolean = true;
    protected mModel: ISprite;
    protected mInputEnable: InputEnable;
    protected mCreatedDisplay: boolean = false;
    constructor(room: IRoomService) {
        super(room);
        this.isUsed = true;
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
        return this.mRoomService.transformTo45(pos);
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
        switch (val) {
            case InputEnable.Interactive:
                if (this.mModel && this.mModel.hasInteractive) {
                    this.mRoomService.game.peer.render.setInteractive(this.id, this.type);
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
                    // Logger.getInstance().log("block addBlockObject");
                    this.mRoomService.addBlockObject(this);
                } else {
                    // Logger.getInstance().log("block removeBlockObject");
                    this.mRoomService.removeBlockObject(this);
                }
            }
        }
        return this;
    }

    public destroy() {
        this.removeFromBlock();
        super.destroy();
    }

    public clear() {
        this.isUsed = false;
    }

    public getProjectionSize(): IPos {
        const miniSize = this.mRoomService.miniSize;
        const collision = this.mModel.getCollisionArea();
        const origin = this.mModel.getOriginPoint();
        const rows = collision.length - origin.y;
        const cols = collision[0].length - origin.x;
        const width = this.mRoomService.transformToMini90(new LogicPos(0, cols));
        const height = this.mRoomService.transformToMini90(new LogicPos(rows, 0));
        const ow = this.mRoomService.transformToMini90(new LogicPos(origin.y));
        const oh = this.mRoomService.transformToMini90(new LogicPos(origin.x));

        return new LogicPos(width.x - ow.x, height.y - oh.y);
    }

    protected addDisplay(): Promise<any> { return this.createDisplay(); }

    protected createDisplay(): Promise<any> {
        this.mCreatedDisplay = true;
        return Promise.resolve();
    }

    protected removeDisplay(): Promise<any> {
        this.mCreatedDisplay = false;
        return this.mRoomService.game.peer.render.removeBlockObject(this.id);
    }

    protected addToBlock(): Promise<any> {
        if (this.mBlockable) {
            return this.mRoomService.addBlockObject(this);
        } else {
            return this.addDisplay();
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

    protected disableBlock() {
        this.removeFromBlock();
        this.mBlockable = false;
        this.mRenderable = false;
    }

    protected enableBlock() {
        this.mBlockable = true;
        this.addToBlock();
    }

    protected setBody() {
        this.drawBody();
    }

    protected drawBody() {
        const collision = this.mModel.getCollisionArea();
        if (!collision) {
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
        const dpr = this.mRoomService.game.scaleRatio;
        const transformToMini90 = this.mRoomService.transformToMini90.bind(this.mRoomService);
        let paths = [];
        const miniSize = this.mRoomService.miniSize;
        if (resule) {
            paths[0] = this.calcBodyPath(collisionArea, miniSize);
        } else {
            paths = [[transformToMini90(new LogicPos(0, 0)), transformToMini90(new LogicPos(rows, 0)), transformToMini90(new LogicPos(rows, cols)), transformToMini90(new LogicPos(0, cols))]];
        }

        const mapHeight = (rows + cols) * (miniSize.tileHeight / 2) * dpr;
        const mapWidth = (rows + cols) * (miniSize.tileWidth / 2) * dpr;
        const scaleDpr = (pos) => {
            pos.x *= dpr;
            pos.y *= dpr;
        };
        paths.map((path) => path.map(scaleDpr));
        if (paths.length < 1 || paths[0].length < 3) {
            Logger.getInstance().log("can't draw paths: ", this.mModel.nickname, this.mModel.id);
            return;
        }
        // const paths = [{ x: 0, y: -height / 2 }, { x: width / 2, y: 0 }, { x: 0, y: height / 2 }, { x: -width / 2, y: 0 }];
        const curOrigin = this.mModel.getOriginPoint();
        const originPos = new LogicPos(curOrigin.x, curOrigin.y);
        const origin = Position45.transformTo90(originPos, miniSize);
        origin.x *= dpr;
        origin.y *= dpr;

        // this._offset.x = origin.x;
        // this._offset.y = mapHeight * 0.5 - origin.y;
        this._offset.x = mapWidth * this._offsetOrigin.x - (cols * (miniSize.tileWidth / 2) * dpr) - origin.x;
        this._offset.y = mapHeight * this._offsetOrigin.y - origin.y;
        const body = Bodies.fromVertices(this._tempVec.x * this._radio + this._offset.x, this._tempVec.y * this._radio + this._offset.y, paths, { isStatic: true, friction: 0 });
        this.setExistingBody(body, true);
    }

    private calcBodyPath(collisionArea: number[][], miniSize: IPosition45Obj) {
        const allpoints = this.prepareVertices(collisionArea).reduce((acc, p) => acc.concat(this.transformBodyPath2(p[1], p[0], miniSize)), []);
        // console.log(allpoints);
        const convexHull = require("monotone-convex-hull-2d");
        const resultIndices = convexHull(allpoints);

        return resultIndices.map((i) => ({ x: allpoints[i][0], y: allpoints[i][1] }));
        //    return paths;
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
        return [{ x: pos.x, y: -miniSize.tileHeight * 0.5 + pos.y }, { x: pos.x + miniSize.tileWidth * 0.5, y: pos.y }, { x: pos.x, y: pos.y + miniSize.tileHeight * 0.5 }, { x: pos.x - miniSize.tileWidth * 0.5, y: pos.y }];
    }

    private transformBodyPath2(x: number, y: number, miniSize: IPosition45Obj) {
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
