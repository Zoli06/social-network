import { useSearchParams } from 'react-router-dom';
import { Search } from '../components/Search/Search';

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const _type = searchParams.get('type');

  const type = _type === 'users' || _type === 'groups' || _type === 'messages' ? _type : 'all';

  return (
    <Search query={query || ''} type={type} />
  )
}
