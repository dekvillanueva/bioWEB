import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss']
})
export class BodyComponent implements OnInit {

  colla: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  @Input() collapsed = false;
  @Input() screenWidth = 0;

  getBodyClass():string{
    let styleClass = "";
    if(this.collapsed && this.screenWidth > 768){
      styleClass = "body-trimmed";
    }else if(this.collapsed && this.screenWidth <= 768 && this.screenWidth > 0){
      styleClass = "body-md-screen";
    }
    //console.log(styleClass, this.collapsed, this.screenWidth);
    return styleClass;
  }


}
