# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: browser-test.spec.js >> MP3 to Score - End-to-End Flow >> should handle key selection without detection
- Location: browser-test.spec.js:84:3

# Error details

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:5173/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import fs from 'fs'
  3   | import path from 'path'
  4   | 
  5   | const BASE_URL = 'http://localhost:5173'
  6   | const TEST_FILE = path.resolve('./test-audio.wav')
  7   | 
  8   | test.describe('MP3 to Score - End-to-End Flow', () => {
  9   |   test('should complete full workflow: upload → analyze → confirm → transcribe → export', async ({ page }) => {
  10  |     console.log('\n🧪 BROWSER E2E TEST - COMPLETE WORKFLOW\n')
  11  | 
  12  |     test.step('1. Navigate to application', async () => {
  13  |       await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  14  |       const heading = await page.locator('h1')
  15  |       await expect(heading).toContainText('MP3 → Spartito MuseScore')
  16  |       console.log('✅ App loaded successfully')
  17  |     })
  18  | 
  19  |     test.step('2. Upload audio file', async () => {
  20  |       const fileInput = page.locator('input[type="file"]')
  21  |       await fileInput.setInputFiles(TEST_FILE)
  22  | 
  23  |       await page.waitForTimeout(500)
  24  | 
  25  |       const fileName = await page.locator('text=/test-audio/').isVisible()
  26  |       expect(fileName).toBeTruthy()
  27  |       console.log('✅ File uploaded: test-audio.wav')
  28  |     })
  29  | 
  30  |     test.step('3. Start pitch detection', async () => {
  31  |       const analyzeButton = page.locator('button:has-text("Analizza tonalità")')
  32  |       await expect(analyzeButton).toBeEnabled()
  33  |       await analyzeButton.click()
  34  | 
  35  |       await page.waitForTimeout(3000)
  36  | 
  37  |       const detectedKey = await page.locator('select').isVisible()
  38  |       expect(detectedKey).toBeTruthy()
  39  |       console.log('✅ Pitch detection completed')
  40  |     })
  41  | 
  42  |     test.step('4. Confirm key', async () => {
  43  |       const keySelect = page.locator('select')
  44  |       await keySelect.selectOption('C')
  45  | 
  46  |       const confirmButton = page.locator('button:has-text("Conferma tonalità")')
  47  |       await expect(confirmButton).toBeEnabled()
  48  |       await confirmButton.click()
  49  | 
  50  |       await page.waitForTimeout(500)
  51  |       console.log('✅ Key confirmed: C')
  52  |     })
  53  | 
  54  |     test.step('5. Generate transcription', async () => {
  55  |       const transcribeButton = page.locator('button:has-text("Genera spartito")')
  56  |       await expect(transcribeButton).toBeEnabled()
  57  |       await transcribeButton.click()
  58  | 
  59  |       await page.waitForTimeout(4000)
  60  | 
  61  |       const downloadButton = page.locator('button:has-text("Scarica MusicXML")')
  62  |       const isVisible = await downloadButton.isVisible()
  63  |       expect(isVisible).toBeTruthy()
  64  |       console.log('✅ Transcription generated')
  65  |     })
  66  | 
  67  |     test.step('6. Download MusicXML', async () => {
  68  |       const downloadButton = page.locator('button:has-text("Scarica MusicXML")')
  69  |       
  70  |       const downloadPromise = page.waitForEvent('download')
  71  |       await downloadButton.click()
  72  |       const download = await downloadPromise
  73  | 
  74  |       const fileName = download.suggestedFilename
  75  |       expect(fileName).toContain('.musicxml')
  76  |       console.log(`✅ Downloaded: ${fileName}`)
  77  | 
  78  |       await download.path()
  79  |     })
  80  | 
  81  |     console.log('\n✅ BROWSER E2E TEST PASSED!\n')
  82  |   })
  83  | 
  84  |   test('should handle key selection without detection', async ({ page }) => {
  85  |     console.log('\n🧪 BROWSER TEST - MANUAL KEY SELECTION\n')
  86  | 
  87  |     test.step('1. Navigate and upload', async () => {
> 88  |       await page.goto(BASE_URL)
      |                  ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  89  |       const fileInput = page.locator('input[type="file"]')
  90  |       await fileInput.setInputFiles(TEST_FILE)
  91  |       await page.waitForTimeout(500)
  92  |       console.log('✅ File uploaded')
  93  |     })
  94  | 
  95  |     test.step('2. Select key manually (skip detection)', async () => {
  96  |       const keySelect = page.locator('select')
  97  |       const isVisible = await keySelect.isVisible()
  98  | 
  99  |       if (isVisible) {
  100 |         await keySelect.selectOption('G')
  101 |         const confirmButton = page.locator('button:has-text("Conferma tonalità")')
  102 |         await confirmButton.click()
  103 |         await page.waitForTimeout(500)
  104 |         console.log('✅ Key selected manually: G')
  105 |       }
  106 |     })
  107 | 
  108 |     test.step('3. Generate and export', async () => {
  109 |       const transcribeButton = page.locator('button:has-text("Genera spartito")')
  110 |       if (await transcribeButton.isEnabled()) {
  111 |         await transcribeButton.click()
  112 |         await page.waitForTimeout(4000)
  113 |         console.log('✅ Transcription completed')
  114 |       }
  115 |     })
  116 | 
  117 |     console.log('\n✅ MANUAL KEY SELECTION TEST PASSED!\n')
  118 |   })
  119 | })
  120 | 
```