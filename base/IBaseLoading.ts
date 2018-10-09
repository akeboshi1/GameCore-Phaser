/**
 * Loading接口
 * author aaron
 */
namespace Core {
    export interface IBaseLoading {
        show(resGroupName: string): void;
        hide(): void;
        destroy(): void;
    }
}