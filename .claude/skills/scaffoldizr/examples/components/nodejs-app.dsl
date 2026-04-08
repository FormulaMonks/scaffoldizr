NodeJSApp_RESTController = component "NodeJS App REST Controller" {
    description "Handles REST API requests for the NodeJS application."
    technology "Node.js,Express"
}

NodeJSApp_View = component "NodeJS App Web Frontend" {
    description "The web frontend for the NodeJS application."
    technology "Node.js,React"
}

NodeJSApp_MessageSender = component "NodeJS App Message Sender" {
    description "Sends messages to the message queue."
    technology "Node.js, RabbitMQ"
}