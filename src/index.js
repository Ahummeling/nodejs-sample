// external imports
import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import createStore from 'session-file-store';
import winston from 'winston';

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'nodejs-sample' },
    transports: [
        //
        // - Write all logs with importance level of `error` or less to `error.log`
        // - Write all logs with importance level of `info` or less to `combined.log`
        //
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// internal imports
import {getModuleRoutes} from "./module";

function registerExpressRoutes(app, routes) {
    routes.forEach((route) => {
        switch (route.type) {
            case 'GET':
                app.get(route.path, route.handler);
                break;
            case 'POST':
                app.post(route.path, route.handler);
                break;
            case 'PUT':
                app.put(route.path, route.handler);
                break;
            case 'DELETE':
                app.delete(route.path, route.handler);
        }
    });
}

// check if all required environment variables are present
dotenv.config(); // use .env files

const app = express(); // create express application
const port = parseInt(process.env.PORT ?? '8000'); // retrieve port

app.use(express.json()); // for parsing of json request bodies
app.set('trust proxy', 1) // used when run behind a proxy (e.g. nginx)

// instantiate redis store and client
const FileStore = createStore(session);
// Full list of options: https://www.npmjs.com/package/session-file-store#options
const fileStoreOptions = {
    path: process.env.SESSION_PATH, // path to the file where the sessions are stored
    ttl: 157680000, // time to live in seconds
}

// configure the express sessions
app.use(session({
    name: 'app-session', // name of the session id cookie
    store: new FileStore(fileStoreOptions),
    secret: process.env.SECRET ?? 'apps3cr3t',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true, // mitigate XSS attacks
        secure: false, // TODO: set to true, currently set to false such that postman receives the cookie
        sameSite: true, // only sent to in first-party contexts
        maxAge: 15768000 * 1000, // half a year for refresh token
    },
}));

// register express routes retrieved from sub-modules
registerExpressRoutes(app, [
    ...getModuleRoutes(),
]);


// start the webserver
const server = app.listen(port, () => {
    logger.info(`Node server running on http://0.0.0.0:${port}/status`);
});

// add a terminate-handler
const terminate = () => {
    logger.error('Application crashed, exiting webserver after processing current event loop');
    server.close(() => {
        logger.info('Server closed successfully');
        process.exit(1);
    });
}

// register the terminate-handler
['beforeExit', 'exit', 'uncaughtException', 'unhandledRejection'].forEach((eventName) => {
    process.on(eventName, terminate);
});
