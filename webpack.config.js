/* --- CDN Configuration ---
 *
 *  Make sure to fill these out with the folder/bucket IDs from the CDN
 *  Having this enabled will REQUIRE a cdnkey.json file
 */

/* global __dirname */
const webpack = require("webpack");
const path = require("path");
const entry = require("webpack-glob-entry");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const FriendlyErrorsPlugin = require("friendly-errors-webpack-plugin");
const StyleLintPlugin = require("stylelint-webpack-plugin");
const GenerateJSONPlugin = require("generate-json-webpack-plugin");
const WebpackGoogleCloudStoragePlugin = require("webpack-google-cloud-storage-plugin");

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else {
    return false;
  }
}

let compiledPath = "../../../../../compiled/";

module.exports = {
  mode: "production",
  entry: {
    "js/main.js": [
      "./src/js/main.js"
    ],
    "js/workers/image-load.js": [
      "./src/js/_worker/workers/image-load.js"
    ],
    "../../../../../compiled/init": [
      "./src/css/_critical/init.scss"
    ],
    "../../../../../compiled/fonts": [
      "./src/css/_fonts.css"
    ],
    "../../../../../compiled/main": [
      "./src/css/main.scss"
    ]
  },
  output: {
    path: path.resolve(__dirname, "./web/site/assets/"),
    filename: "[name]",
    chunkFilename: compiledPath + "[id].chunk"
  },
  resolve: {
    extensions: [".webpack.js", ".web.js", ".js", ".jsx"]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        init: {
          name: "css/_init.css",
          test: (m,c,entry = "../../../../../compiled/init") => m.constructor.name === "CssModule" && recursiveIssuer(m) === entry,
          chunks: "initial",
          enforce: true
        },
        fonts: {
          name: "css/_fonts.css",
          test: (m,c,entry = "../../../../../compiled/fonts") => m.constructor.name === "CssModule" && recursiveIssuer(m) === entry,
          chunks: "initial",
          enforce: true
        },
        main: {
          name: "css/main.css",
          test: (m,c,entry = "../../../../../compiled/main") => m.constructor.name === "CssModule" && recursiveIssuer(m) === entry,
          chunks: "initial",
          enforce: true
        },
        default: false 
      }
    },
    minimizer: [
      new UglifyJsPlugin({
        test: [
          /\.js$/i
        ],
        sourceMap: false,
        uglifyOptions: { 
          ecma: 5,
          compress: {
            warnings: false
          }
        }
      }),
      new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/i,
        cssProcessorOptions: {
          zindex: false
        }
      })
    ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env", { 
                    "targets": {
                      "node": "current",
                      "browsers": [ "last 2 versions", "ie 11" ]
                    }
                  }
                ]
              ],
              plugins: [
                [
                  "@babel/plugin-transform-runtime", {
                    "regenerator": true
                  }
                ]
              ]
            }
          },
          {
            loader: "eslint-loader"
          }
        ]
      },
      { 
        test: /\.(png|woff|woff2|eot|ttf|svg)$/, 
        loader: "url-loader?limit=100000" 
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              minimize: true
            }
          },
          {
            loader: "postcss-loader",
            options: {
              config: {
                path: path.resolve(__dirname, "./postcss.config.js")
              }
            }
          },
          {
            loader: "sass-loader"
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
        filename: "[name]"
    }),
    new CopyWebpackPlugin([
      {
        from: "./src/images",
        to: "./images",
        force: true,
        ignore: [
          ".gitkeep"
        ]
      },
      {
        from: "./src/fonts",
        to: "./fonts",
        force: true,
        ignore: [
          ".gitkeep"
        ]
      },
      // {
      //   from: "./src/css/_fonts.css",
      //   to: "./fonts",
      //   force: true,
      //   ignore: [
      //     ".gitkeep"
      //   ]
      // },
      {
        from: "./src/templates",
        to: "../../site",
        force: true,
        ignore: [
          ".gitkeep"
        ]
      }
    ]),
    new StyleLintPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new FriendlyErrorsPlugin()
  ]
};