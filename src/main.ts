import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { initData } from "./later/api";

// 初始化数据
initData();

createApp(App).use(Antd).use(router).mount("#app");
