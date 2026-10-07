import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
 testDir: './tests/browser',
 timeout: 30000,
 retries: process.env.CI ? 1 : 0,
 workers: 1,
 reporter: [['list']],
 use: { baseURL:'http://127.0.0.1:3174', trace:'retain-on-failure' },
 projects: [{name:'desktop',use:{...devices['Desktop Chrome']}},{name:'mobile',use:{...devices['iPhone 13'],defaultBrowserType:'chromium'}}],
 webServer: {command:'npm run start -- -H 127.0.0.1 -p 3174',url:'http://127.0.0.1:3174',reuseExistingServer:false,env:{RAPIDAPI_KEY:'',OPENAI_API_KEY:''}}
})
