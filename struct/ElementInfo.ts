import {Globals} from "../Globals";

export class ElementInfo {
    public id: number;
    public type: number;
    private _dir: number;
    public row: number;
    public col: number;
    public speed: number = 4;

    public base: any;
    public constructor(value: any) {
        this.base = value;
        this.init();
    }

    protected init(): void {
        var value: any;
        for (var key in this.base) {
            value = this.base[key];
            this[key] = value;
        }
    }

    public get path(): string {
        let s: string = "elements_" + this.type;
        return s;
    }

    public set dir(value: number) {
        this._dir = value;
    }

    public get dir(): number {
        return this._dir;
    }

    public get rows(): number {
        if (this.dir == 3 || this.dir == 7) {
            return this.config.rows;
        } else {
            return this.config.cols;
        }
    }

    public get cols(): number {
        if (this.dir == 3 || this.dir == 7) {
            return this.config.cols;
        } else {
            return this.config.rows;
        }
    }


    public get config(): any {
        return Globals.DataCenter.ElementConfig.getElementBy(this.type);
    }
}