NodeJSApp = container "NodeJS App" {
    !include ../../components/nodejs-app/api.dsl
    !include ../../components/nodejs-app/web.dsl
    description "A NodeJS application that serves as an example."
    technology "Node.js"
    tags "WebApp"
}}