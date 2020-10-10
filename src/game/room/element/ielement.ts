import { IRoomService } from "../room";
import { LogicPos } from "../../../utils/logic.pos";
import { op_client } from "pixelpai_proto";
import { IFramesModel } from "../display/frame/iframe.model";
import { ISprite } from "../../../render/rooms/element/sprite";
export interface IElement {
    readonly id: number;
    readonly dir: number;
    readonly roomService: IRoomService;

    model: ISprite;

    update();

    setModel(model: ISprite);

    updateModel(model: op_client.ISprite);

    play(animationName: string): void;

    setPosition(p: LogicPos): void;

    getPosition(): LogicPos;

    getPosition45(): LogicPos;

    setDirection(val: number): void;

    getDirection(): number;

    showEffected(displayInfo: IFramesModel);

    showNickname();

    hideNickname();

    // scaleTween();

    turn();

    setAlpha(val: number);

    setQueue(queue: op_client.IChangeAnimation[]);

    mount(ele: IElement): this;

    unmount(): this;

    addMount(ele: IElement, index?: number): this;

    removeMount(ele: IElement): this;
}
