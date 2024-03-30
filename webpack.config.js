const path = require('path');

module.exports = {
    mode: 'development', // Use 'production' for production builds
    entry: './src/main.ts', // Entry point of your application
    devtool: 'inline-source-map', // Generates source maps
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'content.js', // Output file name
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
};
