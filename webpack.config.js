const nodeExternals = require('webpack-node-externals');

module.exports = {
    target: 'node',
    externals: [ nodeExternals() ],
    output: {
        filename: '[name].js',
        path: __dirname + '/dist',
    },
    resolve: {
        extensions: ['.js'],
    },
}
