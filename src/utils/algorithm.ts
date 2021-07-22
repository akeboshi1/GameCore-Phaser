export class Algorithm {
    public static median(arr: number[]): number {
        const op_arr = arr.sort((x, y) => {
            return y - x;
        });
        const med = Math.floor(op_arr.length / 2);
        if (op_arr.length % 2 === 0) {
            const h = op_arr[med - 1]
                , l = op_arr[med];
            return (h + l) / 2;
        }
        return op_arr[med];
    }
}
