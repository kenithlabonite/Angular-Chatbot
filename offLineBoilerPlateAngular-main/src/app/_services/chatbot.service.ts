import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
const baseUrl = `${environment.apiUrl}/chatbot`;
export interface Conversation {
    conversationId: number;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    messageCount?: number;
    messages?: Message[];
}
export interface Message {
    messageId: number;
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
}
export interface MessageResponse {
    userMessage: Message;
    assistantMessage: Message;
}
@Injectable({ providedIn: 'root' })
export class ChatbotService {
    constructor(private http: HttpClient) { }
    createConversation(title?: string): Observable<Conversation> {
        return this.http.post<Conversation>(`${baseUrl}/conversations`, { title });
    }
    sendMessage(conversationId: number, message: string): Observable<MessageResponse> {
        return this.http.post<MessageResponse>(
            `${baseUrl}/conversations/${conversationId}/messages`,
            { message }
        );
    }
    getConversation(conversationId: number): Observable<Conversation> {
        return this.http.get<Conversation>(`${baseUrl}/conversations/${conversationId}`);
    }
    getAllConversations(): Observable<Conversation[]> {
        return this.http.get<Conversation[]>(`${baseUrl}/conversations`);
    }
    deleteConversation(conversationId: number): Observable<any> {
        return this.http.delete(`${baseUrl}/conversations/${conversationId}`);
    }
}