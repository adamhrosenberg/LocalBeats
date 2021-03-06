# LocalBeats

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development purposes.

### Prerequisites

What things you need to install the software and how to install them

Install [npm](https://www.npmjs.com/get-npm)


### Installing and Running

A step by step series of examples that tell you have to get a development enviorment running

Download and unzip `localbeats.zip`

```
cd <unzipped directory>
```

```
cd localbeats

Install the [Angular CLI](https://github.com/angular/angular-cli#installation)
```
npm install -g @angular/cli
```

Install the dependencies

```
npm install
```

Run the server

```
nodemon server.js
```

Build the frontend

```
ng build --watch
```

Navigate to the site

```
localhost:4200
```


## Deployment

This projcet is deployed to [localbeats.live](https://www.localbeats.live) via Heroku.

## Built With

* [MongoDB](https://www.mongodb.com) - Database framework
* [Express](https://expressjs.com) - Web Framework
* [Angular 5](https://angular.io) - Frontend Framework
* [Node.js](https://nodejs.org/en/) - Server Enviorment

## Authors

* **Adam Rosenber**
*  **Brandon Koch**
*  **Snehashish Mishra** 
*  **Nick Porter**

## Notes

* Redirects from Stripe and other services may not work since the app is running on localhost.
