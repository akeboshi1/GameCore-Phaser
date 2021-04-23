import { PhysicalPeer } from "../physical.worker";
import { MatterPlayerObject, MovePos } from "./matter.player.object";
import { Body } from "tooqingmatter-js";
import { IPos } from "structure";
export declare class MatterUserObject extends MatterPlayerObject {
    peer: PhysicalPeer;
    id: number;
    stopBoxMove: boolean;
    private mTargetPoint;
    private mSyncDirty;
    private mSyncTime;
    private mTargetID;
    constructor(peer: PhysicalPeer, id: number);
    update(time?: number, delta?: number): void;
    unmount(targetPos?: IPos): Promise<void>;
    addBody(): void;
    moveMotion(x: number, y: number, targetId?: number): Promise<void>;
    findPath(targets: IPos[], targetId?: number, toReverse?: boolean): Promise<void>;
    setExistingBody(body: Body, addToWorld?: boolean): void;
    startMove(): void;
    stopMove(): void;
    tryStopMove(pos?: IPos): void;
    move(moveData: MovePos[]): void;
    syncPosition(): void;
    _doMove(time?: number, delta?: number): void;
    checkDirection(): void;
    private addFillEffect;
}
