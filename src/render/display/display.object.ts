import {IBaseDisplay} from "display";
import {IPos} from "utils";
import { ElementStateType, IDragonbonesModel, IFramesModel} from "structure";
import { IProjection } from "src/utils/projection";

export interface IDisplayObject extends IBaseDisplay {
    id: number;
    titleMask: number;
    projectionSize: IProjection;
    nodeType: number | undefined;

    showRefernceArea(area: number[][], origin: IPos);

    hideRefernceArea();

    updateTopDisplay();

    showNickname(name?: string);

    showTopDisplay(data?: ElementStateType);

    showBubble(text: string, setting: any);

    clearBubble();

    doMove(moveData: any);

    mount(ele: Phaser.GameObjects.Container, targetIndex?: number);

    unmount(ele: Phaser.GameObjects.Container);

    addEffect(display: IDisplayObject);

    removeEffect();
}
