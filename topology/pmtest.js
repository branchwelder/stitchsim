import { ProcessModel } from "./ProcessModel";
import { Pattern } from "./pattern";

const TEST = ["K", "K", "K", "K"];
const TEST2 = ["K", "K", "K", "K", "K", "T", "T", "K"];
const TEST3 = ["K", "K", "K", "K", "K", "T", "T", "K", "K", "K", "K", "K"];

const testPattern = new Pattern(TEST3, 4);

const testModel = new ProcessModel(testPattern);

console.log(testModel.cn);
