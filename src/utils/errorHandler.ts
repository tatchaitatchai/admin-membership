export async function getErrorMessage(err: any, fallbackMessage: string): Promise<string> {
    if (err?.response) {
        try {
            const errorData = await err.response.json()
            return errorData.error || fallbackMessage
        } catch {
            return err.message || fallbackMessage
        }
    }
    
    if (err instanceof Error) {
        return err.message
    }
    
    return fallbackMessage
}
