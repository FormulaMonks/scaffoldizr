## Themes

Scaffoldizr includes some extra themes extending from the default Structurizr theme. [More information here](https://docs.structurizr.com/ui/diagrams/themes).

### How to reference

Within your `workspace.dsl`, add the following line under `views`:

```dsl

views {
    themes "<url to theme 1>.json" "<url to theme 2>.json"
}

```

---

### Shapes

Added tag support to most available shapes within Structurizr.

TODO: Shapes Screenshot

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-shapes.json"
```

### Status

Added handy representations for elements when they need to be added/removed from a system or if they are external, inactive, etc.

TODO: Status Screenshot

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-status.json"
```

### Color-based

Because not all diagrams have to be architecture blue!

#### Green

TODO: Green Screenshot

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-green.json"
```

#### Yellow

TODO: Yellow Screenshot

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-yellow.json"
```

#### Red

TODO: Red Screenshot

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-red.json"
```
