const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js'
  },
 
  output: {
    filename: 'bundle.js',
    publicPath: '/',
    path: path.join(__dirname, 'dist'),
    clean: true,
    asyncChunks: false
  },

  externals: {
    cockpit: 'cockpit'
  },

  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'dnsmasq-api': path.join(__dirname, 'src/dnsmasq-api.js'),
    },
  },
  
  // Other loaders and plugins as needed
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react']
          }
        }
      },      
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },

  plugins: [
    new MiniCssExtractPlugin({
      filename: 'bundle.css',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '.',
          noErrorOnMissing: true,
          globOptions: {
            //ignore: ['**/index.html']
          },            
        },
      ],
    })
  ],  

};