import {op_client, op_gameconfig, op_def} from "pixelpai_proto";
import {SlotInfo} from "./SlotInfo";
import IActor = op_client.IActor;

export class PlayerInfo implements IActor {
    /** Character id. */
    public id: number;

    /** Character name. */
    public name: string;

    public nickname: string;

    /** Character maxNum. */
    public maxNum: number;

    /** Character camp. */
    public camp: string;

    public avatar?: (op_gameconfig.IAvatar | null);

    /** Character attributes. */
    public attributes: op_gameconfig.IAttribute[];

    /** Character package. */
    public package: op_gameconfig.IPackage[];

    /** Character sceneId. */
    public sceneId: number;

    /** Character x. */
    public x: number;

    /** Character y. */
    public y: number;

    /** Character z. */
    public z: number;

    /** Character avatarDir. */
    public avatarDir: number;

    /** Character walkableArea. */
    public walkableArea: string;

    /** Character collisionArea. */
    public collisionArea: string;

    /** Character originPoint. */
    public originPoint: number[];

    /** Character walkOriginPoint. */
    public walkOriginPoint: number[];

    /** Actor slot */
    public slot?: (op_gameconfig.ISlot[] | null);

    public uuid = 0; // 玩家ID

    public displayBadgeCards: op_def.IBadgeCard[];

    protected _originWalkPoint: Phaser.Point;

    public constructor() {
    }

    public setInfo(obj: any): void {
        let value: any;
        for (let key in obj) {
            value = obj[key];
            if (value) {
                this[key] = value;
            }
        }
    }

    public getSlots(): SlotInfo[] {
        if (this.slot === undefined) return null;
        let len = this.slot.length;
        let info: SlotInfo;
        let attri: op_gameconfig.IAttribute;
        let slots: SlotInfo[] = [];
        for (let i = 0; i < len; i++) {
            info = new SlotInfo();
            attri = this.getAttriByKey(this.slot[i].bondAttrCurkey);
            info.bondAttrCur = attri.intVal;
            attri = this.getAttriByKey(this.slot[i].bondAttrMaxkey);
            info.bondAttrMax = attri.intVal;
            info.bondName = this.slot[i].bondName;
            info.color = this.slot[i].color;
            slots.push(info);
        }
        return slots;
    }

    public getSlotByName(name: string): SlotInfo {
        if (this.slot === undefined) return null;
        let len = this.slot.length;
        let info: SlotInfo;
        let attri: op_gameconfig.IAttribute;
        for (let i = 0; i < len; i++) {
            if (this.slot[i].bondName === name) {
                info = new SlotInfo();
                attri = this.getAttriByKey(this.slot[i].bondAttrCurkey);
                info.bondAttrCur = attri.intVal;
                attri = this.getAttriByKey(this.slot[i].bondAttrMaxkey);
                info.bondAttrMax = attri.intVal;
                info.bondName = this.slot[i].bondName;
                info.color = this.slot[i].color;
                return info;
            }
        }
        return null;
    }

    public getAttriByKey(key: string): op_gameconfig.IAttribute {
        if (this.attributes === undefined) return null;
        let len = this.attributes.length;
        for (let i = 0; i < len; i++) {
            if (this.attributes[i].name === key) {
                return this.attributes[i];
            }
        }
        return null;
    }

    protected _originCollisionPoint: Phaser.Point;

    public get originCollisionPoint(): Phaser.Point {
        return this._originCollisionPoint;
    }

    public get originWalkPoint(): Phaser.Point {
        return this._originWalkPoint;
    }

    public setOriginCollisionPoint(value: number[] | null): void {
        if (this._originCollisionPoint === undefined) {
            this._originCollisionPoint = new Phaser.Point();
        }
        if (value && value.length > 1) {
            this._originCollisionPoint.x = value[0];
            this._originCollisionPoint.y = value[1];
        }
    }

    public setOriginWalkPoint(value: number[] | null): void {
        if (this._originWalkPoint === undefined) {
            this._originWalkPoint = new Phaser.Point();
        }
        if (value && value.length > 1) {
            this._originWalkPoint.x = value[0];
            this._originWalkPoint.y = value[1];
        }
    }
}

