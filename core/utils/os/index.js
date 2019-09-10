const os = require('os');
const ip = require('ip');

// CPU 核心
const cpus = os.cpus();
// 操作系统类型
const type = os.type();
// 本机的ip地址
// console.log(ip);
const ipAddress = ip.address();
// 线程数
const threads = cpus ? cpus.length : 1;

module.exports = {
  type,
  cpus,
  ip: ipAddress,
  threads,
};
