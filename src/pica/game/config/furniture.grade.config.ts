import { BaseConfigData } from "gamecore";
import { IFurnitureGrade } from "../../structure";
import { Logger } from "utils";

export class FurnitureGradeConfig extends BaseConfigData {

    public gradeMap: Map<number, IFurnitureGrade>;
    public get(id: number): IFurnitureGrade {
        if (this.gradeMap.has(id)) {
            return this.gradeMap.get(id);
        } else {
            Logger.getInstance().error(`furniture.grade表未配置ID为:${id}的数据`);
            return undefined;
        }
    }
    public parseJson(json) {
        this.gradeMap = new Map();
        const grades = json["furnitureGrade"];
        for (const temp of grades) {
            this.gradeMap.set(temp.grade, temp);
        }
    }
}
