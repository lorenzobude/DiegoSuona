import { useState } from 'react'

export function useAppState() {
  const [state, setState] = useState({
    currentPhase: 'upload',
    audioFile: null,
    fileName: null,
    fileSize: null,
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
    setMusicXmlData,
    setError,
    reset
  }
}
