## Installation

Run in your terminal:

```bash
curl -s https://arch-formula.github.io/scaffoldizr/assets/install.sh | sh
```

Then, verify the tool is correctly installed:

```bash
scfz --version
```

## Usage

Once installed, run in your terminal:

```bash
scfz --dest {docs_folder}
```

where `{docs_folder}` is a folder where dsl files will be generated. The tool creates an `architecture/` folder and starts scaffolding from there. `{docs_folder}` default value is current working directory. So you can just issue `scfz` command.
