import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, type Message } from '../../services/api.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit {
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;
  
  messages: Message[] = [];
  userInput = '';
  conversationId = '';
  isLoading = false;
  errorMessage = '';
  conversationEnded = false;

  private readonly STORAGE_KEY = 'feedback_bot_conversation_id';

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Always start a fresh conversation on page load
    // This ensures each reload creates a new record (no upsert)
    localStorage.removeItem(this.STORAGE_KEY);
    this.startConversation();
  }

  startConversation(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.conversationEnded = false;
    
    this.apiService.startConversation().subscribe({
      next: (conversation) => {
        this.conversationId = conversation.id;
        this.messages = conversation.messages || [];
        this.isLoading = false;
        localStorage.setItem(this.STORAGE_KEY, conversation.id);
        this.cdr.detectChanges();
        this.focusInput();
      },
      error: (error) => {
        this.errorMessage = 'Failed to start conversation. Please try again.';
        this.isLoading = false;
        console.error('Error starting conversation:', error);
      }
    });
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    
    if (!text) {
      this.errorMessage = 'Message cannot be empty';
      return;
    }

    if (this.conversationEnded) {
      this.errorMessage = 'This conversation has ended. Starting a new one...';
      localStorage.removeItem(this.STORAGE_KEY);
      this.startConversation();
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    const userMessage: Message = {
      sender: 'developer',
      text: text,
      timestamp: new Date().toISOString()
    };
    this.messages.push(userMessage);
    this.userInput = '';

    this.apiService.sendMessage(this.conversationId, text).subscribe({
      next: (response) => {
        this.messages.push(response.message);
        this.conversationId = response.conversationId;
        localStorage.setItem(this.STORAGE_KEY, response.conversationId);
        
        if (response.message.text.includes("That's really helpful — thank you for taking the time")) {
          this.conversationEnded = true;
          localStorage.removeItem(this.STORAGE_KEY);
        }
        
        this.isLoading = false;
        this.cdr.detectChanges();
        this.scrollToBottom();
        this.focusInput();
      },
      error: (error) => {
        if (error.error?.message?.includes('has already ended')) {
          this.errorMessage = 'This conversation has ended. Starting a new one...';
          this.conversationEnded = true;
          localStorage.removeItem(this.STORAGE_KEY);
          setTimeout(() => {
            this.startConversation();
          }, 2000);
        } else {
          this.errorMessage = 'Failed to send message. Please try again.';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
        this.focusInput();
        console.error('Error sending message:', error);
      }
    });
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return;
    }
    
    event.preventDefault();
    this.sendMessage();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.message-area');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  private focusInput(): void {
    setTimeout(() => {
      if (this.messageInput?.nativeElement) {
        this.messageInput.nativeElement.focus();
      }
    }, 50);
  }
}
