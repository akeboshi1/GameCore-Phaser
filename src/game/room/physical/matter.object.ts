import { IPos } from "utils";
import { IRoomService } from "../room/room";
export class MatterObject {
    protected guid: number;
    protected hasBody: boolean = false;
    protected _tempVec2: any;
    protected _sensor: boolean = false;
    protected _offsetOrigin: any;
    constructor(id: number,protected mRoomService: IRoomService) {
        this.guid = id;
        this._tempVec2 = { x: 0, y: 0 };
        this._offsetOrigin = { x: 0.5, y: 0.5 };
    }

    set _offset(val: any) {
        this.mRoomService.game.peer.physicalPeer.setOffset(this.guid, val);
    }

    public async applyForce(force) {
        await this.mRoomService.game.peer.physicalPeer.applyForce(this.guid, force);
        return this;
    }

    public setVelocityX(x: number) {
        this.mRoomService.game.peer.physicalPeer.setVelocityX(this.guid);
    }

    public setVelocityY(y: number) {
        this.mRoomService.game.peer.physicalPeer.setVelocityY(this.guid);
    }

    public setVelocity(x: number, y: number) {
        x *= this.mRoomService.game.scaleRatio;
        y *= this.mRoomService.game.scaleRatio;
        this.mRoomService.game.peer.physicalPeer.setVelocity(this.guid, x, y);
    }

    public setPosition(pos: IPos) {
        // const scaleRatio = this.mRoomService.game.scaleRatio;
        // this._tempVec2.x = pos.x * scaleRatio;
        // this._tempVec2.y = pos.y * scaleRatio;
        // this.mRoomService.game.peer.physicalPeer.setPosition(this.guid, pos.x, pos.y);
    }

    public destroy() {
        this.mRoomService.game.peer.physicalPeer.destroyMatterObject(this.guid);
        this.hasBody = false;
    }

    protected setBody() {
        this.mRoomService.game.peer.physicalPeer.setBody(this.guid);
        this.hasBody = true;
    }

    protected addBody() {
        this.mRoomService.game.peer.physicalPeer.addBody(this.guid);
        this.hasBody = true;
    }

    protected removeBody() {
        this.mRoomService.game.peer.physicalPeer.removeBody(this.guid);
        this.hasBody = false;
    }

    protected async setVertices(vertexSets) {
        return await this.mRoomService.game.peer.physicalPeer.setVertices(this.guid, vertexSets);
    }

    protected getSensor() {
        return false;
    }
}
