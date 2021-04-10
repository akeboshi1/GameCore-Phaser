import { BasicScene } from "baseRender";

export class RoomScene extends BasicScene {
    protected mRoomID: any;
    public init(data: any) {
        super.init(data);
        if (data) {
            this.mRoomID = data.roomid;
        }
    }

    public create() {
        this.initListener();
        super.create();
    }

    protected initListener() {
        this.input.on("pointerdown", this.onPointerDownHandler, this);
        this.input.on("pointerup", this.onPointerUpHandler, this);
        this.input.on("gameout", this.onGameOutHandler, this);
    }

    protected onGameOutHandler() {
        this.input.off("pointerdown", this.onPointerDownHandler, this);
        this.input.off("pointerup", this.onPointerUpHandler, this);
        this.input.off("gameout", this.onGameOutHandler, this);
    }

    protected onPointerDownHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
    }

    protected onPointerUpHandler(pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[]) {
    }

}
