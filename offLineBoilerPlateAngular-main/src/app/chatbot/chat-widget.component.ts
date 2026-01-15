import { Component } from '@angular/core';

@Component({
    selector: 'app-chat-widget',
    template: `
        <div class="chat-widget card">
            <div class="card-body p-0 d-flex flex-column h-100">
                <app-conversation-list *ngIf="view === 'list'" 
                    [isWidget]="true"
                    (selectConversation)="onSelectConversation($event)">
                </app-conversation-list>
                
                <app-chat *ngIf="view === 'chat'" 
                    [isWidget]="true"
                    [conversationIdInput]="selectedConversationId"
                    (back)="onBack()">
                </app-chat>
            </div>
        </div>
    `,
    styles: [`
        .chat-widget {
            position: fixed;
            bottom: 90px;
            right: 2rem;
            width: 350px;
            height: 500px;
            z-index: 1049;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            border: none;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .card-body {
            overflow-y: auto;
        }
        @media (max-width: 576px) {
            .chat-widget {
                width: 90%;
                right: 5%;
                bottom: 80px;
            }
        }
    `]
})
export class ChatWidgetComponent {
    view: 'list' | 'chat' = 'list';
    selectedConversationId?: number;

    onSelectConversation(conversationId: number) {
        this.selectedConversationId = conversationId;
        this.view = 'chat';
    }

    onBack() {
        this.view = 'list';
        this.selectedConversationId = undefined;
    }
}
