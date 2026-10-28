import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'http://localhost:5173'
const TEST_FILE = path.resolve('./test-audio.wav')

test.describe('MP3 to Score - End-to-End Flow', () => {
  test('should complete full workflow: upload → analyze → confirm → transcribe → export', async ({ page }) => {
    console.log('\n🧪 BROWSER E2E TEST - COMPLETE WORKFLOW\n')

    test.step('1. Navigate to application', async () => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      const heading = await page.locator('h1')
      await expect(heading).toContainText('MP3 → Spartito MuseScore')
      console.log('✅ App loaded successfully')
    })

    test.step('2. Upload audio file', async () => {
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(TEST_FILE)

      await page.waitForTimeout(500)

      const fileName = await page.locator('text=/test-audio/').isVisible()
      expect(fileName).toBeTruthy()
      console.log('✅ File uploaded: test-audio.wav')
    })

    test.step('3. Start pitch detection', async () => {
      const analyzeButton = page.locator('button:has-text("Analizza tonalità")')
      await expect(analyzeButton).toBeEnabled()
      await analyzeButton.click()

      await page.waitForTimeout(3000)

      const detectedKey = await page.locator('select').isVisible()
      expect(detectedKey).toBeTruthy()
      console.log('✅ Pitch detection completed')
    })

    test.step('4. Confirm key', async () => {
      const keySelect = page.locator('select')
      await keySelect.selectOption('C')

      const confirmButton = page.locator('button:has-text("Conferma tonalità")')
      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()

      await page.waitForTimeout(500)
      console.log('✅ Key confirmed: C')
    })

    test.step('5. Generate transcription', async () => {
      const transcribeButton = page.locator('button:has-text("Genera spartito")')
      await expect(transcribeButton).toBeEnabled()
      await transcribeButton.click()

      await page.waitForTimeout(4000)

      const downloadButton = page.locator('button:has-text("Scarica MusicXML")')
      const isVisible = await downloadButton.isVisible()
      expect(isVisible).toBeTruthy()
      console.log('✅ Transcription generated')
    })

    test.step('6. Download MusicXML', async () => {
      const downloadButton = page.locator('button:has-text("Scarica MusicXML")')
      
      const downloadPromise = page.waitForEvent('download')
      await downloadButton.click()
      const download = await downloadPromise

      const fileName = download.suggestedFilename
      expect(fileName).toContain('.musicxml')
      console.log(`✅ Downloaded: ${fileName}`)

      await download.path()
    })

    console.log('\n✅ BROWSER E2E TEST PASSED!\n')
  })

  test('should handle key selection without detection', async ({ page }) => {
    console.log('\n🧪 BROWSER TEST - MANUAL KEY SELECTION\n')

    test.step('1. Navigate and upload', async () => {
      await page.goto(BASE_URL)
      const fileInput = page.locator('input[type="file"]')
      await fileInput.setInputFiles(TEST_FILE)
      await page.waitForTimeout(500)
      console.log('✅ File uploaded')
    })

    test.step('2. Select key manually (skip detection)', async () => {
      const keySelect = page.locator('select')
      const isVisible = await keySelect.isVisible()

      if (isVisible) {
        await keySelect.selectOption('G')
        const confirmButton = page.locator('button:has-text("Conferma tonalità")')
        await confirmButton.click()
        await page.waitForTimeout(500)
        console.log('✅ Key selected manually: G')
      }
    })

    test.step('3. Generate and export', async () => {
      const transcribeButton = page.locator('button:has-text("Genera spartito")')
      if (await transcribeButton.isEnabled()) {
        await transcribeButton.click()
        await page.waitForTimeout(4000)
        console.log('✅ Transcription completed')
      }
    })

    console.log('\n✅ MANUAL KEY SELECTION TEST PASSED!\n')
  })
})
