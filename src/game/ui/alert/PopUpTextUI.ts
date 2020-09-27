import { WorldService } from "../../game/world.service";
import { Size } from "../../game/core/utils/size";
import { BasePanel } from "../components/BasePanel";

export class PopUpTextUI extends BasePanel {
    constructor(world: WorldService, scene: Phaser.Scene) {
        super(scene, world);
        this.mWorld = world;
        this.scene = scene;
        this.disInteractive();
    }

    public show(param?: any) {
        const size: Size = this.mWorld.getSize();
        const text = this.scene.make.text({
            x: 0,
            y: 0,
            text: param,
            style: { fill: "#FF0000", fontSize: 20 }
        });
        this.add(text);
        this.setSize(text.width, text.height);
        this.setPosition(size.width - this.width >> 1, size.height >> 1);
        this.scene.tweens.add({
            targets: this,
            duration: 1000,
            ease: "Linear",
            props: {
                y: { value: (size.height >> 1) - 80 },
                alhpa: { value: 0 },
            },
            onComplete: (tween, targets, element) => {
                this.destroy();
            },
            onCompleteParams: [this],
        });
        super.show(param);
    }

    public resize() {
        if (!this.mInitialized) return;
        const size: Size = this.mWorld.getSize();
        this.x = size.width - this.width >> 1;
    }

    public destroy() {
        super.destroy();
    }
}
