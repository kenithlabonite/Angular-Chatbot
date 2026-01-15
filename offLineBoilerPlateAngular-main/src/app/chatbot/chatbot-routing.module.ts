import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConversationListComponent } from './conversation-list.component';
import { ChatComponent } from './chat.component';
const routes: Routes = [
    { path: '', component: ConversationListComponent },
    { path: ':conversationId', component: ChatComponent }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ChatbotRoutingModule { }