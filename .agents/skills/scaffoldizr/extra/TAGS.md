# Tags

Some tags have semantic meaning within Structurizr and the C4 model. Here is a list of important tags and how they should be used:

## Shape tags

Used to generate specific shapes for elements in views. Choices are:

- **`EventBus`**: Used for event bus components. E.g. Kafka, RabbitMQ, etc.
- **`MessageBroker`**: Used for message broker components. E.g. AWS SQS, etc.
- **`Function`**: Used for serverless function components. E.g. AWS Lambda, Azure Functions, etc.
- **`Database`**: Used for database components. E.g. MySQL, PostgreSQL, MongoDB, etc.
- **`WebApp`**: Used for web application components. E.g. React, Angular, Java, Python, Node.js, etc.
- **`MobileApp`**: Used for mobile application components. E.g. iOS, Android, React Native, etc.

## Status Tags

Used to indicate the status of an element. Choices are:

- **`New`**: Indicates that the element currently does not exist in the system and is planned for future implementation.
- **`Deprecated`**: Indicates that the element is planned to be removed from the system in the future.
- **`External`**: Indicates that the element is external to the system being modeled. This tag should be used for External Systems.
