import { Component, OnInit } from '@angular/core';
import { KosztyTransportuService } from '../service/koszty-transportu.service';
import { Result } from '../model/result.model';
import { Field } from '../model/Field';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  result: Result;
  cykl: Field[] = [];
  brakRozwiazania = false;

  constructor(private service: KosztyTransportuService) {}

  ngOnInit() {
    this.service.getResult().subscribe((result: Result) => {
      this.result = result;
    });

    this.service.getCykl().subscribe((cykl: Field[]) => {
      this.cykl = cykl;
    });

    this.service.getBrakRozwiazania().subscribe((isBrak: boolean) => {
      if (isBrak) {
        this.cykl = null;
        this.result = null;
        this.brakRozwiazania = true;
      }
    });
  }

  calculateAgain() {
    this.service.calculateAgain();
  }

  checkIfMin(idx: number) {
    const values = this.cykl.map(field => field.value);
    return this.cykl[idx].value === Math.min(...values);
  }
}
