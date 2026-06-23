import time


def word_error_rate(reference, hypothesis):
    reference_words = reference.split()
    hypothesis_words = hypothesis.split()
    rows = len(reference_words) + 1
    cols = len(hypothesis_words) + 1
    distances = [[0] * cols for _ in range(rows)]
    for row in range(rows):
        distances[row][0] = row
    for col in range(cols):
        distances[0][col] = col
    for row in range(1, rows):
        for col in range(1, cols):
            if reference_words[row - 1] == hypothesis_words[col - 1]:
                distances[row][col] = distances[row - 1][col - 1]
            else:
                distances[row][col] = 1 + min(
                    distances[row - 1][col],
                    distances[row][col - 1],
                    distances[row - 1][col - 1],
                )
    return distances[-1][-1] / max(1, len(reference_words))


class Timer:
    def __enter__(self):
        self.started_at = time.perf_counter()
        return self

    def __exit__(self, *_):
        self.elapsed_seconds = time.perf_counter() - self.started_at


def real_time_factor(processing_seconds, audio_seconds):
    if not audio_seconds or audio_seconds <= 0:
        return None
    return processing_seconds / audio_seconds
