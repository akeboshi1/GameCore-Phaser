import { BasicSceneEntity } from "../../../base/BasicSceneEntity";
import Globals from "../../../Globals";
import {ElementInfo}  from "../../../common/struct/ElementInfo";
import BasicElementDisplay from "./BasicElementDisplay";

export default class BasicElement extends BasicSceneEntity {

    protected createDisplay() {
         let element = new BasicElementDisplay(Globals.game);
         return element;
    }

    protected onInitialize() {
        super.onInitialize();
        this.loadModel(this.elementData.path);
    }

    public loadModel(url: string) {
        (<BasicElementDisplay>this.display).loadModel(url, this);
    }

    public get elementData(): ElementInfo {
        return this.data;
    }
}