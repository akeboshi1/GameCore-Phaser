import { Body, Vector } from "tooqingmatter-js";
import { MatterWorld } from "./matter.world";
import { MoveData, MovePos } from "./matter.player.object";
import { op_client } from "pixelpai_proto";
import { MatterSprite } from "./matter.sprite";
import { IPos, IPosition45Obj } from "structure";
export interface IMatterObject {
    id: number;
    model: MatterSprite;
    body: Body;
    _sensor: boolean;
    _offset: Vector;
    setStatic(boo: boolean): any;
    applyForce(boo: boolean): any;
    setVelocityX(): any;
    setVelocityY(): any;
    setBaseVelocity(x: number, y: number): any;
    setVelocity(x: number, y: number): any;
    changeState(state: string, times?: number): any;
    setExistingBody(body: Body, addToWorld?: boolean): any;
    update(time?: number, delta?: number): any;
    setModel(sprite: op_client.ISprite): any;
    updateModel(sprite: any): any;
    updateAnimations(displayInfo: any): any;
    setPosition(p: IPos, update: boolean): void;
    getPosition(): IPos;
    startMove(): any;
    stopMove(): any;
    destroy(): any;
    drawBody(): any;
    setBody(scaleRatio: number): any;
    addBody(scaleRatio: number): any;
    removeBody(): any;
    setVertices(vertexSets: any): any;
    _doMove(time?: number, delta?: number): any;
    move(moveData: MovePos[]): any;
    moveMotion(x: number, y: number): any;
    mount(ele: IMatterObject): this;
    unmount(targetPos?: IPos): Promise<void> | undefined;
    addMount(ele: IMatterObject, index?: number): this;
    removeMount(ele: IMatterObject, targetPos?: IPos): Promise<void>;
    getInteractivePositionList(): IPos[];
}
export declare class MatterObject implements IMatterObject {
    peer: any;
    id: number;
    _tempVec: Vector;
    _offset: Vector;
    _sensor: boolean;
    body: Body;
    protected mModel: MatterSprite;
    protected mMoveData: MoveData;
    protected mCurState: string;
    protected mMoving: boolean;
    protected mOffsetY: number;
    protected mMounts: IMatterObject[];
    protected mDirty: boolean;
    protected endMove: boolean;
    protected mRootMount: IMatterObject;
    protected hasPos: IPos;
    protected curSprite: any;
    protected _offsetOrigin: Vector;
    protected _scale: number;
    protected mTargetPos: any;
    private mMoveDelayTime;
    private mMoveTime;
    private mMovePoints;
    constructor(peer: any, id: number);
    get matterWorld(): MatterWorld;
    update(time?: number, delta?: number): void;
    _pushMoveData(): void;
    _doMove(time?: number, delta?: number): void;
    setModel(sprite: any): void;
    updateModel(model: any): void;
    mergeMounth(mounts: number[]): void;
    updateMounth(mounts: number[]): void;
    checkDirection(): void;
    updateAnimations(displayInfo: any): void;
    startMove(): void;
    stopMove(): void;
    tryStopMove(pos?: IPos): void;
    /**
     * 设置object是否是静态物件受力是否可移动
     * @param value
     */
    setStatic(value: boolean): this;
    isStatic(): boolean;
    applyForce(force: any): this;
    setVelocityX(): void;
    setVelocityY(): void;
    setVelocity(x: number, y: number): void;
    setBaseVelocity(x: number, y: number): void;
    setPosition(p: IPos, update?: boolean): void;
    getPosition(): IPos;
    destroy(): void;
    mount(root: IMatterObject): this;
    unmount(): Promise<void>;
    addMount(ele: IMatterObject, index?: number): this;
    removeMount(ele: IMatterObject, targetPos?: IPos): Promise<void>;
    setExistingBody(body: Body, addToWorld?: boolean): void;
    setBody(): void;
    addBody(): void;
    removeBody(): void;
    setVertices(vertexSets: any): any;
    getSensor(): boolean;
    changeState(state: any, number?: number): void;
    moveMotion(x: number, y: number): void;
    move(path: MovePos[]): void;
    getInteractivePositionList(): IPos[];
    drawBody(): Promise<void>;
    protected calcBodyPath(collisionArea: number[][], miniSize: IPosition45Obj): any;
    private prepareVertices;
    private transformBodyPath;
    private transformBodyPath2;
    get model(): any;
}
