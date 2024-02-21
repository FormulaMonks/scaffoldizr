import type { Answers } from "inquirer";
import { ActionTypes } from ".";

export type AddManyAction = {
    type: ActionTypes.AddMany;
    destination: string;
    templateFiles: string;
    skipIfExists?: boolean;
};

export async function addMany<A extends Answers>(
    data: A,
    options: AddManyAction,
): Promise<boolean> {
    console.log("🦊", "data", data);
    console.log("🦊", "options", options);
    return false;
}
