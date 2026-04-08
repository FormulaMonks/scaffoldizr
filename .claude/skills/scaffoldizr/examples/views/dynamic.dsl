dynamic SoftwareSystemIdentifier "ViewKeyInPascalCase" {
    title "View Title"
    description "Short description of the view. ${AUTHOR}"
    autoLayout lr
    
    1: ContainerA -> ExternalSystemB "Uses" "HTTPS"
    2: ContainerB -> DatabaseC "Reads from and writes to" "JDBC"
    3: User -> ContainerA "Interacts with" "Web UI"
}