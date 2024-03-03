workspace "Blueprint DSL" {
    description "Opinionated Scaffolding Tool for Structurizr"

    !adrs decisions
    !docs docs

    model {
        !include system

        BlueprintDsl = softwareSystem "Blueprint DSL" {
            description "Scaffolding tool"

            # Constants

            !include containers
            !include relationships

            tags "System"
        }

        !include environments
    }

    views {
        themes "https://structurizr.test.zemoga-client.com/share/1/theme"
        !const AUTHOR "Author: Formula.monks <andres.zorro@mediamonks.com>"

        !include views
    }
}
