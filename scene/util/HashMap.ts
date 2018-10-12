/**
 * author aaron
 * 哈希表
 */
export class HashMap {
    constructor() {
        this._keyList = [];
        this._valueList = [];
    }

    private _keyList: any[];

    public get keyList(): any[] {
        return this._keyList;
    }

    private _valueList: any[];

    public get valueList(): any[] {
        return this._valueList;
    }

    public get length(): number {
        return this._keyList.length;
    }

    public clear(): void {
        if (this._keyList.length > 0)
            this._keyList.splice(0, this._keyList.length);
        if (this._valueList.length > 0)
            this._valueList.splice(0, this._valueList.length);
    }

    public getValue(key: any): any {
        var index: number = this._keyList.indexOf(key);
        if (index >= 0) {
            return this._valueList[index];
        }
        return null;
    }

    public getFirstKey(value: any): any {
        var index: number = this._valueList.indexOf(value);
        if (index >= 0) {
            return this._keyList[index];
        }
        return null;
    }

    public has(key: any): boolean {
        var index: number = this._keyList.indexOf(key);
        if (index >= 0) {
            return true;
        }
        return false;
    }

    public add(key: any, value: any): void {
        if (key != null) {
            this.remove(key);
            this._keyList.push(key);
            this._valueList.push(value);
        }
    }

    public remove(key: any): any {
        var index: number = this._keyList.indexOf(key);
        if (index >= 0) {
            this._keyList.splice(index, 1);
            var value: any = this._valueList.splice(index, 1)[0];
            return value;
        }
        return null;
    }
}
