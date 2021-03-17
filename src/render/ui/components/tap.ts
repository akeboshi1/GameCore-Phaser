import { ClickEvent } from "apowophaserui";

export class Tap {
    private isDown: boolean = false;
    constructor(private gameobject: Phaser.GameObjects.GameObject) {
        this.addListener();
    }

    addListener() {
        this.gameobject.on("pointerdown", this.onGameObjectDownHandler, this);
        this.gameobject.on("pointerup", this.onGameObjectUpHandler, this);
        this.gameobject.on("pointerout", this.onGameObjectOutHandler, this);
    }

    removeListener() {
        this.gameobject.off("pointerdown", this.onGameObjectDownHandler, this);
        this.gameobject.off("pointerup", this.onGameObjectUpHandler, this);
        this.gameobject.off("pointerout", this.onGameObjectOutHandler, this);
    }

    private onGameObjectDownHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        this.isDown = true;
    }

    private onGameObjectUpHandler(pointer: Phaser.Input.Pointer, gameobject: Phaser.GameObjects.GameObject) {
        if (!this.isDown) {
            return;
        }
        this.isDown = false;
        this.gameobject.emit(ClickEvent.Tap, pointer, gameobject);
    }

    private onGameObjectOutHandler() {
        this.isDown = false;
    }
}
