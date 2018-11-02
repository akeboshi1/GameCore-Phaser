/**
 * author aaron
 */
import BaseSingleton from "../../base/BaseSingleton";
import Globals from "../../Globals";

export class MessageCenter extends BaseSingleton {
    private _typeList: string[];
    private _listenerList: Function[];
    private _thisObjList: any[];
    private _groupList: string[];

    public constructor() {
        super();
        this._typeList = [];
        this._listenerList = [];
        this._thisObjList = [];
        this._groupList = [];
    }

    public addListener(type: string, listener: Function, thisObj: any, group: string = null): void {
        if (type && listener && type.length > 0) {
            this.removeListener(type, listener, thisObj);
            this._typeList.push(type);
            this._listenerList.push(listener);
            this._thisObjList.push(thisObj);
            this._groupList.push(group);
        }
    }

    public removeListener(type: string, listener: Function, thisObj: any): void {
        let idx: number = this._listenerList.indexOf(listener);
        if (idx >= 0 && this._typeList[idx] === type && this._thisObjList[idx] === thisObj) {
            this.removeByIdx(idx);
        }
    }

    public removeByType(type: string): void {
        if (type) {
            for (let idx: number = this._typeList.length - 1; idx >= 0; idx--) {
                if (this._typeList[idx] === type) {
                    this.removeByIdx(idx);
                }
            }
        }
    }

    public removeByThisObj(thisObj: any): void {
        if (thisObj) {
            for (let idx: number = this._thisObjList.length - 1; idx >= 0; idx--) {
                if (this._thisObjList[idx] === thisObj) {
                    this.removeByIdx(idx);
                }
            }
        }
    }

    public removeByGroup(group: string): void {
        if (group) {
            for (let idx: number = this._groupList.length - 1; idx >= 0; idx--) {
                if (this._groupList[idx] === group) {
                    this.removeByIdx(idx);
                }
            }
        }
    }

    public dispatch(type: string, data: any = null): void {
        let idx: number;
        let dispatchListenerList: Function[] = [];
        let dispatchThisObjList: any[] = [];
        for (idx = 0; idx < this._typeList.length; idx++) {
            if (this._typeList[idx] === type) {
                dispatchListenerList.push(this._listenerList[idx]);
                dispatchThisObjList.push(this._thisObjList[idx]);
            }
        }
        if (dispatchListenerList.length > 0) {
            let listener: Function;
            let thisObj: any;
            for (idx = 0; idx < dispatchListenerList.length; idx++) {
                listener = dispatchListenerList[idx];
                thisObj = dispatchThisObjList[idx];
                if (data === null) {
                    listener.apply(thisObj);
                } else {
                    listener.apply(thisObj, [data]);
                }
            }
            Globals.Tool.clearArray(dispatchListenerList);
            Globals.Tool.clearArray(dispatchThisObjList);
        }
    }

    private removeByIdx(idx: number): void {
        this._typeList.splice(idx, 1);
        this._listenerList.splice(idx, 1);
        this._thisObjList.splice(idx, 1);
        this._groupList.splice(idx, 1);
    }
}

