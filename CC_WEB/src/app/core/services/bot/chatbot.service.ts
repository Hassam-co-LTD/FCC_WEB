import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { ChatMessage } from '../../models/chatbot';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private conversationId: string | null = null;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  private openSubject = new BehaviorSubject<boolean>(false);
  isOpen$: Observable<boolean> = this.openSubject.asObservable();

  constructor(private api: ApiService) {}

  toggle(): void {
    this.openSubject.next(!this.openSubject.value);
  }

  open(): void {
    this.openSubject.next(true);
  }

  close(): void {
    this.openSubject.next(false);
  }

  ask(question: string): void {
    const trimmed = question.trim();
    if (!trimmed || this.loadingSubject.value) {
      return;
    }

    this.pushMessage({ role: 'user', text: trimmed, timestamp: new Date() });
    this.loadingSubject.next(true);

    this.api
      .askChatbot({
        question: trimmed,
        conversationId: this.conversationId ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.conversationId = res.conversationId;
          this.pushMessage({
            role: 'assistant',
            text: res.answer,
            sources: res.sources,
            timestamp: new Date(),
          });
          this.loadingSubject.next(false);
        },
        error: (err) => {
          this.pushMessage({
            role: 'assistant',
            text: err.message || 'Something went wrong. Please try again.',
            timestamp: new Date(),
            isError: true,
          });
          this.loadingSubject.next(false);
        },
      });
  }

  resetConversation(): void {
    this.conversationId = null;
    this.messagesSubject.next([]);
  }

  private pushMessage(msg: ChatMessage): void {
    this.messagesSubject.next([...this.messagesSubject.value, msg]);
  }
}
