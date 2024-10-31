import { h } from "vue";
import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

export enum ROUTE {
  BEATMAP_LIST = "BEATMAP_LIST",
  GAME_FIELD = "GAME_FIELD",
}

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: { name: ROUTE.BEATMAP_LIST } },
  {
    path: "/beatmaps",
    name: ROUTE.BEATMAP_LIST,
    component: () => import("../views/List.vue"),
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
