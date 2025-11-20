import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Creates a fully fledged test workspace with all supported types
 */
export const createFullWorkspace = async (basePath: string): Promise<void> => {
    // Create directory structure
    const dirs = [
        "archetypes",
        "components",
        "containers/test-system",
        "containers/web-app",
        "decisions",
        "docs",
        "environments",
        "relationships",
        "scripts",
        "systems",
        "views",
    ];

    for (const dir of dirs) {
        await mkdir(join(basePath, dir), { recursive: true });
    }

    // Create workspace.dsl
    await writeFile(
        join(basePath, "workspace.dsl"),
        `workspace "Test Workspace" {
    description "A fully fledged test workspace with all supported types"

    configuration {
        scope softwaresystem
    }

    !adrs decisions
    !docs docs

    model {
        properties {
            "structurizr.groupSeparator" "/"
        }

        # Constants
        !const API "REST/HTTP API"
        !const WEB "Web/HTTP"
        !const DATABASE "Database/SQL"
        !const MESSAGING "Message Queue"

        archetypes {
            !include archetypes
        }

        !include systems
        !include environments

        # Relationships
        !include relationships/_people.dsl
        !include relationships/_external.dsl
        !include relationships/_system.dsl
    }

    views {
        themes "https://static.structurizr.com/themes/default/theme.json"
        !const AUTHOR "Author: Test User <test@example.com>"

        !include views
    }
}`,
        "utf-8",
    );

    // Create archetypes
    await writeFile(
        join(basePath, "archetypes/test-archetype_container.dsl"),
        `testContainerArchetype = container {
    technology "Java"
    tags "Tag"
}
`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "archetypes/test-archetype_component.dsl"),
        `testComponentArchetype = component {
    technology "SpringBoot"
    tags "Tag"
}
`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "archetypes/test-archetype_relationship.dsl"),
        `testRelationshipArchetype = -> {
    technology "Web/HTTPS"
    tags "Tag"
}
`,
        "utf-8",
    );

    // Create systems
    await writeFile(
        join(basePath, "systems/_people.dsl"),
        `InternalUser = person "Internal User" "A user of the system"
ExternalUser = person "External User" "An external customer"`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "systems/_external.dsl"),
        `ExternalSystem = softwareSystem "ExternalSystem" {
    description "Third-party system integration"
    tags "External"
}

WebApp = softwareSystem "WebApp" {
    description "Web Application"
    tags "External"
}

Database = softwareSystem "Database System" {
    description "Central database storage"
    tags "External"
}`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "systems/_system.dsl"),
        `TestSystem = softwareSystem "Test System" {
    description "Main application system"

    !include ../containers/test-system

    tags "System"
}`,
        "utf-8",
    );

    // Create containers
    await writeFile(
        join(basePath, "containers/test-system/api-gateway.dsl"),
        `ApiGateway = container "API Gateway" "Routes and manages API requests" "Node.js/Express" {
    !include ../../components/test-system--api-gateway.dsl
    tags "API Gateway"
}`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "containers/test-system/business-logic.dsl"),
        `BusinessLogic = container "Business Logic" "Core business processing" "Java/Spring Boot" {
    !include ../../components/test-system--business-logic.dsl
    tags "Business Logic"
}`,
        "utf-8",
    );

    // Create components
    await writeFile(
        join(basePath, "components/test-system--api-gateway.dsl"),
        `group "API Layer" {
    AuthController = component "Authentication Controller" "Handles user authentication" "Express Controller"
    UserController = component "User Controller" "Manages user operations" "Express Controller"
    ValidationMiddleware = component "Validation Middleware" "Request validation" "Express Middleware"
}

group "Security" {
    JwtService = component "JWT Service" "Token management" "jsonwebtoken"
    RateLimiter = component "Rate Limiter" "API rate limiting" "express-rate-limit"
}`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "components/test-system--business-logic.dsl"),
        `group "Services" {
    UserService = component "User Service" "User business logic" "Spring Service"
    OrderService = component "Order Service" "Order processing logic" "Spring Service"
    PaymentService = component "Payment Service" "Payment processing" "Spring Service"
}

group "Data Access" {
    UserRepository = component "User Repository" "User data access" "Spring Data JPA"
    OrderRepository = component "Order Repository" "Order data access" "Spring Data JPA"
}`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "components/web-app--frontend.dsl"),
        `group "Pages" {
    HomePage = component "Home Page" "Main application page" "React Component"
    UserDashboard = component "User Dashboard" "User management interface" "React Component"
    OrderManagement = component "Order Management" "Order handling interface" "React Component"
}

group "Shared Components" {
    Navigation = component "Navigation" "App navigation" "React Component"
    ApiClient = component "API Client" "HTTP client for backend" "Axios"
}`,
        "utf-8",
    );

    // Create relationships
    await writeFile(
        join(basePath, "relationships/_people.dsl"),
        `InternalUser -> TestSystem "Uses" "Web Interface"
ExternalUser -> WebApp "Interacts with" "Browser"
InternalUser -> WebApp "Manages" "Admin Interface"`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "relationships/_external.dsl"),
        `TestSystem -> ExternalSystem "Integrates with" "\${API}"
TestSystem -> Database "Stores data in" "\${DATABASE}"
WebApp -> TestSystem "Calls" "\${API}"`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "relationships/_system.dsl"),
        `ApiGateway -> BusinessLogic "Routes requests to" "\${API}"
WebApp -> ApiGateway "Makes requests to" "\${WEB}"
UserService -> UserRepository "Uses" "JPA"
OrderService -> OrderRepository "Uses" "JPA"`,
        "utf-8",
    );

    // Create views
    await writeFile(
        join(basePath, "views/landscape.dsl"),
        `systemLandscape "SystemLandscape" {
    description "System landscape view. \${AUTHOR}"
    include *
    autoLayout lr
}`,
        "utf-8",
    );

    await writeFile(
        join(basePath, "views/test-system.dsl"),
        `systemContext TestSystem "TestSystemContext" {
    description "Test System context view. \${AUTHOR}"
    include *
    autoLayout lr
}

container TestSystem {
    description "Test System container view. \${AUTHOR}"
    include *
    autoLayout lr
}

component ApiGateway {
    description "API Gateway components. \${AUTHOR}"
    include *
    autoLayout lr
}

component BusinessLogic {
    description "Business Logic components. \${AUTHOR}"
    include *
    autoLayout lr
}`,
        "utf-8",
    );

    // Create environments
    await writeFile(
        join(basePath, "environments/production.dsl"),
        `deploymentEnvironment "Production" {
    deploymentNode "Production Infrastructure" {
        deploymentNode "Load Balancer" {
            technology "AWS ALB"
            instances "2"
        }
        
        deploymentNode "Application Servers" {
            technology "AWS ECS"
            instances "3"
            
            ApiGatewayInstance = containerInstance ApiGateway
            BusinessLogicInstance = containerInstance BusinessLogic
        }
        
        deploymentNode "Database Cluster" {
            technology "AWS RDS"
            instances "1"
            
            DatabaseInstance = softwareSystemInstance Database
        }
    }
}`,
        "utf-8",
    );

    // Create workspace.json with sample data
    const workspaceJson = {
        id: 1,
        name: "Test Workspace",
        description: "A fully fledged test workspace with all supported types",
        lastModifiedDate: new Date().toISOString(),
        properties: {},
        model: {
            people: [
                {
                    id: "InternalUser",
                    name: "Internal User",
                    description: "A user of the system",
                    location: "Internal",
                    tags: "Person",
                    properties: {},
                    relationships: [],
                    documentation: { sections: [], images: [] },
                },
            ],
            softwareSystems: [
                {
                    id: "TestSystem",
                    name: "Test System",
                    description: "Main application system",
                    location: "Internal",
                    tags: "System",
                    properties: {},
                    relationships: [],
                    documentation: { sections: [], images: [] },
                    containers: [],
                },
            ],
            deploymentNodes: [],
        },
        configuration: {
            branding: {},
            styles: {},
            terminology: {},
        },
        documentation: {
            sections: [],
            images: [],
        },
        views: {
            systemLandscapeViews: [],
            systemContextViews: [],
            configuration: {
                branding: {},
                styles: {},
                terminology: {},
            },
        },
    };

    await writeFile(
        join(basePath, "workspace.json"),
        JSON.stringify(workspaceJson, null, 2),
        "utf-8",
    );

    // Create .gitkeep files for empty directories
    await writeFile(join(basePath, "decisions/.gitkeep"), "", "utf-8");
    await writeFile(join(basePath, "docs/.gitkeep"), "", "utf-8");
};
