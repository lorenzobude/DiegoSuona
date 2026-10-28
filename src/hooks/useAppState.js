import { useState } from 'react'

export function useAppState() {
  const [state, setState] = useState({
    currentPhase: 'upload',
    audioFile: null,
    fileName: null,
    fileSize: null,
    transcription: null,
    musicXmlData: null,
    error: null,
    loading: false
  })

  const setAudioFile = (file) => {
    setState(prev => ({
      ...prev,
      audioFile: file,
      fileName: file ? file.name : null,
      fileSize: file ? file.size : null,
      error: null,
      currentPhase: 'upload',
      transcription: null,
      musicXmlData: null
    }))
  }

  const setPhase = (phase) => {
    setState(prev => ({
      ...prev,
      currentPhase: phase
    }))
  }

  const setLoading = (isLoading) => {
    setState(prev => ({
      ...prev,
      loading: isLoading
    }))
  }

  const setTranscription = (notes) => {
    setState(prev => ({
      ...prev,
      transcription: notes
    }))
  }

  const setMusicXmlData = (xml) => {
    setState(prev => ({
      ...prev,
      musicXmlData: xml,
      currentPhase: 'done'
    }))
  }

  const setError = (error) => {
    setState(prev => ({
      ...prev,
      error,
      currentPhase: 'error',
      loading: false
    }))
  }

  const reset = () => {
    setState({
      currentPhase: 'upload',
      audioFile: null,
      fileName: null,
      fileSize: null,
      transcription: null,
      musicXmlData: null,
      error: null,
      loading: false
    })
  }

  return {
    state,
    setAudioFile,
    setPhase,
    setLoading,
    setTranscription,
    setMusicXmlData,
    setError,
    reset
  }
}
