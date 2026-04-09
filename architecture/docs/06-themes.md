

## Managing Themes with Scaffoldizr

Use the `theme` generator to manage your workspace themes without manually editing the DSL.

### Interactive

Run `scfz theme` to launch the interactive theme manager. It provides three actions:

- **Add themes**: select from built-in themes or enter a custom URL.
- **Remove themes**: select currently configured themes to remove.
- **List themes**: see all theme URLs currently used in your workspace.

Color-based themes (Blue, Red, Green, Yellow) are mutually exclusive. Selecting a new color theme automatically replaces any existing one.

### Non-Interactive (AI Agent Mode)

Use the `theme` subcommand with flags for automation:

- `--themeAction`: one of `"Add themes"`, `"Remove themes"`, or `"List themes"`.
- `--additionalThemes`: comma-separated theme URLs to add (e.g. `"url1,url2"`).

For example, to add the Shapes theme:

```bash
scfz theme \
  --themeAction "Add themes" \
  --additionalThemes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-shapes.json"
```

The Blue color theme, which is not included by default during workspace initialization, can be added using:

```bash
scfz theme \
  --themeAction "Add themes" \
  --additionalThemes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-blue.json"
```

## Available Themes


Scaffoldizr includes some extra themes extending from the default Structurizr theme. [More information here](https://docs.structurizr.com/ui/diagrams/themes).

### How to reference

Within your `workspace.dsl`, add the following line under `views`:

```dsl

views {
    themes "<url to theme 1>.json" "<url to theme 2>.json"
}

```

---

## Shapes

Added tag support to most available shapes within Structurizr.

![Scaffoldizr Shapes](https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-shapes.png)

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-shapes.json"
```

## Status

Added handy representations for elements when they need to be added/removed from a system or if they are external, inactive, etc.

![Scaffoldizr Status](https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-status.png)

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-status.json"
```

## Color-based

Because not all diagrams have to be architecture blue!

### Green

![Scaffoldizr Green](https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-green.png)

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-green.json"
```

### Yellow

![Scaffoldizr Yellow](https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-yellow.png)

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-yellow.json"
```

### Red

![Scaffoldizr Red](https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-red.png)

```dsl
themes "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-red.json"
```
