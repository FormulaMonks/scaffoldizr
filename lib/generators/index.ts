export { default as workspaceGenerator } from "./workspace";
export { default as constantGenerator } from "./constant";
export { default as personGenerator } from "./person";
export { default as extSystemGenerator } from "./external-system";
export { default as viewGenerator } from "./view";
export { default as systemGenerator } from "./system";
export { default as containerGenerator } from "./container";
export { default as relationshipGenerator } from "./relationship";
// TODO: componentGenerator
// - Available when the system finds containers
// - Select from a list of containers
// TODO: deploymentNodeGenerator
// - Available when available deployment views
// - Ability to choose between instanceNode and deploymentNode
// - Create relationships in-file
