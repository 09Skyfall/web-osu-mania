import { remove, uniqueId } from "lodash";
import { assert } from "../../utils/assertions/assert";

export class AudioGraphNode<T extends AudioNode> {
  public node: T;
  public inbounds: AudioGraphNode<AudioNode>[] = [];
  public outbounds: AudioGraphNode<AudioNode>[] = [];
  public id = uniqueId();

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
    let [removed] = remove(this.outbounds, (out_n) => out_n.id === graphNode.id);
    assert(removed);

    [removed] = remove(graphNode.inbounds, (in_n) => in_n.id === this.id);
    assert(removed);

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
