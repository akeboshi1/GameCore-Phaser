import { IDispose } from "./IDispose";
import { Element } from "../rooms/element/element";
import { ActionGroup } from "./ActionGroup";

export abstract class AIAction implements IDispose {

    public owner: Element;
    public group: ActionGroup;
    public isBreak: boolean = true;
    public isEnd: boolean = false;
    public nextAction() {
        this.isEnd = true;
        if (this.group) {
            this.group.nextAction();
        }
    }
    public abstract execute();

    public dispose() {
        this.owner = null;
        this.group = null;
    }
}
