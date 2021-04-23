import { BaseLayer } from "./base.layer";

export class GroundLayer extends BaseLayer {
    private mSortDirty: boolean = false;

    public add(child: Phaser.GameObjects.GameObject) {
        super.add(child);
        this.mSortDirty = true;
        return this;
    }
    public sortLayer() {
        if (!this.mSortDirty) {
            return;
        }
        this.mSortDirty = false;
        this.sort("depth", (displayA: any, displayB: any) => {
            // 游戏中所有元素的sortz为1，只在同一高度上，所以下面公式中加入sortz暂时不影响排序，后期sortz会有变化
            return displayA.y + displayA.z > displayB.y + displayB.z;
        });
    }
}
