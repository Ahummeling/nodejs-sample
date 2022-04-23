import {complexModuleHandler} from "./complex-module-handler";

const routes = [
    {
        path: '/status',
        type: 'GET',
        handler: (_req, res) => {
            res.status(200).json({status: 'UP'});
        },
    },
    {
        path: '/complex-module',
        type: 'GET',
        handler: complexModuleHandler,
    },
];

export function getModuleRoutes() {
    return routes;
}