/**
 * author aaron
 */
export class Log {
    public static trace(...optionalParams: any[]): void {
        var text: string = optionalParams.join(", ");
        console.log("[Log]" + text);
    }
}
