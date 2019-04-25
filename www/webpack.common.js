const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        app: './bootstrap.js',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bootstrap.[name].bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin(['index.html']),
    ],
};
