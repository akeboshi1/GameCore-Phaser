/**
 * author aaron
 */
export class Log {
    public static trace(...optionalParams: any[]): void {
        let text: string = optionalParams.join(", ");
        console.log("[Log]" + text);
        // Globals.game.debug.text("[Log]" + text,0,0);
    }
}
