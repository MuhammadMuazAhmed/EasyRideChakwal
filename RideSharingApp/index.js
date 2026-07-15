import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';

import App from './src/App';

// Prevent the native splash screen from auto-hiding before
// the app finishes its async initialization. Must be called
// synchronously before any async work or component rendering.
SplashScreen.preventAutoHideAsync();

registerRootComponent(App);
