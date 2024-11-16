import { remove } from "lodash";

export class AudioGraphNode<T extends AudioNode> {
  public node: T;
  public inbounds: AudioGraphNode<AudioNode>[] = [];
  public outbounds: AudioGraphNode<AudioNode>[] = [];

  constructor(node: T) {
    this.node = node;
    this.inbounds = [];
    this.outbounds = [];
  }

  connect<T extends AudioNode>(graphNode: AudioGraphNode<T>) {
    this.outbounds.push(graphNode);
    graphNode.inbounds.push(this);
    return this.node.connect(graphNode.node);
  }

  disconnect<T extends AudioNode>(graphNode: AudioGraphNode<T>) {
    remove(this.outbounds, (out_n) => out_n === graphNode);
    remove(graphNode.inbounds, (in_n) => in_n === graphNode);
    return this.node.disconnect(graphNode.node);
  }
}

type AudioGraphConstructorParameters = {
  input: AudioScheduledSourceNode;
  output: AudioDestinationNode;
};

export class AudioGraph {
  private _input: AudioGraphNode<AudioScheduledSourceNode>;
  private _output: AudioGraphNode<AudioDestinationNode>;

  constructor({ input, output }: AudioGraphConstructorParameters) {
    this._input = new AudioGraphNode(input);
    this._output = new AudioGraphNode(output);

    this._input.connect(this._output);
  }

  get input() {
    return this._input;
  }

  get output() {
    return this._output;
  }
}
