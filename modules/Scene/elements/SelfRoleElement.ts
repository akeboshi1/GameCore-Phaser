import {RoleElement} from "./RoleElement";
import Globals from "../../../Globals";

export class SelfRoleElement extends RoleElement {
    public constructor() {
        super();
    }

    protected onUpdating(deltaTime: number): void {
        super.onUpdating(deltaTime);
        // Globals.Keyboard.onUpdate();
        // Globals.MouseMod.onUpdate();
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow;
    }
}
