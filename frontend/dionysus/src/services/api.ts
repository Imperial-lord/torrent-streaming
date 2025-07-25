const API_BASE_URL = 'http://localhost:8081/api';

export interface Movie {
    name: string;
    year: string;
    videoPath: string;
    subsFiles: string[];
    omdbData: {
        imdbRating: string;
        imdbID: string;
        Title: string;
        Year: string;
        Rated: string;
        Released: string;
        Runtime: string;
        Genre: string;
        Director: string;
        Writer: string;
        Actors: string;
        Plot: string;
        Language: string;
        Country: string;
        Awards: string;
        Poster: string;
        Type: string;
        Response: string;
    };
}

export const movieApi = {
    getAllMovies: async (): Promise<Movie[]> => {
        const response = await fetch(`${API_BASE_URL}/movies`);
        if (!response.ok) {
            throw new Error('Failed to fetch movies');
        }
        return response.json();
    },

    getVideoUrl: (objectName: string): string => {
        return `${API_BASE_URL}/video?objectName=${encodeURIComponent(objectName)}`;
    },

    getSubtitleUrl: (objectName: string): string => {
        return `${API_BASE_URL}/subtitles?objectName=${encodeURIComponent(objectName)}`
    }
};