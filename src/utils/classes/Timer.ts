import { assert } from "../assertions/assert";

export class Timer {
  private _start_t = 0;
  private _paused_t: null | number = null;
  private _paused_time = 0;

  public start() {
    this._start_t = performance.now();
  }

  public pause() {
    this._paused_t = performance.now();
  }

  public resume() {
    assert(this._paused_t);
    this._paused_time += performance.now() - this._paused_t;
    this._paused_t = null;
  }

  public get started() {
    return this._start_t !== 0;
  }

  public get paused() {
    return this._paused_t !== null;
  }

  public get elapsed() {
    if (!this.started) return 0;

    if (this.paused) {
      assert(this._paused_t);
      this._paused_time += performance.now() - this._paused_t;
      this._paused_t = performance.now();
    }

    return performance.now() - this._start_t - this._paused_time;
  }
}
