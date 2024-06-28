import { Injectable } from '@angular/core';
import { Flag } from './flag.model';
import { Observable } from 'rxjs';
import * as flagData from 'src/assets/country-flag.json';

@Injectable({
  providedIn: 'root'
})
export class FlagService {
  private flags: Flag[] = [];

  constructor() { 
    this.loadFlags()
  }

  private loadFlags() {
    this.flags = flagData as Flag[];
    console.log(this.flags);
  }

  getRandomFlag(): Flag {
    const randomIndex = Math.floor(Math.random() * this.flags.length);
    return this.flags[randomIndex]
  }
}
