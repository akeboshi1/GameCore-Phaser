export interface ITickedObject {
    onTick(deltaTime: number): void;
}