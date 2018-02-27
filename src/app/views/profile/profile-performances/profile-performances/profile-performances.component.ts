// Angular Modules
import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { Router } from "@angular/router";
import { MatTabChangeEvent, MatSnackBar, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StripeDialog } from '../../../events/event-singleton/event-singleton.component';

// Services
import { UserService } from '../../../../services/auth/user.service';
import { BookingService } from '../../../../services/booking/booking.service';
import { EventService } from '../../../../services/event/event.service';
import { SocketService } from 'app/services/chats/socket.service';
import { StripeService } from 'app/services/payments/stripe.service';

// Data Models
import { User } from '../../../../models/user';
import { Event } from '../../../../models/event';
import { Booking, StatusMessages, NegotiationResponses } from '../../../../models/booking';
import { Action } from '../../../../services/chats/model/action'
import { SocketEvent } from '../../../../services/chats/model/event'
import { Notification } from '../../../../models/notification'
import { Message } from '../../../../services/chats/model/message';
import { Payment, PaymentStatus } from '../../../../models/payment'

@Component({
  selector: 'app-profile-performances',
  templateUrl: './profile-performances.component.html',
  styleUrls: ['./profile-performances.component.css']
})
export class ProfilePerformancesComponent implements OnInit {
  // User Model
  user: User;
  submitted: boolean = false;
  // Performances of the User Model
  performances: {
    applications: Booking[],
    applicationNotifications: number,
    requests: Booking[],
    requestNotifications: number,
    confirmations: Booking[],
    confirmationNotifications: number,
    paymentStatues: PaymentStatus[]};

  constructor(private eventService: EventService, 
    private userService: UserService,
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router,
    private _socketService: SocketService,
    private stripeService: StripeService,
    public dialog: MatDialog
    ) {
      // Set user model to the authenticated singleton user
      this.user = this.userService.user;
      // Get the performances of the user
      this.performances = {
        applications: [],
        applicationNotifications: 0,
        requests: [],
        requestNotifications: 0,
        confirmations: [],
        confirmationNotifications: 0,
        paymentStatues: []};
      this.getPerformances();
    }

  ngOnInit() {
    this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
      .subscribe((notification: Notification) => {
        if (notification.response == NegotiationResponses.payment) {
          this.updatePaymentStatues(notification.booking);
        } else {
          this.updateModel(notification.booking, notification.response);
        }
    });
  }

