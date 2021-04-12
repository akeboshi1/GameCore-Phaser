import { ElementBaseAction } from "./element.base.action";
export declare class TAGElementAction extends ElementBaseAction {
    actionTag: string;
    executeAction(): void;
    private executeMine;
    private executeCrop;
    private executeCollect;
    private executeOpenChest;
}
