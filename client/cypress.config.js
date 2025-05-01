import { defineConfig } from "cypress";
export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    env: {
      userEmail: "testaccount@gmail.com",
      userPassword: "@h6cGW&IK90gyb6",
      adminEmail: "tharaka.tmw7@gmail.com",
      adminPassword: "123456789"
    }
  }
});
