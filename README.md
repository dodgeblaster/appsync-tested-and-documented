# Appsync tested and documented

## Unit Tests

Don't need them! Our AppSync app is 100% written in cloudformation. No could to test

## Integration Tests

`/integrationTests` contains a serverless project, which has a Lambda that will

-   get appsync endpoint and api key from cloudformation outputs ask call
-   create a note
-   get a note
-   remove a note
-   make a code pipeline sdk call to let our pipeline know things are good and we can continue on

`/pipeline` contains a cloudformation project that defines our cicd pipeline.

## Documentation

Not implemented yet

# Notes:

api has a graphql resolver function that will add an event to event bridge

core or backend will read events, do something with it, and emit back onto the event bridge

api can define what they want to listen for and update its db

---

could have a generic function that records "state" to db and sends event to via event function
that way, the api call has a "processing" record in db once its resolved that can be presented in the ui.

then have a generic function which listens on a particular event, and updates that same state
will have to include meta data details in payload to inform both these generic functions

# Web anayltics note:

should make an api gateway endpoint that connects
directly to kenesis firehouse (can do data transformation within firehouse, like processing
it into ParQi),
to put into an s3 bucket
