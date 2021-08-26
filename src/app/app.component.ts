import { Component } from '@angular/core';
import { WebSocketAPI } from './WebSocketAPI';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular8-springboot-websocket';

  greeting: any;
  name: string;
  constructor(public webSocketAPI: WebSocketAPI){}

  ngOnInit() {
  }

  connect(){
    this.webSocketAPI._connect();
  }

  disconnect(){
    this.webSocketAPI._disconnect();
  }

  sendMessage(){
    this.webSocketAPI._send(this.name);
  }

  handleMessage(message){
    this.greeting = message;
  }
}
