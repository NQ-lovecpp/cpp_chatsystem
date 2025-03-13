import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initProtobuf } from './network/protobuf';

// Initialize protobuf before mounting the app
async function init() {
  try {
    // Wait for protobuf to initialize
    await initProtobuf();
    
    // Then create and mount the app
    const app = createApp(App);
    app.use(createPinia());
    app.use(router);
    app.mount('#app');
  } catch (error) {
    console.error('Failed to initialize application:', error);
    // Show an error message to the user
    document.body.innerHTML = '<div style="text-align: center; margin-top: 100px;"><h1>Failed to load application</h1><p>Please try refreshing the page.</p></div>';
  }
}

init();