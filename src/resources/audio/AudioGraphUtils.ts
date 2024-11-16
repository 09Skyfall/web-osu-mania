import { AudioGraphNode } from "./AudioGraph";

export class AudioGraphUtils {
  static insertNodeBetween<T extends AudioNode>(
    node: AudioGraphNode<T>,
    a: AudioGraphNode<AudioNode>,
    b: AudioGraphNode<AudioNode>,
  ) {
    a.disconnect(b);
    a.connect(node);
    node.connect(b);

    return node;
  }

  static removeNode<T extends AudioNode>(
    node: AudioGraphNode<T>,
    newConnection?: { inbound: number; outbound: number },
  ) {
    if (newConnection) {
      node.inbounds[newConnection.inbound].connect(node.outbounds[newConnection.outbound]);
    }

    node.inbounds.forEach((inbound) => inbound.disconnect(node));

    node.outbounds.forEach((outbound) => node.disconnect(outbound));

    return node;
  }
}
