import { Game } from "gamecore";
import { EventType } from "structure";
import { RedDotTypeEnum } from "custom_proto";
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
        this.mails = [RedDotTypeEnum.MAIL_REDDOTSTATUS];
        this.gallerys = [RedDotTypeEnum.GALLERY_REDDOTSTATUS, RedDotTypeEnum.GALLERY_PROGRESSREWARD_REDDOTSTATUS, RedDotTypeEnum.GALLERY_COLLECTIONREWARD_REDDOTSTATUS, RedDotTypeEnum.GALLERY_BADGEREWARD_REDDOTSTATUS];
        this.orders = [RedDotTypeEnum.ORDER_REDDOTSTATUS];
        this.packages = [RedDotTypeEnum.PACKAGE_REDDOTSTATUS];
        this.tasks = [RedDotTypeEnum.DAILY_QUEST_REDDOTSTATUS, RedDotTypeEnum.MAIN_QUEST_REDDOTSTATUS];
        this.friends = [RedDotTypeEnum.FRIEND_REDDOTSTATUS];
        this.dresss = [RedDotTypeEnum.DRESS_REDDOTSTATUS];
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
        const allTypes = this.getRedTypes();
        const mainTypes = [];
        const list = content.list;
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
            mainTypes.push(redType);
        }
        this.redDataMap.set(MainUIRedType.MAIN, mainTypes);
        for (const temp of allTypes) {
            const eventType = this.getRedEventType(temp);
            if (!eventType) continue;
            let redArr = this.redDataMap.get(temp);
            redArr = redArr || [];
            this.game.emitter.emit(eventType, redArr);
        }
        this.game.emitter.emit(RedEventType.MAIN_PANEL_RED, mainTypes);
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
    protected getRedTypes() {
        const regPos = /^\d+(\.\d+)?$/;
        const redTypse = [];
        for (const key in MainUIRedType) {
            if (regPos.test(key)) {
                redTypse.push(Number(key));
            }
        }
        return redTypse;
    }

}
