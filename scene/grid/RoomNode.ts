import {ANode} from "./ANode";

export class RoomNode extends ANode {
    public nodeContent: any;
    public terrainContent: any;

    public constructor(x: number, y: number) {
        super(x, y);
    }

    private _isMaskAlpha: boolean = false;

    public get isMaskAlpha(): boolean {
        return this._isMaskAlpha;
    }

    public set isMaskAlpha(value: boolean) {
        this._isMaskAlpha = value;
    }

    private _terrainType: number;

    public get terrainType(): number {
        return this._terrainType;
    }

    public set terrainType(value: number) {
        this._terrainType = value;
    }
}