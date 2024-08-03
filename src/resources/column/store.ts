import Column from "./Column.vue";

export type ColumnProps = Pick<InstanceType<typeof Column>["$props"], "notes" | "hitKey">