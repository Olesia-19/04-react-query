import { useState, useEffect} from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import ReactPaginate from 'react-paginate';
import toast, { Toaster } from 'react-hot-toast';
import type { Movie } from '../../types/movie';
import fetchMovies from '../../services/movieService';
import type {FetchMoviesResponse} from '../../services/movieService'
import SearchBar from '../SearchBar/SearchBar';
import Loader from '../Loader/Loader';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import MovieGrid from '../MovieGrid/MovieGrid';
import MovieModal from '../MovieModal/MovieModal';
import css from './App.module.css';

const notify = () => toast('No movies found for your request.');

export default function App() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  const { data, isLoading, isError } = useQuery<FetchMoviesResponse>({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query !== '',
    placeholderData: keepPreviousData,
  });

  const hasPagination = data?.total_pages && data.total_pages > 1;

  useEffect(() => {
    if (data && data.results.length === 0) {
      notify();
    }
  }, [data]);
  
  const handleSearch = (query: string) => {
    setQuery(query);
    setPage(1)
  }


  return (
    <>
      <SearchBar onSubmit={handleSearch} />
      <Toaster />
      {hasPagination && (
        <ReactPaginate
        pageCount={data.total_pages}
        pageRangeDisplayed={5}
        marginPagesDisplayed={1}
        onPageChange={({ selected }) => setPage(selected + 1)}
        forcePage={page - 1}
        containerClassName={css.pagination}
        activeClassName={css.active}
        nextLabel="→"
        previousLabel="←"
      />
      )}
      {isLoading ? <Loader /> : <MovieGrid onSelect={setSelectedMovie} movies={data?.results ?? [] } />}
      {isError && <ErrorMessage />}
      {selectedMovie && <MovieModal movie={selectedMovie } onClose={ () => setSelectedMovie(null)} />}
    </>
  )
}

