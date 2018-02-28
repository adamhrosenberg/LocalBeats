import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { SocketService } from '../../services/chats/socket.service';
import { UserService } from '../../services/auth/user.service';
import { SocketEvent } from '../../services/chats/model/event';
import { environment } from '../../../environments/environment';
import { User } from 'app/models/user';

@Injectable()
export class SpotifyClientService {

  public authorizeConnection: string = environment.apiURL + 'api/spotify'; 
  private headers: Headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: Http, private _socketService: SocketService, private _userService: UserService) { }

  // Redirect user to stripe website
  public authorizeSpotify(): Promise<string> {
    const current = this.authorizeConnection + '/authorize';
    console.log('Spotify AUth server url: ', current);
    return this.http.post(current, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
          const data = response.json();
          console.log('Data SPotift: ', data);
          return data.redirect_url;
        })
        .catch(this.handleError);
  }

  public requestRefreshAndAccessTokens(code: string): Promise<any> {
    const current = this.authorizeConnection + '/getAuthTokens';
    console.log('Spotify Token server url: ', current);
    return this.http.post(current, {user: this._userService.user, code: code}, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
          const data = response.json();
          console.log('Tokens recieved: ', data);
          return data;
        })
        .catch(this.handleError);
  }

  public requestSpotifyMyProfile(code: string): Promise<any> {
    const current = this.authorizeConnection + '/me';
    console.log('Spotify Token server url: ', current);
    return this.http.post(current, {user: this._userService.user, code: code}, { headers: this.headers })
        .toPromise()
        .then((response: Response) => {
          const data = response.json();
          console.log('Tokens recieved: ', data);
          return data;
        })
        .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    let errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console
    return Promise.reject(errMsg);
}
}
