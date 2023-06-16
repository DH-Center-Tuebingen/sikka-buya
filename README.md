# SIKKA-BŪYA

A digital application for displaying and exploring islamic coinage.


## Project Structure

The project has three main parts:

1. [Frontend](./frontend/README.md)
1. [Backend](./backend/README.md)
1. [Testing](./test/README.md)


## Requirenments

- Node v.16.16.0


### Grunt

Grunt is used for the testing framework:

```
npm install global grunt
```

### VUE-CLI

Vue cli is used for the frontend:

```
npm install global vue-cli
```


## Frontend

The frontend contains the [Vue.js](https://vuejs.org/) project that handles the client-side application. It contains a [Leaflet](https://leafletjs.com/) based map application to visualize data. A catalog to display the coins, as known from other scientific documents. And a content-management layer for the editors to create and edit the catalog entries and their corresponding attributes (e.g. mint, material, persons, ...).

## Backend

It's a [nodejs](https://nodejs.org/) based application which uses runs an [expressjs](https://expressjs.com/) webserver. The backend manages the connected [PostgeSQL](https://www.postgresql.org/) database. [GraphQL](https://graphql.org/) serves as the interface between the frontend and the backend.

## Testing

A [mocha](https://mochajs.org/)/[chai](https://www.chaijs.com/) based testing framework to provide security and stability to the project. However, it only covers rudimentary tests and (at the time of writing) mainly focuses on the GraphQL interface.