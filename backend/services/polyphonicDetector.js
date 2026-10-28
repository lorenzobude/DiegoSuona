import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'
import * as tf from '@tensorflow/tfjs'
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm'
import { BasicPitch, outputToNotesPoly, addPitchBendsToNoteEvents, noteFramesToTime } from '@spotify/basic-pitch'

const require = createRequire(import.meta.url)
const modelDirectory = path.join(path.dirname(require.resolve('@spotify/basic-pitch/package.json')), 'model')
const wasmDirectory = path.dirname(require.resolve('@tensorflow/tfjs-backend-wasm/package.json'))

let basicPitchPromise = null

async function loadModel() {
  setWasmPaths(path.join(wasmDirectory, 'wasm-out') + path.sep)
  try {
    await tf.setBackend('wasm')
  } catch (error) {
    console.warn(`[PolyphonicDetector] WASM backend unavailable, using CPU: ${error.message}`)
    await tf.setBackend('cpu')
  }
  await tf.ready()

  const modelJson = JSON.parse(fs.readFileSync(path.join(modelDirectory, 'model.json'), 'utf8'))
  const weightBuffer = fs.readFileSync(path.join(modelDirectory, 'group1-shard1of1.bin'))
  const weightData = weightBuffer.buffer.slice(weightBuffer.byteOffset, weightBuffer.byteOffset + weightBuffer.byteLength)

  return tf.loadGraphModel(tf.io.fromMemory({
    modelTopology: modelJson.modelTopology,
    weightSpecs: modelJson.weightsManifest[0].weights,
    weightData,
    format: modelJson.format,
    generatedBy: modelJson.generatedBy,
    convertedBy: modelJson.convertedBy
  }))
}

function getBasicPitch() {
  if (!basicPitchPromise) {
    basicPitchPromise = loadModel().then(model => new BasicPitch(Promise.resolve(model)))
  }
  return basicPitchPromise
}

export async function detectNotes(audioBuffer) {
  const basicPitch = await getBasicPitch()
  const frames = []
  const onsets = []
  const contours = []

  await basicPitch.evaluateModel(
    audioBuffer,
    (batchFrames, batchOnsets, batchContours) => {
      frames.push(...batchFrames)
      onsets.push(...batchOnsets)
      contours.push(...batchContours)
    },
    () => {}
  )

  return noteFramesToTime(
    addPitchBendsToNoteEvents(contours, outputToNotesPoly(frames, onsets, 0.5, 0.3, 5))
  )
}
