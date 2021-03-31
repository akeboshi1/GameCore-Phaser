import { MessageHandler } from "gamecore";
import { PBpacket } from "net-socket-packet/dist/src/Packet";
import { EventType } from "structure";
import { Logger } from "utils";
import { op_client, op_virtual_world, op_def } from "pixelpai_proto";

export class TestCommandHandler extends MessageHandler {
    onAddListener() {
        this.emitter.on(EventType.TEST_COMMAND_MESSAGE, this.testFinishGuide, this);
    }
    onRemoveListener() {
        this.emitter.off(EventType.TEST_COMMAND_MESSAGE, this.testFinishGuide, this);
    }

    destroy() {
        super.destroy();
    }
    protected onTestHandler(tag: string) {

        Logger.getInstance().log("*****************     " + tag);
    }

    protected testFinishGuide() {
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_GALLARY_PROGRESS_REWARD);
        const content: op_virtual_world.OP_CLIENT_REQ_VIRTUAL_WORLD_PKT_TAKE_GALLARY_PROGRESS_REWARD = pkt.content;
        content.type = 1;
        this.connection.send(pkt);
    }
}
