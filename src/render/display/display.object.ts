import {IBaseDisplay} from "display";
import {IPos} from "utils";
import {DisplayField, ElementStateType, IDragonbonesModel, IFramesModel} from "structure";

export interface IDisplayObject extends IBaseDisplay {
    id: number;
    titleMask: number;
    projectionSize: IPos;
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
