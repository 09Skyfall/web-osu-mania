import { h } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

export enum ROUTE {
  HOME = "HOME",
  GAME_FIELD = "GAME_FIELD",
}

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: { name: ROUTE.HOME } },
  {
    path: "/home",
    name: ROUTE.HOME,
    component: () => import("../views/Home.vue"),
  },
  {
    path: "/play/:beatmapId/:levelId",
    name: ROUTE.GAME_FIELD,
    props: true,
    component: () => import("../views/Play.vue"),
  },
  {
    path: "/benchmarks",
    children: [
      {
        path: "canvas-clear",
        component: () => import("../../benchmarks/canvas-clear/CanvasClear.vue"),
      },
    ],
  },
  { path: "/:pathMatch(.*)*", component: h("h1", "404") }, // TODO
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
