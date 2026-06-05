dynamic SoftwareSystemIdentifier "ViewKeyInPascalCase" {
    description "Short description of the view. ${AUTHOR}"

    1: ContainerA -> ExternalSystemB "Uses" "HTTPS"
    2: ContainerB -> DatabaseC "Reads from and writes to" "JDBC"
    3: User -> ContainerA "Interacts with" "Web UI"
    autoLayout lr
}