export const STRUCTURIZR_DEFAULT_THEME_URL =
    "https://static.structurizr.com/themes/default/theme.json";
export const SCAFFOLDIZR_SHAPES_THEME_URL =
    "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-shapes.json";
export const SCAFFOLDIZR_STATUS_THEME_URL =
    "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-status.json";
export const SCAFFOLDIZR_BLUE_THEME_URL =
    "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-blue.json";
export const SCAFFOLDIZR_RED_THEME_URL =
    "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-red.json";
export const SCAFFOLDIZR_GREEN_THEME_URL =
    "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-green.json";
export const SCAFFOLDIZR_YELLOW_THEME_URL =
    "https://formulamonks.github.io/scaffoldizr/assets/scaffoldizr-yellow.json";

export const COLOR_THEME_URLS: readonly string[] = [
    SCAFFOLDIZR_BLUE_THEME_URL,
    SCAFFOLDIZR_RED_THEME_URL,
    SCAFFOLDIZR_GREEN_THEME_URL,
    SCAFFOLDIZR_YELLOW_THEME_URL,
];

export type BuiltinTheme = { name: string; value: string };

export const BUILTIN_THEMES: BuiltinTheme[] = [
    { name: "Default (Structurizr)", value: STRUCTURIZR_DEFAULT_THEME_URL },
    { name: "Shapes (Scaffoldizr)", value: SCAFFOLDIZR_SHAPES_THEME_URL },
    { name: "Status (Scaffoldizr)", value: SCAFFOLDIZR_STATUS_THEME_URL },
    { name: "Blue (Color)", value: SCAFFOLDIZR_BLUE_THEME_URL },
    { name: "Red (Color)", value: SCAFFOLDIZR_RED_THEME_URL },
    { name: "Green (Color)", value: SCAFFOLDIZR_GREEN_THEME_URL },
    { name: "Yellow (Color)", value: SCAFFOLDIZR_YELLOW_THEME_URL },
    { name: "Custom (by URL)", value: "custom" },
];
