# Structurizr CLI

There are various ways to gather information, validate and troubleshoot errors in the Structurizr workspace. All of them use the unified `structurizr/structurizr` Docker image.
Refer to the [Structurizr commands reference](https://docs.structurizr.com/commands) for the full list of available commands.

## List elements within a workspace

You can list all the elements within a Structurizr workspace by running the following command from the workspace root (the folder containing `workspace.dsl`):

```bash
docker run --rm -v {workspace-path}/architecture:/usr/local/structurizr structurizr/structurizr list -w /usr/local/structurizr/workspace.dsl
```

The command will output the current elements in the following format:

```bash
 - Person://{ElementName}
 - SoftwareSystem://{ElementName}
   - Container://{Software System Name}.{Container Name}
     - Component://{Software System Name}.{Container Name}.{Component Name}
```

## Validation and Error Troubleshooting

Whenever changes are made to the DSL files, it's important to validate that the workspace is still valid and there are no errors. To do so, run the following command:

```bash
docker run --rm -v {workspace-path}/architecture:/usr/local/structurizr structurizr/structurizr validate -w /usr/local/structurizr/workspace.dsl
```

### Inspect violations

The inspect command allows you to inspect a JSON/DSL workspace via the workspace inspection feature. The return code indicates the number of violations that were shown. To run the inspect command:

```bash
docker run --rm -v {workspace-path}/architecture:/usr/local/structurizr structurizr/structurizr inspect -w /usr/local/structurizr/workspace.dsl
```
