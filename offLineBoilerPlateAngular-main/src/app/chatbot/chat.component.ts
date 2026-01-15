import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { ChatbotService, Conversation, Message } from '@app/_services';
import { AlertService } from '@app/_services';
@Component({ selector: 'app-chat', templateUrl: 'chat.component.html', styleUrls: ['./chat.component.less'] })
export class ChatComponent implements OnInit, AfterViewChecked {
    @Input() isWidget = false;
    @Input() set conversationIdInput(value: number | undefined) {
        if (value) {
            this.conversationId = value;
            this.loadConversation();
        }
    }
    @Output() back = new EventEmitter<void>();

    @ViewChild('messageContainer') private messageContainer!: ElementRef;
    
    conversationId!: number;
    conversation?: Conversation;
    messages: Message[] = [];
    form!: FormGroup;
    loading = false;
    sending = false;
    private shouldScroll = false;

    constructor(
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private chatbotService: ChatbotService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        if (!this.conversationId) {
            this.conversationId = parseInt(this.route.snapshot.params['conversationId']);
        }
        
        this.form = this.formBuilder.group({
            message: ['', [Validators.required, Validators.maxLength(5000)]]
        });

        if (this.conversationId) {
            this.loadConversation();
        }
    }
    ngAfterViewChecked() {
        if (this.shouldScroll) {
            this.scrollToBottom();
            this.shouldScroll = false;
        }
    }
    get f() { return this.form.controls; }
    loadConversation() {
        this.loading = true;
        this.chatbotService.getConversation(this.conversationId)
            .pipe(first())
            .subscribe({
                next: (conv) => {
                    this.conversation = conv;
                    this.messages = conv.messages || [];
                    this.shouldScroll = true;
                    this.loading = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }
    onSubmit() {
        if (this.form.invalid) return;
        const message = this.f.message.value.trim();
        if (!message) return;
        this.sending = true;
        this.chatbotService.sendMessage(this.conversationId, message)
            .pipe(first())
            .subscribe({
                next: (response) => {
                    this.messages.push(response.userMessage);
                    this.messages.push(response.assistantMessage);
                    this.form.reset();
                    this.shouldScroll = true;
                    this.sending = false;
                },
                error: error => {
                    this.alertService.error(error);
                    this.sending = false;
                }
            });
    }
    private scrollToBottom(): void {
        try {
            this.messageContainer.nativeElement.scrollTop = 
                this.messageContainer.nativeElement.scrollHeight;
        } catch(err) { }
    }
    getMessageTime(date: Date): string {
        return new Date(date).toLocaleTimeString('en-US', { 
            hour: 'numeric', minute: '2-digit' 
        });
    }
}