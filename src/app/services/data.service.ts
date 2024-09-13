import { Injectable } from '@angular/core';
import { Firestore, addDoc, collection, getDocs, query } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore) { }

  async saveHighScore(playerName: string, score: number) {
    try {
      const docRef = await addDoc(collection(this.firestore, 'highscores'), {
        name: playerName,
        score: score,
        date: new Date()
      });
    } catch (e) {
      console.error("Error adding high score: ", e);
    }
  }

  async getHighScores(): Promise<{ name: string; score: number; date: Date }[]> {
    const scoresCollection = collection(this.firestore, 'highscores');
    const scoresQuery = query(scoresCollection);
    const querySnapshot = await getDocs(scoresQuery);
    
    const highScores: { name: string; score: number; date: Date }[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      highScores.push({
        name: data['name'],
        score: data['score'],
        date: data['date'].toDate() // Convert Firestore timestamp to Date object
      });
    });
  
    return highScores;
  }
  
}
