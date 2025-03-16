import { Subscribable } from "../../utils/classes/Subscribable";
import { Judgement } from "./store";

/**
 * @doc ho bisogno di un singleton che si occupi di mostrare i judgements in quanto
 * non posso lasciare che sia il composable useJudgement da solo a occuparsene.
 * Se così fosse finirei per avere quattro sequenze separate di judgements, una per ogni colonna,
 * piuttosto che un'unica sequenza che raggruppa i valori delle varie colonne
 */

type JudgementServiceEventsDict = {
  add: { judgement: Judgement; note_hit_t: number; timestamp: number };
};

const judgementService = new Subscribable<JudgementServiceEventsDict>();

export { judgementService };
