import {RoleElement} from "./RoleElement";
import Globals from "../../../Globals";

export class SelfRoleElement extends RoleElement {
    public constructor() {
        super();
    }

    protected onUpdating(deltaTime: number): void {
        // Globals.Keyboard.onUpdate();
        // Globals.MouseMod.onUpdate();
      super.onUpdating(deltaTime);
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow;
    }
}
