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
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  messages: Message[] = [];
  userInput = '';
  conversationId = '';
  isLoading = false;
  errorMessage = '';
  conversationEnded = false;
  selectedFiles: File[] = [];

  private readonly STORAGE_KEY = 'feedback_bot_conversation_id';
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  constructor(
    public apiService: ApiService,
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

      if (!text && this.selectedFiles.length === 0) {
        this.errorMessage = 'Message cannot be empty';
        return;
      }

      if (this.conversationEnded) {
        // After conversation ends, still allow sending messages (e.g. file uploads)
        // Only a page refresh starts a new conversation
      }

      this.errorMessage = '';
      this.isLoading = true;

      const userMessage: Message = {
        sender: 'developer',
        text: text || this.selectedFiles.map(f => f.name).join(', '),
        timestamp: new Date().toISOString(),
        ...(this.selectedFiles.length > 0 && {
          attachments: this.selectedFiles.map(f => ({
            originalFilename: f.name,
            storedFilename: '',
            fileSize: f.size,
            mimeType: f.type || 'application/octet-stream',
          }))
        }),
      };
      this.messages.push(userMessage);
      this.userInput = '';
      this.cdr.detectChanges();
      this.scrollToBottom();

      const request$ = this.selectedFiles.length > 0
        ? this.apiService.sendMessageWithFiles(this.conversationId, text, this.selectedFiles)
        : this.apiService.sendMessage(this.conversationId, text);

      request$.subscribe({
        next: (response) => {
          this.messages.push(response.message);
          this.conversationId = response.conversationId;
          localStorage.setItem(this.STORAGE_KEY, response.conversationId);

          this.removeFile();
          this.isLoading = false;
          this.cdr.detectChanges();
          this.scrollToBottom();
          this.focusInput();
        },
        error: (error) => {
          this.errorMessage = 'Failed to send message. Please try again.';
          this.isLoading = false;
          this.cdr.detectChanges();
          this.focusInput();
          console.error('Error sending message:', error);
        }
      });
    }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        if (file.size > this.MAX_FILE_SIZE) {
          this.errorMessage = `File "${file.name}" exceeds the 10 MB size limit`;
          continue;
        }
        this.selectedFiles.push(file);
      }
      this.errorMessage = '';
      input.value = '';
    }
  }

  removeFile(index?: number): void {
    if (index !== undefined) {
      this.selectedFiles.splice(index, 1);
    } else {
      this.selectedFiles = [];
    }
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
