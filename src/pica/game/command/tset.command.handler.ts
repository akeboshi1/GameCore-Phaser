import { MessageHandler } from "gamecore";
import { EventType } from "structure";
import { Logger } from "utils";

export class TestCommandHandler extends MessageHandler {
    onAddListener() {
        this.emitter.on(EventType.TEST_COMMAND_MESSAGE, this.onTestHandler, this);
    }
    onRemoveListener() {
        this.emitter.off(EventType.TEST_COMMAND_MESSAGE, this.onTestHandler, this);
    }

    destroy() {
        super.destroy();
    }
    protected onTestHandler(tag: string) {
        Logger.getInstance().log("*****************     " + tag);
    }
}
