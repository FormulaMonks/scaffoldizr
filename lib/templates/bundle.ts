import envArch from "./.env-arch.hbs";
import gitignore from "./.gitignore";
import constant from "./constant.hbs";
import containersContainer from "./containers/container.hbs";
import gitkeep from "./docs/.gitkeep";
import empty from "./empty.hbs";
import environmentsDeployment from "./environments/deployment.hbs";
import include from "./include.hbs";
import relationshipsMultiple from "./relationships/multiple.hbs";
import scriptsRun from "./scripts/run.sh";
import scriptsUpdate from "./scripts/update.sh";
import systemExternal from "./system/external.hbs";
import systemPerson from "./system/person.hbs";
import systemSystem from "./system/system.hbs";
import testTemplate from "./test-template.hbs";
import viewsContainer from "./views/container.hbs";
import viewsDeployment from "./views/deployment.hbs";
import viewsLandscape from "./views/landscape.hbs";
import viewsSystem from "./views/system.hbs";
import workspace from "./workspace.hbs";

const templatesMap = new Map([
    ["templates/workspace.hbs", workspace],
    ["templates/test-template.hbs", testTemplate],
    ["templates/constant.hbs", constant],
    ["templates/empty.hbs", empty],
    ["templates/containers/container.hbs", containersContainer],
    ["templates/.env-arch", envArch],
    ["templates/.gitignore", gitignore],
    ["templates/decisions/.gitkeep", gitkeep],
    ["templates/docs/.gitkeep", gitkeep],
    ["templates/containers/.gitkeep", gitkeep],
    ["templates/relationships/.gitkeep", gitkeep],
    ["templates/environments/.gitkeep", gitkeep],
    ["templates/environments/deployment.hbs", environmentsDeployment],
    ["templates/include.hbs", include],
    ["templates/relationships/multiple.hbs", relationshipsMultiple],
    ["templates/scripts/run.sh", scriptsRun],
    ["templates/scripts/update.sh", scriptsUpdate],
    ["templates/system/external.hbs", systemExternal],
    ["templates/system/person.hbs", systemPerson],
    ["templates/system/system.hbs", systemSystem],
    ["templates/views/system.hbs", viewsSystem],
    ["templates/views/landscape.hbs", viewsLandscape],
    ["templates/views/container.hbs", viewsContainer],
    ["templates/views/deployment.hbs", viewsDeployment],
]);

export default templatesMap;
