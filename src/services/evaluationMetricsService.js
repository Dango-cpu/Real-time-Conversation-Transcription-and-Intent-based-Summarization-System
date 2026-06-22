const speechModels = [
  {
    id: 'cnn-bilstm-ctc',
    name: 'CNN + Bi-LSTM + CTC',
    label: 'Model 1 — CNN + Bi-LSTM + CTC',
    metrics: { rtf: 0.42, wer: 8.7, bleu: 34.6 },
  },
  {
    id: 'simplified-deepspeech',
    name: 'Simplified DeepSpeech',
    label: 'Model 2 — Simplified DeepSpeech',
    metrics: { rtf: 0.58, wer: 10.1, bleu: 35.2 },
  },
  {
    id: 'seq2seq-encoder-decoder',
    name: 'Seq2Seq Encoder–Decoder',
    label: 'Model 3 — Seq2Seq Encoder–Decoder',
    metrics: { rtf: 0.27, wer: 14.8, bleu: 31.4 },
  },
]

/**
 * Mock benchmark catalogue for the UI and processing response.
 * Replace these values with measurements produced by the evaluation pipeline.
 */
export function listSpeechModels() {
  return structuredClone(speechModels)
}

export function getModelBenchmark(modelId) {
  const selected = speechModels.find(model => model.id === modelId) || speechModels[0]
  return structuredClone(selected)
}
