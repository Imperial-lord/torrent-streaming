import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import VideoPlayer from "@/components/VideoPlayer";
import { movieApi, Movie } from "@/services/api";


const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [currentSubsUrl, setCurrentSubsUrl] = useState("");
  const [currentVideoTitle, setCurrentVideoTitle] = useState("");

  // Fetch movies from API
  const { data: movies = [], isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: movieApi.getAllMovies,
  });


  // Filter movies based on search query
  const filteredMovies = useMemo(() => {
    if (!searchQuery) return movies;
    return movies.filter(movie =>
      movie.omdbData.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.omdbData.Genre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.omdbData.Actors.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, movies]);

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handlePlay = (movie: Movie) => {
    const videoUrl = movieApi.getVideoUrl(movie.videoPath);
    const subsUrl = (movie.subsFiles.length > 0) ? movieApi.getSubtitleUrl(movie.subsFiles[0]) : "";
    setCurrentVideoUrl(videoUrl);
    setCurrentSubsUrl(subsUrl);
    setCurrentVideoTitle(movie.omdbData.Title);
    setIsVideoPlayerOpen(true);
    setIsModalOpen(false); // Close modal when starting video
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMovie(null);
  };

  // Featured movie (first movie in the list)
  const featuredMovie = movies.length > 0 ? movies[0] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background font-inter flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background font-inter flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load movies. Please check if your backend is running.</p>
          <p className="text-sm text-muted-foreground">Make sure the API is available at http://141.148.160.138</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Header */}
      <Header onSearch={setSearchQuery} />

      {/* Hero Section */}
      {!searchQuery && featuredMovie && (
        <HeroSection
          movie={featuredMovie}
          onPlay={handlePlay}
          onInfo={handleMovieClick}
        />
      )}

      {/* Movies Section */}
      <div className={`container mx-auto px-4 py-8 ${!searchQuery ? 'mt-0' : 'mt-20'}`}>
        <div className="space-y-8">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Popular Movies"}
            </h2>
            {!searchQuery && (
              <p className="text-muted-foreground">
                {movies.length} movies available
              </p>
            )}
          </div>

          {/* Movies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.omdbData.imdbID}
                movie={movie}
                onClick={() => handleMovieClick(movie)}
              />
            ))}
          </div>

          {/* No Results */}
          {searchQuery && filteredMovies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No movies found for "{searchQuery}"
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try searching for a different title, genre, or actor
              </p>
            </div>
          )}
        </div>

        {/* Additional Sections */}
        {!searchQuery && (
          <div className="space-y-8 mt-12">
            <div>
              <h3 className="text-xl font-semibold mb-4">Trending Now</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {movies.slice().reverse().map((movie) => (
                  <MovieCard
                    key={`trending-${movie.omdbData.imdbID}`}
                    movie={movie}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Because You Watched</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {movies.map((movie) => (
                  <MovieCard
                    key={`recommended-${movie.omdbData.imdbID}`}
                    movie={movie}
                    onClick={() => handleMovieClick(movie)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Movie Modal */}
      <MovieModal
        movie={selectedMovie}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlay={handlePlay}
      />

      {/* Video Player */}
      <VideoPlayer
        videoUrl={currentVideoUrl}
        subsUrl={currentSubsUrl}
        title={currentVideoTitle}
        isOpen={isVideoPlayerOpen}
        onClose={() => setIsVideoPlayerOpen(false)}
      />
    </div>
  );
};

export default Index;