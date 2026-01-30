export interface MediaFile {
    uuid: string;
    display_name: string;
    size: number;
    url: string;
}

export interface MediaKey {
    extension: string | null;
}