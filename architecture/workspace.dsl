workspace "Scaffoldizr" {
    description "Opinionated Scaffolding Tool for Structurizr DSL"

    !adrs decisions
    !docs docs

    model {
        # Constants
        !const CLI "CLI/Terminal"

        !include systems
        !include environments

        # Relationships
        !include relationships/_external.dsl
        !include relationships/_system.dsl
    }

    views {
        themes "https://structurizr.test.zemoga-client.com/share/1/theme"
        !const AUTHOR "Author: Formula.monks <andres.zorro@mediamonks.com>"

        !include views
    }
}