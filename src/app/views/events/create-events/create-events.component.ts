import { Component, ElementRef,OnInit, ViewChild, NgZone } from '@angular/core';
import { MatProgressBar, MatButton, MatSnackBar} from '@angular/material';
import { UserService } from '../../../services/auth/user.service';
import { BookingService } from '../../../services/booking/booking.service';
import { EventService } from '../../../services/event/event.service';
import { User } from '../../../models/user';
import { Event } from '../../../models/event';
import { NgForm } from '@angular/forms/src/directives/ng_form';
import { FormGroup, FormControl, Validators, FormArray, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { ImgurService } from 'app/services/image/imgur.service';
import { StripeService } from 'app/services/payments/stripe.service';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import { } from 'googlemaps';
import { MapsAPILoader } from '@agm/core';
import { SearchService } from '../../../services/search/search.service';
// import { NgZone } from '@angular/core/src/zone/ng_zone';

@Component({
  selector: 'app-create-events',
  templateUrl: './create-events.component.html',
  styleUrls: ['./create-events.component.css']
})
export class CreateEventsComponent implements OnInit {
  @ViewChild(MatProgressBar) progressBar: MatProgressBar;
  formData = {}
  console = console;
  basicForm: FormGroup;
  event:Event  = new Event;
  user:User;
  eventID;
  EID: any;  
  up: any;
  submitButtonText:string
  updating:Boolean
  cityState:string;

  public selectedMoment = new Date();
  public selectedMoment2 = new FormControl(new Date());
  // public dateRange = [new Date(2018, 1, 12, 10, 30), new Date(2018, 3, 21, 20, 30)];
  public dateRange;



  agreed = false;

  public place: google.maps.places.PlaceResult
  zoom: number;

  latitude = 51.678418;
  longitude = 7.809007;
  locationChosen = false;

  genresList: string[] = ['Rock', 'Country', 'Jazz', 'Blues', 'Rap'];
  eventsList: string[] = ['Wedding', 'Birthday', 'Business'];
  cancellationPolicies = ['flexible', 'strict'];

  selectedEventType: string = 'wedding';
  checkedValues:Boolean[]
  
  // evenGenres:Array<string>;


  musicGenres: any = [{genre:'Rock', checked:false}, {genre:'Country', checked:false}, {genre:'Jazz', checked:false}, {genre:'Blues', checked:false}, {genre:'Rap', checked:false}];
  
  // loadedEventGenres: any = [{genre:'Rock', checked:false}, {genre:'Country', checked:false}, {genre:'Jazz', checked:false}, {genre:'Blues', checked:false}, {genre:'Rap', checked:false}];

  // eventTypes: any = [{genre:'Wedding', checked:false}, {genre:'Birthday', checked:false}, {genre:'Business', checked:false}];
  genres: any = this.musicGenres;
  uploadedImage: boolean = false;

  @ViewChild("searchplaces") searchElementRef: ElementRef;
  minDate = new Date(Date.now());
  maxDate = new Date(2020, 0, 1);

  imageChangedEvent: any = '';
  croppedImage: any = '';
  showCropper: boolean = false;

  constructor(private route: ActivatedRoute,
              private userService: UserService,
              private bookingService: BookingService,
              private eventService: EventService,
              private router: Router,
              private imgurService: ImgurService,
              private formBuilder: FormBuilder,
              public snackBar: MatSnackBar,
              private mapsAPILoader: MapsAPILoader,
              private ngZone: NgZone,
              private stripeService: StripeService,
              private searchService: SearchService
              ) { }

              
  ngOnInit() {

    this.searchService.eventTypes().then((types: string[]) => {
      this.eventsList = types;
    }).then(() => this.searchService.genres().then((types: string[]) => {
      this.genresList = types;
    }));

    
    this.event.eventType = "Wedding"
  
    // this.openSnackBar();
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;
    this.user = this.userService.user;
    this.setCurrentPosition();
    this.setupMap();

    
    this.event = new Event;

    this.EID = {
      id: this.route.snapshot.params['id']
    }


    let ID = this.EID["id"];
    if (ID == null) {
      this.updating = false;
    } else {
      this.updating = true;
    }

    this.dateRange = [new Date(), new Date()];

    if (this.updating) {
      this.eventService.getEventByEID(this.EID).then((eventEdit: Event) => {
        this.event = eventEdit;
        this.dateRange = [this.event.fromDate, this.event.toDate];

        this.setForm();

        // pre load maps input box
       this.cityState = this.event.city + ',' + this.event.state + ', USA' ;

        for(let genre of this.genres){
          for(let eventGenre of this.event.eventGenres){
            if(genre.genre == eventGenre){
              genre.checked = true;
            }
          }
        }
      });
    }
    this.setForm();
  }

  setForm() {
    if(this.updating){
      this.basicForm = this.formBuilder.group({
        eventName: new FormControl(this.event.eventName, [
          Validators.minLength(4),
          Validators.maxLength(40),
          Validators.required
        ]),
        eventType: new FormControl(this.event.eventType, [Validators.required
        ]),
        cancellationPolicy: new FormControl(this.event.cancellationPolicy, [Validators.required]),
        fixedPrice: new FormControl(this.event.fixedPrice, [
          Validators.required
        ]),
        negotiable: new FormControl(this.event.negotiable, [
        ]),
        date: new FormControl(this.dateRange, [
          Validators.required
        ]),
        eventDescription: new FormControl(this.event.description, [
          Validators.required
        ]),
        imageUploaded: new FormControl(),
        genres: new FormControl(this.event.eventGenres,[
  
        ]),
        location: new FormControl('',[Validators.required]),
        agreed: new FormControl('', (control: FormControl) => {
          const agreed = control.value;
          if(!agreed) {
            return { agreed: true }
          }
          return null;
        })
      });
    }else {
      // creating new event
      this.basicForm = this.formBuilder.group({
        eventName: new FormControl('', [
          Validators.minLength(4),
          Validators.maxLength(40),
          Validators.required
        ]),
        eventType: new FormControl('', [Validators.required
        ]),
        cancellationPolicy: new FormControl('', [Validators.required]),
        fixedPrice: new FormControl('', [
          Validators.required
        ]),
        negotiable: new FormControl(false, [
        ]),
        date: new FormControl('', [
          Validators.required
        ]),
        eventDescription: new FormControl('', [
          Validators.required
        ]),
        imageUploaded: new FormControl(),
        genres: new FormControl('',[
  
        ]),
        location: new FormControl('',[Validators.required]),
        agreed: new FormControl('', (control: FormControl) => {
          const agreed = control.value;
          if(!agreed) {
            return { agreed: true }
          }
          return null;
        })
      });
    }
  }
  
  
  openSnackBar() {
    // console.log('test')
    this.snackBar.open('Create Event','next', { duration: 2000 });
  }

  setupMap() {

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["(cities)"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          this.place = autocomplete.getPlace();
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // place.address_components
          // place.formatted_address
          this.basicForm.setControl('location', new FormControl(place.formatted_address))
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  onChoseLocation(event) {
    this.latitude = event.coords.lat;
    this.longitude = event.coords.lng;
    this.locationChosen = true;
  }

  private prepareBlob() {
    fetch(this.croppedImage).then(res => res.blob()).then(blob => this.uploadImage(blob));
  }

  uploadImage(blob: Blob) {
      this.progressBar.mode = 'indeterminate';
      this.imgurService.uploadToImgur(blob).then(link => {
        this.event.eventPicUrl = link as string;
      }).then(link => {
          this.uploadedImage = true;
          this.progressBar.mode = 'determinate';
          this.showCropper = false;
          this.croppedImage = null;
        }).catch(err => {
          this.progressBar.mode = 'determinate';
          this.showCropper = false;
          this.croppedImage = null;
      });
  }

  fileChangeEvent(event: EventTarget) {
    this.showCropper = true;
    this.imageChangedEvent = event;
  }

  imageCropped(image: String) {
    this.croppedImage = image;
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }


  onChangeEventType(event: EventTarget) {
    if (!this.uploadedImage) {
      this.imgurService.getDefaultPic(this.basicForm.controls.eventType.value).then(url => {
        this.event.eventPicUrl = url;
      })
    }
  }

  onAgreed(){
    this.agreed = !this.agreed;
  }

  onContentChanged() { }
  onSelectionChanged() { }


  onCreateEvent(form: NgForm) {


    if(this.latitude != null){
      this.event.location = [this.longitude, this.latitude]

    }else{
      this.event.location = [-111.84494389999999,
        40.7677324];
    }

    if(this.place){

      const city = this.place.address_components[0].long_name
      const state = this.place.address_components[2].short_name
      this.event.state = state;
      this.event.city = city;
      console.log('in place')
    }else{
      this.event.location = [-111.84494389999999,
        40.7677324];
      this.event.city = 'Salt Lake City';
      this.event.state = 'UT';
    }

    this.event.eventName = this.basicForm.get('eventName').value;
    this.event.eventType = this.basicForm.get('eventType').value;
    this.event.fixedPrice = this.basicForm.get('fixedPrice').value;
    this.event.toDate = this.basicForm.get('date').value;
    this.event.negotiable = this.basicForm.get('negotiable').value;
    this.event.eventGenres = this.basicForm.get('genres').value;
    this.event.description = this.basicForm.get('eventDescription').value;
    this.event.hostUser = this.user;
    this.event.hostEmail = this.user.email;
    this.event.fromDate = this.basicForm.get('date').value[0];
    this.event.toDate = this.basicForm.get('date').value[1];
    this.event.cancellationPolicy = this.basicForm.get('cancellationPolicy').value;


    if (!this.updating) {
      this.eventService.createEvent(this.event).then((newEvent: Event) => {
        this.event = newEvent;
        this.eventService.event = this.event;
        this.router.navigate(['/events', this.event._id]);
      });
    } else {
      this.eventService.updateEvent(this.event).then((newEvent: Event) => {
        this.event = newEvent;

        this.eventService.event = this.event;
        this.router.navigate(['/events', this.event._id]);
      });
    }
  }
}
