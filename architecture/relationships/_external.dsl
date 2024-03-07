Scaffoldizr -> StructurizrLite "Creates scaffolding to preview" "${CLI}"
Architect -> StructurizrLite "Previews DSL diagrams" "Web/HTTP"

Scaffoldizr -> FileSystem "Outputs generated scaffolding" "${CLI}"
FileSystem -> StructurizrLite "Uses DSL files to generate workspace.json file" "Structurizr/Lite File System"