  private updatePaymentStatues(booking: Booking) {
      // Update payment status
    let idx = this.performances.confirmations.findIndex(b => b._id == booking._id);
    this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
      this.performances.paymentStatues[idx] = status;
    });
  }

  private getPerformances() {
    // Get all performances associated with the user
    this.bookingService.getUserBookings(this.userService.user, 'artist').then((bookings: Booking[]) => {
      // Get the confirmed bookings
      let confirmedBookings: Booking[] = [];
      // Get the application bookings
      let applicationBookings: Booking[] = [];
      // Get the request bookings
      let requestBookings: Booking[] = [];
      // Get the notification counts
      let numNotif: number = 0;
      let reqNotif: number = 0;
      let numConf: number = 0;
      let paymentStatues = [];
      for(let booking of bookings) {
        if(booking.approved) {
          confirmedBookings.push(booking);
            // If the booking is confirmed and has not yet been viewed by the artist, a new notification exists
            if(!booking.artViewed) {
              numConf++;
            }
            this.bookingService.bookingPaymentStatus(booking).then((status: PaymentStatus) => {
              paymentStatues.push(status);
            }
          );
        } else {
          // Check to see if the artist applied
          if(booking.bookingType == 'artist-apply') {
            applicationBookings.push(booking);
            // If the booking is not confirmed and the host has approved, a new notification exists
            if(booking.hostApproved) {
              numNotif++;
            }
          } else {
            // Otherwise, it was a host request
            requestBookings.push(booking);
            // If the booking is not confirmed and the host has approved, a new notification exists
            if(booking.hostApproved) {
              reqNotif++;
            }
          }
        }
      }
      this.performances = {
        applications: applicationBookings,
        applicationNotifications: numNotif,
        requests: requestBookings,
        requestNotifications: reqNotif,
        confirmations: confirmedBookings,
        confirmationNotifications: numConf,
        paymentStatues: paymentStatues};
    });
  }

  private updateModel(newBooking: Booking, response: NegotiationResponses) {
    let applicationIndex: number = -1;
    let requestIndex: number = -1;
    let confirmationIndex: number = -1;
    // Check if the booking has been approved
    if(newBooking.approved && response == NegotiationResponses.accept) {
      requestIndex = this.performances.requests.findIndex(r => r._id == newBooking._id)
      applicationIndex = this.performances.applications.findIndex(a => a._id == newBooking._id);
      // Remove from applications/requests and put on confirmations
      if(newBooking.bookingType == 'artist-apply') {
        this.performances.applications.splice(applicationIndex, 1);
      } else {
        this.performances.requests.splice(requestIndex, 1);
      }
      this.performances.confirmations.push(newBooking);
      this.performances.confirmationNotifications++;

    } else if(response == NegotiationResponses.new) {
      // Otherwise, check if there is a new bid or offer
      requestIndex = this.performances.requests.findIndex(r => r._id == newBooking._id);
      applicationIndex = this.performances.applications.findIndex(a => a._id == newBooking._id);
      if(applicationIndex >= 0) {
        // Then it must be a performance with a current application
        // Update this event
        if(this.performances.applications[applicationIndex].artistApproved != newBooking.artistApproved) {
          // Increment the notifications only if there wasn't a previous one before the artist responded
          this.performances.applicationNotifications++;
        }
        this.performances.applications[applicationIndex] = newBooking;
      } else if(requestIndex >= 0){
        // Then it is an event with a current request
        // Update this event
        if(this.performances.requests[requestIndex].artistApproved != newBooking.artistApproved) {
          // Increment the notifications only if there wasn't a previous one before the artist responded
          this.performances.requestNotifications++;
        }
        this.performances.requests[requestIndex] = newBooking;
      } else {
        // Otherwise, it is a brand new application/request
        // Push onto applications/requests
        if(newBooking.bookingType == 'artist-apply') {
          this.performances.applications.push(newBooking);
          // Increment the notifications
          this.performances.applicationNotifications++;
        } else {
          this.performances.requests.push(newBooking);
          // Increment the notifications
          this.performances.requestNotifications++;
        }
        
      }
    } else if(response == NegotiationResponses.decline) {
      // Find it in applications and remove it
      if(newBooking.bookingType == 'artist-apply') {
        applicationIndex = this.performances.applications.findIndex(a => a._id == newBooking._id);
        this.performances.applications.splice(applicationIndex, 1);
      } else {
        requestIndex = this.performances.requests.findIndex(r => r._id == newBooking._id);
        this.performances.requests.splice(requestIndex, 1);
      }
    } else if(response == NegotiationResponses.cancel) {
      confirmationIndex = this.performances.confirmations.findIndex(a => a._id == newBooking._id);
      this.performances.confirmations.splice(confirmationIndex, 1);
    }
  }

  onViewEvent(event:Event){
    this.router.navigate(['/events', event._id]); //this will go to the page about the event
  }

  resetConfirmations(event: MatTabChangeEvent) {
    if(event.index == 2) {
      this.performances.confirmationNotifications = 0;
      for(let booking of this.performances.confirmations) {
        if(!booking.artViewed) {
          booking.artViewed = true;
          this.bookingService.updateBooking(booking);
        }
      }
    }
  }

  openNegotiationDialog(booking: Booking, bookingIndex: number) {
    if (!this.userService.user.stripeAccountId) {
      this.showStripeDialog();
      return;
    }

    let view = this.eventService.event.hostUser._id == this.userService.user._id ? "host" : "artist";
    this.bookingService.negotiate(booking, false, view)
    .subscribe((result) => {
      // Check to see if a response was recorded in the negotiation dialog box
      if (result != undefined) {
        // Check to see what the response was
        if (result.response == NegotiationResponses.new) {
          // New, the user offered a new monetary amount to the host
          // Set the new price
          booking.currentPrice = result.price;
          // Swap the approvals so that the host now needs to approve the new price
          booking.hostApproved = false;
          booking.hostStatusMessage = StatusMessages.artistBid
          booking.artistApproved = true;
          booking.artistStatusMessage = StatusMessages.waitingOnHost;
          // Update the booking asynchronously
          this.bookingService.updateBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == 'artist-apply') {
              this.performances.applications[bookingIndex] = booking;
              this.performances.applicationNotifications--;
            } else {
              this.performances.requests[bookingIndex] = booking;
              this.performances.requestNotifications--;
            }
            this.createNotificationForHost(booking, result.response, ['/profile', 'events'],
            'import_export', booking.performerUser.firstName + " has made a new bid on " + booking.eventEID.eventName);
          });
        } else if (result.response == NegotiationResponses.accept) {
          // Accept, the user accepted an offer from the host or they reconfirmed their previous bid
          // No price change
          // Check to see if it was already host approved, otherwise no change
          booking.artistApproved = true;
          if(booking.hostApproved) {
            // Confirm booking
            booking.approved = true;
            booking.hostStatusMessage = StatusMessages.bookingConfirmed;
            booking.artistStatusMessage = StatusMessages.bookingConfirmed;
            // Asynchronously update
            this.bookingService.acceptBooking(booking).then(() => {
              // Update the model of the component
              if(booking.bookingType == 'artist-apply') {
                this.performances.applications.splice(bookingIndex, 1);
                this.performances.applicationNotifications--;
              } else {
                this.performances.requests.splice(bookingIndex, 1);
                this.performances.requestNotifications--;
              }
              this.performances.confirmations.push(booking);
              this.performances.confirmationNotifications++;
              this.createNotificationForHost(booking, result.response, ['/profile', 'events'],
              'event_available', booking.performerUser.firstName + " has confirmed the booking" + booking.eventEID.eventName);
            })
          }
        } else if (result.response == NegotiationResponses.decline) {
          // Decline, the user declined an offer from the host
          // Negate approvals for real-time notification to other user's component model
          booking.artistApproved = false;
          booking.hostApproved = false;
          booking.approved = false;
          // Asynchronously update
          this.bookingService.declineBooking(booking).then(() => {
            // Update the model of the component
            if(booking.bookingType == 'artist-apply') {
              this.performances.applications.splice(bookingIndex, 1);
              this.performances.applicationNotifications--;
            } else {
              this.performances.requests.splice(bookingIndex, 1);
              this.performances.requestNotifications--;
            }
            this.createNotificationForHost(booking, result.response, ['/events', booking.eventEID._id],
            'event_busy', booking.performerUser.firstName + " has cancelled the request on " + booking.eventEID.eventName);
          })
        } else if(result.response == NegotiationResponses.cancel) {
          // Cancellation, the user cancelled a confirmed booking
          // Negate approvals for real-time notification to other user's component model
          booking.artistApproved = false;
          booking.hostApproved = false;
          booking.approved = false;
          // Asynchronously update
          this.bookingService.declineBooking(booking).then(() => {
            // Update the model of the component
            this.performances.confirmations.splice(bookingIndex, 1);
            this.createNotificationForHost(booking, result.response, ['/events', booking.eventEID._id],
            'event_busy', booking.performerUser.firstName + " has cancelled the confirmed boking for " + booking.eventEID.eventName);
          })
        } else {
          // No change, the user kept their confirmed booking
        }
      }
    });
  }
  
  createNotificationForHost(booking: Booking, response: NegotiationResponses, route: string[], icon: string, message: string) {
    let notification = new Notification(booking.performerUser, booking.hostUser, booking.eventEID._id,
    booking, response, message, icon, route); 
    this._socketService.sendNotification(SocketEvent.SEND_NOTIFICATION, notification);
  }

  messageHost(booking:Booking){
    let message:Message = {
      to: booking.hostUser
    };
    this.router.navigate(['/chat']);
    this._socketService.send(Action.REQUEST_MSG_FROM_PROFILE_BUTTON, message);
  }

  showRefundDialog(booking: Booking) {
    this.submitted = true;
    let dialogRef: MatDialogRef<RefundPaymentDialog>;
    dialogRef = this.dialog.open(RefundPaymentDialog, {
        width: '250px',
        disableClose: false,
        data: { booking }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.updatePaymentStatues(booking);
      this.submitted = false;
    });
  }

  showPaymentHistoryDialog(booking: Booking) {
    let userID = this.userService.user._id;
    let dialogRef: MatDialogRef<PaymentHistoryDialog>;
    this.stripeService.getBookingPayments(booking).then((payments: Payment[]) => {
      dialogRef = this.dialog.open(PaymentHistoryDialog, {
          width: '420px',
          disableClose: false,
          data: { payments, userID }
      });

    });

  }

  showStripeDialog() {
    let dialogRef: MatDialogRef<StripeDialog>;
    dialogRef = this.dialog.open(StripeDialog, {
        width: '250px',
        disableClose: false,
        data: { }
    });

    dialogRef.afterClosed();
  }

}

