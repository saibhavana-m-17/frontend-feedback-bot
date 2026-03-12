import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  sender: 'developer' | 'bot';
  text: string;
  timestamp: string;
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
}
