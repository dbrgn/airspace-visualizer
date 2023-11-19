const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
    entry: {
        app: './bootstrap.ts',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.wasm']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bootstrap.[name].bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin(['index.html', 'node_modules/leaflet/dist/leaflet.css']),
    ],
    experiments: {
        asyncWebAssembly: true,
    },
};
