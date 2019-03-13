import BaseSingleton from "../../base/BaseSingleton";

export class PackageData extends BaseSingleton {
    private _initialize = false;



    public get initialize(): boolean {
        return this._initialize;
    }
}