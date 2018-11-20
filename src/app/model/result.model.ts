import { Field } from './Field';
import { KosztyTransportu } from './koszty-transportu';

export interface Result {
  kosztyTransportu?: number[][];
  tabelaPrzyblizen?: number[][];
  minFunkcjiCelu?: number;
  alpha?: number[];
  beta?: number[];
  deltas?: number[][];
  zoptymalizowane?: boolean;
  minCyklu?: Field;
}
