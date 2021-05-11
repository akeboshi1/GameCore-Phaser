import { op_client, op_def } from "pixelpai_proto";
import { AnimationQueue, ElementStateType, IDragonbonesModel, IFramesModel, ISprite } from "structure";
import { IPos, IProjection } from "structure";
import { BlockObject } from "../block/block.object";
import { IRoomService } from "../room";
import { ElementStateManager } from "../state/element.state.manager";
import { IElementManager } from "./element.manager";
export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;
    readonly created: boolean;
    readonly moveData: MoveData;
    state: boolean;
    model: ISprite;
    update(time?: number, delta?: number): any;
    startFireMove(pos: IPos): any;
    startMove(): any;
    stopMove(): any;
    setModel(model: ISprite): any;
    updateModel(model: op_client.ISprite): any;
    play(animationName: string): void;
    setPosition(p: IPos, update: boolean): void;
    getPosition(): IPos;
    getPosition45(): IPos;
    setDirection(val: number): void;
    getDirection(): number;
    showEffected(displayInfo: IFramesModel): any;
    showNickname(): any;
    hideNickname(): any;
    showRefernceArea(): any;
    hideRefernceArea(): any;
    turn(): any;
    setAlpha(val: number): any;
    setQueue(queue: op_client.IChangeAnimation[]): any;
    completeAnimationQueue(): any;
    mount(ele: IElement): this;
    unmount(targetPos?: IPos): Promise<this>;
    addMount(ele: IElement, index?: number): this;
    removeMount(ele: IElement, targetPos?: IPos): Promise<void>;
    getInteractivePositionList(): Promise<IPos[]>;
    getProjectionSize(): IProjection;
    addToWalkableMap(): any;
    removeFromWalkableMap(): any;
}
export interface MoveData {
    step?: number;
    path?: op_def.IMovePoint[];
    arrivalTime?: number;
}
export interface MovePos {
    x: number;
    y: number;
    stopDir?: number;
}
export interface MovePath {
    x: number;
    y: number;
    direction: number;
    duration?: number;
    onStartParams?: any;
}
export declare class Element extends BlockObject implements IElement {
    protected mElementManager: IElementManager;
    get state(): boolean;
    set state(val: boolean);
    get dir(): number;
    get roomService(): IRoomService;
    get id(): number;
    get model(): ISprite;
    set model(val: ISprite);
    get moveData(): MoveData;
    get created(): boolean;
    get eleMgr(): IElementManager;
    protected mId: number;
    protected mDisplayInfo: IFramesModel | IDragonbonesModel;
    protected mAnimationName: string;
    protected mMoveData: MoveData;
    protected mCurState: string;
    protected mOffsetY: number;
    protected mQueueAnimations: AnimationQueue[];
    protected mMoving: boolean;
    protected mRootMount: IElement;
    protected mMounts: IElement[];
    protected mDirty: boolean;
    protected mCreatedDisplay: boolean;
    protected isUser: boolean;
    protected moveControll: MoveControll;
    protected mStateManager: ElementStateManager;
    protected mTopDisplay: any;
    protected mTarget: any;
    private delayTime;
    private mState;
    constructor(sprite: ISprite, mElementManager: IElementManager);
    showEffected(displayInfo: any): void;
    load(displayInfo: IFramesModel | IDragonbonesModel, isUser?: boolean): Promise<any>;
    setModel(model: ISprite): Promise<void>;
    updateModel(model: op_client.ISprite, avatarType?: op_def.AvatarStyle): void;
    play(animationName: string, times?: number): void;
    setQueue(animations: op_client.IChangeAnimation[]): void;
    completeAnimationQueue(): void;
    setDirection(val: number): void;
    getDirection(): number;
    changeState(val?: string): void;
    getState(): string;
    getRenderable(): boolean;
    update(time?: number, delta?: number): void;
    /**
     * 发射
     * id 发射对象
     * pos 发射终点
     */
    fire(id: number, pos: IPos): void;
    startFireMove(pos: IPos): Promise<void>;
    move(path: op_def.IMovePoint[]): void;
    startMove(points?: any): void;
    stopMove(points?: any): void;
    getPosition(): IPos;
    setPosition(p: IPos, update?: boolean): void;
    getRootPosition(): IPos;
    showBubble(text: string, setting: op_client.IChat_Setting): void;
    clearBubble(): void;
    showNickname(): void;
    hideNickname(): void;
    showTopDisplay(data?: ElementStateType): void;
    removeTopDisplay(): void;
    showRefernceArea(conflictMap?: number[][]): void;
    hideRefernceArea(): void;
    getInteractivePositionList(): Promise<IPos[]>;
    get nickname(): string;
    turn(): void;
    setAlpha(val: number): void;
    mount(root: IElement): this;
    unmount(): Promise<this>;
    addMount(ele: IElement, index: number): this;
    removeMount(ele: IElement, targetPos?: IPos): Promise<void>;
    getDepth(): number;
    asociate(): void;
    addToWalkableMap(): void;
    removeFromWalkableMap(): void;
    setState(stateGroup: op_client.IStateGroup): void;
    destroy(): void;
    protected _doMove(time?: number, delta?: number): void;
    protected createDisplay(): Promise<any>;
    protected loadDisplayInfo(): Promise<any>;
    protected onDisplayReady(): void;
    protected addDisplay(): Promise<any>;
    protected removeDisplay(): Promise<any>;
    protected setDepth(depth: number): void;
    protected get offsetY(): number;
    protected addToBlock(): Promise<any>;
    protected checkDirection(): void;
    protected calculateDirectionByAngle(angle: any): number;
    protected mergeMounth(mounts: number[]): void;
    protected updateMounth(mounts: number[]): void;
    protected animationChanged(data: any): void;
    protected addBody(): void;
    protected updateBody(model: any): void;
    private _startMove;
}
declare class MoveControll {
    private target;
    private velocity;
    private mPosition;
    private mPrePosition;
    constructor(target: BlockObject);
    setVelocity(x: number, y: number): void;
    update(time: number, delta: number): void;
    setPosition(x: number, y: number): void;
    get position(): IPos;
    get prePosition(): IPos;
}
export {};
