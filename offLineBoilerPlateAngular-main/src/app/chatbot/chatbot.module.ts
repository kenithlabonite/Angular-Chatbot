import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatbotRoutingModule } from './chatbot-routing.module';
import { ConversationListComponent } from './conversation-list.component';
import { ChatComponent } from './chat.component';
import { ChatWidgetComponent } from './chat-widget.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ChatbotRoutingModule
    ],
    declarations: [
        ConversationListComponent,
        ChatComponent,
        ChatWidgetComponent
    ],
    exports: [
        ChatWidgetComponent
    ]
})
export class ChatbotModule { }