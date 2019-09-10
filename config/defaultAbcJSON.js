module.exports = {
  wap: false,
  package: "npm",
  path: {
    output: "dist/",
    public: "/"
  },
  alias: {},
  define: {},
  provide: {},
  css: {
    modules: false,
  },
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
  publish: {}
};
