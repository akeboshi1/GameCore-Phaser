import Globals from "../Globals";

export class RoleAvatarModelVO {
	public csetId: number = 1;
	public hairId: number = 1;
	public sex: number = 1;//1男孩2女孩
	public constructor() {
	}

	public get bodyModel(): string {
		return Globals.Tool.caclNumStr(8);
	}

	public changeAvatarModelByModeVO(value: RoleAvatarModelVO): void {
		if (value.csetId > 0)
			this.csetId = value.csetId;
		if (value.hairId > 0)
			this.hairId = value.hairId;
	}
}