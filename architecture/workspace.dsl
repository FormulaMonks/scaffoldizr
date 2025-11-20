workspace "Scaffoldizr" {
    description "Opinionated Scaffolding Tool for Structurizr DSL"

    configuration {
        scope softwaresystem
    }

    !adrs decisions
    !docs docs

    model {
        properties {
            structurizr.inspection.model.softwaresystem.documentation ignore
            structurizr.inspection.model.softwaresystem.decisions ignore
        }

        # Constants
        !const CLI "CLI/Terminal"

        archetypes {
            !include archetypes
        }

        !include systems
        # !include environments (Enable when environments ready)

        # Relationships
        !include relationships/_external.dsl
        !include relationships/_system.dsl
    }

    views {
        themes "https://static.structurizr.com/themes/default/theme.json"
        !const AUTHOR "Author: Formula.monks <andres.zorro@mediamonks.com>"

        !include views
    }
}