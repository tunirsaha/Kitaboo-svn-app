import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import { Change, diffChars } from 'diff';

export interface EditorData {
  id: number;
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, EditorModule, FormsModule, CommonModule],
  providers: [DatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  content = '';
  contentArr: EditorData[] = [];
  displayChangedContent: SafeHtml = '';

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {}

  initTiny(): any {
    return {
      selector: '#textarea',
      toolbar: false,
      menubar: false,
      KeyboardEvent: false,
      ai_request: (request: any, respondWith: any) => respondWith.string(() => Promise.reject("See docs to implement AI Assistant")),
    }
  }

  modelChangeFn(e: any) {
    this.content = e;
  }

  save(): any {
    this.contentArr.push({
      id: this.contentArr.length,
      content: this.content,
      timestamp: new Date()
    })
  }

  reset(): void {
    this.content = ''
  }

  clearAll(): void {
    this.reset()
    this.contentArr = []
    this.displayChangedContent = ''
  }

  getItemClick(event: any): void {
    let _tmpContent = '';
    const clickedId = event.target.id;
    if (clickedId > 0) {
      _tmpContent = this.compareAndWrap(
        this.contentArr[clickedId].content, this.contentArr[clickedId - 1].content
      );
    } else {
      _tmpContent = this.contentArr[0].content
    }
    this.displayChangedContent = this.sanitizer.bypassSecurityTrustHtml(_tmpContent);
  }

  compareAndWrap(newHtml: string, oldHtml: string): string {
    const diff = diffChars(oldHtml, newHtml);
    let resultHtml = '';

    diff.forEach((part: Change) => {
      // Encode HTML to handle special characters like '<', '>', '&', etc.
      const escapedValue = part.value.replace(/[&]/g, match => ({ '<': '<', '>': '>', '&': '&' }[match] || match));
      if (part.added) {
        resultHtml += `<span style="background-color: lightgreen;">${escapedValue}</span>`;
      } else if (part.removed) {
        resultHtml += `<span style="background-color: lightcoral;">${escapedValue}</span>`;
      } else {
        resultHtml += escapedValue;
      }
    });
    return resultHtml;
  }

}