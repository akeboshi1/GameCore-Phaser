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

    public onDispose(): void {
        super.onDispose();
        // unFollow camera
        if (this.camera) {
            this.camera.unfollow();
        }
    }

    protected checkIsValidDisplayAvatar(): void {
        this.isValidDisplay = this.isCanShow;
    }
}
