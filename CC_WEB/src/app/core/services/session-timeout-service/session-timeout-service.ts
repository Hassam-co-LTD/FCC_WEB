import { Injectable, NgZone } from '@angular/core';
import { AuthService } from '../auth.service';
@Injectable({
  providedIn: 'root'
})
export class SessionTimeoutService {


  private timeoutId: any;

private timeoutDuration = 5 * 60 * 1000; // 5 minutes


  constructor(
    private ngZone: NgZone,
    private authService: AuthService
  ) {

  }



  startWatching() {

    this.resetTimer();


    const events = [
      'click',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart'
    ];


    events.forEach(event => {


      window.addEventListener(
        event,
        () => this.resetTimer()
      );


    });


  }




  private resetTimer() {


    clearTimeout(this.timeoutId);


    this.timeoutId = setTimeout(() => {


      this.logoutUser();


    }, this.timeoutDuration);


  }




  private logoutUser() {


    console.log(
      "Session expired. Calling AuthService logout..."
    );


    this.ngZone.run(() => {


      this.authService.logout();


    });


  }


}