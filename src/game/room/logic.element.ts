import { IRoomService } from "./room";
import { ISprite } from "../../render/rooms/element/sprite";
import { op_client } from "pixelpai_proto";
import { IFramesModel } from "./displayManager/frame/iframe.model";
import { LogicPos } from "../../utils/logic.pos";
export interface ILogicElement {
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

    scaleTween();

    turn();

    setAlpha(val: number);

    setQueue(queue: op_client.IChangeAnimation[]);

    mount(ele: ILogicElement): this;

    unmount(): this;

    addMount(ele: ILogicElement, index?: number): this;

    removeMount(ele: ILogicElement): this;
}