// Refund dialog
@Component({
  selector: 'refund-confirm-dialog',
  templateUrl: 'refund-confirm-dialog.html',
})
export class RefundPaymentDialog {

  constructor(
    public dialogRef: MatDialogRef<RefundPaymentDialog>, private stripeService: StripeService, public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkClick(): void {
    this.stripeService.charge
    this.stripeService.refund(this.data.booking).then((success: boolean) => {
      this.dialogRef.close();
      if (success) {
        let snackBarRef = this.snackBar.open('Refund sent!', "", {
          duration: 1500,
        });
      } else {
        let snackBarRef = this.snackBar.open('Refund failed, please try again.', "", {
          duration: 1500,
        });
      }
    });
  }

}

// Payment History Dialog
@Component({
  selector: 'payment-history-dialog',
  templateUrl: 'payment-history-dialog.html',
})
export class PaymentHistoryDialog {

  constructor(
    public dialogRef: MatDialogRef<RefundPaymentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any, private _socketService: SocketService, private stripeService: StripeService) { }

    ngOnInit() {
      this._socketService.onEvent(SocketEvent.SEND_NOTIFICATION)
        .subscribe((notification: Notification) => {
          this.stripeService.getBookingPayments(notification.booking).then((payments: Payment[]) => {
            this.data.payments = payments;
          });
      });
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}