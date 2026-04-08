# External System

## What is an External System?

The externalSystem keyword defines an external software system. Check the [documentation](https://docs.structurizr.com/dsl/language#softwaresystem) for further details.

## Create an External System

_⚠️ IMPORTANT:_ External Systems do not have the limitation that Software Systems have regarding [Workspace Scope](../SKILL.md#workspace-scope). This means that External Systems can be created regardless of the Workspace Scope being set to `landscape` or `softwaresystem`.

Follow the same instructions as a regular Software System, but make sure to create the element within the `./architecture/systems/_external.dsl` file. Also, make sure to tag the element with both `System` and `External` tags, separated by commas.

## Using Scaffoldizr CLI (preferred for AI agents)

```bash
scfz external-system \
  --elementName "<external system name>" \
  --extSystemDescription "<description>"
```
