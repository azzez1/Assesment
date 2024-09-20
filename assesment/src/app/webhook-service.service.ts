   
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebhookServiceService {

  private url = 'https://webhook.site/67b17657-a795-4430-8f49-afc74a5486c4';
  private queue: any[] = [];
  private offlineHitsCount = 0;
  offlineHitsCountUpdated = new Subject<number>();


  constructor(private http: HttpClient) {
    fromEvent(window, 'online').subscribe(() => this.onConnectionRestored());
    fromEvent(window, 'offline').subscribe(() => this.onOffline());
  }

  sendRequest(data: any) {

    this.http.post(this.url, data).subscribe({
        next: () => {
            console.log('Request successful');
        },
        error: (err) => {
            if (!navigator.onLine) {
                this.queue.push(data);
                this.offlineHitsCount++;
                console.log("User is offline, incrementing offlineHitsCount:", this.offlineHitsCount);
                this.offlineHitsCountUpdated.next(this.offlineHitsCount);
            } else {
                console.error('Request failed due to:', err.message);
            }
        }
    });
  }
  

  private sendQueuedRequests() {
    while (this.queue.length > 0) {
      const data = this.queue.shift();
      this.sendRequest(data);
    }
  }

  private onConnectionRestored() {
    this.sendQueuedRequests();
    this.offlineHitsCount = 0;  
    this.offlineHitsCountUpdated.next(this.offlineHitsCount);  
  }

  private onOffline() {
    console.log('The application is offline.');
    this.offlineHitsCountUpdated.next(this.offlineHitsCount); 
  }

  getOfflineHitsCount() {
    return this.offlineHitsCount;
  }
}
