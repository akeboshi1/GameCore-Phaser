import {RoleElement} from "./RoleElement";

export class SelfRoleElement extends RoleElement {
    public constructor() {
        super();
    }

    public initialize(): void {
        super.initialize();
        // follow camera
        if (this.camera) {
            this.camera.follow(this.display);
        }
    }

    public isInScreen(): boolean {
        return true;
    }

    public onClear(): void {
        super.onClear();
        // unFollow camera
        if (this.camera) {
            this.camera.unfollow();
        }
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
