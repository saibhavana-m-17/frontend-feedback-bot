import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Attachment {
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  mimeType: string;
}

export interface Message {
  sender: 'developer' | 'bot';
  text: string;
  timestamp: string;
  attachment?: Attachment;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  developerName: string;
  messages: Message[];
  startTime: string;
  endTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = ''; // Empty string for relative URLs (same origin)

  constructor(private http: HttpClient) {}

  startConversation(): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.apiUrl}/api/feedback/conversations`, {});
  }

  getConversation(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/api/feedback/conversations/${conversationId}`);
  }

  sendMessage(conversationId: string, text: string): Observable<{ message: Message; conversationId: string }> {
    return this.http.post<{ message: Message; conversationId: string }>(
      `${this.apiUrl}/api/feedback/conversations/${conversationId}/messages`,
      { text }
    );
  }
  sendMessageWithFiles(conversationId: string, text: string, files: File[]): Observable<{ message: Message; conversationId: string }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('text', text);
    return this.http.post<{ message: Message; conversationId: string }>(
      `${this.apiUrl}/api/feedback/conversations/${conversationId}/messages`,
      formData
    );
  }

  getFileUrl(storedFilename: string): string {
    return `${this.apiUrl}/api/feedback/files/${storedFilename}`;
  }
}
