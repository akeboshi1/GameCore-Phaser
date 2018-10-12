import {ANode} from "./ANode";

export class RoomNode extends ANode {
	private _isMaskAlpha: boolean = false;

	public nodeContent: any;

	public terrainContent: any;

	private _terrainType: number;

	public constructor(x: number, y: number) {
		super(x, y);
	}

	public set isMaskAlpha(value: boolean) {
		this._isMaskAlpha = value;
	}

	public get isMaskAlpha(): boolean {
		return this._isMaskAlpha;
	}

	public get terrainType(): number {
		return this._terrainType;
	}

	public set terrainType(value: number) {
		this._terrainType = value;
	}
}