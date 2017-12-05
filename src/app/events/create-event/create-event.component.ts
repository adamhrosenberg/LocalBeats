import { Component, OnInit } from '@angular/core';
import { User } from 'app/models/user';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { UserService } from 'app/services/user.service';
import { EventService } from 'app/services/event.service';
import { print } from 'util';
import { Injectable } from '@angular/core';
import { Event } from 'app/models/event';

@Component({
  selector: 'app-create-event',
  templateUrl: './create-event.component.html',
  styleUrls: ['./create-event.component.css']
})
export class CreateEventComponent implements OnInit {

  model:Event;
  user:User;

  constructor(private eventService: EventService, private userSerivce: UserService, private router: Router) { }
  
  ngOnInit() {
    this.user = this.userSerivce.user;
    this.model = new Event;
  }

 onCreateEvent(form: NgForm) {
    // console.log("printing host id");
    // console.log(this.user._id);
    
    
    // const lastName = form.value.lastname;
    const eventName = form.value.eventName;
    const eventType = form.value.eventType;
    const eventGenre = form.value.eventGenre;
    // const hostEmail = form.value.hostemail;
    const address = form.value.address;
    const fromDate = form.value.fromDate;
    const toDate = form.value.toDate;
    const description = form.value.description;
    const fixedPrice = form.value.fixedPrice;
    // const hourlyRate: string
    // const deposit: string
    // const isBooked: string

    this.model.eventName = eventName;
    this.model.eventType = eventType;
    this.model.eventGenre = eventGenre;
    this.model.address = address;
    // this.model.fromDate = fromDate;
    // this.model.toDate = toDate;
    this.model.description = description;

    console.log("printing event dscription");
    console.log(this.model.description);
    this.model.fixedPrice = fixedPrice;

    this.model.hostUID = this.user._id;
    this.model.hostEmail = this.user.email;


    console.log("creating event: \n" );
    console.log(this.model);

    this.eventService.createEvent(this.model).then((event: Event) => {
      this.model = event;      
      this.eventService.event = this.model;
      console.log("eid");
      console.log(this.model._id); 
      this.router.navigate(['/event-page']); //this will go to the page about the event
    });


    
  }
}