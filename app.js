// DOM Elements
const recordBtn = document.getElementById('recordBtn');
const recordingIndicator = document.getElementById('recordingIndicator');
const recordStatus = document.getElementById('recordStatus');
const recordingTimer = document.getElementById('recordingTimer');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFile = document.getElementById('removeFile');
const transcribeBtn = document.getElementById('transcribeBtn');
const transcribeBtnText = transcribeBtn.querySelector('.btn-text');
const transcribeBtnLoader = transcribeBtn.querySelector('.btn-loader');
const loadingState = document.getElementById('loadingState');
const resultSection = document.getElementById('resultSection');
const transcriptionResult = document.getElementById('transcriptionResult');
const copyBtn = document.getElementById('copyBtn');
const newTranscribeBtn = document.getElementById('newTranscribe');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const retryBtn = document.getElementById('retryBtn');

// State
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let recordingStartTime = null;
let timerInterval = null;
let audioBlob = null;
let currentTranscription = '';

// API Configuration
const API_URL = 'https://api-inference.huggingface.co/models/nvidia/parakeet-tdt-0.6b-v3';
const HF_TOKEN = ''; // Token would be configured server-side

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Record button click
  recordBtn.addEventListener('click', toggleRecording);

  // Drag & drop events
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('dragover', handleDragOver);
  dropZone.addEventListener('dragleave', handleDragLeave);
  dropZone.addEventListener('drop', handleDrop);
  fileInput.addEventListener('change', handleFileSelect);

  // File actions
  removeFile.addEventListener('click', removeAudioFile);

  // Transcribe button
  transcribeBtn.addEventListener('click', transcribeAudio);

  // Copy button
  copyBtn.addEventListener('click', copyToClipboard);

  // New transcription button
  newTranscribeBtn.addEventListener('click', resetToInitial);

  // Retry button
  retryBtn.addEventListener('click', () => {
    hideAllSections();
    transcribeBtn.disabled = false;
    transcribeBtn.focus();
  });

  // Check for microphone support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    recordBtn.disabled = true;
    recordBtn.title = 'Microphone not supported';
    recordStatus.textContent = 'Recording not available';
  }
}

// Recording Functions
async function toggleRecording() {
  if (isRecording) {
    stopRecording();
  } else {
    await startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      } 
    });

    mediaRecorder = new MediaRecorder(stream, {
      mimeType: getSupportedMimeType()
    });

    audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
      stream.getTracks().forEach(track => track.stop());
      updateFileInfo(audioBlob, 'recording.wav');
      enableTranscribeButton();
    };

    mediaRecorder.start(100);
    isRecording = true;
    
    // Update UI
    recordBtn.classList.add('recording');
    recordStatus.textContent = 'Tap to stop';
    recordingTimer.classList.add('visible');
    
    // Start timer
    recordingStartTime = Date.now();
    timerInterval = setInterval(updateTimer, 100);

  } catch (error) {
    console.error('Error accessing microphone:', error);
    showError('Unable to access microphone. Please check permissions.');
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  isRecording = false;
  
  // Update UI
  recordBtn.classList.remove('recording');
  recordStatus.textContent = 'Tap to record';
  recordingTimer.classList.remove('visible');
  
  // Stop timer
  clearInterval(timerInterval);
  recordingTimer.querySelectorAll('.timer-digit')[0].textContent = '0';
  recordingTimer.querySelectorAll('.timer-digit')[1].textContent = '00';
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  
  recordingTimer.querySelectorAll('.timer-digit')[0].textContent = minutes;
  recordingTimer.querySelectorAll('.timer-digit')[1].textContent = seconds.toString().padStart(2, '0');
}

function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4'
  ];
  
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  
  return 'audio/webm';
}

// Drag & Drop Functions
function handleDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  dropZone.classList.remove('drag-over');

  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith('audio/')) {
    handleAudioFile(files[0]);
  } else {
    showError('Please drop a valid audio file');
  }
}

function handleFileSelect(e) {
  const files = e.target.files;
  if (files.length > 0) {
    handleAudioFile(files[0]);
  }
}

function handleAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    showError('Please select a valid audio file');
    return;
  }

  audioBlob = file;
  updateFileInfo(file, file.name);
  enableTranscribeButton();
}

function updateFileInfo(blob, name) {
  fileName.textContent = name;
  dropZone.classList.add('loading');
  
  setTimeout(() => {
    dropZone.classList.add('hidden');
    fileInfo.classList.remove('hidden');
  }, 300);
}

function removeAudioFile(e) {
  e.stopPropagation();
  audioBlob = null;
  fileInput.value = '';
  fileInfo.classList.add('hidden');
  dropZone.classList.remove('hidden', 'loading');
  transcribeBtn.disabled = true;
}

function enableTranscribeButton() {
  if (audioBlob) {
    transcribeBtn.disabled = false;
  }
}

// Transcribe Functions
async function transcribeAudio() {
  if (!audioBlob) return;

  hideAllSections();
  showLoading();

  transcribeBtn.disabled = true;
  transcribeBtnText.textContent = 'Transcribing...';
  transcribeBtnLoader.classList.remove('hidden');

  try {
    // Convert blob to base64
    const base64Audio = await blobToBase64(audioBlob);

    // For demo purposes, simulate API call since we need server-side token
    // In production, this would go through your backend
    const result = await queryAPI(base64Audio);

    if (result.error) {
      throw new Error(result.error);
    }

    currentTranscription = result.text || 'No transcription available';
    showResult(currentTranscription);

  } catch (error) {
    console.error('Transcription error:', error);
    
    // For demo, show sample result if API fails
    if (error.message.includes('Authorization')) {
      showResult('Demo transcription: The quick brown fox jumps over the lazy dog. This is a sample transcription to demonstrate the UI. In production, configure your HuggingFace API token for full functionality.');
    } else {
      showError(error.message || 'Transcription failed. Please try again.');
    }
  } finally {
    transcribeBtnText.textContent = 'Transcribe';
    transcribeBtnLoader.classList.add('hidden');
  }
}

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function queryAPI(base64Audio) {
  // This would typically go through your backend to protect the API token
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audio: base64Audio }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// UI Functions
function hideAllSections() {
  loadingState.classList.add('hidden');
  resultSection.classList.add('hidden');
  errorSection.classList.add('hidden');
}

function showLoading() {
  loadingState.classList.remove('hidden');
}

function showResult(text) {
  transcriptionResult.innerHTML = `<p>${escapeHtml(text)}</p>`;
  resultSection.classList.remove('hidden');
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(message) {
  errorMessage.textContent = message;
  errorSection.classList.remove('hidden');
  errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(currentTranscription);
    copyBtn.classList.add('copied');
    copyBtn.querySelector('span').textContent = 'Copied!';
    
    setTimeout(() => {
      copyBtn.classList.remove('copied');
      copyBtn.querySelector('span').textContent = 'Copy';
    }, 2000);
  } catch (error) {
    console.error('Copy failed:', error);
    showError('Failed to copy to clipboard');
  }
}

function resetToInitial() {
  hideAllSections();
  audioBlob = null;
  currentTranscription = '';
  removeAudioFile({ stopPropagation: () => {} });
  recordBtn.focus();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (isRecording) {
      stopRecording();
    }
  }
});
