<template>
  <div id="app">
    <a-layout>
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer">
        <a
          herf="https://coderfather.cn"
          target="_blank"
          rel="noopener noreferrer"
        >
          编程导航 by hnyn
        </a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import BasicComponent from "@/layout/BasicComponent.vue";
import GlobalHeader from "@/components/GlobalHeader.vue";
</script>
<style>
#app .footer {
  background-color: #efefef;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
}
#app .container {
  padding: 20px;
  margin-bottom: 20px;
  background: linear-gradient(to right, #efefef, #fff);
}
#app .header {
  background: white;
  margin-bottom: 16px;
  color: unset;
  padding-inline: 20px;
}
</style>
