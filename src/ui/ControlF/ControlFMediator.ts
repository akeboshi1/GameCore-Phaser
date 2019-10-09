import {IMediator} from "../baseMediator";
import { IAbstractPanel } from "../abstractPanel";
import {WorldService} from "../../game/world.service";
import {ILayerManager} from "../layer.manager";

export class ControlFMediator implements IMediator {
    readonly world: WorldService;
    constructor(layerManager: ILayerManager, scene: Phaser.Scene) {
    }

    getName(): string {
        return "";
    }

    getView(): IAbstractPanel {
        return undefined;
    }

    hide(): void {
    }

    isSceneUI(): boolean {
        return false;
    }

    isShow(): boolean {
        return false;
    }

    resize() {
    }

    show(param?: any): void {
    }

    update(param?: any): void {
    }

}
