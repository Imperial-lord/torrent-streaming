import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Movie {
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

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

const MovieCard = ({ movie, onClick }: MovieCardProps) => {
  return (
    <div
      className="group relative overflow-hidden rounded-lg bg-gradient-card shadow-card cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-glow animate-fade-in"
      onClick={onClick}
    >
      {/* Movie Poster */}
      <div className="aspect-[2/3] overflow-hidden">
        <img
          src={movie.omdbData.Poster}
          alt={movie.omdbData.Title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-white truncate">
            {movie.omdbData.Title}
          </h3>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {movie.omdbData.Year}
            </Badge>
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3 text-streaming-gold fill-current" />
              <span className="text-xs text-white">
                {movie.omdbData.imdbRating}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-300 line-clamp-2">
            {movie.omdbData.Plot}
          </p>

          <div className="flex space-x-2 pt-2">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Play className="h-3 w-3 mr-1" />
              Play
            </Button>

            <Button size="sm" variant="secondary">
              <Info className="h-3 w-3 mr-1" />
              Info
            </Button>
          </div>
        </div>
      </div>

      {/* Rating Badge */}
      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
        <div className="flex items-center space-x-1">
          <Star className="h-3 w-3 text-streaming-gold fill-current" />
          <span className="text-xs font-medium">
            {movie.omdbData.imdbRating}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;