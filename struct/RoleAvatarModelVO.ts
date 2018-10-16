export class RoleAvatarModelVO {
	public csetId: number = 1;
	public hairId: number = 1;
	public sex: number = 1;//1男孩2女孩
	public constructor() {
	}

	public get bodyModel(): string {
		return this.caclNumStr(8);
	}

	private caclNumStr(value: number): string {
        let result: string = "";
        if (value >= 0 && value < 10)
            result = "000" + value;
        if (value >= 10 && value < 100)
            result = "00" + value;
        if (value >= 100 && value < 1000)
            result = "0" + value;
        return result;
    }

	public changeAvatarModelByModeVO(value: RoleAvatarModelVO): void {
		if (value.csetId > 0)
			this.csetId = value.csetId;
		if (value.hairId > 0)
			this.hairId = value.hairId;
	}
}