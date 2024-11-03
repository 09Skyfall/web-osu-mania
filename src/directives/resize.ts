const __resize_observer__ = Symbol("__resize_observer__");

const resize = {
  [__resize_observer__]: null as ResizeObserver | null,
  get mounted() {
    return (el: HTMLElement, { value }: { value: ResizeObserverCallback }) => {
      this[__resize_observer__] = new ResizeObserver(value);
      this[__resize_observer__].observe(el);
    };
  },
  get unmounted() {
    return () => {
      if (this[__resize_observer__]) this[__resize_observer__].disconnect();
    };
  },
};

export default resize;
