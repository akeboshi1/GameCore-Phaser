import { AvatarSuit, RunningAnimation, Handler } from "structure";
import { DragonbonesDisplay } from "./dragonbones.display";
export declare class UIDragonbonesDisplay extends DragonbonesDisplay {
    protected mInteractive: boolean;
    private mComplHandler;
    private AniAction;
    private isBack;
    play(val: RunningAnimation): void;
    setBack(back: boolean): void;
    setCompleteHandler(compl: Handler): void;
    setSuits(suits: AvatarSuit[]): void;
    getAnimationName(name: any): any;
    get back(): boolean;
    displayCreated(): void;
    protected onArmatureLoopComplete(event: dragonBones.EventObject): void;
}
