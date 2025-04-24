const fileCache = new Map<string, any>()

export const loadJsonFile = async <T>(path: string): Promise<T | undefined> => {
  try {
    if (fileCache.has(path)) {
      return fileCache.get(path) as T
    }
    const content = await import(path.toLowerCase())
    const parsed = content.default as T
    fileCache.set(path, parsed)
    return parsed
  } catch (e) {
    console.error(`Unable to load ${path}`, e instanceof Error ? e.message : e)
  }
}
