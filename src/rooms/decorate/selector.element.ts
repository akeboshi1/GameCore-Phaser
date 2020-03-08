import { IRoomService } from "../room";
import { Element } from "../element/element";

export class SelectorElement {
    private mScene: Phaser.Scene;
    constructor(private roomService: IRoomService, private element: Element) {
        this.mScene = roomService.scene;
    }

    turnElement() {
        // if (!this.mDisplay) {
        //     return;
        // }
        // const sprite = this.sprite;
        // sprite.turn();
        // if (this.mDisplay) this.mDisplay.play(sprite.currentAnimation);
        this.element.turn();
        // this.mDisplay.play(sprite.currentAnimationName);
        // this.mDisplay.setDirection(sprite.direction);
        this.checkCanPut();
    }

    destroy() {

    }

    private checkCanPut() {
        // if (!this.roomService || !this.mSprite || !this.mDisplay) {
        //     return;
        // }
        // if (this.roomService.canPut(this.mSprite.pos, this.mSprite.currentCollisionArea, this.mSprite.currentCollisionPoint)) {
        //     this.mDisplay.alpha = 1;
        // } else {
        //     this.mDisplay.alpha = 0.6;
        // }
    }
}
