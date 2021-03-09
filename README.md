# Appsync tested and documented

## Unit Tests

Don't need them! Our AppSync app is 100% written in cloudformation. No could to test

## Integration Tests

`/api/tests` contains a serverless project, which has a Lambda that will

-   get appsync endpoint and api key from cloudformation outputs ask call
-   create a note
-   get a note
-   remove a note
-   make a code pipeline sdk call to let our pipeline know things are good and we can continue on

`/api/pipeline` contains a cloudformation project that defines our cicd pipeline.

## Documentation

Not implemented yet
