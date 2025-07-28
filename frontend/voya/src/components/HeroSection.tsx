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

interface HeroSectionProps {
  movie: Movie;
  onPlay: (movie: Movie) => void;
  onInfo: (movie: Movie) => void;
}

const HeroSection = ({ movie, onPlay, onInfo }: HeroSectionProps) => {
  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={movie.omdbData.Poster}
          alt={movie.omdbData.Title}
          className="w-full h-full object-cover object-center animate-float"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold font-inter text-white leading-tight">
                {movie.omdbData.Title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-streaming-gold fill-current" />
                  <span className="text-white font-medium">
                    {movie.omdbData.imdbRating}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  {movie.omdbData.Year}
                </Badge>
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  {movie.omdbData.Rated}
                </Badge>
                <span className="text-white/80">{movie.omdbData.Runtime}</span>
              </div>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {movie.omdbData.Genre.split(', ').map((genre) => (
                  <Badge key={genre} variant="outline" className="border-white/30 text-white bg-white/10">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-xl">
              {movie.omdbData.Plot}
            </p>
            
            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 shadow-netflix animate-glow-pulse"
                onClick={() => onPlay(movie)}
              >
                <Play className="h-5 w-5 mr-2 fill-current" />
                Play Now
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
                onClick={() => onInfo(movie)}
              >
                <Info className="h-5 w-5 mr-2" />
                More Info
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;