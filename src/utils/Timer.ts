export class Timer {
  private _start_t = 0

  public start() {
    this._start_t = performance.now()
  }

  public get started() {
    return this._start_t !== 0
  }

  public get elapsed() {
    if (this._start_t === 0) return 0
    return performance.now() - this._start_t
  }
}