import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "../views/RegisterView.vue";
import ArticleListView from "../views/ArticleListView.vue";
import ArticleEditView from "../views/ArticleEditView.vue";
import ArticleDetailView from "../views/ArticleDetailView.vue";
import ArticleDraftsView from "../views/ArticleDraftsView.vue";
import CategoryManageView from "../views/CategoryManageView.vue";
import UserProfileView from "../views/UserProfileView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/user/login",
    name: "userLogin",
    component: LoginView,
  },
  {
    path: "/user/register",
    name: "userRegister",
    component: RegisterView,
  },
  {
    path: "/user/profile",
    name: "userProfile",
    component: UserProfileView,
  },
  {
    path: "/article/list",
    name: "articleList",
    component: ArticleListView,
  },
  {
    path: "/article/drafts",
    name: "articleDrafts",
    component: ArticleDraftsView,
  },
  {
    path: "/article/create",
    name: "articleCreate",
    component: ArticleEditView,
  },
  {
    path: "/article/edit/:id",
    name: "articleEdit",
    component: ArticleEditView,
  },
  {
    path: "/article/view/:id",
    name: "articleView",
    component: ArticleDetailView,
  },
  {
    path: "/category/manage",
    name: "categoryManage",
    component: CategoryManageView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
