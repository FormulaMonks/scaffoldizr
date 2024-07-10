module.exports = {
    extends: ["@commitlint/config-conventional"],
    ignores: [(commit) => commit.startsWith("[skip-ci]")],
    rules: {
        "body-max-line-length": [0, "always", 200],
    },
};
