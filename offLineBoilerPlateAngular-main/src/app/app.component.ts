import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ selector: 'app-root', templateUrl: 'app.component.html', styleUrls: ['./app.component.css'] })
export class AppComponent {
    Role = Role;
    account?: Account | null;
    showChatWidget = false;

    constructor(
        private accountService: AccountService,
        private router: Router
    ) {
        this.accountService.account.subscribe(x => this.account = x);
    }

    logout() {
        this.accountService.logout();
    }

    toggleChatbot() {
        this.showChatWidget = !this.showChatWidget;
    }
}