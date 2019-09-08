// xcli 重构计划相关
// 基本的目录结构

// 文件分布
const fileExplorer = {
  // cache 缓存 (如gitlab Token)
  // 不在git中
  cache: {
  },

  // 静态资源(如图表，logo, 等其他引用资源)
  static: {
  },

  // 设置相关
  config: {
  },

  // 常量 默认设置
  dict: {
  },

  // 核心库
  core: {

    // 工具函数
    utils : {
      // 原始的 abcJSON 配置文件
      abcJSON: {},

      // 获取缓存
      cache: {},

      // 经过矫正后的 abcJSON 配置文件 (看情况使用)
      prefixAbcJSON: {},

      packageJSON: {},

      // paths路径合集
      paths: {},

      // os 系统相关合集 [如 ip, cpus线程数量等信息]
      os: {},

      // logger 统一化输出
      logger: ["log", "info", "warn", "error"],

      // index
    },

    // 服务核心
    servers : {
      // 本地的mock服务实现
      mockServer: ()=>{},

      // webUI服务实现
      webUIServer: ()=>{},

      // proxy第三方代理实现
      proxyServer: ()=>{}
    },

    // 内置包
    packages: {
      // 内置的项目类型工程化模板
      // 内置的例子
    },

  },

  // 命令 (突击队)
  commandos: {
    dev: {
      // index.js
    }
  },

  // 启动器
  cli: [
    "init",
    "dev",
    "lint",
    "build",
    "publish",
    "upgrade",
    "preview",
    "link",
    "unlink",
  ]
};


// AOP的注入模式

// devServer.js 对dev开发命令的实现规范
export const devServer = function(context, args, ...callback){};

// build.js 对build构建命令的实现
export const build = function(context, args, ...callback){};

// publish.js 对publish发布命令的实现
export const publish = function(context, args, ...callback){};

// lint .eslintrc.js 只需提供一个eslintrc的文件，即可完成对lint命令的实现
// lint --fix
export const eslintrc = {};

// init.js 在当前项目下可新建的模板
export const init = function(context, args, ...callback){};
