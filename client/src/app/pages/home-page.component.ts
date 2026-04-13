import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../services/map.service';
import { Map } from '../models';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center">
      <h2 class="text-xl font-semibold mb-4">Welcome to StoryMaps</h2>
      <p class="text-gray-600">Create and manage user story maps</p>
    </div>
  `
})
export class HomePageComponent implements OnInit {
  constructor(private mapService: MapService) {}

  ngOnInit(): void {}
}