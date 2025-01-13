export interface disabledType {
    [key: string]: number
}

export interface functionResult {
    success: boolean
    warning?: string,
    error?: string,
    data?: any
} 