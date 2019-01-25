import {RoleElement} from "./RoleElement";
import Globals from "../../../Globals";
import {Const} from "../../../common/const/Const";

export class SelfRoleElement extends RoleElement {
    public constructor() {
        super();
    }

    public initialize(): void {
        super.initialize();
        // follow camera
        this.camera.follow(this.display);
    }

    public isInScreen(): boolean {
        return true;
    }

    public onClear(): void {
        super.onClear();
        // unFollow camera
        this.camera.unfollow();
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
