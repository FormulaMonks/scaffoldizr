# Blueprint DSL

## Commands

|     Elements      | Description                                                   |
| :---------------: | :------------------------------------------------------------ |
|    `workspace`    | Creates a new workspace, with the proper scaffolding.         |
| `external system` | Creates an external system (displayed in corresponding view). |
|     `person`      | Actor or user interacting with the system.                    |
|    `variable`     | To reuse within other diagrams. Useful for relationships.     |
|    `container`    | System container.                                             |
|      `view`       | Creates a view. [See below](#supported-view-types).           |

### Supported View Types

|  View type   | Description                                                         |
| :----------: | :------------------------------------------------------------------ |
| `landscape`  | System Landscape view. Showcases system and external relationships. |
| `deployment` | Useful for displaying infrastructure and resources.                 |
