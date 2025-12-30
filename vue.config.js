const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: "warning", //降低对校验的严格程度
  devServer: {
    port: 8081, // 改成其他端口
  },
});
