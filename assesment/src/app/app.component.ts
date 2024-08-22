import { Component, OnDestroy, OnInit } from '@angular/core';
import { WebhookServiceService } from './webhook-service.service';
import { fromEvent, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'assesment';
  offlineHitsCount: number = 0;
  offline:boolean=false;
  online:boolean=false;
  private offlineHitsCountSubscription: Subscription | undefined;

  constructor(private requestHandler: WebhookServiceService) {}

  ngOnInit() {
    fromEvent(window, 'online').subscribe(() => { this.online = true; this.offline = false;});
    this.offlineHitsCountSubscription = this.requestHandler.offlineHitsCountUpdated
      .subscribe(count => {
        this.offline = true;
        this.offlineHitsCount = count;
        console.log("count", this.offlineHitsCount)
      });
  }

  hitEndpoint() {
    const requestData = { timestamp: new Date().toISOString() };
    this.offlineHitsCount = this.requestHandler.getOfflineHitsCount();
    this.requestHandler.sendRequest(requestData);
  }

  ngOnDestroy() {
    if (this.offlineHitsCountSubscription) {
      this.offlineHitsCountSubscription.unsubscribe();
    }  
  }

}
