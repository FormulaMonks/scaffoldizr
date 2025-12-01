
!include scaffoldizr.dsl

Scfz_Generator -> Scfz_Template "References" "${TS}"

Scfz_Utility -> Scfz_Generator "References" "${TS}"
Scfz_Utility -> Scfz_Template "Adds HBS helpers" "${TS}"
Scfz_Utility -> FileSystem "Creates/Updates Files" "Bun/FS Write"

Scfz_CommandLineInterface -> Scfz_Generator "Leverages" "${TS}"

Architect -> Scfz_CommandLineInterface "Uses" "${CLI}"