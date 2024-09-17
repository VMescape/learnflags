import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Flag } from './flag.model';
import { FlagService } from './flag.service';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  showStatus = false;
  title = 'learnflags';
  currentFlag: Flag = {} as Flag;
  guessArray: string[] = [];
  displayArray: string[] = [];
  inputArray: string[] = [];
  score: number = 0;
  streak: number = 0;
  devModeVisible = false;
  showResult = false;
  isCorrect = false;
  hintUsed: boolean = false;
  hintText: string = '';
  timeLeft: number = 30; 
  timer: any;
  currentDifficulty: string = 'easy';
  gameOver: boolean = false;
  playerName: string = '';
  leaderboard: boolean = false;
  highScores: Array<{ name: string, score: number, date: Date }> = [];

  constructor(private flagService: FlagService, private dataService: DataService) {
    this.loadFlag();
  }

  ngOnInit() {
    this.startTimer();
    this.initializeArrays();
  }

  ngAfterViewInit() {
    this.setFocusOnFirstInput();
  }

  initializeArrays() {
    this.displayArray = this.currentFlag.name.split('').map(char => char === ' ' ? '' : char);
    this.inputArray = this.currentFlag.name.split('');
    this.guessArray = this.inputArray.map(char => char === ' ' ? '' : '');
  }

  setFocusOnFirstInput() {
    requestAnimationFrame(() => {
      setTimeout(() => {
        const firstInput = document.querySelector('input:not([disabled])') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 0);
    });
  }

  onInputEvent(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();

    if (value.length > 0) {
      this.guessArray[index] = value.charAt(0); // Ensure it only takes the first character
      input.value = this.guessArray[index];
      this.focusNextInput(index); // Move to the next input field
    }

    this.checkGuess();
  }

  focusNextInput(currentIndex: number) {
    let nextIndex = currentIndex + 1;
    while (nextIndex < this.inputArray.length && this.inputArray[nextIndex] === ' ') {
      nextIndex++;
    }

    if (nextIndex < this.inputArray.length) {
      const nextInput = document.querySelector(`input[data-index="${nextIndex}"]:not([disabled])`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  focusPreviousInput(currentIndex: number) {
    let prevIndex = currentIndex - 1;
  
    // Skip spaces and already correct letters
    while (prevIndex >= 0 && (this.inputArray[prevIndex] === ' ' || this.isLetterCorrect(prevIndex))) {
      prevIndex--;
    }
  
    // Focus on the previous input if it exists
    if (prevIndex >= 0) {
      const prevInput = document.querySelector(`input[data-index="${prevIndex}"]:not([disabled])`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }
  
  

  onKeyDownEvent(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
  
    if (event.key === 'Backspace') {
      event.preventDefault();
  
      if (input.value === '') {
        // If the input is already empty, move to the previous input
        if (index > 0) {
          let prevIndex = index - 1;
          while (prevIndex >= 0 && this.inputArray[prevIndex] === ' ') {
            prevIndex--;
          }
  
          const prevInput = document.querySelector(`input[data-index="${prevIndex}"]:not([disabled])`) as HTMLInputElement;
          if (prevInput) {
            prevInput.value = '';  // Clear the previous input
            prevInput.focus();     // Focus on the previous input
            this.guessArray[prevIndex] = '';  // Clear the guess array for the previous input
          }
        }
      } else {
        // If the input has a value, clear it
        input.value = '';
        this.guessArray[index] = '';
      }
    }
  }
  

  isLetterCorrect(index: number): boolean {
    return this.guessArray[index].toLowerCase() === this.inputArray[index].toLowerCase();
  }

  checkGuess() {
    if (this.gameOver) return;
  
    const userGuess = this.guessArray.join('').toLowerCase();
    const correctAnswer = this.inputArray.join('').toLowerCase();
  
    const formattedUserGuess = userGuess.replace(/ /g, '');
    const formattedCorrectAnswer = correctAnswer.replace(/ /g, '');
  
    if (formattedUserGuess === formattedCorrectAnswer) {
      this.score++;
      this.streak++;
      this.isCorrect = true; // Correct answer
      this.playSound(true); // Play the correct sound
      this.showStatusIndicator();
      this.newFlag(true);  // Pass 'true' to increase the timer
    } else if (this.guessArray.every((char, index) => char !== '' || this.inputArray[index] === ' ')) {
      this.streak = 0;
      this.isCorrect = false; // Incorrect answer
      this.playSound(false); // Play the wrong sound
      this.showStatusIndicator();
    }
  }
  

  newFlag(increaseTimer: boolean = false) {
    if (this.gameOver) return;

    this.loadFlag();
    this.initializeArrays();
    this.hintUsed = false;
    this.hintText = '';

    if (increaseTimer) {
      this.timeLeft = Math.min(this.timeLeft + 10, 60);
    }

    clearInterval(this.timer);
    this.startTimer();

    setTimeout(() => {
      const inputs = document.querySelectorAll('.letter-container input:not([disabled])') as NodeListOf<HTMLInputElement>;
      inputs.forEach(input => {
        input.value = '';
      });
      this.setFocusOnFirstInput(); // Focus on the first input after clearing
    }, 0);
  }

  restartGame() {
    this.score = 0;
    this.streak = 0;
    this.timeLeft = 30;
    this.gameOver = false;
    this.currentDifficulty = 'easy';
    this.loadFlag();
    this.initializeArrays();

    clearInterval(this.timer);
    this.startTimer();
    this.setFocusOnFirstInput();
  }

  showDev() {
    this.devModeVisible = !this.devModeVisible;
  }

  showResultMessage(correct: boolean) {
    this.isCorrect = correct;
    this.showResult = true;
    setTimeout(() => {
      this.showResult = false;
    }, 500);
  }

  showHint() {
    this.hintUsed = true;
    this.timeLeft -= 5;
    this.hintText = `The country's name starts with "${this.currentFlag.name[0]}${this.currentFlag.name[1]}"`;
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.endRound();
      }
    }, 1000);
  }

  endRound() {
    clearInterval(this.timer);

    if (this.timeLeft <= 0) {
      this.gameOver = true;
      this.showResultMessage(false);
    } else {
      this.showResultMessage(false);
      this.streak = 0;
      setTimeout(() => this.newFlag(), 2000);
    }
  }

  getInputIndex(displayIndex: number): number {
    return this.displayArray.slice(0, displayIndex).filter(char => char !== ' ').length;
  }

  validateInput(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.charCode);
    if (!/^[a-zA-Z]*$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  saveScore() {
    if (this.playerName.trim() !== '') {
      this.dataService.saveHighScore(this.playerName, this.score)
        .then(() => console.log('Score saved successfully!'))
        .catch(error => console.error('Error saving score:', error));
      this.showLeaderboard();
    }
  }

  showStatusIndicator() {
    this.showStatus = true;
    setTimeout(() => this.showStatus = false, 1500); // Hide after 1.5 seconds
  }

  playSound(isCorrect: boolean) {
    const sound = isCorrect ? 'assets/pop.mp3' : 'assets/wrong.mp3';
    const audio = new Audio(sound);
    audio.play();
  }

  async showLeaderboard() {
    this.leaderboard = true;
    this.highScores = await this.dataService.getHighScores();
  
    // Sort high scores by score in descending order (highest score first)
    this.highScores.sort((a, b) => b.score - a.score);
  }
  
  
  

  hideLeaderboard() {
    this.leaderboard = false;
  }

  loadFlag() {
    this.updateDifficulty();
    this.flagService.getRandomFlag(this.currentDifficulty).subscribe(flag => {
      if (flag) {
        this.currentFlag = flag;
        this.initializeArrays();
      } else {
        console.error('Failed to load flag.');
      }
    }, error => {
      console.error('Error loading flag:', error);
    });
  }

  updateDifficulty() {
    if (this.score >= 20) {
      this.currentDifficulty = 'hard';
    } else if (this.score >= 10) {
      this.currentDifficulty = 'medium';
    } else {
      this.currentDifficulty = 'easy';
    }
  }
}
