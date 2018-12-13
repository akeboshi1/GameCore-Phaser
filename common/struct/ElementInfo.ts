import Globals from "../../Globals";
import {op_gameconfig} from "../../../protocol/protocols";
import {DrawArea} from "./DrawArea";

export class ElementInfo {
    public id: number;
    public type: string;
    public dir: number;
    public x: number;
    public y: number;
    public z: number;
    public name: string;
    public des: string;
    public color: number;
    public subType: number;
    public animations: op_gameconfig.IAnimation[];
    public attributes: op_gameconfig.IAttribute[];

    public walkableArea: DrawArea;
    public collisionArea: DrawArea;

    public scale: number = 1; // -1水平翻转

    public speed: number = 4;

    public animationName: string;

    public constructor() {
    }

    public get config(): op_gameconfig.IAnimation {
        if (this.animations == null) return null;
        let len: number = this.animations.length;
        if (len === 0) return null;

        for (let i = 0; i < len; i++) {
            if (this.animations[i].name === this.animationName) {
                return this.animations[i];
            }
        }
        return null;
    }

    public setInfo(base: any): void {
        let value: any;
        for (let key in base) {
            value = base[key];
            this[key] = value;
        }
    }

    public setWalkableArea(value: string, orgin: Phaser.Point): void {
        this.walkableArea = new DrawArea(value, 0x00FF00, orgin);
    }

    public setCollisionArea(value: string, orgin: Phaser.Point): void {
        this.collisionArea = new DrawArea(value, 0xFF0000, orgin);
    }
}
