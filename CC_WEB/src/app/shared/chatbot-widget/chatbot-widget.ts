import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { ChatbotService } from '../../core/services/bot/chatbot.service';
import { ChatMessage } from '../../core/models/chatbot';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './chatbot-widget.html',
  styleUrls: ['./chatbot-widget.scss'],
})
export class ChatbotWidget implements OnInit, OnDestroy {
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;

  isOpen = false;
  loading = false;
  messages: ChatMessage[] = [];
  draft = '';

  private destroy$ = new Subject<void>();

  constructor(private chatbot: ChatbotService) {}

  ngOnInit(): void {
    this.chatbot.isOpen$.pipe(takeUntil(this.destroy$)).subscribe((open) => {
      this.isOpen = open;
      if (open) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });

    this.chatbot.messages$.pipe(takeUntil(this.destroy$)).subscribe((msgs) => {
      this.messages = msgs;
      setTimeout(() => this.scrollToBottom(), 0);
    });

    this.chatbot.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((loading) => {
        this.loading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.chatbot.toggle();
  }

  send(): void {
    if (!this.draft.trim() || this.loading) {
      return;
    }
    this.chatbot.ask(this.draft);
    this.draft = '';
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  clearChat(): void {
    this.chatbot.resetConversation();
  }

  private scrollToBottom(): void {
    this.scrollAnchor?.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }
}
