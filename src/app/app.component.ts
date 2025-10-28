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
        // Set status bar style to light (white text/icons) for better visibility on transparent background
        await StatusBar.setStyle({ style: Style.Light });
        
        // Set status bar background to completely transparent
        await StatusBar.setBackgroundColor({ color: '#00000000' });
        
        // Enable overlay mode for transparent status bar
        await StatusBar.setOverlaysWebView({ overlay: true });
        
        // Show the status bar
        await StatusBar.show();
      } catch (error) {
        console.warn('StatusBar plugin not available:', error);
      }
    }
  }
}
