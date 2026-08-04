import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiSearch, HiAdjustments, HiX } from 'react-icons/hi';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    API.get('/products/categories').then(res => setCategories(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    params.set('page', page);
    params.set('limit', 12);

    API.get(`/products?${params}`)
      .then(res => { setProducts(res.data.products); setTotal(res.data.total); setPages(res.data.pages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, category, sort, page]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">{category || 'All Products'}</h1>
          <p className="text-gray-400 text-sm mt-1">{total} products found</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Active search tag */}
          {search && (
            <div className="flex items-center gap-1.5 glass rounded-lg px-3 py-2 text-sm text-primary">
              <HiSearch className="text-sm" /> "{search}"
              <button onClick={() => updateParam('search', '')} className="ml-1 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer"><HiX className="text-sm" /></button>
            </div>
          )}
          {/* Sort */}
          <select value={sort} onChange={e => updateParam('sort', e.target.value)} className="input-field py-2 w-auto cursor-pointer" style={{ minWidth: '140px' }}>
            <option value="">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name A-Z</option>
          </select>
          {/* Mobile filter toggle */}
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden btn-secondary py-2 px-3"><HiAdjustments className="text-lg" /></button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${filtersOpen ? 'fixed inset-0 z-50 bg-black/60 flex' : 'hidden'} md:block md:relative md:bg-transparent md:z-auto w-64 flex-shrink-0`}>
          <div className={`glass rounded-xl p-5 w-64 h-fit ${filtersOpen ? 'ml-auto h-full overflow-y-auto' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Filters</h3>
              {filtersOpen && <button onClick={() => setFiltersOpen(false)} className="text-white md:hidden bg-transparent border-none cursor-pointer"><HiX className="text-xl" /></button>}
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="text-gray-300 text-sm font-medium mb-3">Categories</h4>
              <div className="space-y-1.5">
                <button onClick={() => { updateParam('category', ''); setFiltersOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border-none cursor-pointer ${!category ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5 bg-transparent'}`}>All</button>
                {categories.map(cat => (
                  <button key={cat} onClick={() => { updateParam('category', cat); setFiltersOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all border-none cursor-pointer ${category === cat ? 'bg-primary/20 text-primary font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5 bg-transparent'}`}>{cat}</button>
                ))}
              </div>
            </div>

            {(category || search || sort) && (
              <button onClick={clearFilters} className="btn-secondary w-full py-2 text-sm flex items-center justify-center gap-2"><HiX /> Clear Filters</button>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse"><div className="aspect-square bg-white/5" /><div className="p-4 space-y-3"><div className="h-3 bg-white/5 rounded w-1/3" /><div className="h-4 bg-white/5 rounded w-2/3" /><div className="h-5 bg-white/5 rounded w-1/2" /></div></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20"><p className="text-gray-400 text-lg mb-4">No products found</p><button onClick={clearFilters} className="btn-primary">Clear Filters</button></div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {products.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} onClick={() => updateParam('page', String(i + 1))} className={`w-10 h-10 rounded-lg text-sm font-medium transition-all border-none cursor-pointer ${page === i + 1 ? 'bg-primary text-white' : 'glass text-gray-300 hover:text-white'}`}>{i + 1}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
