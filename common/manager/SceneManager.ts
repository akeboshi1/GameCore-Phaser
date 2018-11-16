import BaseSingleton from "../../base/BaseSingleton";
import {SceneBasic} from "../../modules/Scene/view/SceneBasic";
import {SceneView} from "../../modules/Scene/view/SceneView";

export class SceneManager extends BaseSingleton {
    private mActivedScenesStack: Array<any> = [];

    public constructor() {
        super();
    }

    public get curScene(): SceneBasic {
        return (<SceneBasic>this.mActivedScenesStack[this.mActivedScenesStack.length - 1]);
    }

    public get curRoom(): SceneView {
        return (<SceneView>this.mActivedScenesStack[this.mActivedScenesStack.length - 1]);
    }

    public pushScene(scene: SceneBasic): void {
        if (this.mActivedScenesStack.length > 0) {
            (<SceneBasic>this.mActivedScenesStack[this.mActivedScenesStack.length - 1]).deactiveScene();
        }

        this.mActivedScenesStack.push(scene);

        (<SceneBasic>this.mActivedScenesStack[this.mActivedScenesStack.length - 1]).activeScene();
    }

    public popupScene(): void {
        if (this.mActivedScenesStack.length > 0) {
            (<SceneBasic>this.mActivedScenesStack[this.mActivedScenesStack.length - 1]).deactiveScene();

            this.mActivedScenesStack.pop();
        }

        if (this.mActivedScenesStack.length > 0) {
            (<SceneBasic>this.mActivedScenesStack[this.mActivedScenesStack.length - 1]).activeScene();
        }
    }

    public getScenesStackLength(): number {
        return this.mActivedScenesStack.length;
    }

    public getScenesStackAt(index: number): SceneBasic {
        return this.mActivedScenesStack[index];
    }
}
