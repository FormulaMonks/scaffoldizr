workspace "Scaffoldizr" {
    description "Opinionated Scaffolding Tool for Structurizr DSL"

    !adrs decisions
    !docs docs

    model {
        # Constants
        !constant CLI "CLI/Terminal"

        !include systems
        # !include environments (Enable when environments ready)

        # Relationships
        !include relationships/_external.dsl
        !include relationships/_system.dsl
    }

    views {
        themes "https://structurizr.test.zemoga-client.com/share/1/theme"
        !constant AUTHOR "Author: Formula.monks <andres.zorro@mediamonks.com>"

        !include views
    }
}