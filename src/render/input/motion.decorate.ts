import {MotionBase, MotionType} from "./motion.base";
import {Render} from "../render";

export class MotionDecorate extends MotionBase {
    constructor(protected render: Render) {
        super(render);

        this.type = MotionType.Decorate;
    }

    protected async onPointerUpHandler(pointer: Phaser.Input.Pointer): Promise<void> {

    }

    protected async onPointerMoveHandler(pointer: Phaser.Input.Pointer): Promise<void> {

    }

    protected async onPointerDownHandler(pointer: Phaser.Input.Pointer): Promise<void> {

    }

    protected onPointeroutHandler() {

    }

    protected onGameObjectUpHandler(pointer, gameObject) {

    }

    protected onGameObjectDownHandler(pointer, gameObject) {

    }
}
