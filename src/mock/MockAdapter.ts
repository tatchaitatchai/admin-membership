// Mock disabled — using real API via ky
export const mock = {
    onPost: () => ({ reply: () => {} }),
    onGet: () => ({ reply: () => {} }),
}
  