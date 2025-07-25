import { X, Play, Plus, ThumbsUp, Star, Calendar, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";

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

interface MovieModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
}

const MovieModal = ({ movie, isOpen, onClose, onPlay }: MovieModalProps) => {
  if (!movie) return null;

  const genres = movie.omdbData.Genre.split(', ');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-background border-border animate-scale-in">
        <div className="relative">
          {/* Header Image */}
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-lg">
            <img
              src={movie.omdbData.Poster}
              alt={movie.omdbData.Title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-hero" />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 shadow-netflix animate-glow-pulse"
                onClick={() => onPlay(movie)}
              >
                <Play className="h-6 w-6 mr-2" />
                Play Now
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Title and Basic Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold font-inter">
                    {movie.omdbData.Title}
                  </h1>

                  <div className="flex items-center space-x-4 text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-streaming-gold fill-current" />
                      <span className="font-medium">{movie.omdbData.imdbRating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{movie.omdbData.Year}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{movie.omdbData.Runtime}</span>
                    </div>
                    <Badge variant="outline" className="border-primary text-primary">
                      {movie.omdbData.Rated}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    My List
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Plot */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed">
                {movie.omdbData.Plot}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Director</h4>
                  <p>{movie.omdbData.Director}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Writer</h4>
                  <p>{movie.omdbData.Writer}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Language</h4>
                  <p>{movie.omdbData.Language}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Cast
                  </h4>
                  <p>{movie.omdbData.Actors}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Country</h4>
                  <p>{movie.omdbData.Country}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Awards</h4>
                  <p>{movie.omdbData.Awards}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MovieModal;