import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Field } from '../model/field';
import { Result } from '../model/result.model';
import { Mozliwosci } from '../model/mozliwosci';
import { KosztyTransportu } from '../model/koszty-transportu';
import { GuardsCheckStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class KosztyTransportuService {
  tabelaPrzyblizen: number[][];
  kosztyTransportu: number[][];
  alpha: number[];
  beta: number[];
  deltas: number[][];
  minFunkcjiCelu = 0;
  m: Mozliwosci;
  zoptymalizowane = false;
  minCyklu: Field;
  cykl: Field[];
  resultAnnouncer = new BehaviorSubject<Result | null>(null);
  cyklAnnouncer = new BehaviorSubject<Field[] | null>(null);
  brakRozwiazania = new BehaviorSubject<boolean | null>(null);

  getResult() {
    return this.resultAnnouncer.asObservable();
  }

  getCykl() {
    return this.cyklAnnouncer.asObservable();
  }

  getBrakRozwiazania() {
    return this.brakRozwiazania.asObservable();
  }

  announceResult(result: Result) {
    this.resultAnnouncer.next(result);
  }

  announceCykl(fields: Field[]) {
    this.cyklAnnouncer.next(fields);
  }

  announceBrakRozwiazania(ifBrak: boolean) {
    this.brakRozwiazania.next(ifBrak);
  }

  setResult() {
    const result: Result = {
      kosztyTransportu: this.kosztyTransportu,
      tabelaPrzyblizen: this.tabelaPrzyblizen,
      minFunkcjiCelu: this.minFunkcjiCelu,
      alpha: this.alpha,
      beta: this.beta,
      deltas: this.deltas,
      zoptymalizowane: this.zoptymalizowane,
      minCyklu: this.minCyklu
    };

    this.announceResult(result);

    console.log('result', result);
  }

  setZoptymalizowane(result: boolean) {
    this.zoptymalizowane = result;
  }

  setJednostkoweKosztyTransportu(koszty: KosztyTransportu[]) {
    this.kosztyTransportu = [[], [], []];

    this.kosztyTransportu[0][0] = koszty[0].O1;
    this.kosztyTransportu[0][1] = koszty[0].O2;
    this.kosztyTransportu[0][2] = koszty[0].O3;
    this.kosztyTransportu[1][0] = koszty[1].O1;
    this.kosztyTransportu[1][1] = koszty[1].O2;
    this.kosztyTransportu[1][2] = koszty[1].O3;
    this.kosztyTransportu[2][0] = koszty[2].O1;
    this.kosztyTransportu[2][1] = koszty[2].O2;
    this.kosztyTransportu[2][2] = koszty[2].O3;
  }

  obliczMetodaWierzcholkaPlnZach(mozliwosci: Mozliwosci) {
    this.announceResult(null);
    this.announceCykl(null);
    this.m = {
      D: [],
      O: []
    };
    this.m.D = [...mozliwosci.D];
    this.m.O = [...mozliwosci.O];

    this.metodaWierzcholkaPlnZach();
    this.obliczMinFunkcjiCelu();
    this.wyznaczAlphaBetaDlaBazowych();
    this.wyznaczDeltyDlaNiebazowych();
    this.checkIfZoptymalizowane();
    this.lookForCycle();
    this.setResult();
    this.announceCykl(this.cykl);
  }

  calculateAgain() {
    this.lookForCycle();
    this.recalculateTablicaPrzyblizen();
    this.obliczMinFunkcjiCelu();
    this.wyznaczAlphaBetaDlaBazowych();
    this.wyznaczDeltyDlaNiebazowych();
    this.checkIfZoptymalizowane();
    this.setResult();
    this.announceCykl(this.cykl);
  }

  obliczMetodaNajmniejszegoElementu(mozliwosci: Mozliwosci) {
    const tab = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]];
  }

  metodaWierzcholkaPlnZach() {
    const tab = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]];

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const min = this.m.D[i] <= this.m.O[j] ? this.m.D[i] : this.m.O[j];
        this.m.D[i] = this.m.D[i] - min;
        this.m.O[j] = this.m.O[j] - min;

        if (tab[i][j] === -1) {
          tab[i][j] = min;
        }

        if (this.m.D[i] === 0 && j < 2) {
          for (let a = j + 1; a < 2; a++) {
            tab[i][a] = 0;
          }
        } else if (this.m.O[j] === 0 && i < 2) {
          for (let a = i + 1; a < 2; a++) {
            tab[a][j] = 0;
          }
        }
      }
    }

    this.tabelaPrzyblizen = tab;
    console.log('tabela przyblizen', this.tabelaPrzyblizen);
  }

  obliczMinFunkcjiCelu() {
    const tab = this.tabelaPrzyblizen;
    const koszt = this.kosztyTransportu;
    this.minFunkcjiCelu = 0;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        this.minFunkcjiCelu += tab[i][j] * koszt[i][j];
      }
    }

    console.log('min funkcji celu', this.minFunkcjiCelu);
  }

  wyznaczAlphaBetaDlaBazowych() {
    this.deltas = [[-1, -1, -1], [-1, -1, -1], [-1, -1, -1]];
    this.alpha = [0, null, null];
    this.beta = [null, null, null];

    let k = 0;

    while (this.alpha.some(a => a === null) || this.beta.some(b => b === null)) {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (this.tabelaPrzyblizen[i][j] !== 0 && this.beta[j] !== null) {
            this.deltas[i][j] = 0;
            this.alpha[i] = -this.kosztyTransportu[i][j] - this.beta[j];
          }

          if (this.tabelaPrzyblizen[i][j] !== 0 && this.alpha[i] !== null) {
            this.deltas[i][j] = 0;
            this.beta[j] = -this.kosztyTransportu[i][j] - this.alpha[i];
          }
        }
      }
      k++;
      if (k === 30) {
        console.log('BRAK ROZWIAZANIA');
        this.announceBrakRozwiazania(true);
        return;
      }
    }
  }

  wyznaczDeltyDlaNiebazowych() {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.deltas[i][j] !== 0) {
          this.deltas[i][j] =
            this.alpha[i] + this.beta[j] + this.kosztyTransportu[i][j];
        }
      }
    }

    console.log('deltas', this.deltas);
    console.log('alphas', this.alpha);
    console.log('betas', this.beta);
  }

  checkIfZoptymalizowane() {
    let min = 0;

    this.deltas.forEach((d, i) => {
      if (Math.min(...d) < min) {
        min = Math.min(...d);
        this.minCyklu = {
          i: i,
          j: d.indexOf(min),
          value: min
        };
      }
    });

    console.log('minCyklu', this.minCyklu);

    if (min < 0) {
      this.setZoptymalizowane(false);
    } else {
      this.setZoptymalizowane(true);
      this.announceCykl(null);
    }
  }

  lookForCycle() {
    const m = this.minCyklu;
    let sasiedzi = [];

    const i_p = m.i - 1 < 0 ? 2 : m.i - 1;
    const j_p = m.j - 1 < 0 ? 2 : m.j - 1;
    const i_n = m.i + 1 > 2 ? 0 : m.i + 1;
    const j_n = m.j + 1 > 2 ? 0 : m.j + 1;

    sasiedzi = [
      { i: i_p, j: j_p, value: this.deltas[i_p][j_p] },
      { i: i_p, j: m.j, value: this.deltas[i_p][m.j] },
      { i: i_p, j: j_n, value: this.deltas[i_p][j_n] },

      { i: m.i, j: j_p, value: this.deltas[m.i][j_p] },
      { i: m.i, j: j_n, value: this.deltas[m.i][j_n] },

      { i: i_n, j: j_p, value: this.deltas[i_n][j_p] },
      { i: i_n, j: m.j, value: this.deltas[i_n][m.j] },
      { i: i_n, j: j_n, value: this.deltas[i_n][j_n] }
    ];

    if (!sasiedzi[0].value && !sasiedzi[1].value && !sasiedzi[3].value) {
      this.cykl = [sasiedzi[0], sasiedzi[1], sasiedzi[3], this.minCyklu];
    } else if (!sasiedzi[1].value && !sasiedzi[2].value && !sasiedzi[4].value) {
      this.cykl = [sasiedzi[1], sasiedzi[2], this.minCyklu, sasiedzi[4]];
    } else if (!sasiedzi[3].value && !sasiedzi[5].value && !sasiedzi[6].value) {
      this.cykl = [sasiedzi[3], this.minCyklu, sasiedzi[5], sasiedzi[6]];
    } else if (!sasiedzi[4].value && !sasiedzi[6].value && !sasiedzi[7].value) {
      this.cykl = [this.minCyklu, sasiedzi[4], sasiedzi[6], sasiedzi[7]];
    }

    console.log('cykl', this.cykl);
  }

  recalculateTablicaPrzyblizen() {
    let min = 0;

    switch (this.cykl.indexOf(this.minCyklu)) {
      case 1:
      case 2:
        min =
          this.tabelaPrzyblizen[this.cykl[0].i][this.cykl[0].j] <
          this.tabelaPrzyblizen[this.cykl[3].i][this.cykl[3].j]
            ? this.tabelaPrzyblizen[this.cykl[0].i][this.cykl[0].j]
            : this.tabelaPrzyblizen[this.cykl[3].i][this.cykl[3].j];

        this.tabelaPrzyblizen[this.cykl[0].i][this.cykl[0].j] -= min;
        this.tabelaPrzyblizen[this.cykl[3].i][this.cykl[3].j] -= min;
        this.tabelaPrzyblizen[this.cykl[1].i][this.cykl[1].j] += min;
        this.tabelaPrzyblizen[this.cykl[2].i][this.cykl[2].j] += min;
        break;
      case 0:
      case 3:
        min =
          this.tabelaPrzyblizen[this.cykl[1].i][this.cykl[1].j] <
          this.tabelaPrzyblizen[this.cykl[2].i][this.cykl[2].j]
            ? this.tabelaPrzyblizen[this.cykl[1].i][this.cykl[1].j]
            : this.tabelaPrzyblizen[this.cykl[2].i][this.cykl[2].j];

        this.tabelaPrzyblizen[this.cykl[1].i][this.cykl[1].j] -= min;
        this.tabelaPrzyblizen[this.cykl[2].i][this.cykl[2].j] -= min;
        this.tabelaPrzyblizen[this.cykl[0].i][this.cykl[0].j] += min;
        this.tabelaPrzyblizen[this.cykl[3].i][this.cykl[3].j] += min;
        break;
    }

    console.log('zmodyfikowana tablica przyblizen', this.tabelaPrzyblizen);
  }
}
