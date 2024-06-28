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
  score: number = 0;
  devModeVisible = false;
  showResult = false;
  isCorrect = false;

  constructor(private flagService: FlagService) {
    this.currentFlag = this.flagService.getRandomFlag();
  }

  ngOnInit() {
    this.initializeGuessArray();
  }

  ngAfterViewInit() {
    this.setFocusOnFirstInput();
  }

  initializeGuessArray() {
    this.guessArray = new Array(this.currentFlag.country.length).fill('');
  }

  setFocusOnFirstInput() {
    setTimeout(() => {
      const firstInput = document.querySelector('input[data-index="0"]') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 0);
  }

  onInputEvent(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.toLowerCase();
    console.log(`onInputEvent: index=${index}, value=${value}`);
  
    if (value.length > 0) {
      this.guessArray[index] = value.charAt(value.length - 1);
      input.value = this.guessArray[index];
      console.log(`Updated guessArray: ${this.guessArray}`);
  
      if (index < this.currentFlag.country.length - 1) {
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-index="${index + 1}"]`) as HTMLInputElement;
          if (nextInput) {
            nextInput.value = ''; // Clear the next input before focusing
            nextInput.focus();
          }
        }, 0);
      }
    }
  
    this.checkGuess();
  }

  onKeyDownEvent(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    console.log(`onKeyDownEvent: index=${index}, key=${event.key}`);

    if (event.key === 'Backspace') {
      event.preventDefault();
      this.guessArray[index] = '';
      input.value = '';
      console.log(`Updated guessArray: ${this.guessArray}`);

      if (index > 0) {
        setTimeout(() => {
          const prevInput = document.querySelector(`.letter:nth-child(${index}) input`) as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
          }
        }, 10);
      }
    }
  }

  isLetterCorrect(index: number): boolean {
    return this.guessArray[index].toLowerCase() === this.currentFlag.country[index].toLowerCase();
  }

  checkGuess() {
    const userGuess = this.guessArray.join('').toLowerCase();
    if (userGuess === this.currentFlag.country.toLowerCase()) {
      this.score++;
      this.showResultMessage(true); // Show correct message
      this.newFlag(); // Load new flag after showing message
    } else {
      this.showResultMessage(false); // Show incorrect message
    }
  }

  newFlag() {
    this.currentFlag = this.flagService.getRandomFlag();
    this.initializeGuessArray();

    setTimeout(() => {
      const inputs = document.querySelectorAll('.letter-container input') as NodeListOf<HTMLInputElement>;
      inputs.forEach(input => {
        input.value = '';
      });
      this.setFocusOnFirstInput(); // Ensure the focus is set on the first input of the new flag
    }, 0);
  }

  showDev() {
    this.devModeVisible = !this.devModeVisible;
  }

  showResultMessage(correct: boolean) {
    this.isCorrect = correct;
    this.showResult = true;
    setTimeout(() => {
      this.showResult = false;
    }, 2000); // Hide result message after 2 seconds
  }
}
