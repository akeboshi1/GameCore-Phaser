export class Tool {
    public static formatChineseString(context: string, fontSize: number | string, lineWidth: number) {
        if (typeof fontSize === "string") fontSize = parseInt(fontSize, 10);
        const wrapWidth = Math.floor(lineWidth / fontSize);
        return this.chunk(context, wrapWidth).join(" ");
    }

    private static chunk(str, n) {
        const result = [];
        for (let i = 0; i < str.length; i += n) {
            result.push(str.substr(i, n));
        }
        return result;
    }
}
