import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { UserService } from '../../services/auth/user.service';
import { User } from '../../models/user';
import { Message } from './model/message';
import { SocketEvent } from './model/event';
import { SocketService} from './socket.service';
import { environment } from '../../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const SERVER_URL = environment.apiURL;

@Injectable()
export class ChatsService {
  private loggedInUser: User = new User();
  public unreadCounts = new Array();

  constructor(private _userService: UserService, private _socketService: SocketService, private http: HttpClient) { }

  // ==============================================
  // COMPONENT HELPER METHODS
  // ==============================================
  getConnectionUsers() {
    return this.http.get(SERVER_URL + 'api/users/');
  }

  // Returns { users: [User] } JSON
  getAllConversationBuddiesOfThisUser() {
    return this.http.get(SERVER_URL + 'api/messages/' + this.loggedInUser._id);
  }

  getAllUnreadCountsForAllChatBuddies(connectedUsers: User[]) {
    const url = SERVER_URL + 'api/messages/counts';
    let bodyObject = {
      loggedInUser: this.loggedInUser,
      senders: connectedUsers
    };
    this.http.post(url, JSON.stringify(bodyObject), httpOptions).subscribe(
      (data: any) => {
        this.unreadCounts = data.buddies as Array<any>;
      },
      (error: any) => {
        console.error(error);
      });
  }

  markChatsAsReadBetweenTwoUser(fromUID: string, toUID: string) {
    const url = SERVER_URL + 'api/messages/update/read/' + fromUID + '/' + toUID;
    return this.http.put(url, {}, httpOptions);
  }

  markChatsAsReadBetweenTwoUsersAuto(fromUID: string, toUID: string) {
    const url = SERVER_URL + 'api/messages/update/read/' + fromUID + '/' + toUID;
    this.http.put(url, {}, httpOptions).subscribe(
      (data: any) => {
        // Make the unread count for that user to zero in unreadCounts[]
        const senderIndex = this.unreadCounts.findIndex(x => x._id === fromUID);
        if (senderIndex !== -1) {
          this.unreadCounts[senderIndex].unreadCount = 0;
        }
      },
      (error: any) => {
        console.error(error);
      }
    );
  }

  markThisMessageAsRead(messageID: string) {
    const url = SERVER_URL + 'api/messages/update/read/' + messageID;
    return this.http.put(url, {}, httpOptions);
  }

  getCurrentLoggedInUser() {
    this.loggedInUser = this._userService.user;
    return this.loggedInUser;
  }

  setLoggedInUser(user: User)  {
    this.loggedInUser = user;
  }

  getPMsBetweenActiveAndLoggedInUser(from: User, to: User) {
    return this.http.get(SERVER_URL + 'api/messages/' + from._id + '/' + to._id);
  }

  savePrivateMessageToDB(message: Message) {
    let body = JSON.stringify(message);
    return this.http.post(SERVER_URL + 'api/messages/', body, httpOptions);
  }

}
