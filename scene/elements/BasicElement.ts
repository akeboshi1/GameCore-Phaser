import { BasicSceneEntity } from "../../base/BasicSceneEntity";
import { BasicViewElement } from "../../base/BasicViewElement";
import BasicElementDisplay from "./BasicElementDisplay";
import Globals from "../../Globals";
import {ElementInfo}  from "../../struct/ElementInfo";

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