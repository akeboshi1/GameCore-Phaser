import Globals from "../../Globals";
import {op_gameconfig} from "../../../protocol/protocols";

export class ElementInfo {
    public id: number;
    public type: number;
    public dir: number;
    public x: number;
    public y: number;
    public z: number;
    public name: string;
    public des: string;
    public color: number;
    public subType: number;
    public baseLoc: string;
    public animations: op_gameconfig.IAnimation[];
    public attributes: op_gameconfig.IAttribute[];
    public dirable: number[];

    public speed: number = 4;

    public constructor() {
    }

    public setInfo( base: any ): void {
        let value: any;
        for (let key in base) {
            value = base[key];
            this[key] = value;
        }
    }
}