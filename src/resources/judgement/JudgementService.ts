import { MaybeArray } from "../../types/MaybeArray";
import { toArray } from "../../utils/toArray";
import { Judgement } from "./store";

/** 
 * @doc ho bisogno di un singleton che si occupi di mostrare i judgements in quanto
 * non posso lasciare che sia il composable useJudgement da solo a occuparsene. 
 * Se così fosse finirei per avere quattro sequenze separate di judgements, una per ogni colonna,
 * piuttosto che un'unica sequenza che raggruppa i valori delle varie colonne
 */

type OnAddJudgementFunction = (judgement: Judgement) => void

class JudgementService {
  private cbs: OnAddJudgementFunction[] = []

  public add(judgement: Judgement) {
    this.cbs.forEach(cb => cb(judgement))
  }

  public onAdd(cbs: MaybeArray<OnAddJudgementFunction>) {
    this.cbs.push(...toArray(cbs))
  }
}

const judgementService = new JudgementService()

export { judgementService }