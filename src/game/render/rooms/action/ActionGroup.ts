import { AIAction } from "./AIAction";
import { IDispose } from "./IDispose";
import { Handler } from "../../../../utils/Handler";

export class ActionGroup implements IDispose {
    public list: AIAction[];
    public current: AIAction;
    public sleepAction: AIAction;
    public compHandler: Handler;
    public addAction(action: AIAction) {
        if (!this.list) this.list = [];
        this.list.push(action);
    }

    public nextAction() {
        if (this.current) {
            this.current.destroy();
            this.current = null;
        }
        if (this.list && this.list.length > 0) {
            this.current = this.list.splice(0, 1)[0];
            this.current.isEnd = false;
            this.current.execute();
        }
    }

    public setComplHandler(handler: Handler) {
        this.compHandler = handler;
    }

    public clear() {
        if (this.list) {
            for (const action of this.list) {
                action.destroy();
            }
            this.list.length = 0;
        }
        if (this.current) {
            this.current.destroy();
            this.current = null;
        }

    }

    public stopCurrentAction() {
        if (this.current) {
            this.current.destroy();
            this.current = null;
        }
    }

    public isExecuting(): boolean {
        if (this.current && !this.current.isEnd) return true;
        return false;
    }

    public hasLast(): boolean {
        if (!this.list || this.list.length === 0) return false;
        else return true;
    }

    public breakAction() {
        for (const action of this.list) {
            action.destroy();
        }
        this.list.length = 0;
        if (this.current && this.current.isBreak) {
            this.current.destroy();
            this.current = null;
        }
    }

    public destroy() {
        this.clear();
        this.list = null;
        if (this.sleepAction) {
            this.sleepAction.destroy();
            this.sleepAction = null;
        }
        if (this.compHandler) {
            this.compHandler.clear();
            this.compHandler = null;
        }
    }
}
