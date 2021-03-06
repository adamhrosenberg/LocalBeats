// 'use strict';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { MatDialogRef, MatDialog, MatDialogConfig } from '@angular/material';

import { Observable } from 'rxjs/Observable';
import { Review } from 'app/models/review';
import { Booking, NegotiationResponses } from 'app/models/booking';
import { Notification } from 'app/models/notification';
import { SocketService } from 'app/services/chats/socket.service';
import { SocketEvent } from 'app/services/chats/model/event';
import { Event } from 'app/models/event';
import { User } from 'app/models/user';
import { environment } from '../../../environments/environment';
import { ReviewDialogComponent } from 'app/views/review/review-dialog/review-dialog.component';

const SERVER_URL = environment.apiURL;


@Injectable()
export class ReviewService {

    //TODO: change these URLs.
    public connection: string = SERVER_URL + 'api/reviews';
    public userReviewsToConnection: string = SERVER_URL + 'api/userReviewsTo';
    public userReviewsFromConnection: string = SERVER_URL + 'api/userReviewsFrom';
    public FlagReviewFromConnection: string = SERVER_URL + 'api/userReviewsFrom';
    private headers: Headers = new Headers({ 'Content-Type': 'application/json' });


    constructor(private http: Http, private dialog: MatDialog, private socketService: SocketService) { }

    public review(review: Review, isEditing: boolean): Observable<Review> {

        let dialogRef: MatDialogRef<ReviewDialogComponent>;
        dialogRef = this.dialog.open(ReviewDialogComponent, {
            width: '500px',
            disableClose: true,
            data: { review: review, isEditing: isEditing }
        });

        return dialogRef.afterClosed();
    }

    // POST Create review
    public createReview(newReview: Review): Promise<Review> {
        const current = this.connection + '/create';
        return this.http.post(current, { review: newReview }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {

                const data = response.json();
                const review = data.review as Review;
                return review;
            })
            .catch(this.handleError);
    }

    // GET a review via _id
    public getReview(review: Review): Promise<Review> {
        const current = this.connection + '/' + review._id;
        return this.http.get(current, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const review = data.review as Review;
                return review;
            })
            .catch(this.handleError);
    }

    // PUT update a review
    public updateReview(review: Review): Promise<Review> {
        const current = this.connection + '/' + review._id;
        return this.http.put(current, { review: review }, { headers: this.headers })
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                const review = data.review as Review;
                return review;
            })
            .catch(this.handleError);
    }

    // DELETE delete a review by id
    public deleteReviewByRID(reviewToDelete: Review): Promise<Number> {
        const current = this.connection + '/' + reviewToDelete._id;
        return this.http.delete(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.status;
                return data as Number;
            })
            .catch(this.handleError);
    }

    // GET gets all reviews left for this user
    public getReviewsTo(user: User): Promise<Review[]> {
        const current = this.userReviewsToConnection + '/?uid=' + user._id;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                let reviews: Review[];
                reviews = data.reviews as Review[];
                return reviews;
            })
            .catch(this.handleError);
    }

    // GET gets all reviews left for this user
    public getReviewsFrom(user: User): Promise<Review[]> {
        const current = this.userReviewsFromConnection + '/?uid=' + user._id;
        return this.http.get(current)
            .toPromise()
            .then((response: Response) => {
                const data = response.json();
                let reviews: Review[];
                reviews = data.reviews as Review[];
                return reviews;
            })
            .catch(this.handleError);
    }

    // Can add flag review if needed

    private handleError(error: any): Promise<any> {
        let errMsg = (error.message) ? error.message :
            error.status ? `${error.status} - ${error.statusText}` : 'Server error';
        console.error(errMsg); // log to console
        return Promise.reject(errMsg);
    }
}