const path = require('path');

module.exports = {
    mode: 'development', // Use 'production' for production builds
    entry: './src/main.ts', // Entry point of your application
    devtool: 'inline-source-map', // Generates source maps
    module: {
        rules: [
            {
              test: /\.css$/, // Regex to match files ending with .css
              use: [
                'style-loader', // Injects CSS into the DOM using a <style> tag
                'css-loader'    // Interprets @import and url() like import/require() and will resolve them
              ]
            },
            {
              test: /\.ts$/, // Regex to match files ending with .ts
              use: 'ts-loader',
              exclude: /node_modules/
            }
        ] 
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'content.js', // Output file name
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
};
