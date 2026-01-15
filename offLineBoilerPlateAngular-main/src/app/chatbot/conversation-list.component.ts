import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ChatbotService, Conversation } from '@app/_services';
import { AlertService } from '@app/_services';
@Component({ selector: 'app-conversation-list', templateUrl: 'conversation-list.component.html' })
export class ConversationListComponent implements OnInit {
    @Input() isWidget = false;
    @Output() selectConversation = new EventEmitter<number>();
    
    conversations: Conversation[] = [];
    loading = false;

    constructor(
        private router: Router,
        private chatbotService: ChatbotService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.loadConversations();
    }

    loadConversations() {
        this.loading = true;
        this.chatbotService.getAllConversations()
            .pipe(first())
            .subscribe({
                next: (conversations) => {
                    this.conversations = conversations;
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    createConversation() {
        this.chatbotService.createConversation()
            .pipe(first())
            .subscribe({
                next: (conversation) => {
                    if (this.isWidget) {
                        this.selectConversation.emit(conversation.conversationId);
                        this.loadConversations(); // Reload list to show new one
                    } else {
                        this.router.navigate(['/chatbot', conversation.conversationId]);
                    }
                },
                error: error => this.alertService.error(error)
            });
    }

    openConversation(conversationId: number) {
        if (this.isWidget) {
            this.selectConversation.emit(conversationId);
        } else {
            this.router.navigate(['/chatbot', conversationId]);
        }
    }
    deleteConversation(conversationId: number, event: Event) {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this conversation?')) {
            this.chatbotService.deleteConversation(conversationId)
                .pipe(first())
                .subscribe({
                    next: () => {
                        this.conversations = this.conversations.filter(c => c.conversationId !== conversationId);
                        this.alertService.success('Conversation deleted');
                    },
                    error: error => this.alertService.error(error)
                });
        }
    }
}