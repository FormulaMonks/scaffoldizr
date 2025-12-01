systemContext Scaffoldizr "Scaffoldizr" {
    description "Scaffolding tool. ${AUTHOR}" 
    include *
}

container Scaffoldizr "ScaffoldizrCLI" {
    description "Command Line Interface (binary). ${AUTHOR}" 
    include *
    autolayout lr
}

component Scfz "Generator" {
    description "Definition to generate files and folders. ${AUTHOR}" 
    include *
}
