import { EventDispatcher } from "utils";
import { Game } from "../game";
import { BaseHandler } from "./base.handler";
export class ElementDataManager extends BaseHandler {
    private mEleMap: Map<number, string[]>;
    private mContextMap: Map<any, number[]>;
    constructor(game: Game) {
        super(game);
        this.mEleMap = new Map();
        this.mContextMap = new Map();
    }
    clear() {
        super.clear();
        this.mEleMap.clear();
        this.mContextMap.clear();
    }

    destroy() {
        super.destroy();
        this.mEleMap.clear();
        this.mContextMap.clear();
        this.mEleMap = undefined;
        this.mContextMap = undefined;
    }
    onAction(id: number, event: string, fn: Function, context: any) {
        this.addMapByID(id, event);
        this.addMapByContext(context, id);
        this.on(event, fn, context);
    }

    offAction(id: number, event: string, fn: Function, context: any) {
        if (context !== undefined) {
            this.removeMapByContext(context, id);
            this.off(event, fn, context);
        } else if (id !== undefined) {
            const contexArr = this.getContextByID(id);
            for (const contex of contexArr) {
                this.removeMapByContext(contex, id);
                this.off(event, fn, context);
            }
        }

    }
    actionEmitter(id: number, event: string, data?: any) {
        if (this.hasAction(id, event)) {
            this.emit(event, data);
        }
    }

    hasAction(id: any, event?: string) {
        if (this.mEleMap.has(id)) {
            const value = this.mEleMap.get(id);
            if (value.indexOf(event) !== -1) {
                return true;
            }
        }
        return false;
    }

    private addMapByID(id: number, event: string) {
        if (this.mEleMap.has(id)) {
            const value = this.mEleMap.get(id);
            if (value && value.indexOf(event) === -1) {
                value.push(event);
            }
        } else {
            const value = [];
            this.mEleMap.set(id, value);
            value.push(event);
        }
    }

    private removeMapByID(id: number, event: string) {
        if (this.mEleMap.has(id)) {
            if (event === undefined) {
                this.mEleMap.delete(id);
            } else {
                const value = this.mEleMap.get(id);
                if (value) {
                    const index = value.indexOf(event);
                    if (index !== -1) {
                        value.splice(index, 1);
                    }
                    if (value.length === 0) {
                        this.mEleMap.delete(id);
                    }
                }
            }
        }
    }

    private addMapByContext(context: any, id: number) {
        if (this.mContextMap.has(context)) {
            const value = this.mContextMap.get(context);
            if (value && value.indexOf(id) === -1) {
                value.push(id);
            }
        } else {
            const value = [];
            this.mContextMap.set(context, value);
            value.push(id);
        }
    }
    private removeMapByContext(context: any, id: number, event?: string) {
        if (this.mContextMap.has(context)) {
            if (id === undefined) {
                const ids = this.mContextMap.get(context);
                this.mContextMap.delete(context);
                if (ids) {
                    for (const temp of ids) {
                        this.removeMapByID(temp, event);
                    }
                }
            } else {
                this.removeMapByID(id, event);
                const value = this.mContextMap.get(context);
                if (value) {
                    const index = value.indexOf(id);
                    if (index !== -1) {
                        value.splice(index, 1);
                    }
                    if (value.length === 0) {
                        this.mContextMap.delete(id);
                    }
                }
            }
        }
    }

    private getContextByID(id: number) {
        const arr = [];
        this.mContextMap.forEach((value, key) => {
            if (value && value.indexOf(id) !== -1) {
                arr.push(key);
            }
        });
        return arr;
    }
}
