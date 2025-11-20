systemContext Scaffoldizr "Scaffoldizr" {
    description "Scaffolding tool. ${AUTHOR}" 
    include *
}

container Scaffoldizr "ScaffoldizrCLI" {
    description "Command Line Interface (binary). ${AUTHOR}" 
    include *
    autolayout lr
}
