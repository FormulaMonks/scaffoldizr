import envArch from "./.env-arch.hbs";
import gitignore from "./.gitignore";
import componentsComponent from "./components/component.hbs";
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
import viewsComponent from "./views/component.hbs";
import viewsContainer from "./views/container.hbs";
import viewsDeployment from "./views/deployment.hbs";
import viewsLandscape from "./views/landscape.hbs";
import viewsSystem from "./views/system.hbs";
import workspace from "./workspace.hbs";

const templatesMap = new Map([
    ["templates/.env-arch", envArch],
    ["templates/.gitignore", gitignore],
    ["templates/components/component.hbs", componentsComponent],
    ["templates/constant.hbs", constant],
    ["templates/containers/.gitkeep", gitkeep],
    ["templates/containers/container.hbs", containersContainer],
    ["templates/decisions/.gitkeep", gitkeep],
    ["templates/docs/.gitkeep", gitkeep],
    ["templates/empty.hbs", empty],
    ["templates/environments/.gitkeep", gitkeep],
    ["templates/environments/deployment.hbs", environmentsDeployment],
    ["templates/include.hbs", include],
    ["templates/relationships/.gitkeep", gitkeep],
    ["templates/relationships/multiple.hbs", relationshipsMultiple],
    ["templates/scripts/run.sh", scriptsRun],
    ["templates/scripts/update.sh", scriptsUpdate],
    ["templates/system/external.hbs", systemExternal],
    ["templates/system/person.hbs", systemPerson],
    ["templates/system/system.hbs", systemSystem],
    ["templates/test-template.hbs", testTemplate],
    ["templates/views/component.hbs", viewsComponent],
    ["templates/views/container.hbs", viewsContainer],
    ["templates/views/deployment.hbs", viewsDeployment],
    ["templates/views/landscape.hbs", viewsLandscape],
    ["templates/views/system.hbs", viewsSystem],
    ["templates/workspace.hbs", workspace],
]);

export default templatesMap;
