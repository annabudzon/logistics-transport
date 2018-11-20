import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KosztyTransportu } from '../model/koszty-transportu';
import { Mozliwosci } from '../model/mozliwosci';
import { KosztyTransportuService } from '../service/koszty-transportu.service';

@Component({
  selector: 'app-input-table',
  templateUrl: './input-table.component.html',
  styleUrls: ['./input-table.component.css']
})
export class InputTableComponent implements OnInit {
  displayedColumns: string[] = ['dostawcyOdbiorcy', 'O1', 'O2', 'O3'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  displayedRows: KosztyTransportu[];
  data: KosztyTransportu[] = this.displayedRows;
  mozliwosci: Mozliwosci = {
    D: [50, 70, 30],
    O: [20, 40, 90]
  };

  constructor(
    public service: KosztyTransportuService,
    private router: Router
  ) {}

  ngOnInit() {
    this.displayedRows = [
      { dostawcyOdbiorcy: 'D1', O1: 3, O2: 6, O3: 5 },
      { dostawcyOdbiorcy: 'D2', O1: 4, O2: 12, O3: 10 },
      { dostawcyOdbiorcy: 'D3', O1: 4, O2: 5, O3: 4 }
    ];
    this.service.setJednostkoweKosztyTransportu(this.displayedRows);
    this.data = this.displayedRows;
  }

  checkIfBalanced() {
    const m = this.transformMozliwosci();
    return (m.D[0] + m.D[1] + m.D[2]) === (m.O[0] + m.O[1] + m.O[2]);
  }

  metodaNajmniejszegoElementu() {
    const m = this.transformMozliwosci();
    this.service.obliczMetodaNajmniejszegoElementu(m);
    this.router.navigate(['/result']);
  }

  metodaWierzcholkaPlnZach() {
    const m = this.transformMozliwosci();
    this.service.obliczMetodaWierzcholkaPlnZach(m);
    this.router.navigate(['/result']);
  }

  transformMozliwosci() {
    const m = {
      D: this.mozliwosci.D.map(s => Number(s)),
      O: this.mozliwosci.O.map(s => Number(s))
    };

    return m;
  }
}
