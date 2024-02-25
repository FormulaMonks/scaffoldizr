import { QuestionCollection } from "inquirer";
import { GeneratorDefinition } from "../utils/generator";
import { getSystemQuestion } from "../utils/questions/system";

type PersonAnswers = {
    systemName: string;
    elementName: string;
    personDescription: string;
    relationship: string;
    relationshipType: "outgoing" | "incoming";
};

const constantGenerator: GeneratorDefinition<PersonAnswers> = {
    name: "Person",
    description: "Create a new person (customer, user, etc)",
    questions: async (prompt, generator) => {
        const systemQuestion = await getSystemQuestion(generator.destPath);

        const questions: QuestionCollection<PersonAnswers> = [
            systemQuestion,
            {
                type: "input",
                name: "elementName",
                message: "Person name:",
                validate: (input, answers) => {
                    if (input === answers?.systemName) {
                        throw new Error(`Name "${input}" already exists`);
                    }

                    return true;
                },
            },
            {
                type: "input",
                name: "personDescription",
                message: "Person description:",
                default: "Default user",
            },
            {
                type: "input",
                name: "relationship",
                message: "Relationship:",
                default: "Consumes",
            },
            {
                type: "list",
                name: "relationshipType",
                message: "Relationship type:",
                choices: [
                    {
                        name: "outgoing (System → Person)",
                        value: "outgoing",
                    },
                    {
                        name: "incoming (Person → System)",
                        value: "incoming",
                    },
                ],
                default: "incoming",
            },
        ];

        return prompt(questions);
    },
    actions: [],
};

export default constantGenerator;
