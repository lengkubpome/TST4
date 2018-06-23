import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'tst-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() sideNavToggle = new EventEmitter<void>();
  constructor() { }

  ngOnInit() {
  }

  onToggleSidenav() {
    this.sideNavToggle.emit();
  }



}
