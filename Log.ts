/**
 * author aaron
 */
import Globals from "./Globals";

export class Log {
    public static trace(...optionalParams: any[]): void {
        let text: string = optionalParams.join(", ");
        console.log("[Log]" + text);
        // Globals.game.debug.text("[Log]" + text,0,0);
    }

    public static debug(...optionalParams: any[]): void {
        let text: string = optionalParams.join(", ");
        Globals.game.debug.text("[Log]" + text,0,14, "#be0823");
    }
}
