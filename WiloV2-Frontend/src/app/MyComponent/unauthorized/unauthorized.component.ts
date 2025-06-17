import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-danger text-white">
              Unauthorized Access
            </div>
            <div class="card-body">
              <h5 class="card-title">Permission Denied</h5>
              <p class="card-text">You do not have the necessary permissions to view this page.</p>
              <a routerLink="/material-table" class="btn btn-primary">Go to Material Table</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class UnauthorizedComponent {

}