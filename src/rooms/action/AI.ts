import { AIAction } from "./AIAction";
import { Element } from "../element/element";
import { ActionGroup } from "./ActionGroup";

export class AI extends AIAction {

    constructor(owner: Element) {
        super();
        this.owner = owner;
        this.group = new ActionGroup();
    }

    public execute() {
        this.group.nextAction();
    }

    public nextAction() {
        this.group.nextAction();
    }

    public addAction(action: AIAction, isbreak: boolean = false) {
        action.group = this.group;
        action.owner = this.owner;
        if (isbreak && this.group.current && this.group.current.isBreak) {
            this.group.stopCurrentAction();
        }

        this.group.addAction(action);
        if (!this.group.isExecuting())
            this.group.nextAction();
    }

    public breakAction() {
        this.group.breakAction();
    }

    public destroy() {
        this.group.destroy();
        this.owner = null;
    }

}
