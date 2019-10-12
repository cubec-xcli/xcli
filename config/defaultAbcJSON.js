module.exports = {
  wap: false,
  package: "npm",
  path: {
    output: "dist/",
    public: "/"
  },
  alias: {},
  defineNamespace: void 0,
  define: {},
  provide: {},
  plugin: {},
  devServer: {
    port: 9001,
    https: false,
    historyApiFallback: {
      rewrites: []
    },
    proxy: {}
    // proxy: {
    //   "/api": {
    //     target: "https://mzw.natappvip.cc",
    //     changeOrigin: true,
    //     secure: false
    //   }
    // }
  },
  mockServer: {
    debug: false
  },
  publishRecursive: 1,
  publish: {}
};
