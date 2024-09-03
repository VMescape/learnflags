import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Flag } from './flag.model';
import { FlagService } from './flag.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'learnflags';
  currentFlag: Flag;
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
  gameOver: boolean = false;

  constructor(private flagService: FlagService) {
    this.currentFlag = this.flagService.getRandomFlag();
  }

  ngOnInit() {
    this.initializeArrays();
    this.startTimer();
  }

  ngAfterViewInit() {
    this.setFocusOnFirstInput();
  }

  initializeArrays() {
    this.displayArray = this.currentFlag.name.split('');
    this.inputArray = this.currentFlag.name.split('');
    this.guessArray = this.inputArray.map(char => char === ' ' ? ' ' : '');
  }

  setFocusOnFirstInput() {
    setTimeout(() => {
      const firstInput = document.querySelector('input:not([disabled])') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 0);
  }

  onInputEvent(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();
    if (value.length > 0) {
      this.guessArray[index] = value.charAt(value.length - 1);
      input.value = this.guessArray[index];
      this.focusNextInput(index);
    }
    this.checkGuess();
  }

  focusNextInput(currentIndex: number) {
    if (currentIndex < this.inputArray.length - 1) {
      setTimeout(() => {
        let nextIndex = currentIndex + 1;
        while (nextIndex < this.inputArray.length && this.inputArray[nextIndex] === ' ') {
          nextIndex++;
        }
        const nextInput = document.querySelector(`input[data-index="${nextIndex}"]:not([disabled])`) as HTMLInputElement;
        if (nextInput) {
          nextInput.value = '';
          nextInput.focus();
        }
      }, 0);
    }
  }

  onKeyDownEvent(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.guessArray[index] = '';
      input.value = '';
      if (index > 0) {
        setTimeout(() => {
          let prevIndex = index - 1;
          while (prevIndex >= 0 && this.inputArray[prevIndex] === ' ') {
            prevIndex--;
          }
          const prevInput = document.querySelector(`input[data-index="${prevIndex}"]:not([disabled])`) as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
          }
        }, 10);
      }
    }
  }

  isLetterCorrect(index: number): boolean {
    return this.guessArray[index].toLowerCase() === this.inputArray[index].toLowerCase();
  }

  checkGuess() {
    if (this.gameOver) return;

    const userGuess = this.guessArray.join('').toLowerCase();
    if (userGuess === this.inputArray.join('').toLowerCase()) {
      this.score++;
      this.streak++;
      this.showResultMessage(true);
      this.newFlag(true);  // Pass 'true' to increase the timer
    } else if (this.guessArray.every((char, index) => char !== '' || this.inputArray[index] === ' ')) {
      this.streak = 0;
      this.showResultMessage(false);
    }
  }
  
  newFlag(increaseTimer: boolean = false) {
    if (this.gameOver) return;
  
    this.currentFlag = this.flagService.getRandomFlag();
    this.initializeArrays();
    this.hintUsed = false;
    this.hintText = '';
  
    if (increaseTimer) {
      this.timeLeft = Math.min(this.timeLeft + 10, 60); // Cap at 60 seconds
    }
  
    clearInterval(this.timer);
    this.startTimer();
  
    setTimeout(() => {
      const inputs = document.querySelectorAll('.letter-container input:not([disabled])') as NodeListOf<HTMLInputElement>;
      inputs.forEach(input => {
        input.value = '';
      });
      this.setFocusOnFirstInput();
    }, 0);
  }
  
  
  restartGame() {
    this.score = 0;
    this.streak = 0;
    this.timeLeft = 30; // Reset the timer to the initial value
    this.gameOver = false; // Reset the game over flag
    this.currentFlag = this.flagService.getRandomFlag(); // Get a new flag
    this.initializeArrays(); // Initialize the arrays for the new game
    this.startTimer(); // Start the timer again
    this.setFocusOnFirstInput(); // Set focus on the first input
  }


  showDev() {
    this.devModeVisible = !this.devModeVisible;
  }

  showResultMessage(correct: boolean) {
    this.isCorrect = correct;
    this.showResult = true;
    setTimeout(() => {
      this.showResult = false;
    }, 2000);
  }

  showHint() {
    this.hintUsed = true;
    this.timeLeft= this.timeLeft - 10
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
      this.gameOver = true;  // Set the game over flag
      this.showResultMessage(false);
      // Optionally, display a game over message or take other actions
    } else {
      this.showResultMessage(false);
      this.streak = 0;
      setTimeout(() => this.newFlag(), 2000);
    }
  }

  getInputIndex(displayIndex: number): number {
    return this.displayArray.slice(0, displayIndex).filter(char => char !== ' ').length;
  }
}