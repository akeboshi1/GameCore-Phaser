import { Game } from "gamecore";
import { EventType } from "structure";
import { op_client, op_virtual_world, op_def, op_gameconfig, op_pkt_def } from "pixelpai_proto";
import { MainUIRedType, RedEventType } from "picaStructure";
export class RedSystemMananger {
    protected redDataMap: Map<number, number[]> = new Map();
    protected mails: number[];
    protected gallerys: number[];
    protected packages: number[];
    protected orders: number[];
    protected tasks: number[];
    protected friends: number[];
    protected dresss: number[];
    constructor(protected game: Game) {
        this.game.emitter.on(EventType.RETURN_UPDATE_RED_SYSTEM, this.onRedSystemHandler, this);
        this.mails = [op_def.RedDotTypeEnum.MAIL_REDDOTSTATUS];
        this.gallerys = [op_def.RedDotTypeEnum.GALLERY_REDDOTSTATUS, op_def.RedDotTypeEnum.GALLERY_PROGRESSREWARD_REDDOTSTATUS, op_def.RedDotTypeEnum.GALLERY_COLLECTIONREWARD_REDDOTSTATUS];
        this.orders = [op_def.RedDotTypeEnum.ORDER_REDDOTSTATUS];
        this.packages = [op_def.RedDotTypeEnum.PACKAGE_REDDOTSTATUS];
        this.tasks = [op_def.RedDotTypeEnum.DAILY_QUEST_REDDOTSTATUS, op_def.RedDotTypeEnum.MAIN_QUEST_REDDOTSTATUS];
        this.friends = [op_def.RedDotTypeEnum.FRIEND_REDDOTSTATUS];
        this.dresss = [op_def.RedDotTypeEnum.DRESS_REDDOTSTATUS];
    }
    destory() {
        if (this.game.emitter) this.game.emitter.off(EventType.RETURN_UPDATE_RED_SYSTEM, this.onRedSystemHandler, this);
        this.redDataMap.clear();
    }

    public getRedPoints(type) {
        if (this.redDataMap.has(type)) {
            return this.redDataMap.get(type);
        } else return [];
    }
    protected onRedSystemHandler(content: any) {
        this.redDataMap.clear();
        const updateTypes = [];
        const list = content.list;
        // const list = [op_def.RedDotTypeEnum.MAIL_REDDOTSTATUS, op_def.RedDotTypeEnum.GALLERY_REDDOTSTATUS, op_def.RedDotTypeEnum.GALLERY_PROGRESSREWARD_REDDOTSTATUS, op_def.RedDotTypeEnum.GALLERY_COLLECTIONREWARD_REDDOTSTATUS,
        // op_def.RedDotTypeEnum.MAIN_QUEST_REDDOTSTATUS];
        for (const type of list) {
            const redType = this.getRedMapType(type);
            let temps: number[];
            if (!this.redDataMap.has(redType)) {
                temps = [];
                this.redDataMap.set(redType, temps);
            } else {
                temps = this.redDataMap.get(redType);
            }
            temps.push(type);
            updateTypes.push(redType);
        }
        this.redDataMap.set(MainUIRedType.MAIN, updateTypes);
        for (const temp of updateTypes) {
            const eventType = this.getRedEventType(temp);
            this.game.emitter.emit(eventType, this.redDataMap.get(temp));
        }
        this.game.emitter.emit(RedEventType.MAIN_PANEL_RED, updateTypes);
    }

    protected getRedMapType(type: number) {
        if (this.mails.indexOf(type) !== -1) {
            return MainUIRedType.MAIL;
        } else if (this.gallerys.indexOf(type) !== -1) {
            return MainUIRedType.GALLERY;
        } else if (this.orders.indexOf(type) !== -1) {
            return MainUIRedType.ORDER;
        } else if (this.packages.indexOf(type) !== -1) {
            return MainUIRedType.PACKAGE;
        } else if (this.tasks.indexOf(type) !== -1) {
            return MainUIRedType.TASK;
        } else if (this.friends.indexOf(type) !== -1) {
            return MainUIRedType.FRIEND;
        } else if (this.dresss.indexOf(type) !== -1) {
            return MainUIRedType.DRESS;
        }
    }

    protected getRedEventType(type: number) {
        if (type === MainUIRedType.GALLERY) return RedEventType.GALLERY_PANEL_RED;
        else if (type === MainUIRedType.TASK) return RedEventType.TASK_PANEL_RED;
        return undefined;
    }

}
