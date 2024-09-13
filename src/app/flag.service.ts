import { Injectable } from '@angular/core';
import { Flag } from './flag.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FlagService {
  private flags: Flag[] = [];

  constructor(private http: HttpClient) {
    this.loadFlags();
  }

  private loadFlags(): Observable<Flag[]> {
    return this.http.get<Flag[]>('assets/country-flag.json').pipe(
      map(data => {
        this.flags = data;
        return this.flags;
      })
    );
  }
  

  getRandomFlag(difficulty: string): Observable<Flag | null> {
    return this.loadFlags().pipe(
      map(() => {
        const filteredFlags = this.flags.filter(flag => flag.difficulty === difficulty);
  
        if (filteredFlags.length === 0) {
          console.error(`No flags found for difficulty: ${difficulty}`);
          return null;
        }
  
        const randomIndex = Math.floor(Math.random() * filteredFlags.length);
        return filteredFlags[randomIndex];
      })
    );
  }
  
}
