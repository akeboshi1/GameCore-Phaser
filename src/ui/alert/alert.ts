import { IAbstractPanel } from "../abstractPanel";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";

export class Alert implements IAbstractPanel {
    public isShow: boolean;
    private mWorld: WorldService;
    private mScene: Phaser.Scene;
    private mParentCon: Phaser.GameObjects.Container;
    constructor(world: WorldService, scene: Phaser.Scene) {
        this.mWorld = world;
        this.mScene = scene;
    }

    public show(param?: any) {
        const size: Size = this.mWorld.getSize();
        this.mParentCon = this.mScene.add.container(size.width >> 1, size.height >> 1);
        const text = this.mScene.make.text({
            x: 0,
            y: 0,
            text: param,
            style: { fill: "#FF0000", fontSize: 20 }
        });
        this.mParentCon.add(text);
        this.mParentCon.setSize(text.width, text.height);
        this.mParentCon.x = size.width - this.mParentCon.width >> 1;
        this.mScene.tweens.add({
            targets: this.mParentCon,
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
    }

    public hide() {

    }

    public resize() {

    }

    public destroy() {
        if (this.mParentCon) this.mParentCon.destroy(true);
    }

    public update() {

    }
}
