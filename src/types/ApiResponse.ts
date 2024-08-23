

export interface ApiResponse {
    success: boolean;
    message: string;
    data?: object; // Optional object
    datas?: object[]; // Optional array of objects
    
}