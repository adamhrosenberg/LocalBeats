import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService} from 'app/services/user.service'
import { User } from 'app/models/user';
@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrls: ['./profile-details.component.css']
})
export class ProfileDetailsComponent implements OnInit {

  editing: boolean = false;
 
  // profile: Profile;
  constructor(private userService: UserService, private router: Router) { 
    this.userService.user = {
      uid: null,
      userName: null,
      firstName: 'Adam',
      lastName: 'Rosenberg',
      email: 'adam@adam.com',
      phone: '3305555555',
      password: 'brandon',
      userStatus: null
    }
  }

  getProfileName(){
    return this.userService.user.firstName + ' ' + this.userService.user.lastName;
  }

  ngOnInit() {
  }

  onSubmit(){
  this.router.navigate(['/profile-edit']);
  }
}
