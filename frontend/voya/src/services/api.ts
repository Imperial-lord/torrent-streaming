const API_BASE_URL = 'http://141.148.160.138/api';
import axios from '../api/axios';

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
        const res = await axios.get<Movie[]>('/api/movies');
        if (res.status != 200) throw new Error('Failed to fetch movies');
        return res.data;
    },

    getVideoUrl: (objectName: string): string => {
        return `${API_BASE_URL}/video?objectName=${encodeURIComponent(objectName)}`;
    },

    getSubtitleUrl: (objectName: string): string => {
        return `${API_BASE_URL}/subtitles?objectName=${encodeURIComponent(objectName)}`
    }
};