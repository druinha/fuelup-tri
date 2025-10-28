import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, ],
})
export class AppComponent {

  constructor(
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      this.initializeStatusBar();
    });
  }

  async initializeStatusBar() {
    if (this.platform.is('capacitor')) {
      try {
        // Set status bar style
        await StatusBar.setStyle({ style: Style.Dark });
        
        // Set status bar background color to match your app theme
        await StatusBar.setBackgroundColor({ color: '#1976d2' });
        
        // Show the status bar
        await StatusBar.show();
      } catch (error) {
        console.warn('StatusBar plugin not available:', error);
      }
    }
  }
}
