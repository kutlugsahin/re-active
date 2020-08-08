const path = require("path");

module.exports = {
    mode: 'development',
    entry: './main.ts',
    watch: true,
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'index.js',
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        alias: {
            '@re-active/core': path.resolve(__dirname, '../core/src/index.ts'),
            '@re-active/react': path.resolve(__dirname, '../react/src/index.ts'),
            '@re-active/store': path.resolve(__dirname, '../store/src/index.ts'),
        }
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            }, {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname),
                    path.resolve(__dirname, '../core'),
                    path.resolve(__dirname, '../react'),
                    path.resolve(__dirname, '../store'),
                ],
                exclude: /node_modules/,
                loader: 'ts-loader',
            }]
    },
    devServer: {
        contentBase: path.join(__dirname, 'public'),
        port: 3000,
        hot: true,
        liveReload: false,
    }
}