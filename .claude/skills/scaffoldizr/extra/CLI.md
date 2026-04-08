# Structurizr CLI

There are various ways to gather information, validate and troubleshoot errors in the Structurizr workspace. All of them rely on the `structurizr-cli` tool.
If `structurizr-cli` is not installed, follow [the instructions](https://docs.structurizr.com/cli/installation) to install it, or prompt the user to install it.

## List elements within a workspace

You can list all the elements within a Structurizr workspace by running the following command in the `./architecture` folder:

```bash
structurizr-cli list -workspace {workspace-path}/architecture/workspace.dsl
```

The command will output the current elements in the following format:

```bash
 - Person://{ElementName}
 - SoftwareSystem://{ElementName}
   - Container://{Software System Name}.{Container Name}
     - Component://{Software System Name}.{Container Name}.{Component Name}
```

## Validation and Error Troubleshooting

Whenever changes are made to the DSL files, it's important to validate that the workspace is still valid and there are no errors. To do so, run the following command in the `./architecture` folder:

```bash
structurizr-cli validate -workspace {workspace-path}/architecture/workspace.dsl
```

### Inspect violations

The inspect command allows you to inspect a JSON/DSL workspace via the workspace inspection feature. The return code indicates the number of violations that were shown. To run the inspect command, use the following command in the `./architecture` folder:

```bash
structurizr-cli inspect -workspace {workspace-path}/architecture/workspace.dsl
```
